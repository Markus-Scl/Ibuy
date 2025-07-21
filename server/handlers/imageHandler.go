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
	form := r.MultipartForm
    
	if form == nil {
		return []string{}, nil // No files uploaded, return empty slice
	}
	
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

func DeleteImageFiles(imagePaths []string) error {
    if len(imagePaths) == 0 {
        return nil
    }

    // Track unique parent directories
    parentDirs := make(map[string]bool)

    // Delete each image file and collect parent directories
    for _, imagePath := range imagePaths {
        // Skip empty paths
        if strings.TrimSpace(imagePath) == "" {
            continue
        }

        // Check if file exists before attempting to delete
        if _, err := os.Stat(imagePath); os.IsNotExist(err) {
            continue // Skip non-existent files
        }

        // Delete the image file
        if err := os.Remove(imagePath); err != nil {
            return fmt.Errorf("failed to delete file %s: %w", imagePath, err)
        }

        // Get parent directory
        parentDir := filepath.Dir(imagePath)
        parentDirs[parentDir] = true
    }

    // Delete parent directories if they're empty
    for parentDir := range parentDirs {
        // Check if directory exists
        if _, err := os.Stat(parentDir); os.IsNotExist(err) {
            continue
        }

        // Check if directory is empty
        entries, err := os.ReadDir(parentDir)
        if err != nil {
            return fmt.Errorf("failed to read directory %s: %w", parentDir, err)
        }

        // If directory is empty, delete it
        if len(entries) == 0 {
            if err := os.Remove(parentDir); err != nil {
                return fmt.Errorf("failed to delete directory %s: %w", parentDir, err)
            }
        }
    }

    return nil
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

    if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
        err := os.MkdirAll(uploadDir, 0755)
        if err != nil {
            return "", err
    }
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



func GetMimeType(filePath string) (string, error) {
    ext := strings.ToLower(filepath.Ext(filePath))
    switch ext {
    case ".jpg", ".jpeg":
        return "image/jpeg", nil
    case ".png":
        return "image/png", nil
    case ".gif":
        return "image/gif", nil
    case ".webp":
        return "image/webp", nil
    default:
        return "", fmt.Errorf("unsupported image extension: %s", ext)
    }
}