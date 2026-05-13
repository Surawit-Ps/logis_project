package port

import "backend/core/entity"

type AuditLogRepository interface {
	CreateAuditLog(entity.AuditLogs) error
	FindByClaimID(claimID string) ([]entity.AuditLogs, error)
}
