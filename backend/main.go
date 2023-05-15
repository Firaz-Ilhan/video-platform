package main

import (
	"fmt"
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

type Config struct {
	S3Region           string
	AWSAccessKeyID     string
	AWSSecretAccessKey string
	S3Bucket           string
	Port               string
}

func loadConfig() (*Config, error) {
	err := godotenv.Load()
	if err != nil {
		return nil, fmt.Errorf("error loading .env file: %w", err)
	}

	return &Config{
		S3Region:           os.Getenv("S3_REGION"),
		AWSAccessKeyID:     os.Getenv("AWS_ACCESS_KEY_ID"),
		AWSSecretAccessKey: os.Getenv("AWS_SECRET_ACCESS_KEY"),
		S3Bucket:           os.Getenv("S3_BUCKET"),
		Port:               os.Getenv("PORT"),
	}, nil
}

func main() {
	config, err := loadConfig()
	if err != nil {
		log.Fatal(err)
	}

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(config.S3Region),
		Credentials: credentials.NewStaticCredentials(
			config.AWSAccessKeyID,
			config.AWSSecretAccessKey,
			""),
	})

	if err != nil {
		log.Fatalf("Failed to create AWS session: %v", err)
	}

	s3Svc := s3.New(sess)

	router := gin.Default()

	router.GET("/generate-presigned-url", func(c *gin.Context) {
		fileName := c.Query("fileName")
		if fileName == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "fileName parameter is required"})
			return
		}

		req, _ := s3Svc.PutObjectRequest(&s3.PutObjectInput{
			Bucket: aws.String(config.S3Bucket),
			Key:    aws.String(fileName),
		})

		str, err := req.Presign(15 * time.Minute)

		if err != nil {
			log.Printf("Failed to sign request: %v", err)
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

	port := fmt.Sprintf(":%s", config.Port)
	log.Printf("Starting server on %s", port)
	log.Fatal(http.ListenAndServe(port, handler))
}
