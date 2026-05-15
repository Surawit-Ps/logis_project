package repository

import (
	"backend/core/entity"
	"errors"
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FuelClaimRepository struct {
	db *gorm.DB
}

type FuelClaim struct {
	ID         string `gorm:"primaryKey"`
	TripId     string
	DriverId   string
	Amount     float64
	ReceiptRef string
	ReceiptUrl string
	Status     string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func FuelClaimToEntity(claim FuelClaim) entity.FuelClaims {
	return entity.FuelClaims{
		ID:         claim.ID,
		TripId:     claim.TripId,
		DriverId:   claim.DriverId,
		Amount:     claim.Amount,
		ReceiptRef: claim.ReceiptRef,
		ReceiptUrl: claim.ReceiptUrl,
		Status:     claim.Status,
		CreatedAt:  claim.CreatedAt,
		UpdatedAt:  claim.UpdatedAt,
	}
}

func EntityToFuelClaim(claim entity.FuelClaims) FuelClaim {
	return FuelClaim{
		ID:         claim.ID,
		TripId:     claim.TripId,
		DriverId:   claim.DriverId,
		Amount:     claim.Amount,
		ReceiptRef: claim.ReceiptRef,
		ReceiptUrl: claim.ReceiptUrl,
		Status:     claim.Status,
		CreatedAt:  claim.CreatedAt,
		UpdatedAt:  claim.UpdatedAt,
	}
}

func NewFuelClaimRepository(db *gorm.DB) FuelClaimRepository {
	return FuelClaimRepository{db: db}
}

func (r FuelClaimRepository) AddFuelClaim(claim entity.FuelClaims) error {
	claim.ID = uuid.New().String()
	claim.CreatedAt = time.Now()
	claim.UpdatedAt = time.Now()
	enClaim := EntityToFuelClaim(claim)
	result := r.db.Create(&enClaim)
	return result.Error
}

func (r FuelClaimRepository) GetFuelClaimByID(id string) (*entity.FuelClaims, error) {
	var claim FuelClaim
	result := r.db.Where("id = ?", id).First(&claim)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil 
	}
	enClaim := FuelClaimToEntity(claim)
	return &enClaim, result.Error
}

func (r FuelClaimRepository) UpdateStatusClaim(id string, status string) error {
	result := r.db.Model(&entity.FuelClaims{}).Where("id = ?", id).Update("status", status)
	return result.Error
}

func (r FuelClaimRepository) FindClaimByDriverID(driverID string) ([]entity.FuelClaims, error) {
	var claims []FuelClaim
	result := r.db.Where("driver_id = ?", driverID).Find(&claims)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil 
	}
	enClaims := make([]entity.FuelClaims, len(claims))
	for i, claim := range claims {
		enClaims[i] = FuelClaimToEntity(claim)
	}
	return enClaims, result.Error
}

func (r FuelClaimRepository) FindClaimByTripID(tripID string) ([]entity.FuelClaims, error) {
	var claims []FuelClaim
	result := r.db.Where("trip_id = ?", tripID).Find(&claims)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil 
	}
	enClaims := make([]entity.FuelClaims, len(claims))
	for i, claim := range claims {
		enClaims[i] = FuelClaimToEntity(claim)
	}
	return enClaims, result.Error
}


func (r FuelClaimRepository) UpdateFuelClaim(claim entity.FuelClaims) error {
	enClaim := EntityToFuelClaim(claim)
	result := r.db.Save(&enClaim)
	return result.Error
}

func (r FuelClaimRepository) FindFuelClaimByID(id string) (*entity.FuelClaims, error) {
	var claim FuelClaim
	result := r.db.Where("id = ?", id).First(&claim)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, errors.New("claim not found")
	}
	if result.Error != nil {
		return nil, result.Error
	}
	enClaim := FuelClaimToEntity(claim)
	return &enClaim, nil
}

func (r FuelClaimRepository) IsReceiptRefExists(receiptRef string) (bool, error) {
	var count int64
	result := r.db.Model(&FuelClaim{}).Where("receipt_ref = ?", receiptRef).Count(&count)
	if result.Error != nil {
		return false, result.Error
	}
	return count > 0, nil
}

func (r FuelClaimRepository) FindClaimByStatus(status string) ([]entity.FuelClaims, error) {
	var claims []FuelClaim
	result := r.db.Where("status = ?", status).Find(&claims)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil 
	}
	enClaims := make([]entity.FuelClaims, len(claims))
	for i, claim := range claims {
		enClaims[i] = FuelClaimToEntity(claim)
	}
	return enClaims, result.Error
}





