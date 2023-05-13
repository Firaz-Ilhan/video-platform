package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	router := gin.Default()

	router.GET("/generate-presigned-url", func(c *gin.Context) {
		fileName := c.Query("fileName")
		if fileName == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "fileName parameter is required"})
			return
		}

		sess, err := session.NewSession(&aws.Config{
			Region: aws.String(os.Getenv("S3_REGION")),
			Credentials: credentials.NewStaticCredentials(
				os.Getenv("AWS_ACCESS_KEY_ID"),
				os.Getenv("AWS_SECRET_ACCESS_KEY"),
				""),
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create AWS session"})
			return
		}

		s3Svc := s3.New(sess)

		req, _ := s3Svc.PutObjectRequest(&s3.PutObjectInput{
			Bucket: aws.String(os.Getenv("S3_BUCKET")),
			Key:    aws.String(fileName),
		})
		str, err := req.Presign(15 * time.Minute)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sign request"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"url": str,
		})
	})

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type"},
	})

	handler := c.Handler(router)

	log.Fatal(http.ListenAndServe(":1337", handler))

	router.Run(":1337")
}
