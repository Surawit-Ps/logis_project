package services

import (
	"backend/core/dto"
	"backend/core/entity"
	"backend/core/port"
)

type TripService struct {
	tripRepo port.TripRepository
	userRepo port.UserRepository
}

func NewTripService(tripRepo port.TripRepository, userRepo port.UserRepository) TripService {
	return TripService{tripRepo: tripRepo, userRepo: userRepo}
}

func (s TripService) AddTrips(trip entity.Trips) error {
	return s.tripRepo.AddTrips(trip)
}

func (s TripService) GetATrip(id string) (*entity.Trips, error) {
	return s.tripRepo.GetATrip(id)
}

func (s TripService) FindTripByID(id string) (*entity.Trips, error) {
	return s.tripRepo.FindTripByID(id)
}

func (s TripService) GetAllTripsByDriverID(driverID string) ([]dto.TripResponse, error) {
	trips, err := s.tripRepo.GetAllTripsByDriverID(driverID)
	if err != nil {
		return nil, err
	}

	var tripResponses []dto.TripResponse
	for _, trip := range trips {
		tripResponses = append(tripResponses, dto.TripResponse{
			ID:          trip.ID,
			Origin:      trip.Origin,
			Destination: trip.Destination,
			Status:      trip.Status,
			CreatedAt:  trip.CreatedAt,
		})
	}

	return tripResponses, nil
}
