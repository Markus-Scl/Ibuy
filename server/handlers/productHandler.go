package handlers

import (
	"database/sql"
	"encoding/json"
	"ibuy-server/db"
	"log"
	"net/http"
	"strconv"
	"strings"

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
    ProductID   string   `json:"productId"`
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
        Condition:   r.FormValue("condition"),
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

    // Convert file paths to URL paths and normalize to forward slashes
    var urlPaths []string
    for _, path := range imagePaths {
        // Convert backslashes to forward slashes for URL format
        urlPath := strings.ReplaceAll(path, "\\", "/")
        urlPaths = append(urlPaths, urlPath)
    }

    // Save URL paths (with forward slashes) to database
    if len(urlPaths) > 0 {
        query := "INSERT INTO product_image (product_id, image_path) SELECT $1, UNNEST($2::text[])"
        _, err := db.DB.Exec(query, productId, pq.Array(urlPaths))
        if err != nil {
            http.Error(w, "Failed to save product images", http.StatusInternalServerError)
            return
        }
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
        Images:      urlPaths, // Return URL paths instead of base64 images
    }

    w.WriteHeader(http.StatusCreated)

    if err := json.NewEncoder(w).Encode(productResponse); err != nil {
        http.Error(w, "Failed to encode response", http.StatusInternalServerError)
        return
    }
}

func GetProductById(w http.ResponseWriter, r *http.Request) {
    path := r.URL.Path
    parts := strings.Split(path, "/")

    if len(parts) != 3 || parts[1] != "product" || parts[2] == "" {
        http.Error(w, "Invalid product URL", http.StatusBadRequest)
        return
    }

    productId := parts[2]
    log.Printf("Product ID: %s", productId)

    var product ProductResponse
    var imagePathsStr sql.NullString

    // Using string_agg to concatenate all image paths (PostgreSQL)
    query := `
        SELECT 
            p.p_id,
            p.name,
            p.price,
            p.category_id,
            p.condition,
            p.status_id,
            p.location,
            p.description,
            string_agg(pi.image_path, ',') as image_paths
        FROM product p
        LEFT JOIN product_image pi ON p.p_id = pi.product_id
        WHERE p.p_id = $1
        GROUP BY p.p_id, p.name, p.price, p.category_id, p.condition, p.status_id, p.location, p.description`

    err := db.DB.QueryRow(query, productId).Scan(
        &product.ProductID,
        &product.Name,
        &product.Price,
        &product.Category,
        &product.Condition,
        &product.Status,
        &product.Location,
        &product.Description,
        &imagePathsStr,
    )

    if err != nil {
        if err == sql.ErrNoRows {
            http.Error(w, "Product not found", http.StatusNotFound)
            return
        }
        log.Printf("Failed to scan product row: %v", err)
        http.Error(w, "Failed to get product", http.StatusInternalServerError)
        return
    }

    // Parse the comma-separated image paths
    if imagePathsStr.Valid && imagePathsStr.String != "" {
        product.Images = strings.Split(imagePathsStr.String, ",")
    } else {
        product.Images = []string{}
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)

    if err := json.NewEncoder(w).Encode(product); err != nil {
        log.Printf("Failed to encode response: %v", err)
        http.Error(w, "Failed to encode response", http.StatusInternalServerError)
        return
    }
}

func GetUserProducts(w http.ResponseWriter, r *http.Request) {
    userContext, ok := r.Context().Value("userContext").(UserContext)
    if !ok {
        http.Error(w, "No user context found", http.StatusUnauthorized)
        return
    }
    var userId = userContext.UserId

    query := `
        SELECT 
            p.p_id,
            p.name,
            p.price,
            p.category_id,
            p.condition,
            p.status_id,
            p.location,
            p.description,
            pi.image_path
        FROM product p
        LEFT JOIN product_image pi ON p.p_id = pi.product_id
        WHERE p.u_id = $1
        ORDER BY p.p_id, pi.id`

    rows, err := db.DB.Query(query, userId)
    if err != nil {
        http.Error(w, "Failed to get products", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    productMap := make(map[string]*ProductResponse)
    
    for rows.Next() {
        var productID, name, condition, location, description string
        var price float32
        var category, status int
        var imagePath sql.NullString

        err := rows.Scan(
            &productID,
            &name,
            &price,
            &category,
            &condition,
            &status,
            &location,
            &description,
            &imagePath,
        )
        if err != nil {
            http.Error(w, "Failed to get all product info", http.StatusInternalServerError)
            return
        }

        // Check if product already exists in map
        if _, exists := productMap[productID]; !exists {
            productMap[productID] = &ProductResponse{
                ProductID:   productID,
                Name:        name,
                Price:       price,
                Category:    category,
                Condition:   condition,
                Status:      status,
                Location:    location,
                Description: description,
                Images:      []string{},
            }
        }

        // Add image path if it exists
        if imagePath.Valid && imagePath.String != "" {
            productMap[productID].Images = append(productMap[productID].Images, imagePath.String)
        }
    }

    if err = rows.Err(); err != nil {
        http.Error(w, "Failed to read product images", http.StatusInternalServerError)
        return
    }

    // Convert map to slice
    var products []ProductResponse
    for _, product := range productMap {
        products = append(products, *product)
    }

    w.WriteHeader(http.StatusOK)

    if err := json.NewEncoder(w).Encode(products); err != nil {
        http.Error(w, "Failed to encode response", http.StatusInternalServerError)
        return
    }
}



