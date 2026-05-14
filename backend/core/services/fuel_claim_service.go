package services

import (
	"backend/core/dto"
	"backend/core/entity"
	"backend/core/port"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type FuelClaimService struct {
	claimRepo port.FuelClaimRepository
	auditRepo port.AuditLogRepository
	userRepo  port.UserRepository
	tripRepo  port.TripRepository
}

func NewFuelClaimService(claimRepo port.FuelClaimRepository, auditRepo port.AuditLogRepository, userRepo port.UserRepository, tripRepo port.TripRepository) FuelClaimService {
	return FuelClaimService{claimRepo: claimRepo, auditRepo: auditRepo, userRepo: userRepo, tripRepo: tripRepo}
}

func (s FuelClaimService) SubmitClaim(req dto.SubmitClaimRequest) (*entity.FuelClaims, error) {
	// ตรวจสอบว่ามี receiptRef ซ้ำหรือไม่
	exists, err := s.claimRepo.IsReceiptRefExists(req.ReceiptRef)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, fmt.Errorf("receipt reference already exists")
	}

	claim := entity.FuelClaims{
		ID:         uuid.New().String(),
		TripId:     req.TripID,
		Amount:     req.Amount,
		ReceiptRef: req.ReceiptRef,
		Status:     "Pending",
		CreatedAt:  time.Now(),
	}
	err = s.claimRepo.CreateFuelClaim(claim)
	if err != nil {
		return nil, err
	}
	return &claim, nil
}

func (s FuelClaimService) GetClaimWithAuditTrail(claimID string) (dto.FuelClaimDetail, error) {
	claim, err := s.claimRepo.FindFuelClaimByID(claimID)
	if err != nil {
		return dto.FuelClaimDetail{}, err
	}
	auditLogs, err := s.auditRepo.FindByClaimID(claimID)
	if err != nil {
		return dto.FuelClaimDetail{}, err
	}
	driver, err := s.userRepo.FindUser(claim.DriverId)
	if err != nil {
		return dto.FuelClaimDetail{}, err
	}
	trip, err := s.tripRepo.GetATrip(claim.TripId)
	if err != nil {
		return dto.FuelClaimDetail{}, err
	}

	// Loop เพื่อแปลง entity.AuditLogs เป็น dto.AuditLogInfo
	auditTrail := make([]dto.AuditLogInfo, len(auditLogs))
	for i, log := range auditLogs {
		auditTrail[i] = dto.AuditLogInfo{
			ID:         log.ID,
			Action:     log.Action,
			FromStatus: log.FromStatus,
			ToStatus:   log.ToStatus,
			Remarks:    log.Remarks,
			CreatedAt:  log.CreatedAt,
		}
	}

	data := dto.FuelClaimDetail{
		ID:         claim.ID,
		Status:     claim.Status,
		Amount:     claim.Amount,
		ReceiptRef: claim.ReceiptRef,
		ReceiptURL: claim.ReceiptUrl,
		CreatedAt:  claim.CreatedAt,
		UpdatedAt:  claim.UpdatedAt,
		Driver: dto.DriverInfo{
			ID:       driver.ID,
			Username: driver.UserName,
		},
		Trip: dto.TripInfo{
			ID:          trip.ID,
			Origin:      trip.Origin,
			Destination: trip.Destination,
			Status:      trip.Status,
		},
		AuditTrail: auditTrail,
	}

	return data, nil
}

func (s FuelClaimService) ApproveBySupervisor(supervisorID string, claimID string, remarks string) error {
	claim, err := s.claimRepo.FindFuelClaimByID(claimID)
	if err != nil {
		return err
	}
	if claim.Status != "Pending" {
		return fmt.Errorf("claim is not in pending status")
	}
	claim.Status = "Approved by Supervisor"
	err = s.claimRepo.UpdateFuelClaim(*claim)
	if err != nil {
		return err
	}
	return s.auditRepo.CreateAuditLog(entity.AuditLogs{
		ID:         uuid.New().String(),
		ClaimId:    claimID,
		Action:     "APPROVE",
		UserId:     supervisorID,
		FromStatus: "Pending",
		ToStatus:   "Approved by Supervisor",
		Remarks:    remarks,
		CreatedAt:  time.Now(),
	})
}

func (s FuelClaimService) RejectBySupervisor(supervisorID string, claimID string, remarks string) error {
	claim, err := s.claimRepo.FindFuelClaimByID(claimID)
	if err != nil {
		return err
	}
	if claim.Status != "Pending" {
		return fmt.Errorf("claim is not in pending status")
	}
	claim.Status = "Rejected by Supervisor"
	err = s.claimRepo.UpdateFuelClaim(*claim)
	if err != nil {
		return err
	}
	return s.auditRepo.CreateAuditLog(entity.AuditLogs{
		ID:         uuid.New().String(),
		ClaimId:    claimID,
		Action:     "REJECT",
		UserId:     supervisorID,
		FromStatus: "Pending",
		ToStatus:   "Rejected by Supervisor",
		Remarks:    remarks,
		CreatedAt:  time.Now(),
	})
}

func (s FuelClaimService) ApproveByFinance(financeID string, claimID string, remarks string) error {
	claim, err := s.claimRepo.FindFuelClaimByID(claimID)
	if err != nil {
		return err
	}
	if claim.Status != "Approved by Supervisor" {
		return fmt.Errorf("claim is not approved by supervisor")
	}
	claim.Status = "Approved by Finance"
	err = s.claimRepo.UpdateFuelClaim(*claim)
	if err != nil {
		return err
	}
	return s.auditRepo.CreateAuditLog(entity.AuditLogs{
		ID:         uuid.New().String(),
		ClaimId:    claimID,
		Action:     "APPROVE",
		UserId:     financeID,
		FromStatus: "Approved by Supervisor",
		ToStatus:   "Approved by Finance",
		Remarks:    remarks,
		CreatedAt:  time.Now(),
	})
}

func (s FuelClaimService) RejectByFinance(financeID string, claimID string, remarks string) error {
	claim, err := s.claimRepo.FindFuelClaimByID(claimID)
	if err != nil {
		return err
	}
	if claim.Status != "Approved by Supervisor" {
		return fmt.Errorf("claim is not approved by supervisor")
	}
	claim.Status = "Rejected by Finance"
	err = s.claimRepo.UpdateFuelClaim(*claim)
	if err != nil {
		return err
	}
	return s.auditRepo.CreateAuditLog(entity.AuditLogs{
		ID:         uuid.New().String(),
		ClaimId:    claimID,
		Action:     "REJECT",
		UserId:     financeID,
		FromStatus: "Approved by Supervisor",
		ToStatus:   "Rejected by Finance",
		Remarks:    remarks,
		CreatedAt:  time.Now(),
	})
}

func (s FuelClaimService) GetClaimsByDriverID(driverID string) ([]entity.FuelClaims, error) {
	return s.claimRepo.FindClaimByDriverID(driverID)
}

func (s FuelClaimService) GetClaimsByTripID(tripID string) ([]entity.FuelClaims, error) {
	return s.claimRepo.FindClaimByTripID(tripID)
}

func (s FuelClaimService) GetClaimByID(id string) (*entity.FuelClaims, error) {
	return s.claimRepo.FindFuelClaimByID(id)
}

func (s FuelClaimService) GetAllClaimsByStatus(status string) ([]entity.FuelClaims, error) {
	return s.claimRepo.FindClaimByStatus(status)
}
