package handler

import (
	"backend/core/dto"
	"backend/core/services"
	
	"github.com/gofiber/fiber/v2"
	e "backend/pkg/errs"
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
		return handleError(c,errf)
	}

	claimID := c.Params("claimID")
	var req struct {
		SupervisorID string `json:"supervisor_id" binding:"required"`
		Remarks      string `json:"remarks"`
	}

	if err := c.BodyParser(&req); err != nil {
		return handleError(c, err)
	}

	err := h.service.ApproveBySupervisor(req.SupervisorID, claimID, req.Remarks)
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

	claimID := c.Params("claimID")
	var req struct {
		SupervisorID string `json:"supervisor_id" binding:"required"`
		Remarks      string `json:"remarks" binding:"required"`
	}

	if err := c.BodyParser(&req); err != nil {
		return handleError(c, err)
	}

	err := h.service.RejectBySupervisor(req.SupervisorID, claimID, req.Remarks)
	if err != nil {
		return handleError(c, err)
	}

	return newResponseSuccessMessage(c, "Claim rejected by supervisor successfully")
}


func (h FuelClaimHandler) ApproveByFinance(c *fiber.Ctx) error {
	errf := IsFinance(c)
	if errf != nil {
		return handleError(c,errf)
	}
	claimID := c.Params("claimID")
	var req struct {
		FinanceID string `json:"finance_id" binding:"required"`
		Remarks   string `json:"remarks"`
	}

	if err := c.BodyParser(&req); err != nil {
		return handleError(c, err)
	}

	err := h.service.ApproveByFinance(req.FinanceID, claimID, req.Remarks)
	if err != nil {
		return handleError(c, err)
	}

	return newResponseSuccessMessage(c, "Claim approved by finance successfully")
}


func (h FuelClaimHandler) RejectByFinance(c *fiber.Ctx) error {
	
	errf := IsFinance(c)
	if errf != nil {
		return handleError(c,errf)
	}

	claimID := c.Params("claimID")
	var req struct {
		FinanceID string `json:"finance_id" binding:"required"`
		Remarks   string `json:"remarks" binding:"required"`
	}

	if err := c.BodyParser(&req); err != nil {
		return handleError(c, err)
	}

	err := h.service.RejectByFinance(req.FinanceID, claimID, req.Remarks)
	if err != nil {
		return handleError(c, err)
	}

	return newResponseSuccessMessage(c, "Claim rejected by finance successfully")
}

func (h FuelClaimHandler) GetClaimsByDriverID(c *fiber.Ctx) error {
	driverID := c.Get("userID")
	if driverID == "" {
		return handleError(c, e.ErrBadRequest)
	}
	claims, err := h.service.GetClaimsByDriverID(driverID)
	if err != nil {
		return handleError(c, err)
	}
	return newResponseSuccess(c, claims)
}

func (h FuelClaimHandler) GetClaimsForSupervisor(c *fiber.Ctx) error {
	claims, err := h.service.GetAllClaimsByStatus("pending")
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