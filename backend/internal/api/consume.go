package api

import (
	"encoding/json"
	"net/http"

	"github.com/SidM81/goQueue/internal/consumer"
)

func ConsumeHandler(w http.ResponseWriter, r *http.Request) {
	topic := r.URL.Query().Get("topic")
	group := r.URL.Query().Get("group")

	if topic == "" || group == "" {
		http.Error(w, "Missing topic or group", http.StatusBadRequest)
		return
	}

	msg, err := consumer.FetchMessage(r.Context(), topic, group)
	if err != nil {
		http.Error(w, "No messages available", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msg)
}
