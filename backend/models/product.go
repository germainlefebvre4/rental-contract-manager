package models

import (
	"errors"
	"rental-contract-manager/database"
)

var (
	ErrInvalidProduct  = errors.New("invalid product data")
	ErrProductNotFound = errors.New("product not found")
)

type Product struct {
	ID             uint    `gorm:"primaryKey" json:"id"`
	Object         string  `json:"object"`
	Brand          string  `json:"brand"`
	Model          string  `json:"model"`
	Quantity       int     `json:"quantity"`
	Description    string  `json:"description"`
	Precautions    string  `json:"precautions"`
	PricePerDay    float64 `json:"pricePerDay"`
	PricePerWeek   float64 `json:"pricePerWeek"`
	CautionDeposit float64 `json:"cautionDeposit"`
}

// GetProduct retrieves a specific product by ID
func GetProductByID(id uint) (*Product, error) {
	var product Product
	result := database.DB.First(&product, id)
	if result.Error != nil {
		return nil, ErrInvalidProduct
	}
	return &product, nil
}
