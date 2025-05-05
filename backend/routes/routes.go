package routes

import (
	"rental-contract-manager/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// Product routes
	router.POST("/api/products", controllers.CreateProduct)
	router.GET("/api/products", controllers.GetProducts)
	router.PUT("/api/products/:id", controllers.UpdateProduct)
	router.DELETE("/api/products/:id", controllers.DeleteProduct)

	// Contract routes
	router.POST("/api/contracts", controllers.CreateContract)
	router.GET("/api/contracts", controllers.GetContracts)
	router.GET("/api/contracts/date-range", controllers.GetContractsByDateRange)
	router.PUT("/api/contracts/:id", controllers.EditContract)
	router.GET("/api/contracts/:id", controllers.GetContract)

	// User routes
	router.POST("/api/users", controllers.CreateUser)
	router.GET("/api/users", controllers.GetUsers)
}
