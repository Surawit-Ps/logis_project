package entity

import "time"

type FuelClaims struct{
	ID string
	TripId string
	DriverId string
	Amount float64
	ReceiptRef string
	ReceiptUrl string
	Status string
	CreatedAt time.Time
	UpdatedAt time.Time
}