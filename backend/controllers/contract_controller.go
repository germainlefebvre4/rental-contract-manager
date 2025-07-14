package controllers

import (
	"net/http"
	"rental-contract-manager/database"
	"rental-contract-manager/models"
	"rental-contract-manager/utils"
	"time"

	"github.com/gin-gonic/gin"
)

// ContractRequest represents the data structure for contract creation
type ContractRequest struct {
	Contract models.Contract `json:"contract"`
	User     *models.User    `json:"user,omitempty"` // Optional user data
}

// CreateContract handles the creation of a new rental contract
func CreateContract(c *gin.Context) {
	var request ContractRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		// Try binding to just the contract for backward compatibility
		var contract models.Contract
		if err := c.ShouldBindJSON(&contract); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		request.Contract = contract
	}

	// If user data is provided, create the user first
	if request.User != nil {
		// Set default kind to "renter" if not specified
		if request.User.Kind == "" {
			request.User.Kind = "renter"
		}

		// Save the user to the database
		if err := database.DB.Create(request.User).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}

		// Associate the new user with the contract
		request.Contract.UserID = request.User.ID
	}

	// Save the contract to the database
	if err := models.SaveContract(&request.Contract); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save contract"})
		return
	}

	// Get the full contract with user data for the response
	var fullContract models.Contract
	if err := database.DB.Preload("User").Preload("Product").First(&fullContract, request.Contract.ID).Error; err != nil {
		// If we can't get the full data, just return the contract we created
		c.JSON(http.StatusCreated, request.Contract)
		return
	}

	c.JSON(http.StatusCreated, fullContract)
}

// EditContract handles the editing of an existing rental contract
func EditContract(c *gin.Context) {
	var contract models.Contract
	if err := c.ShouldBindJSON(&contract); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update the contract in the database (implementation not shown)
	if err := models.UpdateContract(&contract); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update contract"})
		return
	}

	c.JSON(http.StatusOK, contract)
}

// GetContracts retrieves all rental contracts
func GetContracts(c *gin.Context) {
	contracts, err := models.GetAllContracts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve contracts"})
		return
	}

	c.JSON(http.StatusOK, contracts)
}

// GetContract retrieves a specific rental contract by ID
func GetContract(c *gin.Context) {
	id := c.Param("id")
	contract, err := models.GetContractByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contract not found"})
		return
	}

	c.JSON(http.StatusOK, contract)
}

// GetContractsByDateRange retrieves contracts within a specified date range
func GetContractsByDateRange(c *gin.Context) {
	startDateStr := c.Query("start")
	endDateStr := c.Query("end")

	// Parse date strings into time.Time objects
	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format. Use YYYY-MM-DD"})
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format. Use YYYY-MM-DD"})
		return
	}

	// Get contracts within the date range
	contracts, err := models.GetContractsByDateRange(startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve contracts"})
		return
	}

	// Enhance contract with product details
	for i := range contracts {
		user, err := models.GetUserByID(contracts[i].UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve user details"})
			return
		}
		product, err := models.GetProductByID(contracts[i].ProductID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve product details"})
			return
		}
		contracts[i].User = *user
		contracts[i].Product = *product
	}
	// Return the list of contracts

	c.JSON(http.StatusOK, contracts)
}

// GenerateContractPDF handles the PDF generation for a contract
func GenerateContractPDF(c *gin.Context) {
	id := c.Param("id")

	// Fetch the contract details
	contract, err := models.GetContractByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contract not found"})
		return
	}

	// Generate the PDF file
	pdfPath, err := utils.GeneratePDF(contract)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate PDF"})
		return
	}

	// Return the PDF file as a response
	c.File(pdfPath)
}

// GeneratePDF generates a PDF for a specific contract
func GeneratePDF(c *gin.Context) {
	id := c.Param("id")

	// Get the contract with all related data
	var contract models.Contract
	if err := database.DB.Preload("User").Preload("Product").First(&contract, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contract not found"})
		return
	}

	// For now, we'll use placeholder owner data. In a real app, this would come from configuration or admin user
	ownerData := struct {
		FirstName string
		LastName  string
		Email     string
		Phone     string
		Address   string
		City      string
	}{
		FirstName: "John",
		LastName:  "Owner",
		Email:     "owner@rent4goods.com",
		Phone:     "+1-555-0123",
		Address:   "123 Business St",
		City:      "Business City",
	}

	// Convert to ContractData for PDF generation
	contractData := utils.ContractData{
		Object:          contract.Product.Object,
		Brand:           contract.Product.Brand,
		Model:           contract.Product.Model,
		Quantity:        contract.Quantity,
		Description:     contract.Product.Description,
		Precautions:     contract.Product.Precautions,
		PricePerDay:     contract.Product.PricePerDay,
		PricePerWeek:    contract.Product.PricePerWeek,
		CautionDeposit:  contract.Product.CautionDeposit,
		RenterFirstName: contract.User.FirstName,
		RenterLastName:  contract.User.LastName,
		RenterAddress:   contract.User.PostalAddress,
		RenterCity:      contract.User.City,
		RenterBirthDate: contract.User.BirthDate,
		RenterPhone:     contract.User.PhoneNumber,
		RenterEmail:     contract.User.Email,
		OwnerFirstName:  ownerData.FirstName,
		OwnerLastName:   ownerData.LastName,
		OwnerAddress:    ownerData.Address,
		OwnerCity:       ownerData.City,
		OwnerPhone:      ownerData.Phone,
		OwnerEmail:      ownerData.Email,
		RentalDays:      contract.RentalDuration,
		TotalAmount:     contract.TotalAmount,
		StateBefore:     contract.StateBefore,
		StateAfter:      contract.StateAfter,
		UsageDate:       contract.UsageDate.Format("2006-01-02"),
		RetrievalDate:   contract.RetrievalDate.Format("2006-01-02"),
	}

	// Generate the PDF
	pdfPath, err := utils.GeneratePDF(contractData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate PDF"})
		return
	}

	// Return the PDF file
	c.File(pdfPath)
}
