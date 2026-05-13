package repository

import (
	"backend/core/entity"
	"backend/core/middleware"
	"errors"
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return UserRepository{db: db}
}

type User struct {
	ID        string `gorm:"primaryKey"`
	Username  string `gorm:"unique"`
	Password  string
	Role      string
	CreatedAt time.Time
}

func UserToEntity(user User) entity.User {
	return entity.User{
		ID:        user.ID,
		UserName:  user.Username,
		Password:  user.Password,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
	}
}

func EntityToUser(user entity.User) User {
	return User{
		ID:        user.ID,
		Username:  user.UserName,
		Password:  user.Password,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
	}
}

func (r UserRepository) AddUser(user entity.User) error {
	user.ID = uuid.New().String()

	passwordHash, err := middleware.HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = string(passwordHash)
	user.Role = "Driver"
	user.CreatedAt = time.Now()
	enUser := EntityToUser(user)
	result := r.db.Create(&enUser)
	return result.Error
}

func (r UserRepository) ChangeStatusUser(id string, status string) error {
	result := r.db.Model(&entity.User{}).Where("id = ? OR username = ?", id, id).Update("status", status)
	return result.Error
}

func (r UserRepository) FindUser(username string) (*entity.User, error) {
	var user User
	result := r.db.Where("username = ?", username).First(&user)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil // ไม่พบผู้ใช้
	}
	enUser := UserToEntity(user)
	return &enUser, result.Error
}

func (r UserRepository) FindUserByID(id string) (*entity.User, error) {
	var user User
	result := r.db.Where("id = ?", id).First(&user)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil // ไม่พบผู้ใช้
	}
	enUser := UserToEntity(user)
	return &enUser, result.Error
}

func (r UserRepository) GetUserByID(id string) (*entity.User, error) {
	var user User
	result := r.db.Where("id = ?", id).First(&user)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, errors.New("user not found")
	}
	if result.Error != nil {
		return nil, result.Error
	}
	enUser := UserToEntity(user)
	return &enUser, nil
}

func (r UserRepository) GetAllUsers(users *[]entity.User) error {
	var dbUsers []User
	result := r.db.Find(&dbUsers)
	if result.Error != nil {
		return result.Error
	}
	for _, u := range dbUsers {
		*users = append(*users, UserToEntity(u))
	}
	return nil
}