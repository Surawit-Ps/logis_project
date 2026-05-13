package port

import "backend/core/entity"

type UserRepository interface{
	AddUser(entity.User)error
	ChangeStatusUser(id string,status string)error
	FindUser(string)(*entity.User,error)
	GetUserByID(id string)(*entity.User,error)
	GetAllUsers(users *[]entity.User)error
}

type UserService interface{
	CreateUser(user entity.User)error
	ChangeStatusUser(id string,status string)error
	Login(username,password string)(*entity.User,string,error)
}