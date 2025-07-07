package consumer

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/SidM81/goQueue/internal/storage"
	"github.com/google/uuid"
)

type ConsumedMessage struct {
	ID      uuid.UUID       `json:"id"`
	Payload json.RawMessage `json:"payload"`
}

func FetchMessage(ctx context.Context, topic, group string) (ConsumedMessage, error) {
	var (
		msgID       uuid.UUID
		payload     json.RawMessage
		partitionID uuid.UUID
		offset      int64
	)

	err := storage.DB.QueryRow(ctx, `
		SELECT m.id, m.payload, m.partition_id, m.msg_offset
		FROM messages m
		JOIN partitions p ON p.id = m.partition_id
		WHERE p.topic_id = (SELECT id FROM topics WHERE name = $1)
		AND m.status = 'pending'
		ORDER BY m.msg_offset ASC
		LIMIT 1
	`, topic).Scan(&msgID, &payload, &partitionID, &offset)

	if err != nil {
		return ConsumedMessage{}, errors.New("no messages available")
	}

	return ConsumedMessage{
		ID:      msgID,
		Payload: payload,
	}, nil
}
