package models

import "github.com/google/uuid"

type Partition struct {
	ID     uuid.UUID
	Number int
}
