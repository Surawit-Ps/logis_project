package entity

import "time"

type AuditLogs struct{
	ID string
	ClaimId string
	UserId string
	Action string
	FromStatus string
	ToStatus string
	Remarks string
	CreatedAt time.Time
}