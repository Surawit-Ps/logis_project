package port

import ("backend/core/entity"
	"backend/core/dto")

type FuelClaimRepository interface {
	AddFuelClaim(claim entity.FuelClaims) error
	UpdateFuelClaim(claim entity.FuelClaims) error
	FindFuelClaimByID(id string) (*entity.FuelClaims, error)
	FindClaimByDriverID(driverID string) ([]entity.FuelClaims, error)
	FindClaimByTripID(tripID string) ([]entity.FuelClaims, error)
	FindClaimByStatus(status string) ([]entity.FuelClaims, error)
	
	IsReceiptRefExists(receiptRef string) (bool, error)
}

type FuelClaimUsecase interface {
	// สร้างรายการเบิก
	SubmitClaim(req dto.SubmitClaimRequest) (*entity.FuelClaims, error)

	GetClaimsByDriverID(driverID string) ([]entity.FuelClaims, error)
	GetClaimsByTripID(tripID string) ([]entity.FuelClaims, error)
	GetClaimByID(id string) (*entity.FuelClaims, error)
	GetAllClaimsByStatus(status string) ([]entity.FuelClaims, error)
	
	// first approval (Supervisor)
	ApproveBySupervisor(supervisorID string, claimID string, remarks string) error
	RejectBySupervisor(supervisorID string, claimID string, remarks string) error
	
	// final approval (Finance)
	ApproveByFinance(financeID string, claimID string, remarks string) error
	RejectByFinance(financeID string, claimID string, remarks string) error
	
	// ดูสถานะและประวัติ
	GetClaimWithAuditTrail(claimID string) (dto.FuelClaimDetail, error)
}