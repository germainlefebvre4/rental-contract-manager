package main

import (
	"log"
	"rental-contract-manager/config"
	"rental-contract-manager/database"
	"rental-contract-manager/middlewares"
	"rental-contract-manager/models"
	"rental-contract-manager/routes"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// initializeDatabase handles database connection, migrations and seeding
func initializeDatabase() {
	// Initialize database connection
	database.Connect()

	// Run database migrations with explicit models
	database.MigrateDB(
		&models.User{},
		&models.Product{},
		&models.Contract{},
	)

	// Seed database with initial data
	database.SeedDB(seedDatabase)
}

// seedDatabase populates the database with initial data if needed
func seedDatabase(db *gorm.DB) error {
	// Check if seeding is needed (e.g., empty tables)
	var userCount int64
	db.Model(&models.User{}).Count(&userCount)

	// Only seed if no users exist
	if userCount == 0 {
		// Example admin user
		adminUser := models.User{
			FirstName:     "Admin",
			LastName:      "User",
			PostalAddress: "123 Admin St",
			City:          "Admin City",
			BirthDate:     "1990-01-01",
			PhoneNumber:   "+1234567890",
			Email:         "admin@example.com",
		}

		if err := db.Create(&adminUser).Error; err != nil {
			log.Printf("Error seeding admin user: %v", err)
			return err
		}

		// Add more seed data as needed
	}
	return nil
}

func main() {
	// Load configuration
	config.LoadConfig()

	// Initialize database
	initializeDatabase()

	// Initialize Gin router
	router := gin.Default()

	// Apply CORS middleware
	router.Use(middlewares.CORSMiddleware())

	// Set up routes
	routes.SetupRoutes(router)

	// Start the server
	router.Run(":8080")
}
