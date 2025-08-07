// backend/handlers/tts.go
package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type TextRequest struct {
	Text string `json:"text" binding:"required"`
}

// GenerateAudioHandler membuat handler untuk endpoint /generate-audio
func GenerateAudioHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var jsonRequest TextRequest
		if err := c.ShouldBindJSON(&jsonRequest); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request body"})
			return
		}

		elevenLabsAPIKey := os.Getenv("ELEVENLABS_API_KEY")
		voiceID := "21m00Tcm4TlvDq8ikWAM" // Voice ID (contoh: Rachel)

		url := "https://api.elevenlabs.io/v1/text-to-speech/" + voiceID

		payload := map[string]interface{}{
			"text":     jsonRequest.Text,
			"model_id": "eleven_multilingual_v2",
			"voice_settings": map[string]float64{
				"stability":        0.5,
				"similarity_boost": 0.75,
			},
		}
		payloadBytes, _ := json.Marshal(payload)

		req, _ := http.NewRequest("POST", url, bytes.NewBuffer(payloadBytes))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("xi-api-key", elevenLabsAPIKey)

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil || resp.StatusCode != 200 {
			c.JSON(500, gin.H{"error": "Gagal menghasilkan audio dari ElevenLabs"})
			return
		}
		defer resp.Body.Close()

		c.Header("Content-Type", "audio/mpeg")
		io.Copy(c.Writer, resp.Body)
	}
}