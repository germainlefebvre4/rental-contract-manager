package controllers

import (
	"net/http"
	"rental-contract-manager/database"
	"rental-contract-manager/models"

	"github.com/gin-gonic/gin"
)

// CreateUser handles the creation of a new user
func CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set default kind to "renter" if not specified
	if user.Kind == "" {
		user.Kind = "renter"
	}

	// Save the user to the database
	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Send confirmation email
	// if err := utils.SendConfirmationEmail(user.Email, "Subject of the Email", "Body of the Email"); err != nil {
	// 	// Just log the error but don't fail the request
	// 	c.JSON(http.StatusCreated, gin.H{
	// 		"message": "User created successfully, but confirmation email failed to send",
	// 		"user":    user,
	// 	})
	// 	return
	// }

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user":    user,
	})
}

// GetUsers retrieves users with optional filtering by kind
func GetUsers(c *gin.Context) {
	var users []models.User

	// Check if kind query parameter is provided
	kind := c.Query("kind")

	// Apply filter if kind is specified
	if kind != "" {
		if err := database.DB.Where("kind = ?", kind).Find(&users).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve users"})
			return
		}
	} else {
		// If no kind is specified, return all users
		if err := database.DB.Find(&users).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve users"})
			return
		}
	}

	// Return the list of users
	c.JSON(http.StatusOK, users)
}
