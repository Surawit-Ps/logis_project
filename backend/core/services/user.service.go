package services

import (
	"backend/core/entity"
	"backend/core/middleware"
	"backend/core/port"
	"errors"
	"backend/core/env"
	
)

type UserService struct {
	userRepo port.UserRepository
	
}

func NewUserService(userRepo port.UserRepository ) UserService {
	return UserService{userRepo: userRepo}
}

func (s UserService) CreateUser(user entity.User) error {

	return s.userRepo.AddUser(user)
}

func (s UserService) ChangeStatusUser(id string, status string) error {
	return s.userRepo.ChangeStatusUser(id, status)
}

func (s UserService) Login(username, password string) (*entity.User, string, error) {
	user, err := s.userRepo.FindUser(username)
	if err != nil {
		return nil, "", err
	}
	if user == nil {
		return nil, "", errors.New("user not found")
	}
	ok := middleware.CheckPasswordHash([]byte(password), []byte(user.Password))
	if !ok {

		return nil, "", errors.New("invalid password")
	}

	jwtWrapper := middleware.JwtWrapper{
		SecretKey:       env.LoadConfig().SecretKey,
		Issuer:          env.LoadConfig().Issuer,
		ExpirationHours: env.LoadConfig().ExpirationHours,
	}

	token, err := jwtWrapper.GenerateToken(user.ID, user.Role)
	if err != nil {
		return nil, "", errors.New("failed to generate token")
	}

	return user, token, nil
}
