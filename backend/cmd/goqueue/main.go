package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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

	// Routes
	router.HandleFunc("/topics", api.CreateTopicHandler).Methods("POST")
	router.HandleFunc("/topics", api.ListTopicsHandler).Methods("GET")
	router.HandleFunc("/produce", api.ProduceHandler).Methods("POST")
	router.HandleFunc("/consume", api.ConsumeHandler).Methods("GET")
	router.HandleFunc("/ack", api.AcknowledgeHandler).Methods("POST")
	router.HandleFunc("/dashboard", api.DashboardHandler).Methods("GET")
	router.Use(api.LoggingMiddleware)

	broker.StartRetryWorker()

	srv := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	// Graceful shutdown
	go func() {
		log.Println("Server running on http://localhost:8080")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Listen error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}

	log.Println("✅ Server stopped gracefully")
}
