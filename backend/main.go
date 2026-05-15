package main

import (
	"backend/adapter/handler"
	"backend/adapter/repository"
	"backend/core/entity"
	"backend/core/middleware"
	"backend/core/services"
	"backend/pkg/redis"
	"context"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"gorm.io/driver/sqlite"

	// "gorm.io/driver/postgres" // Uncomment for docker-compose
	"gorm.io/gorm"
)

func main() {
	// ==========================================
	// DATABASE CONFIGURATION
	// ==========================================
	// Choose one:
	// - SQLite: Uncomment below (local development)
	// - PostgreSQL: Uncomment postgres code below (docker-compose)
	// ==========================================

	// LOCAL DEVELOPMENT: SQLite
	db, err := gorm.Open(sqlite.Open("fuel_claim.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect to SQLite database:", err)
	}
	log.Println("✅ Connected to SQLite database: fuel_claim.db")

	// DOCKER COMPOSE: PostgreSQL (uncomment to use)
	
	// dbHost := os.Getenv("DB_HOST")
	// if dbHost == "" {
	// 	dbHost = "localhost"
	// }

	// dbPort := os.Getenv("DB_PORT")
	// if dbPort == "" {
	// 	dbPort = "5432"
	// }

	// dbUser := os.Getenv("DB_USER")
	// if dbUser == "" {
	// 	dbUser = "logis_user"
	// }

	// dbPassword := os.Getenv("DB_PASSWORD")
	// if dbPassword == "" {
	// 	dbPassword = "logis_password"
	// }

	// dbName := os.Getenv("DB_NAME")
	// if dbName == "" {
	// 	dbName = "logis_db"
	// }

	// dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
	// 	dbHost, dbPort, dbUser, dbPassword, dbName)

	// db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	// if err != nil {
	// 	log.Fatal("failed to connect to PostgreSQL database:", err)
	// }
	// log.Println("✅ Connected to PostgreSQL database:", dbName)
	

	db.AutoMigrate(&repository.User{}, &repository.Trip{}, &repository.FuelClaim{}, &repository.AuditLog{})

	// Initialize Redis
	redisHost := os.Getenv("REDIS_HOST")
	if redisHost == "" {
		redisHost = "localhost"
	}

	redisPort := os.Getenv("REDIS_PORT")
	if redisPort == "" {
		redisPort = "6379"
	}

	redisAddr := fmt.Sprintf("%s:%s", redisHost, redisPort)
	redisPassword := os.Getenv("REDIS_PASSWORD")
	if redisPassword == "" {
		redisPassword = ""
	}

	redisDB := 0
	redisClient := redis.NewRedis(redisAddr, redisPassword, redisDB)
	
	// Verify Redis connection
	ctx := context.Background()
	if err := redisClient.Ping(ctx); err != nil {
		log.Printf("⚠️  Redis connection failed (rate limiting disabled): %v", err)
		log.Printf("💡 To enable rate limiting, start Redis with: docker run -d -p 6379:6379 redis:7-alpine")
		redisClient = nil // Disable Redis - login will work without rate limiting
	} else {
		log.Printf("✅ Connected to Redis at %s", redisAddr)
	}

	claimRepo := repository.NewFuelClaimRepository(db)
	auditRepo := repository.NewAuditLogRepository(db)
	userRepo := repository.NewUserRepository(db)
	tripRepo := repository.NewTripRepository(db)

	fuelClaimService := services.NewFuelClaimService(claimRepo, auditRepo, userRepo, tripRepo)
	tripService := services.NewTripService(tripRepo, userRepo)
	userService := services.NewUserService(userRepo)

	seedData(fuelClaimService, tripService, userService, userRepo)

	routes := handler.NewRoutes(fuelClaimService, tripService, userService, redisClient)

	app := fiber.New()
	middleware.CORS(app)
	routes.RegisterRoutes(app)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "healthy",
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("🚀 Server running on http://localhost:%s", port)
	log.Fatal(app.Listen(":" + port))
}

func seedData(fuelClaimService services.FuelClaimService, tripService services.TripService, userService services.UserService, userRepo repository.UserRepository) {
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
			UserName: "d2", // driver
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
