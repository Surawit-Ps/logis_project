package repository

import (
	"backend/core/entity"
	"errors"

	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TripRepository struct {
	db *gorm.DB
}

type Trip struct {
	ID          string `gorm:"primaryKey"`
	DriverID    string
	Origin      string
	Destination string
	StartTime   time.Time
	Status      string
	CreatedAt   time.Time
}

func TripToEntity(trip Trip) entity.Trips {
	return entity.Trips{
		ID:          trip.ID,
		DriverId:    trip.DriverID,
		Origin:      trip.Origin,
		Destination: trip.Destination,
		StartTime:   trip.StartTime,
		Status:      trip.Status,
		CreatedAt:   trip.CreatedAt,
	}
}

func EntityToTrip(trip entity.Trips) Trip {
	return Trip{
		ID:          trip.ID,
		DriverID:    trip.DriverId,
		Origin:      trip.Origin,
		Destination: trip.Destination,
		StartTime:   trip.StartTime,
		Status:      trip.Status,
		CreatedAt:   trip.CreatedAt,
	}
}

func NewTripRepository(db *gorm.DB) TripRepository {
	return TripRepository{db: db}
}

func (r TripRepository) AddTrips(trip entity.Trips) error {
	Tid := uuid.New().String()
	trip.ID = Tid
	trip.CreatedAt = time.Now()
	trip.Status = "pending"
	enTrip := EntityToTrip(trip)
	result := r.db.Create(&enTrip)
	return result.Error
}

func (r TripRepository) GetATrip(id string) (*entity.Trips, error) {
	var trip Trip
	result := r.db.Where("id = ?", id).First(&trip)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil // ไม่พบทริป
	}
	enTrip := TripToEntity(trip)
	return &enTrip, result.Error
}

func (r TripRepository) FindTripByID(id string) (*entity.Trips, error) {
	var trip Trip
	result := r.db.Where("id = ?", id).First(&trip)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil // ไม่พบทริป
	}
	enTrip := TripToEntity(trip)
	return &enTrip, result.Error
}

func (r TripRepository) GetAllTripsByDriverID(driverID string) ([]entity.Trips, error) {
	var trips []Trip
	result := r.db.Where("driver_id = ?", driverID).Find(&trips)
	if result.Error != nil {
		return nil, result.Error
	}
	var enTrips []entity.Trips
	for _, trip := range trips {
		enTrips = append(enTrips, TripToEntity(trip))
	}
	return enTrips, nil
}
