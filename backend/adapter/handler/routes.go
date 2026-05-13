package handler

import (
	"backend/core/services"
	"backend/core/middleware"
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
) Routes {
	return Routes{
		fuelClaimHandler: NewFuelClaimHandler(fuelClaimService),
		tripHandler:      NewTripHandler(tripService),
		userHandler:      NewUserHandler(userService),
	}
}

func (r Routes) RegisterRoutes(app *fiber.App) {

	app.Post("/login", r.userHandler.Login)
	auth := middleware.Authorizes()
	userGroup := app.Group("/api/users", auth)
	userGroup.Post("/register", r.userHandler.Register,auth)
	userGroup.Patch("/:userID/status", r.userHandler.ChangeStatus, auth)


	fuelGroup := app.Group("/api/fuel-claims")
	fuelGroup.Post("/", r.fuelClaimHandler.SubmitClaim)
	fuelGroup.Get("/:claimID", r.fuelClaimHandler.GetClaimWithAuditTrail)
	fuelGroup.Get("/driver", r.fuelClaimHandler.GetClaimsByDriverID)
	fuelGroup.Get("/status/supervisor", r.fuelClaimHandler.GetClaimsForSupervisor)
	fuelGroup.Get("/status/finance", r.fuelClaimHandler.GetClaimsForFinance)

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
