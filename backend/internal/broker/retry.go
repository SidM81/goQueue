package broker

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/SidM81/goQueue/internal/storage"
	"github.com/google/uuid"
)

const (
	MaxRetries    = 3
	RetryInterval = 10 * time.Second // Poll interval
)

func StartRetryWorker() {
	go func() {
		ticker := time.NewTicker(RetryInterval)
		defer ticker.Stop()

		for range ticker.C {
			processRetries()
		}
	}()
}

func processRetries() {
	ctx := context.Background()
	log.Println("🔁 Retry worker running...")

	rows, err := storage.DB.Query(ctx, `
		SELECT id, partition_id, msg_offset, payload, attempt_count
		FROM messages
		WHERE status = 'failed' AND attempt_count < $1
		ORDER BY last_attempt_at ASC
		LIMIT 10
	`, MaxRetries)
	if err != nil {
		log.Println("Retry query failed:", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var (
			id           uuid.UUID
			partitionID  uuid.UUID
			offset       int64
			payload      json.RawMessage
			attemptCount int
		)
		if err := rows.Scan(&id, &partitionID, &offset, &payload, &attemptCount); err != nil {
			log.Println("Scan failed:", err)
			continue
		}

		log.Printf("🔄 Retrying message %s (attempt %d)\n", id.String(), attemptCount+1)

		if attemptCount+1 >= MaxRetries {
			// Move to DLQ
			_, err := storage.DB.Exec(ctx, `
				INSERT INTO dead_letters (message_id, partition_id, msg_offset, payload, failed_at)
				VALUES ($1, $2, $3, $4, now())
			`, id, partitionID, offset, payload)
			if err != nil {
				log.Println("DLQ insert failed:", err)
				continue
			}

			// Delete from main table or mark as final failed
			_, _ = storage.DB.Exec(ctx, `
				UPDATE messages
				SET status = 'dead', attempt_count = $1
				WHERE id = $2
			`, attemptCount+1, id)

			log.Printf("💀 Moved message %s to dead_letters\n", id.String())
		} else {
			// Requeue
			_, err := storage.DB.Exec(ctx, `
				UPDATE messages
				SET attempt_count = attempt_count + 1,
					last_attempt_at = now(),
					status = 'pending'
				WHERE id = $1
			`, id)
			if err != nil {
				log.Println("Requeue failed:", err)
			}
		}
	}
}
