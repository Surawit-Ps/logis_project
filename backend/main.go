package main

import (
	"backend/adapter/handler"
	"backend/adapter/repository"
	"backend/core/entity"
	"backend/core/middleware"
	"backend/core/services"
	"log"

	"github.com/gofiber/fiber/v2"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {

	db, err := gorm.Open(sqlite.Open("fuel_claim.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database")
	}

	db.AutoMigrate(&repository.User{}, &repository.Trip{}, &repository.FuelClaim{}, &repository.AuditLog{})

	claimRepo := repository.NewFuelClaimRepository(db)
	auditRepo := repository.NewAuditLogRepository(db)
	userRepo := repository.NewUserRepository(db)
	tripRepo := repository.NewTripRepository(db)

	fuelClaimService := services.NewFuelClaimService(claimRepo, auditRepo, userRepo, tripRepo)
	tripService := services.NewTripService(tripRepo, userRepo)
	userService := services.NewUserService(userRepo)

	seedData(fuelClaimService, tripService, userService, userRepo)

	routes := handler.NewRoutes(fuelClaimService, tripService, userService)

	app := fiber.New()
	middleware.CORS(app)
	routes.RegisterRoutes(app)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "healthy",
		})
	})

	log.Fatal(app.Listen(":3000"))
}

func seedData(fuelClaimService services.FuelClaimService, tripService services.TripService, userService services.UserService,userRepo repository.UserRepository) {
	// check if no data 
	var users []entity.User
	err := userRepo.GetAllUsers(&users)
	if err != nil {
		log.Fatal("failed to get users")
	}

	if len(users) > 0 {
		return
	}

	// สร้างผู้ใช้ตัวอย่าง
	user := []entity.User{
		{
			UserName: "d1", // driver
			Password: "123",
		},
		{
			UserName: "s1", // supervisor
			Password: "123",
		},
		{
			UserName: "f1", // finance
			Password: "123",
		},
	}

	for _, u := range user {
		userService.CreateUser(u)
	}

	// upate status user
	userService.ChangeStatusUser("s1", "supervisor")
	userService.ChangeStatusUser("f1", "finance")

	driver, _, _ := userService.Login("d1", "123")

	trip := entity.Trips{
		DriverId:    driver.ID,
		Origin:      "Bangkok",
		Destination: "Chiang Mai",
		Status:      "pending",
	}
	tripService.AddTrips(trip)




}
