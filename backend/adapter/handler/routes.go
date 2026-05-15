package handler

import (
	"backend/core/middleware"
	"backend/core/services"
	"backend/pkg/redis"

	"github.com/gofiber/fiber/v2"
)

type Routes struct {
	fuelClaimHandler FuelClaimHandler
	tripHandler      TripHandler
	userHandler      UserHandler
}

func NewRoutes(
	fuelClaimService services.FuelClaimService,
	tripService services.TripService,
	userService services.UserService,
	redisClient *redis.Redis,
) Routes {
	return Routes{
		fuelClaimHandler: NewFuelClaimHandler(fuelClaimService),
		tripHandler:      NewTripHandler(tripService),
		userHandler:      NewUserHandler(userService, redisClient),
	}
}

func (r Routes) RegisterRoutes(app *fiber.App) {

	app.Post("/login", r.userHandler.Login)
	auth := middleware.Authorizes()
	userGroup := app.Group("/api/users", auth)
	userGroup.Post("/register", r.userHandler.Register, auth)
	userGroup.Patch("/:userID/status", r.userHandler.ChangeStatus, auth)

	fuelGroup := app.Group("/api/fuel-claims", auth)
	fuelGroup.Post("/", r.fuelClaimHandler.SubmitClaim)
	fuelGroup.Get("/driver", r.fuelClaimHandler.GetClaimsByDriverID)
	fuelGroup.Get("/status/supervisor", r.fuelClaimHandler.GetClaimsForSupervisor)
	fuelGroup.Get("/status/finance", r.fuelClaimHandler.GetClaimsForFinance)
	fuelGroup.Get("/:claimID", r.fuelClaimHandler.GetClaimWithAuditTrail)

	// Supervisor approval
	fuelGroup.Post("/:claimID/approve-supervisor", r.fuelClaimHandler.ApproveBySupervisor)
	fuelGroup.Post("/:claimID/reject-supervisor", r.fuelClaimHandler.RejectBySupervisor)

	// Finance approval
	fuelGroup.Post("/:claimID/approve-finance", r.fuelClaimHandler.ApproveByFinance)
	fuelGroup.Post("/:claimID/reject-finance", r.fuelClaimHandler.RejectByFinance)

	// Trips routes
	tripGroup := app.Group("/api/trips", auth)
	tripGroup.Post("/", r.tripHandler.AddTrip)
	tripGroup.Get("/driver", r.tripHandler.GetAllTripsByDriverID)
	tripGroup.Get("/:tripID", r.tripHandler.GetTrip)
	tripGroup.Get("/find/:tripID", r.tripHandler.FindTrip)

	// Users routes

}
