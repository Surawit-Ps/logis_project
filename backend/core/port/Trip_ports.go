package port

import (
	"backend/core/dto"
	"backend/core/entity"
)

type TripRepository interface {
	AddTrips(entity.Trips) error
	GetATrip(id string) (*entity.Trips, error)
	FindTripByID(id string) (*entity.Trips, error)
	GetAllTripsByDriverID(driverID string) ([]entity.Trips, error)
}

type TripService interface {
	AddTrips(trip entity.Trips) error
	GetATrip(id string) (*entity.Trips, error)
	GetAllTripsByDriverID(driverID string) ([]dto.TripResponse, error)
	FindTripByID(id string) (*entity.Trips, error)
}
