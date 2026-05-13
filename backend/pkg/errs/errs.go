package pkg

import "errors"

var (
	ErrUserNotFound = errors.New("user not found")
	ErrTripNotFound = errors.New("trip not found")
	ErrClaimNotFound = errors.New("claim not found")
	ErrAuditLogNotFound = errors.New("audit log not found")
	ErrUnauthorized = errors.New("unauthorized")
	ErrConflict = errors.New("conflict")
	ErrBadRequest = errors.New("bad request")
	ErrInvalidInput = errors.New("invalid input")
	ErrInternalServer = errors.New("internal server error")
	ErrForbidden = errors.New("forbidden")
)

