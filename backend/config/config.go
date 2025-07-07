package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	PostgresDSN string
}

func LoadConfig() Config {
	err := godotenv.Load("../../../.env") // relative to cmd/goqueue
	if err != nil {
		log.Println("Could not load .env , using system env")
	}

	dsn := os.Getenv("POSTGRES_DSN")
	if dsn == "" {
		log.Fatal("POSTGRES_DSN not set in environment")
	}

	return Config{
		PostgresDSN: dsn,
	}
}
