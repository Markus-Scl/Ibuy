package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func UploadImageHandler(r *http.Request, userId string, productId string) ([]string, error){
	//Process images
	r.ParseMultipartForm(32 << 20)

	// Get the multipart form
    form := r.MultipartForm
	files := form.File["images"]

	var savedFiles []string

	for _, fileHeader := range files {

		file, err := fileHeader.Open()
		if err != nil {
            return nil, err
        }
		defer file.Close()

		if !isValidImageType(fileHeader.Header.Get("Content-Type")) {
           return nil, err
        }

		savedPath, err := saveImageFile(file, fileHeader.Filename, productId, userId)
        if err != nil {
            return nil, err
        }
        
        savedFiles = append(savedFiles, savedPath)
	}

	return savedFiles, nil
}


func isValidImageType(contentType string) bool {
    validTypes := []string{
        "image/jpeg",
        "image/jpg", 
        "image/png",
        "image/gif",
        "image/webp",
    }
    
    for _, validType := range validTypes {
        if contentType == validType {
            return true
        }
    }
    return false
}

func saveImageFile(file io.Reader, originalFilename, productId string, userId string) (string, error) {
    // Create upload directory if it doesn't exist
    uploadDir := filepath.Join("uploads", "products", userId, productId)
    err := os.MkdirAll(uploadDir, 0755)
    if err != nil {
        return "", err
    }

    // Generate unique filename to prevent conflicts
    ext := filepath.Ext(originalFilename)
    filename := fmt.Sprintf("%d_%s%s", time.Now().Unix(), 
        strings.ReplaceAll(originalFilename[:len(originalFilename)-len(ext)], " ", "_"), 
        ext)
    
    // Create the full file path
    filePath := filepath.Join(uploadDir, filename)
    
    // Create the destination file
    dst, err := os.Create(filePath)
    if err != nil {
        return "", err
    }
    defer dst.Close()

    // Copy the uploaded file to destination
    _, err = io.Copy(dst, file)
    if err != nil {
        return "", err
    }

    return filePath, nil
}