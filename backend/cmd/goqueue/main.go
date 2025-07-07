package main

import (
	"context"
	"fmt"

	"github.com/SidM81/goQueue/config"
	"github.com/SidM81/goQueue/internal/storage"
)

func main() {
	cfg := config.LoadConfig()

	storage.Connect(cfg.PostgresDSN)

	// Test query
	var count int
	err := storage.DB.QueryRow(
		context.Background(),
		"SELECT COUNT(*) FROM topics",
	).Scan(&count)

	if err != nil {
		panic(err)
	}

	fmt.Printf(" %d topics in DB\n", count)

}
