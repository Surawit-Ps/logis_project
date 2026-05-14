package handler

import (
	"backend/core/dto"
	"backend/core/services"
	"fmt"

	e "backend/pkg/errs"

	"github.com/gofiber/fiber/v2"
)

type FuelClaimHandler struct {
	service services.FuelClaimService
}

func NewFuelClaimHandler(service services.FuelClaimService) FuelClaimHandler {
	return FuelClaimHandler{service: service}
}

func (h FuelClaimHandler) SubmitClaim(c *fiber.Ctx) error {
	var req dto.SubmitClaimRequest

	if err := c.BodyParser(&req); err != nil {
		return handleError(c, err)
	}

	userID := c.Locals("userID")

	driverID, ok := userID.(string)
	if !ok || driverID == "" {
		return handleError(c, e.ErrBadRequest)
	}
	req.DriverID = driverID
	fmt.Printf("SubmitClaim request: %+v\n", req)
	claim, err := h.service.SubmitClaim(req)
	if err != nil {
		return handleError(c, err)
	}

	return newResponseSuccess(c, claim)
}

func (h FuelClaimHandler) GetClaimWithAuditTrail(c *fiber.Ctx) error {
	claimID := c.Params("claimID")

	if claimID == "" {
		return handleError(c, e.ErrBadRequest)
	}

	detail, err := h.service.GetClaimWithAuditTrail(claimID)
	if err != nil {
		return handleError(c, err)
	}

	return newResponseSuccess(c, detail)
}

func (h FuelClaimHandler) ApproveBySupervisor(c *fiber.Ctx) error {
	errf := IsSupervisor(c)
	if errf != nil {
		return handleError(c, errf)
	}

	userID := c.Locals("userID")

	supervisorID, ok := userID.(string)
	if !ok || supervisorID == "" {
		return handleError(c, e.ErrBadRequest)
	}

	claimID := c.Params("claimID")
	var req struct {
		Remarks      string `json:"remarks"`
	}

	if err := c.BodyParser(&req); err != nil {
		return handleError(c, err)
	}

	err := h.service.ApproveBySupervisor(supervisorID, claimID, req.Remarks)
	if err != nil {
		return handleError(c, err)
	}

	return newResponseSuccessMessage(c, "Claim approved by supervisor successfully")
}

func (h FuelClaimHandler) RejectBySupervisor(c *fiber.Ctx) error {
	errf := IsSupervisor(c)
	if errf != nil {
		return handleError(c, errf)
	}

	userID := c.Locals("userID")
	supervisorID, ok := userID.(string)
	if !ok || supervisorID == "" {
		return handleError(c, e.ErrBadRequest)
	}

	claimID := c.Params("claimID")
	var req struct {
		Remarks string `json:"remarks" binding:"required"`
	}

	if err := c.BodyParser(&req); err != nil {
		return handleError(c, err)
	}

	err := h.service.RejectBySupervisor(supervisorID, claimID, req.Remarks)
	if err != nil {
		return handleError(c, err)
	}

	return newResponseSuccessMessage(c, "Claim rejected by supervisor successfully")
}

func (h FuelClaimHandler) ApproveByFinance(c *fiber.Ctx) error {
	errf := IsFinance(c)
	if errf != nil {
		return handleError(c, errf)
	}
	claimID := c.Params("claimID")

	userID := c.Locals("userID")
	financeID, ok := userID.(string)
	if !ok || financeID == "" {
		return handleError(c, e.ErrBadRequest)
	}

	var req struct {
		Remarks   string `json:"remarks"`
	}

	if err := c.BodyParser(&req); err != nil {
		return handleError(c, err)
	}

	err := h.service.ApproveByFinance(financeID, claimID, req.Remarks)
	if err != nil {
		return handleError(c, err)
	}

	return newResponseSuccessMessage(c, "Claim approved by finance successfully")
}

func (h FuelClaimHandler) RejectByFinance(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	financeID, ok := userID.(string)
	if !ok || financeID == "" {
		return handleError(c, e.ErrBadRequest)
	}

	errf := IsFinance(c)
	if errf != nil {
		return handleError(c, errf)
	}

	claimID := c.Params("claimID")
	var req struct {
		Remarks   string `json:"remarks" binding:"required"`
	}

	if err := c.BodyParser(&req); err != nil {
		return handleError(c, err)
	}

	err := h.service.RejectByFinance(financeID, claimID, req.Remarks)
	if err != nil {
		return handleError(c, err)
	}

	return newResponseSuccessMessage(c, "Claim rejected by finance successfully")
}

func (h FuelClaimHandler) GetClaimsByDriverID(c *fiber.Ctx) error {
	userID := c.Locals("userID")

	driverID, ok := userID.(string)
	if !ok || driverID == "" {
		return handleError(c, e.ErrBadRequest)
	}
	claims, err := h.service.GetClaimsByDriverID(driverID)
	if err != nil {
		return handleError(c, err)
	}
	return newResponseSuccess(c, claims)
}

func (h FuelClaimHandler) GetClaimsForSupervisor(c *fiber.Ctx) error {
	claims, err := h.service.GetAllClaimsByStatus("Pending")
	if err != nil {
		return handleError(c, err)
	}
	return newResponseSuccess(c, claims)
}

func (h FuelClaimHandler) GetClaimsForFinance(c *fiber.Ctx) error {
	claims, err := h.service.GetAllClaimsByStatus("Approved by Supervisor")
	if err != nil {
		return handleError(c, err)
	}
	return newResponseSuccess(c, claims)
}
