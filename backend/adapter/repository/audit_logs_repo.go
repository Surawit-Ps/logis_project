package repository

import (
	"backend/core/entity"
	"gorm.io/gorm"
	"errors"
	"time"
	"github.com/google/uuid"
)

type AuditLogRepository struct{
	db *gorm.DB
}

type AuditLog struct {
	ID        string `gorm:"primaryKey"`
	ClaimId    string
    UserId     string
    Action     string
    FromStatus string
    ToStatus   string
    Remarks    string
    CreatedAt  time.Time
}

func AuditLogToEntity(auditLog AuditLog) entity.AuditLogs {
	return entity.AuditLogs{
		ID: auditLog.ID,
		ClaimId: auditLog.ClaimId,
		UserId: auditLog.UserId,
		Action: auditLog.Action,
		FromStatus: auditLog.FromStatus,
		ToStatus: auditLog.ToStatus,
		Remarks: auditLog.Remarks,
		CreatedAt: auditLog.CreatedAt,
	}
}

func EntityToAuditLog(auditLog entity.AuditLogs) AuditLog {
	return AuditLog{
		ID: auditLog.ID,
		ClaimId: auditLog.ClaimId,
		UserId: auditLog.UserId,
		Action: auditLog.Action,
		FromStatus: auditLog.FromStatus,
		ToStatus: auditLog.ToStatus,
		Remarks: auditLog.Remarks,
		CreatedAt: auditLog.CreatedAt,
	}
}

func NewAuditLogRepository(db *gorm.DB)AuditLogRepository{
	return AuditLogRepository{db:db}
}

func (r AuditLogRepository) CreateAuditLog(auditLog entity.AuditLogs)error{
	auditLog.ID = uuid.New().String()
	auditLog.CreatedAt = time.Now()
	enAuditLog := EntityToAuditLog(auditLog)
	result := r.db.Create(&enAuditLog)
	return result.Error
}

func (r AuditLogRepository) FindByClaimID(claimID string)([]entity.AuditLogs,error){
	var auditLogs []AuditLog
	result := r.db.Where("claim_id = ?", claimID).Find(&auditLogs)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil // ไม่พบประวัติการตรวจสอบ
	}
	enAuditLogs := make([]entity.AuditLogs, len(auditLogs))
	for i, auditLog := range auditLogs {
		enAuditLogs[i] = AuditLogToEntity(auditLog)
	}
	return enAuditLogs, result.Error
}

