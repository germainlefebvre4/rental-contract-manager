package models

import (
	"errors"
	"rental-contract-manager/database"
)

type User struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	FirstName     string `json:"firstName" gorm:"not null"`
	LastName      string `json:"lastName" gorm:"not null"`
	PostalAddress string `json:"postalAddress" gorm:"column:postal_address;"`
	City          string `json:"city" gorm:""`
	BirthDate     string `json:"birthDate" gorm:"column:birth_date;"`
	PhoneNumber   string `json:"phoneNumber" gorm:""`
	Email         string `json:"email" gorm:""`
	Kind          string `json:"kind" gorm:"default:'renter'"` // 'admin' or 'renter'
}

// Error definitions
var (
	ErrInvalidUser  = errors.New("invalid user data")
	ErrUserNotFound = errors.New("user not found")
)

// GetAllUsers retrieves all users from the database
func GetAllUsers() ([]User, error) {
	var users []User
	result := database.DB.Find(&users)
	if result.Error != nil {
		return nil, result.Error
	}
	return users, nil
}

// GetUserByID retrieves a user by their ID
func GetUserByID(id uint) (*User, error) {
	var user User
	result := database.DB.First(&user, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

// CreateUser creates a new user in the database
func CreateUser(user *User) error {
	if user == nil {
		return ErrInvalidUser
	}

	result := database.DB.Create(user)
	return result.Error
}
