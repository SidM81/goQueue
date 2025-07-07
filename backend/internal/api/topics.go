package api

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/SidM81/goQueue/internal/models"
	"github.com/SidM81/goQueue/internal/storage"
	"github.com/google/uuid"
)

type CreateTopicRequest struct {
	Name       string `json:"name"`
	Partitions int    `json:"partitions"`
}

type CreateTopicResponse struct {
	ID         uuid.UUID `json:"id"`
	Name       string    `json:"name"`
	Partitions int       `json:"partitions"`
}

func CreateTopicHandler(w http.ResponseWriter, r *http.Request) {
	var req CreateTopicRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if req.Partitions <= 0 {
		req.Partitions = 1
	}

	// Start a DB transaction
	tx, err := storage.DB.Begin(context.Background())
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(context.Background())

	// Insert topic
	var topicID uuid.UUID
	err = tx.QueryRow(context.Background(),
		`INSERT INTO topics (name) VALUES ($1) RETURNING id`,
		req.Name,
	).Scan(&topicID)
	if err != nil {
		http.Error(w, "Insert topic failed", http.StatusInternalServerError)
		return
	}

	// Insert partitions
	for i := 0; i < req.Partitions; i++ {
		_, err := tx.Exec(context.Background(),
			`INSERT INTO partitions (topic_id, partition_number) VALUES ($1, $2)`,
			topicID, i)
		if err != nil {
			http.Error(w, "Insert partition failed", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(context.Background()); err != nil {
		http.Error(w, "Commit failed", http.StatusInternalServerError)
		return
	}

	resp := CreateTopicResponse{
		ID:         topicID,
		Name:       req.Name,
		Partitions: req.Partitions,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func ListTopicsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := storage.DB.Query(context.Background(), `
		SELECT t.id, t.name, p.partition_number
		FROM topics t
		LEFT JOIN partitions p ON p.topic_id = t.id
		ORDER BY t.created_at, p.partition_number
	`)
	if err != nil {
		http.Error(w, "Query failed", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Map of topic_id -> TopicWithPartitions
	topicsMap := make(map[uuid.UUID]*models.TopicWithPartitions)

	for rows.Next() {
		var (
			topicID         uuid.UUID
			topicName       string
			partitionNumber int
		)
		if err := rows.Scan(&topicID, &topicName, &partitionNumber); err != nil {
			http.Error(w, "Scan failed", http.StatusInternalServerError)
			return
		}

		if _, exists := topicsMap[topicID]; !exists {
			topicsMap[topicID] = &models.TopicWithPartitions{
				ID:         topicID,
				Name:       topicName,
				Partitions: []int{},
			}
		}
		topicsMap[topicID].Partitions = append(topicsMap[topicID].Partitions, partitionNumber)
	}

	// Convert map to slice
	var topics []models.TopicWithPartitions
	for _, t := range topicsMap {
		topics = append(topics, *t)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(topics)
}
