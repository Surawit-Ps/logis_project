package handler

import (
	"backend/core/entity"
	"backend/core/services"
	e "backend/pkg/errs"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type TripHandler struct {
	service services.TripService
}

func NewTripHandler(service services.TripService) TripHandler {
	return TripHandler{service: service}
}

func (h TripHandler) AddTrip(c *fiber.Ctx) error {
	var req struct {
		Origin      string `json:"origin"`
		Destination string `json:"destination"`
		StartTime   string `json:"start_time"`
	}

	if err := c.BodyParser(&req); err != nil {
		return handleError(c, err)
	}

	userID := c.Locals("userID").(string)

	trip := entity.Trips{
		ID:          uuid.New().String(),
		DriverId:    userID,
		Origin:      req.Origin,
		Destination: req.Destination,
		Status:      "pending",
	}

	err := h.service.AddTrips(trip)
	if err != nil {
		return handleError(c, err)
	}

	return newResponseSuccess(c, trip)
}

func (h TripHandler) GetTrip(c *fiber.Ctx) error {
	tripID := c.Params("tripID")

	if tripID == "" {
		return handleError(c, e.ErrBadRequest)
	}

	trip, err := h.service.GetATrip(tripID)
	if err != nil {
		return handleError(c, err)
	}

	return newResponseSuccess(c, trip)
}

func (h TripHandler) FindTrip(c *fiber.Ctx) error {
	tripID := c.Params("tripID")

	if tripID == "" {
		return handleError(c, e.ErrBadRequest)
	}

	trip, err := h.service.FindTripByID(tripID)
	if err != nil {
		return handleError(c, err)
	}

	return newResponseSuccess(c, trip)
}

func (h TripHandler) GetAllTripsByDriverID(c *fiber.Ctx,) error {

	userID := c.Locals("userID")

	driverID, ok := userID.(string)
	if !ok || driverID == "" {
		return handleError(c, e.ErrBadRequest)
	}

	trips, err := h.service.GetAllTripsByDriverID(
		driverID,
	)
	if err != nil {
		return handleError(c, err)
	}

	return newResponseSuccess(c, trips)
}
