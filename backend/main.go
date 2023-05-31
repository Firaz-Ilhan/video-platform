package main

import (
	"fmt"
	"log"
	"math/rand"
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
	S3OutputBucket     string
	Port               string
}

var (
	config Config
	r      *rand.Rand
	s3Svc  *s3.S3
)

func init() {
	_ = godotenv.Load()

	config = Config{
		S3Region:           os.Getenv("S3_REGION"),
		AWSAccessKeyID:     os.Getenv("AWS_ACCESS_KEY_ID"),
		AWSSecretAccessKey: os.Getenv("AWS_SECRET_ACCESS_KEY"),
		S3Bucket:           os.Getenv("S3_BUCKET"),
		S3OutputBucket:     os.Getenv("S3_OUTPUT_BUCKET"),
		Port:               os.Getenv("PORT"),
	}

	src := rand.NewSource(time.Now().UnixNano())
	r = rand.New(src)

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

	s3Svc = s3.New(sess)
}

func main() {
	router := gin.Default()

	router.GET("/generate-presigned-url", generatePresignedURL)
	router.GET("/random-file", randomFile)

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

func generatePresignedURL(c *gin.Context) {
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
}

func randomFile(c *gin.Context) {
	input := &s3.ListObjectsV2Input{
		Bucket: aws.String(config.S3OutputBucket),
	}

	result, err := s3Svc.ListObjectsV2(input)
	if err != nil {
		log.Printf("Failed to list objects: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list objects"})
		return
	}

	if len(result.Contents) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No files found in the bucket."})
		return
	}

	randomIndex := r.Intn(len(result.Contents))
	randomFile := result.Contents[randomIndex]

	req, _ := s3Svc.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(config.S3OutputBucket),
		Key:    randomFile.Key,
	})

	presignedURL, err := req.Presign(15 * time.Minute)

	if err != nil {
		log.Printf("Failed to sign request: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sign request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":      presignedURL,
		"fileName": *randomFile.Key,
	})
}
