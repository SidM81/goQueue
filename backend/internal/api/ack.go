package api

import (
	"encoding/json"
	"net/http"

	"github.com/SidM81/goQueue/internal/consumer"
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

	err := consumer.AcknowledgeMessage(r.Context(), req.MessageID, req.Status)
	if err != nil {
		http.Error(w, "Acknowledge failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("acknowledged"))
}
