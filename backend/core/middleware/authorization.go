package middleware

import (
	"net/http"
	"strings"
	"time"
	"backend/core/env"
	"github.com/gofiber/fiber/v2"
)

func Authorizes() fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenHeader := c.Get("Authorization")
		var token string
		if tokenHeader != "" && strings.HasPrefix(tokenHeader, "Bearer ") {
			token = strings.TrimPrefix(tokenHeader, "Bearer ")
		} else {
			token = c.Cookies("access_token")        // read cookie set by SetCookies
		}
		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized"})
		}
		jwtWrapper := JwtWrapper{
			SecretKey:       env.LoadConfig().SecretKey,
			Issuer:          env.LoadConfig().Issuer,
			ExpirationHours: env.LoadConfig().ExpirationHours,
		}
		// `token` now contains the raw JWT (either trimmed from "Bearer " header or read from cookie)
		claims, err := jwtWrapper.ValidateToken(token)
		if err != nil {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
				"message": "Unauthorized",
			})
		}

		c.Locals("userID", claims.UserID)
		c.Locals("role", claims.Role)
		return c.Next()
	}
}

func SetCookies(c *fiber.Ctx, token string) {
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    token,
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
		Secure:   false,
		SameSite: "Lax",
		Path:     "/",
	})
}

func CORS(app *fiber.App) {
	app.Use(func(c *fiber.Ctx) error {
		c.Set("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		c.Set("Access-Control-Allow-Credentials", "true")
		if c.Method() == "OPTIONS" {
			return c.SendStatus(http.StatusNoContent)
		}
		return c.Next()
	})
}
