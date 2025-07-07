package api

import (
	"context"
	"encoding/json"
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

	err := storage.DB.QueryRow(ctx, `SELECT COUNT(*) FROM messages`).Scan(&metrics.TotalMessages)
	err = storage.DB.QueryRow(ctx, `SELECT COUNT(*) FROM messages WHERE status = 'pending'`).Scan(&metrics.PendingMessages)
	err = storage.DB.QueryRow(ctx, `SELECT COUNT(*) FROM messages WHERE status = 'acknowledged'`).Scan(&metrics.Acknowledged)
	err = storage.DB.QueryRow(ctx, `SELECT COUNT(*) FROM messages WHERE status = 'failed' AND attempt_count < max_retries`).Scan(&metrics.FailedRetryable)
	err = storage.DB.QueryRow(ctx, `SELECT COUNT(*) FROM dead_letters`).Scan(&metrics.DeadLettered)

	if err != nil {
		http.Error(w, "Failed to query metrics", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}
