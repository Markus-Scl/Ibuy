package handlers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"ibuy-server/db"
	"net/http"
	"os"
	"strconv"

	"github.com/lib/pq"
)

type NewProduct struct {
	Name        string  `json:"name"`
	Price       float32 `json:"price"`
	Category    int     `json:"category"`
	Condition   string     `json:"condition"`
	Location    string  `json:"location"`
	Description string  `json:"description"`
}

type ProductResponse struct {
    ProductID   string   `json:"product_id"`
    Name        string   `json:"name"`
    Price       float32  `json:"price"`
    Category    int      `json:"category"`
    Condition   string      `json:"condition"`
    Status      int      `json:"status"`
    Location    string   `json:"location"`
    Description string   `json:"description"`
    Images      []string `json:"images"` // Base64-encoded image data
}

func AddProduct(w http.ResponseWriter, r *http.Request) {
    userContext, ok := r.Context().Value("userContext").(UserContext)
    if !ok {
        http.Error(w, "No user context found", http.StatusUnauthorized)
        return
    }
    var userId = userContext.UserId

    // Parse multipart form instead of JSON
    err := r.ParseMultipartForm(32 << 20) // 32MB max
    if err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    // Extract form values and create NewProduct struct
    newProduct := NewProduct{
        Name:        r.FormValue("name"),
        Description: r.FormValue("description"),
        Location:    r.FormValue("location"),
		Condition: r.FormValue("condition"),
    }

    // Parse numeric fields with error handling
    if price := r.FormValue("price"); price != "" {
        if p, err := strconv.ParseFloat(price, 32); err == nil {
            newProduct.Price = float32(p)
        } else {
            http.Error(w, "Invalid price value", http.StatusBadRequest)
            return
        }
    }

    if category := r.FormValue("category"); category != "" {
        if c, err := strconv.Atoi(category); err == nil {
            newProduct.Category = c
        } else {
            http.Error(w, "Invalid category value", http.StatusBadRequest)
            return
        }
    }

    var productId string

    err = db.DB.QueryRow(
        "INSERT INTO product (name, description, price, u_id, category_id, status_id, condition, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING p_id",
        newProduct.Name, newProduct.Description, newProduct.Price, userId, newProduct.Category, 1, newProduct.Condition, newProduct.Location,
    ).Scan(&productId)

    if err != nil {
        http.Error(w, "Failed to create product", http.StatusInternalServerError)
        return
    }

    // Now handle image upload - the form is already parsed
    imagePaths, err := UploadImageHandler(r, userId, productId)
    if err != nil {
        http.Error(w, "Failed to save images", http.StatusInternalServerError)
        return
    }

    if len(imagePaths) > 0 {
        query := "INSERT INTO product_image (product_id, image_path) SELECT $1, UNNEST($2::text[])"
        _, err := db.DB.Exec(query, productId, pq.Array(imagePaths))
        if err != nil {
            http.Error(w, "Failed to save product images", http.StatusInternalServerError)
            return
        }
    }

    var base64Images []string
    for _, path := range imagePaths {
        imgData, err := os.ReadFile(path)
        if err != nil {
            http.Error(w, "Failed to read image file", http.StatusInternalServerError)
            return
        }
        mimeType, err := GetMimeType(path)
        if err != nil {
            http.Error(w, "Failed to determine image type", http.StatusInternalServerError)
            return
        }
        base64Str := fmt.Sprintf("data:%s;base64,%s", mimeType, base64.StdEncoding.EncodeToString(imgData))
        base64Images = append(base64Images, base64Str)
    }

    productResponse := ProductResponse{
        ProductID:   productId,
        Name:        newProduct.Name,
        Price:       newProduct.Price,
        Category:    newProduct.Category,
        Condition:   newProduct.Condition,
        Status:      1,
        Location:    newProduct.Location,
        Description: newProduct.Description,
        Images:      base64Images,
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)

    if err := json.NewEncoder(w).Encode(productResponse); err != nil {
        http.Error(w, "Failed to encode response", http.StatusInternalServerError)
        return
    }
}



