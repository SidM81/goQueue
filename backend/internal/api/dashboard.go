package api

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/SidM81/goQueue/internal/storage"
)

type DashboardMetrics struct {
	TotalMessages   int `json:"total_messages"`
	PendingMessages int `json:"pending_messages"`
	Acknowledged    int `json:"acknowledged_messages"`
	FailedRetryable int `json:"retryable_failed_messages"`
	DeadLettered    int `json:"dead_letter_messages"`
}

func DashboardHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	var metrics DashboardMetrics

	if err := storage.DB.QueryRow(ctx, `SELECT COUNT(*) FROM messages`).Scan(&metrics.TotalMessages); err != nil {
		log.Printf("Error counting total messages: %v", err)
		http.Error(w, "Failed to get total messages", http.StatusInternalServerError)
		return
	}

	if err := storage.DB.QueryRow(ctx, `SELECT COUNT(*) FROM messages WHERE status = 'pending'`).Scan(&metrics.PendingMessages); err != nil {
		log.Printf("Error counting pending messages: %v", err)
		http.Error(w, "Failed to get pending messages", http.StatusInternalServerError)
		return
	}

	if err := storage.DB.QueryRow(ctx, `SELECT COUNT(*) FROM messages WHERE status = 'acknowledged'`).Scan(&metrics.Acknowledged); err != nil {
		log.Printf("Error counting acknowledged messages: %v", err)
		http.Error(w, "Failed to get acknowledged messages", http.StatusInternalServerError)
		return
	}

	if err := storage.DB.QueryRow(ctx, `SELECT COUNT(*) FROM messages WHERE status = 'failed' AND attempt_count < max_retries`).Scan(&metrics.FailedRetryable); err != nil {
		log.Printf("Error counting retryable failed messages: %v", err)
		http.Error(w, "Failed to get retryable failed messages", http.StatusInternalServerError)
		return
	}

	if err := storage.DB.QueryRow(ctx, `SELECT COUNT(*) FROM dead_letters`).Scan(&metrics.DeadLettered); err != nil {
		log.Printf("Error counting dead letters: %v", err)
		http.Error(w, "Failed to get dead letter count", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}
