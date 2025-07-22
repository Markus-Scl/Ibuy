package handlers

import (
	"database/sql"
	"encoding/json"
	"ibuy-server/db"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

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

type UpdatedProduct struct {
	Name        string  `json:"name"`
	Price       float32 `json:"price"`
	Category    int     `json:"category"`
    Status      int     `json:"status"`
	Condition   string     `json:"condition"`
	Location    string  `json:"location"`
	Description string  `json:"description"`
    DeletedImages []string `json:"deletedImages"`
}

type ProductResponse struct {
    ProductID   string   `json:"productId"`
    UserID      string   `json:"userId"`
    Name        string   `json:"name"`
    Price       float32  `json:"price"`
    Category    int      `json:"category"`
    Condition   string      `json:"condition"`
    Status      int      `json:"status"`
    Location    string   `json:"location"`
    Description string   `json:"description"`
    Created    time.Time `json:"created"`
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

func UpdateProduct(w http.ResponseWriter, r *http.Request){
    productId := r.URL.Query().Get("id")

    if productId == "" {
        http.Error(w, "Invalid product URL", http.StatusBadRequest)
        return
    }

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

    // Extract form values and create UpdateProduct struct
    updateProduct := UpdatedProduct{
        Name:        r.FormValue("name"),
        Description: r.FormValue("description"),
        Location:    r.FormValue("location"),
        Condition:   r.FormValue("condition"),
    }

    // Parse numeric fields with error handling
    if price := r.FormValue("price"); price != "" {
        if p, err := strconv.ParseFloat(price, 32); err == nil {
            updateProduct.Price = float32(p)
        } else {
            http.Error(w, "Invalid price value", http.StatusBadRequest)
            return
        }
    }

    if category := r.FormValue("category"); category != "" {
        if c, err := strconv.Atoi(category); err == nil {
            updateProduct.Category = c
        } else {
            http.Error(w, "Invalid category value", http.StatusBadRequest)
            return
        }
    }

    if status := r.FormValue("status"); status != "" {
        if s, err := strconv.Atoi(status); err == nil {
            updateProduct.Status = s
        } else {
            http.Error(w, "Invalid status value", http.StatusBadRequest)
            return
        }
    }

    // Parse deleted images array if provided
    if deletedImagesStr := r.FormValue("deletedImages"); deletedImagesStr != "" {
        err := json.Unmarshal([]byte(deletedImagesStr), &updateProduct.DeletedImages)
        if err != nil {
            http.Error(w, "Invalid deletedImages format", http.StatusBadRequest)
            return
        }
    }

    // Update the product in database
    _, err = db.DB.Exec(`
        UPDATE product 
        SET name = $1, description = $2, price = $3, category_id = $4, status_id = $5, condition = $6, location = $7
        WHERE p_id = $8 AND u_id = $9`,
        updateProduct.Name, updateProduct.Description, updateProduct.Price, 
        updateProduct.Category, updateProduct.Status, updateProduct.Condition, 
        updateProduct.Location, productId, userId,
    )


    if err != nil {
        log.Printf("In the if [%s]", err)
        http.Error(w, "Failed to update product", http.StatusInternalServerError)
        return
    }

    
    // Handle deleted images
    if len(updateProduct.DeletedImages) > 0 {
        // Delete image files from filesystem
        err = DeleteImageFiles(updateProduct.DeletedImages)
        if err != nil {
            http.Error(w, "Failed to delete image files", http.StatusInternalServerError)
            return
        }

        // Remove deleted images from database
        query := "DELETE FROM product_image WHERE product_id = $1 AND image_path = ANY($2)"
        _, err = db.DB.Exec(query, productId, pq.Array(updateProduct.DeletedImages))
        if err != nil {
            http.Error(w, "Failed to delete product images from database", http.StatusInternalServerError)
            return
        }
    }

    // Handle new image uploads
    var newImagePaths []string
    imagePaths, err := UploadImageHandler(r, userId, productId)
    if err != nil {
        http.Error(w, "Failed to save new images", http.StatusInternalServerError)
        return
    }

    // Convert file paths to URL paths and normalize to forward slashes
    for _, path := range imagePaths {
        urlPath := strings.ReplaceAll(path, "\\", "/")
        newImagePaths = append(newImagePaths, urlPath)
    }

    // Save new image URL paths to database
    if len(newImagePaths) > 0 {
        query := "INSERT INTO product_image (product_id, image_path) SELECT $1, UNNEST($2::text[])"
        _, err := db.DB.Exec(query, productId, pq.Array(newImagePaths))
        if err != nil {
            http.Error(w, "Failed to save new product images", http.StatusInternalServerError)
            return
        }
    }

    // Get all current images for the product to return in response
    var allImagePaths []string
    rows, err := db.DB.Query("SELECT image_path FROM product_image WHERE product_id = $1", productId)
    if err != nil {
        http.Error(w, "Failed to retrieve updated product images", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    for rows.Next() {
        var imagePath string
        if err := rows.Scan(&imagePath); err != nil {
            continue
        }
        allImagePaths = append(allImagePaths, imagePath)
    }

    productResponse := ProductResponse{
        ProductID:   productId,
        UserID:      userId,
        Name:        updateProduct.Name,
        Price:       updateProduct.Price,
        Category:    updateProduct.Category,
        Condition:   updateProduct.Condition,
        Status:      updateProduct.Status,
        Location:    updateProduct.Location,
        Description: updateProduct.Description,
        Images:      allImagePaths,
    }

    w.WriteHeader(http.StatusOK)

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

    var product ProductResponse
    var imagePathsStr sql.NullString

    // Using string_agg to concatenate all image paths (PostgreSQL)
    query := `
        SELECT 
            p.p_id,
            p.u_id,
            p.name,
            p.price,
            p.category_id,
            p.condition,
            p.status_id,
            p.location,
            p.description,
            p.created,
            string_agg(pi.image_path, ',') as image_paths
        FROM product p
        LEFT JOIN product_image pi ON p.p_id = pi.product_id
        WHERE p.p_id = $1
        GROUP BY p.p_id, p.u_id, p.name, p.price, p.category_id, p.condition, p.status_id, p.location, p.description, p.created`

    err := db.DB.QueryRow(query, productId).Scan(
        &product.ProductID,
        &product.UserID,
        &product.Name,
        &product.Price,
        &product.Category,
        &product.Condition,
        &product.Status,
        &product.Location,
        &product.Description,
        &product.Created,
        &imagePathsStr,
    )

    if err != nil {
        if err == sql.ErrNoRows {
            http.Error(w, "Product not found", http.StatusNotFound)
            return
        }
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
            p.created,
            pi.image_path
        FROM product p
        LEFT JOIN product_image pi ON p.p_id = pi.product_id
        WHERE p.u_id = $1`

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
        var created time.Time

        err := rows.Scan(
            &productID,
            &name,
            &price,
            &category,
            &condition,
            &status,
            &location,
            &description,
            &created,
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
                Created:     created,
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


func DeleteProductById(w http.ResponseWriter, r *http.Request){
    productId := r.URL.Query().Get("id")

    if productId == "" {
        http.Error(w, "Invalid product URL", http.StatusBadRequest)
        return
    }

    userContext, ok := r.Context().Value("userContext").(UserContext)
    if !ok {
        http.Error(w, "No user context found", http.StatusUnauthorized)
        return
    }

    var userId = userContext.UserId

    query := `
        SELECT 
            p.u_id,
            string_agg(pi.image_path, ',') as image_paths
        FROM product p
        LEFT JOIN product_image pi ON p.p_id = pi.product_id
        WHERE p.p_id = $1
        GROUP BY p.u_id`

    var productUserId string
    var imagePathsString sql.NullString

    err := db.DB.QueryRow(query, productId).Scan(
        &productUserId,
        &imagePathsString,
    )

    if err != nil {
        if err == sql.ErrNoRows {
            http.Error(w, "Product not found", http.StatusNotFound)
            return
        }
        http.Error(w, "Failed to delete product", http.StatusInternalServerError)
        return
    }

    if productUserId != userId {
        http.Error(w, "Not Authorized", http.StatusForbidden)
        return
    }

    // Convert to string array or empty array
    var imagePaths []string
    if imagePathsString.Valid && imagePathsString.String != "" {
        imagePaths = strings.Split(imagePathsString.String, ",")
    } else {
        imagePaths = []string{} // Empty array if no images
    }

    // Delete image files if any exist
    if len(imagePaths) > 0 {
        err = DeleteImageFiles(imagePaths)
        if err != nil {
            http.Error(w, "Failed to delete images", http.StatusInternalServerError)
            return
        }
    }

    _, err = db.DB.Exec("DELETE FROM product WHERE p_id = $1", productId)
    if err != nil {
        http.Error(w, "Failed to delete product from database", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"message": "Product deleted successfully"}`))
}