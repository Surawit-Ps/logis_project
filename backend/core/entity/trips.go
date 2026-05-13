package entity

import "time"

type Trips struct{
	ID	string
	DriverId string
	Origin string
	Destination string
	StartTime time.Time // pending, ongoing, completed
	Status string
	CreatedAt time.Time	
}