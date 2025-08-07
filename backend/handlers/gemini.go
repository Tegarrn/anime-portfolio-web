// backend/handlers/gemini.go
package handlers

import (
	"context"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
)

type PromptRequest struct {
	Prompt string `json:"prompt" binding:"required"`
}

// GenerateTextHandler membuat handler untuk endpoint /generate-text
func GenerateTextHandler(model *genai.GenerativeModel) gin.HandlerFunc {
	return func(c *gin.Context) {
		var jsonRequest PromptRequest
		if err := c.ShouldBindJSON(&jsonRequest); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request"})
			return
		}

		log.Printf("Menerima prompt: %s", jsonRequest.Prompt)
		
		ctx := context.Background()
		resp, err := model.GenerateContent(ctx, genai.Text(jsonRequest.Prompt))
		if err != nil {
			c.JSON(500, gin.H{"error": "Gagal menghasilkan konten dari Gemini"})
			log.Printf("Error dari Gemini: %v", err)
			return
		}

		var responseText string
		if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
			if txt, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
				responseText = string(txt)
			}
		}

		if responseText == "" {
			responseText = "Maaf, saya tidak bisa memberikan respons saat ini."
		}

		c.JSON(200, gin.H{
			"response": responseText,
		})
	}
}