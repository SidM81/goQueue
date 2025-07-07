package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/SidM81/goQueue/internal/models"
	"github.com/SidM81/goQueue/internal/storage"
	"github.com/google/uuid"
)

type ConsumedMessage struct {
	ID        uuid.UUID       `json:"id"`
	Payload   json.RawMessage `json:"payload"`
	Partition int             `json:"partition"`
	Offset    int64           `json:"offset"`
}

func ConsumeMessagesHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	topicName := r.URL.Query().Get("topic")
	groupName := r.URL.Query().Get("group")
	batchSizeStr := r.URL.Query().Get("batch")
	if topicName == "" || groupName == "" {
		http.Error(w, "Missing topic or group", http.StatusBadRequest)
		return
	}
	batchSize := 1
	if batchSizeStr != "" {
		if b, err := strconv.Atoi(batchSizeStr); err == nil && b > 0 {
			batchSize = b
		}
	}

	var topicID uuid.UUID
	err := storage.DB.QueryRow(ctx, `SELECT id FROM topics WHERE name=$1`, topicName).Scan(&topicID)
	if err != nil {
		http.Error(w, "Topic not found", http.StatusNotFound)
		return
	}

	var groupID uuid.UUID
	err = storage.DB.QueryRow(ctx,
		`SELECT id FROM consumers WHERE group_name=$1`, groupName).Scan(&groupID)
	if err != nil {
		// Insert if not exists
		err = storage.DB.QueryRow(ctx,
			`INSERT INTO consumers (group_name) VALUES ($1) RETURNING id`, groupName,
		).Scan(&groupID)
		if err != nil {
			http.Error(w, "Consumer group creation failed", http.StatusInternalServerError)
			return
		}
	}

	rows, err := storage.DB.Query(ctx, `
		SELECT id, partition_number FROM partitions WHERE topic_id=$1 ORDER BY partition_number
	`, topicID)
	if err != nil {
		http.Error(w, "Partition lookup failed", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var partitions []models.Partition
	for rows.Next() {
		var p models.Partition
		if err := rows.Scan(&p.ID, &p.Number); err == nil {
			partitions = append(partitions, p)
		}
	}

	var messages []ConsumedMessage

	for _, p := range partitions {
		if len(messages) >= batchSize {
			break
		}

		// Get last consumed offset
		var lastOffset sqlNullInt64
		storage.DB.QueryRow(ctx,
			`SELECT offset FROM consumer_offsets WHERE group_id=$1 AND partition_id=$2`,
			groupID, p.ID).Scan(&lastOffset)

		startOffset := int64(0)
		if lastOffset.Valid {
			startOffset = lastOffset.Int64 + 1
		}

		// Get next message
		var (
			msgID     uuid.UUID
			payload   json.RawMessage
			msgOffset int64
		)
		err := storage.DB.QueryRow(ctx, `
			SELECT id, payload, msg_offset FROM messages
			WHERE partition_id=$1 AND msg_offset=$2
		`, p.ID, startOffset).Scan(&msgID, &payload, &msgOffset)

		if err == nil {
			// Append to result
			messages = append(messages, ConsumedMessage{
				ID:        msgID,
				Payload:   payload,
				Partition: p.Number,
				Offset:    msgOffset,
			})

			// Update offset
			_, _ = storage.DB.Exec(ctx, `
				INSERT INTO consumer_offsets (group_id, partition_id, offset)
				VALUES ($1, $2, $3)
				ON CONFLICT (group_id, partition_id)
				DO UPDATE SET offset = EXCLUDED.offset
			`, groupID, p.ID, msgOffset)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}
