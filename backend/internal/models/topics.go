package models

import "github.com/google/uuid"

type TopicWithPartitions struct {
	ID         uuid.UUID `json:"id"`
	Name       string    `json:"name"`
	Partitions []int     `json:"partitions"`
}
