package handler

import (
	pkgErrors "backend/pkg/errs"
	"errors"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

type response struct {
	Success bool   `json:"success" example:"true"`
	Message string `json:"message" example:"Success"`
	Data    any    `json:"data,omitempty"`
}

type errorResponse struct {
	Success bool     `json:"success" example:"false"`
	Message []string `json:"message" example:"Error message"`
}

func newResponse(success bool, message string, data any) response {
	return response{
		Success: success,
		Message: message,
		Data:    data,
	}
}

func handleError(ctx *fiber.Ctx, err error) error {
	statusCode, ok := errorStatus[err]
	if !ok {
		statusCode = fiber.StatusInternalServerError
	}

	errMsg := parseError(err)
	errRsp := newErrorResponse(errMsg)
	log.Error(errMsg)
	return ctx.Status(statusCode).JSON(errRsp)
}

func newResponseSuccess(ctx *fiber.Ctx, data any) error {
	rsp := newResponseSuccessStruct("Success", data)
	return ctx.Status(fiber.StatusOK).JSON(rsp)
}

func newResponseSuccessMessage(ctx *fiber.Ctx, message string) error {
	rsp := newResponseSuccessStruct(message, nil)
	return ctx.Status(fiber.StatusOK).JSON(rsp)
}

func parseError(err error) []string {
	var errMsgs []string

	if errors.As(err, &validator.ValidationErrors{}) {
		for _, err := range err.(validator.ValidationErrors) {
			errMsgs = append(errMsgs, err.Error())
		}
	} else {
		errMsgs = append(errMsgs, err.Error())
	}

	return errMsgs
}

var errorStatus = map[error]int{
	pkgErrors.ErrInvalidInput:         fiber.StatusBadRequest,
	pkgErrors.ErrInternalServer:       fiber.StatusInternalServerError,
	pkgErrors.ErrUnauthorized:         fiber.StatusUnauthorized,
	pkgErrors.ErrConflict:             fiber.StatusConflict,
	pkgErrors.ErrBadRequest:           fiber.StatusBadRequest,
	pkgErrors.ErrUserNotFound:         fiber.StatusNotFound,
	pkgErrors.ErrTripNotFound:         fiber.StatusNotFound,
	pkgErrors.ErrClaimNotFound:        fiber.StatusNotFound,
	pkgErrors.ErrAuditLogNotFound:     fiber.StatusNotFound,
}

type authResponse struct {
	AccessToken string `json:"token" example:"v2.local.Gdh5kiOTyyaQ3_bNykYDeYHO21Jg2..."`
}

func newAuthResponse(token string) authResponse {
	return authResponse{
		AccessToken: token,
	}
}

func newResponseSuccessStruct(message string, data any) response {
	return response{
		Success: true,
		Message: message,
		Data:    data,
	}
}

func newErrorResponse(errMsg []string) errorResponse {
	return errorResponse{
		Success: false,
		Message: errMsg,
	}
}

///////role checker helper function///////

func IsSupervisor(ctx *fiber.Ctx) error {
	role := ctx.Get("UserRole")
	if role != "supervisor" {
		return pkgErrors.ErrForbidden
	}
	return nil
}

func IsDriver(ctx *fiber.Ctx) error {
	role := ctx.Get("UserRole")
	if role != "driver" {
		return pkgErrors.ErrForbidden
	}
	return nil
}

func IsFinance(ctx *fiber.Ctx) error {
	role := ctx.Get("UserRole")
	if role != "finance" {
		return pkgErrors.ErrForbidden
	}
	return nil
}