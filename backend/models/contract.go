package models

import (
	"errors"
	"rental-contract-manager/database"
	"time"
)

// Error definitions
var (
	ErrInvalidContract  = errors.New("invalid contract data")
	ErrContractNotFound = errors.New("contract not found")
)

type Contract struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	ProductID      uint      `json:"productId"`
	Product        Product   `json:"product" gorm:"foreignKey:ProductID"`
	UserID         uint      `json:"userId"`
	User           User      `json:"user" gorm:"foreignKey:UserID"`
	Quantity       int       `json:"quantity"`
	RentalDuration int       `json:"rentalDuration"` // in days
	TotalAmount    float64   `json:"totalAmount"`
	StateBefore    string    `json:"stateBefore"`
	StateAfter     string    `json:"stateAfter"`
	UsageDate      time.Time `json:"usageDate"`
	RetrievalDate  time.Time `json:"retrievalDate"`
	StartDate      time.Time `json:"startDate"`
	EndDate        time.Time `json:"endDate"`
}

// SaveContract persists a new contract to the database
func SaveContract(contract *Contract) error {
	if contract == nil {
		return ErrInvalidContract
	}

	result := database.DB.Create(contract)
	return result.Error
}

// GetAllContracts retrieves all contracts from the database
func GetAllContracts() ([]Contract, error) {
	var contracts []Contract
	result := database.DB.Find(&contracts)
	return contracts, result.Error
}

// GetContractsByDateRange retrieves all contracts that fall within the specified date range
// A contract is considered to be in the range if it overlaps with the range at all
func GetContractsByDateRange(startDate, endDate time.Time) ([]Contract, error) {
	var contracts []Contract

	// Find contracts that overlap with the given date range
	// A contract overlaps if:
	// 1. Contract's start date is within the range, OR
	// 2. Contract's end date is within the range, OR
	// 3. Contract's start date is before the range start AND contract's end date is after the range end
	result := database.DB.Where("(start_date BETWEEN ? AND ?) OR (end_date BETWEEN ? AND ?) OR (start_date <= ? AND end_date >= ?)",
		startDate, endDate, startDate, endDate, startDate, endDate).Find(&contracts)

	return contracts, result.Error
}

// GetContractByID retrieves a contract by its ID
func GetContractByID(id string) (*Contract, error) {
	var contract Contract
	result := database.DB.First(&contract, id)
	if result.Error != nil {
		return nil, ErrContractNotFound
	}
	return &contract, nil
}

// UpdateContract updates an existing contract in the database
func UpdateContract(contract *Contract) error {
	if contract == nil || contract.ID == 0 {
		return ErrInvalidContract
	}

	result := database.DB.Save(contract)
	return result.Error
}
