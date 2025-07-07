package storage

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func Connect(dsn string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var err error
	DB, err = pgxpool.New(ctx, dsn)
	if err != nil {
		panic(fmt.Sprintf("Unable to connect to database: %v", err))
	}

	err = DB.Ping(ctx)
	if err != nil {
		panic(fmt.Sprintf("Database ping failed: %v", err))
	}

	fmt.Println("✅ Connected to Postgres")
}
