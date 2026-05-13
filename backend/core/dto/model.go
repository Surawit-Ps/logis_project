package dto


import "time"

type FuelClaimDetail struct {
	ID         string  `json:"id"`
	Status     string  `json:"status"` 
	Amount     float64 `json:"amount"`
	ReceiptRef string  `json:"receipt_ref"`
	ReceiptURL string  `json:"receipt_url"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	Driver DriverInfo `json:"driver"`
	Trip TripInfo `json:"trip"`
	AuditTrail []AuditLogInfo `json:"audit_trail"`
}


type SubmitClaimRequest struct {
	TripID     string  `json:"trip_id"`
	Amount     float64 `json:"amount"`
	ReceiptRef string  `json:"receipt_ref"`
	ReceiptURL string  `json:"receipt_url"` 
}

type TripResponse struct {
	ID          string `json:"id"`
	Origin      string `json:"origin"`
	Destination string `json:"destination"`
	Status      string `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

type DriverInfo struct {
	ID       string `json:"id"`
	Username string `json:"username"`
}

type TripInfo struct {
	ID          string `json:"id"`
	Origin      string `json:"origin"`
	Destination string `json:"destination"`
	Status      string `json:"status"`
}

type AuditLogInfo struct {
	ID         string    `json:"id"`
	Action     string    `json:"action"`      
	ActorName  string    `json:"actor_name"`  
	ActorRole  string    `json:"actor_role"`  
	FromStatus string    `json:"from_status,omitempty"` 
	ToStatus   string    `json:"to_status,omitempty"`
	Remarks    string    `json:"remarks,omitempty"`  
	CreatedAt  time.Time `json:"created_at"`
}

