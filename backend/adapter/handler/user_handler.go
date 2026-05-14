package handler

import (
	"backend/core/entity"
	"backend/core/middleware"
	"backend/core/services"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type UserHandler struct {
	service services.UserService
}

func NewUserHandler(service services.UserService) UserHandler {
	return UserHandler{service: service}
}


func (h UserHandler) Register(c *fiber.Ctx) error {
	// errf := IsFinance(c)
	// if errf != nil {
	// 	return handleError(c, errf)
	// }

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
		Role:     "Driver",
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

	user, token, err := h.service.Login(req.Username, req.Password)
	if err != nil {
		return handleError(c, err)
	}

	middleware.SetCookies(c,token)

	c.Set("UserID", user.ID)
	c.Set("UserRole", user.Role)

	return newResponseSuccess(c,token)
}


func (h UserHandler) ChangeStatus(c *fiber.Ctx) error {
	// errf := IsFinance(c)
	// if errf != nil {
	// 	return handleError(c, errf)
	// }
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
