package controllers

import (
	"net/http"
	"rental-contract-manager/database"
	"rental-contract-manager/models"

	"github.com/gin-gonic/gin"
)

// CreateProduct handles the creation of a new product
func CreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create product"})
		return
	}

	c.JSON(http.StatusCreated, product)
}

// GetProducts retrieves all products
func GetProducts(c *gin.Context) {
	var products []models.Product
	if err := database.DB.Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve products"})
		return
	}

	c.JSON(http.StatusOK, products)
}

// UpdateProduct handles the update of an existing product
func UpdateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id := c.Param("id")
	if err := database.DB.Model(&product).Where("id = ?", id).Updates(product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update product"})
		return
	}

	c.JSON(http.StatusOK, product)
}

// DeleteProduct handles the deletion of a product
func DeleteProduct(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Product{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete product"})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// GetProduct retrieves a specific product by ID
func GetProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product
	if err := database.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}
}
