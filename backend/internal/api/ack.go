package api

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/SidM81/goQueue/internal/storage"
	"github.com/google/uuid"
)

type AckRequest struct {
	MessageID uuid.UUID `json:"message_id"`
	Status    string    `json:"status"` // "acknowledged" or "failed"
}

func AcknowledgeHandler(w http.ResponseWriter, r *http.Request) {
	var req AckRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	switch req.Status {
	case "acknowledged":
		_, err := storage.DB.Exec(ctx, `
			UPDATE messages
			SET status = 'acknowledged',
			    acked_at = now()
			WHERE id = $1
		`, req.MessageID)
		if err != nil {
			log.Println("ACK update error:", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

	case "failed":
		_, err := storage.DB.Exec(ctx, `
			UPDATE messages
			SET status = 'failed',
			    attempt_count = attempt_count + 1,
			    last_attempt_at = now()
			WHERE id = $1
		`, req.MessageID)
		if err != nil {
			log.Println("FAIL update error:", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

	default:
		http.Error(w, "Invalid status value", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("acknowledged"))
}
