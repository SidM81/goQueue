package api

import (
	"context"
	"encoding/json"
	"errors"
	"hash/fnv"
	"net/http"

	"github.com/SidM81/goQueue/internal/models"
	"github.com/SidM81/goQueue/internal/storage"
	"github.com/google/uuid"
)

type ProduceRequest struct {
	Topic   string          `json:"topic"`
	Key     *string         `json:"key,omitempty"` // optional
	Payload json.RawMessage `json:"payload"`
}

type ProduceResponse struct {
	ID        uuid.UUID `json:"id"`
	Topic     string    `json:"topic"`
	Partition int       `json:"partition"`
	MsgOffset int64     `json:"offset"`
	Status    string    `json:"status"`
}

type sqlNullInt64 struct {
	Int64 int64
	Valid bool
}

func ProduceMessageHandler(w http.ResponseWriter, r *http.Request) {
	var req ProduceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	var topicID uuid.UUID
	err := storage.DB.QueryRow(ctx, `SELECT id FROM topics WHERE name=$1`, req.Topic).Scan(&topicID)
	if err != nil {
		http.Error(w, "Topic not found", http.StatusNotFound)
		return
	}

	rows, err := storage.DB.Query(ctx, `SELECT id, partition_number FROM partitions WHERE topic_id=$1`, topicID)
	if err != nil {
		http.Error(w, "Partition lookup failed", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var partitions []models.Partition
	for rows.Next() {
		var p models.Partition
		if err := rows.Scan(&p.ID, &p.Number); err != nil {
			http.Error(w, "Partition scan failed", http.StatusInternalServerError)
			return
		}
		partitions = append(partitions, p)
	}
	if len(partitions) == 0 {
		http.Error(w, "No partitions found for topic", http.StatusInternalServerError)
		return
	}

	selected := pickPartition(partitions, req.Key)

	var maxOffset sqlNullInt64
	err = storage.DB.QueryRow(ctx,
		`SELECT MAX(msg_offset) FROM messages WHERE partition_id=$1`, selected.ID,
	).Scan(&maxOffset)
	if err != nil {
		http.Error(w, "Offset lookup failed", http.StatusInternalServerError)
		return
	}
	nextOffset := int64(0)
	if maxOffset.Valid {
		nextOffset = maxOffset.Int64 + 1
	}

	var msgID uuid.UUID
	err = storage.DB.QueryRow(ctx, `
		INSERT INTO messages (partition_id, msg_offset, payload)
		VALUES ($1, $2, $3)
		RETURNING id`,
		selected.ID, nextOffset, req.Payload).Scan(&msgID)
	if err != nil {
		http.Error(w, "Message insert failed", http.StatusInternalServerError)
		return
	}

	resp := ProduceResponse{
		ID:        msgID,
		Topic:     req.Topic,
		Partition: selected.Number,
		MsgOffset: nextOffset,
		Status:    "pending",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func pickPartition(partitions []models.Partition, key *string) models.Partition {
	if key == nil || *key == "" {
		return partitions[0]
	}
	hash := fnv.New32a()
	hash.Write([]byte(*key))
	index := int(hash.Sum32()) % len(partitions)
	return partitions[index]
}

func (n *sqlNullInt64) Scan(value interface{}) error {
	if value == nil {
		n.Int64, n.Valid = 0, false
		return nil
	}
	switch v := value.(type) {
	case int64:
		n.Int64, n.Valid = v, true
		return nil
	default:
		return errors.New("invalid type for sqlNullInt64")
	}
}
