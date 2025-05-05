package controllers

import (
	"net/http"
	"rental-contract-manager/database"
	"rental-contract-manager/models"
	"rental-contract-manager/utils"

	"github.com/gin-gonic/gin"
)

// CreateUser handles the creation of a new user
func CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Here you would typically save the user to the database
	// For example: db.Create(&user)

	// Send confirmation email
	if err := utils.SendConfirmationEmail(user.Email, "Subject of the Email", "Body of the Email"); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send confirmation email"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully"})
}

// GetUsers retrieves all users
func GetUsers(c *gin.Context) {
	var users []models.User
	if err := database.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve users"})
		return
	}

	// Return the list of users
	c.JSON(http.StatusOK, users)
}
