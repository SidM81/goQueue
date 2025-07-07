package main

import (
	"log"
	"net/http"

	"github.com/SidM81/goQueue/config"
	"github.com/SidM81/goQueue/internal/api"
	"github.com/SidM81/goQueue/internal/broker"
	"github.com/SidM81/goQueue/internal/storage"
	"github.com/gorilla/mux"
)

func main() {
	cfg := config.LoadConfig()
	storage.Connect(cfg.PostgresDSN)

	router := mux.NewRouter()
	broker.StartRetryWorker()

	// Routes
	router.HandleFunc("/topics", api.CreateTopicHandler).Methods("POST")
	router.HandleFunc("/topics", api.ListTopicsHandler).Methods("GET")
	router.HandleFunc("/produce", api.ProduceMessageHandler).Methods("POST")
	router.HandleFunc("/consume", api.ConsumeMessagesHandler).Methods("GET")
	router.HandleFunc("/ack", api.AcknowledgeHandler).Methods("POST")
	router.HandleFunc("/dashboard", api.DashboardHandler).Methods("GET")

	log.Println("🚀 GoQueue API running at http://localhost:8080")
	http.ListenAndServe(":8080", router)
}
