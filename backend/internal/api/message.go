package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/SidM81/goQueue/internal/producer"
)

type ProduceRequest struct {
	Topic   string          `json:"topic"`
	Payload json.RawMessage `json:"payload"`
}

type ProduceResponse struct {
	MessageID   string `json:"message_id"`
	PartitionID string `json:"partition_id"`
	Offset      int64  `json:"offset"`
}

func ProduceHandler(w http.ResponseWriter, r *http.Request) {
	var req ProduceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	msg, err := producer.StoreMessage(ctx, req.Topic, req.Payload)
	if err != nil {
		log.Println("❌ Produce error:", err)
		http.Error(w, "Failed to store message", http.StatusInternalServerError)
		return
	}

	resp := ProduceResponse{
		MessageID:   msg.ID.String(),
		PartitionID: msg.PartitionID.String(),
		Offset:      msg.Offset,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
