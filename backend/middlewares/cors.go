package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Allow requests from any origin
		c.Header("Access-Control-Allow-Origin", "*")

		// Allow common HTTP methods
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")

		// Allow common headers
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept, Accept-Encoding, X-CSRF-Token, Authorization")

		// Allow credentials
		c.Header("Access-Control-Allow-Credentials", "true")

		// Cache preflight response for 1 hour (3600 seconds)
		c.Header("Access-Control-Max-Age", "3600")

		// Handle preflight requests
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
