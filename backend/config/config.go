package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	Port        string
	JWTSecret   string
	CORSOrigin  string
	EmailFrom   string
}

func LoadConfig() Config {
	// Try to load .env file, but don't fail if it doesn't exist
	// This allows the app to work with direct environment variables in Docker
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// Get configuration from environment variables with defaults
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://rent4goods:rent4goods@database:5432/rent4goods?sslmode=disable"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your_jwt_secret_change_in_production"
	}

	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:3000"
	}

	emailFrom := os.Getenv("EMAIL_FROM")
	if emailFrom == "" {
		emailFrom = "no-reply@example.com"
	}

	return Config{
		DatabaseURL: databaseURL,
		Port:        port,
		JWTSecret:   jwtSecret,
		CORSOrigin:  corsOrigin,
		EmailFrom:   os.Getenv("EMAIL_FROM"),
	}
}
