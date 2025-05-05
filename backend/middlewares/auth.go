package middlewares

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware checks if the user is authenticated
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Here you would typically check for a valid token or session
		// For example, you might check for a JWT token in the Authorization header
		token := c.Request.Header.Get("Authorization")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		// Validate the token (this is just a placeholder)
		// In a real application, you would decode the token and check its validity
		if token != "valid-token" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		// If the token is valid, proceed to the next handler
		c.Next()
	}
}