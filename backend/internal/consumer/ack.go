package consumer

import (
	"context"
	"errors"

	"github.com/SidM81/goQueue/internal/storage"
	"github.com/google/uuid"
)

func AcknowledgeMessage(ctx context.Context, messageID uuid.UUID, status string) error {
	switch status {
	case "acknowledged":
		_, err := storage.DB.Exec(ctx, `
			UPDATE messages
			SET status = 'acknowledged', acked_at = now()
			WHERE id = $1
		`, messageID)
		return err

	case "failed":
		_, err := storage.DB.Exec(ctx, `
			UPDATE messages
			SET status = 'failed',
			    attempt_count = attempt_count + 1,
			    last_attempt_at = now()
			WHERE id = $1
		`, messageID)
		return err

	default:
		return errors.New("invalid status value")
	}
}
