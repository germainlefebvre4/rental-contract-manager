package database

import (
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Connect establishes a database connection and initializes the database
func Connect() {
	dsn := os.Getenv("DATABASE_URL")
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	log.Println("Connected to database successfully")
}

// MigrateDB performs database migrations to create and update tables
// models should be a slice of struct pointers to migrate
func MigrateDB(models ...interface{}) {
	err := DB.AutoMigrate(models...)
	if err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}
	log.Println("Database migration completed successfully")
}

// SeedDB seeds the database with initial data if needed
func SeedDB(seedFunc func(*gorm.DB) error) {
	if seedFunc != nil {
		if err := seedFunc(DB); err != nil {
			log.Printf("Error seeding database: %v", err)
			return
		}
		log.Println("Database seeded successfully")
	}
}
