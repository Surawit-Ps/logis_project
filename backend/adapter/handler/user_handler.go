package handler

import (
	"backend/core/entity"
	"backend/core/middleware"
	"backend/core/services"
	"backend/pkg/redis"
	"context"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type UserHandler struct {
	service services.UserService
	redis   *redis.Redis
}

func NewUserHandler(service services.UserService, redis *redis.Redis) UserHandler {
	return UserHandler{service: service, redis: redis}
}

func (h UserHandler) Register(c *fiber.Ctx) error {
	errf := IsFinance(c)
	if errf != nil {
		return handleError(c, errf)
	}

	var req struct {
		Username string `json:"username" binding:"required,min=3"`
		Password string `json:"password" binding:"required,min=6"`
	}

	if err := c.BodyParser(&req); err != nil {
		return handleError(c, err)
	}

	user := entity.User{
		ID:       uuid.New().String(),
		UserName: req.Username,
		Password: req.Password,
		Role:     "driver",
	}

	err := h.service.CreateUser(user)
	if err != nil {
		return handleError(c, err)
	}

	return newResponseSuccessMessage(c, "User registered successfully")
}

func (h UserHandler) Login(c *fiber.Ctx) error {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.BodyParser(&req); err != nil {
		return handleError(c, err)
	}

	ctx := context.Background()
	key := "login_attempts:" + req.Username

	// Check login attempts (with better error handling)
	attempts := ""
	if h.redis != nil {
		val, err := h.redis.Get(ctx, key)
		if err != nil {
			if err.Error() != "redis: nil" {
				// Not a "key doesn't exist" error - log it
				fmt.Printf("⚠️  Redis Get error for %s: %v\n", req.Username, err)
			}
		} else {
			attempts = val
		}
	} else {
		fmt.Println("⚠️  Redis not available - rate limiting disabled")
	}

	fmt.Printf("🔍 Login attempt for %s. Current attempts: %s\n", req.Username, attempts)


	var attemptCount int64 = 0
	if attempts != "" {
		_, _ = fmt.Sscanf(attempts, "%d", &attemptCount)
		fmt.Printf("Parsed attempt count for %s: %d\n", req.Username, attemptCount)
	}


	const maxAttempts = 5
	const lockoutDuration = 1 // minutes

	if attemptCount >= maxAttempts {
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
			"success": false,
			"message": "Too many login attempts. Try again in 1 minute.",
		})
	}

	user, token, err := h.service.Login(req.Username, req.Password)
	if err != nil {
		// Failed login - increment attempts (if Redis available)
		if h.redis != nil {
			newCount, incrErr := h.redis.IncrementWithExpiration(ctx, key, time.Minute*time.Duration(lockoutDuration))
			if incrErr != nil {
				fmt.Printf("❌ Redis increment error for %s: %v\n", req.Username, incrErr)
			} else {
				fmt.Printf("❌ Failed login for %s. Attempts: %d/%d\n", req.Username, newCount, maxAttempts)
			}
		} else {
			fmt.Printf("❌ Failed login for %s (Redis disabled)\n", req.Username)
		}
		return handleError(c, err)
	}

	// Successful login - clear attempts (if Redis available)
	if h.redis != nil {
		delErr := h.redis.Del(ctx, key)
		if delErr != nil {
			fmt.Printf("⚠️  Redis delete error for %s: %v\n", req.Username, delErr)
		} else {
			fmt.Printf("✅ Successful login for %s. Attempts cleared.\n", req.Username)
		}
	}

	middleware.SetCookies(c, token)

	// Store user info for frontend
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"token":    token,
			"user_id":  user.ID,
			"username": user.UserName,
			"role":     user.Role,
		},
	})
}

func (h UserHandler) ChangeStatus(c *fiber.Ctx) error {
	errf := IsFinance(c)
	if errf != nil {
		return handleError(c, errf)
	}
	userID := c.Params("userID")
	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.BodyParser(&req); err != nil {
		return handleError(c, err)
	}

	if userID == "" {
		return handleError(c, fmt.Errorf("User ID is required"))
	}

	err := h.service.ChangeStatusUser(userID, req.Status)
	if err != nil {
		return handleError(c, err)
	}

	return newResponseSuccessMessage(c, "User status updated successfully")
}
