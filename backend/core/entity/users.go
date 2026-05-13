package entity

import "time"

type User struct {
	ID        string
	UserName  string
	Password  string
	Role      string
	CreatedAt time.Time
}
