package producer

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/SidM81/goQueue/internal/storage"
	"github.com/google/uuid"
)

type Message struct {
	ID          uuid.UUID
	PartitionID uuid.UUID
	Payload     json.RawMessage
	Offset      int64
}

func StoreMessage(ctx context.Context, topic string, payload json.RawMessage) (Message, error) {
	var partitionID uuid.UUID

	// Basic: Pick first partition
	err := storage.DB.QueryRow(ctx, `
		SELECT id FROM partitions
		WHERE topic_id = (SELECT id FROM topics WHERE name = $1)
		ORDER BY id LIMIT 1
	`, topic).Scan(&partitionID)

	if err != nil {
		return Message{}, errors.New("partition not found")
	}

	// Get next offset
	var offset int64
	_ = storage.DB.QueryRow(ctx, `
		SELECT COALESCE(MAX(msg_offset), 0)+1 FROM messages WHERE partition_id = $1
	`, partitionID).Scan(&offset)

	id := uuid.New()
	_, err = storage.DB.Exec(ctx, `
		INSERT INTO messages (id, partition_id, msg_offset, payload, status)
		VALUES ($1, $2, $3, $4, 'pending')
	`, id, partitionID, offset, payload)

	return Message{ID: id, PartitionID: partitionID, Payload: payload, Offset: offset}, err
}
