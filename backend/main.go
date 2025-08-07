package main

import "github.com/gin-gonic/gin"

func main() {
    // Membuat router Gin dengan konfigurasi default
    r := gin.Default()

    // Membuat endpoint sederhana di root ("/")
    r.GET("/", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "Backend server is running!",
        })
    })

    // Menjalankan server di port 8080
    r.Run(":8080")
}