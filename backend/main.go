// backend/main.go
package main

import (
	"context"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
	
	"github.com/tegarrn/anime-portfolio-web/backend/handlers" 
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("GEMINI_API_KEY")))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()
	model := client.GenerativeModel("gemini-1.5-flash")

	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:4321"}
	config.AllowMethods = []string{"GET", "POST"}
	config.AllowHeaders = []string{"Origin", "Content-Type"}
	r.Use(cors.New(config))
	
	// Pastikan kedua baris ini ada
	r.POST("/generate-text", handlers.GenerateTextHandler(model))
	r.POST("/generate-audio", handlers.GenerateAudioHandler()) // <-- Baris ini yang mendaftarkan rute audio

	r.Run(":8080")
}