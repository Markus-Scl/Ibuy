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
        w.WriteHeader(http.StatusUnauthorized)
        json.NewEncoder(w).Encode(map[string]string{"error": "No user context found"})
        return
    }
    var userId = userContext.UserId

    // Parse multipart form instead of JSON
    err := r.ParseMultipartForm(32 << 20) // 32MB max
    if err != nil {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
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
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(map[string]string{"error": "Invalid price value"})
            return
        }
    }

    if category := r.FormValue("category"); category != "" {
        if c, err := strconv.Atoi(category); err == nil {
            newProduct.Category = c
        } else {
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(map[string]string{"error": "Invalid category value"})
            return
        }
    }

    var productId string

    err = db.DB.QueryRow(
        "INSERT INTO product (name, description, price, u_id, category_id, status_id, condition, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING p_id",
        newProduct.Name, newProduct.Description, newProduct.Price, userId, newProduct.Category, 1, newProduct.Condition, newProduct.Location,
    ).Scan(&productId)

    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create product"})
        return
    }

    // Now handle image upload - the form is already parsed
    imagePaths, err := UploadImageHandler(r, userId, productId)
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to save images"})
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
            w.WriteHeader(http.StatusInternalServerError)
            json.NewEncoder(w).Encode(map[string]string{"error": "Failed to save product images"})
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
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to encode response"})
        return
    }
}

func UpdateProduct(w http.ResponseWriter, r *http.Request){
    productId := r.URL.Query().Get("id")

    if productId == "" {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{"error": "Invalid product URL"})
        return
    }

    userContext, ok := r.Context().Value("userContext").(UserContext)
    if !ok {
        w.WriteHeader(http.StatusUnauthorized)
        json.NewEncoder(w).Encode(map[string]string{"error": "No user context found"})
        return
    }

    var userId = userContext.UserId

    // Parse multipart form instead of JSON
    err := r.ParseMultipartForm(32 << 20) // 32MB max
    if err != nil {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
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
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(map[string]string{"error": "Invalid price value"})
            return
        }
    }

    if category := r.FormValue("category"); category != "" {
        if c, err := strconv.Atoi(category); err == nil {
            updateProduct.Category = c
        } else {
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(map[string]string{"error": "Invalid category value"})
            return
        }
    }

    if status := r.FormValue("status"); status != "" {
        if s, err := strconv.Atoi(status); err == nil {
            updateProduct.Status = s
        } else {
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(map[string]string{"error": "Invalid status value"})
            return
        }
    }

    // Parse deleted images array if provided
    if deletedImagesStr := r.FormValue("deletedImages"); deletedImagesStr != "" {
        err := json.Unmarshal([]byte(deletedImagesStr), &updateProduct.DeletedImages)
        if err != nil {
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(map[string]string{"error": "Invalid deletedImages format"})
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
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to update product"})
        return
    }

    // Handle deleted images
    if len(updateProduct.DeletedImages) > 0 {
        // Delete image files from filesystem
        err = DeleteImageFiles(updateProduct.DeletedImages)
        if err != nil {
            w.WriteHeader(http.StatusInternalServerError)
            json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete image files"})
            return
        }

        // Remove deleted images from database
        query := "DELETE FROM product_image WHERE product_id = $1 AND image_path = ANY($2)"
        _, err = db.DB.Exec(query, productId, pq.Array(updateProduct.DeletedImages))
        if err != nil {
            w.WriteHeader(http.StatusInternalServerError)
            json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete product images from database"})
            return
        }
    }

    // Handle new image uploads
    var newImagePaths []string
    imagePaths, err := UploadImageHandler(r, userId, productId)
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to save new images"})
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
            w.WriteHeader(http.StatusInternalServerError)
            json.NewEncoder(w).Encode(map[string]string{"error": "Failed to save new product images"})
            return
        }
    }

    // Get all current images for the product to return in response
    var allImagePaths []string
    rows, err := db.DB.Query("SELECT image_path FROM product_image WHERE product_id = $1", productId)
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to retrieve updated product images"})
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
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to encode response"})
        return
    }
}

func GetProductById(w http.ResponseWriter, r *http.Request) {
    path := r.URL.Path
    parts := strings.Split(path, "/")

    if len(parts) != 3 || parts[1] != "product" || parts[2] == "" {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{"error": "Invalid product URL"})
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
            w.WriteHeader(http.StatusNotFound)
            json.NewEncoder(w).Encode(map[string]string{"error": "Product not found"})
            return
        }
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to get product"})
        return
    }

    // Parse the comma-separated image paths
    if imagePathsStr.Valid && imagePathsStr.String != "" {
        product.Images = strings.Split(imagePathsStr.String, ",")
    } else {
        product.Images = []string{}
    }

    w.WriteHeader(http.StatusOK)

    if err := json.NewEncoder(w).Encode(product); err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to encode response"})
        return
    }
}


func GetCategoryProducts(w http.ResponseWriter, r *http.Request) {
    query := `
        WITH ranked_products AS (
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
                p.u_id,
                ROW_NUMBER() OVER (PARTITION BY p.category_id ORDER BY p.created DESC) as rn
            FROM product p
        )
        SELECT 
            rp.p_id,
            rp.name,
            rp.price,
            rp.category_id,
            rp.condition,
            rp.status_id,
            rp.location,
            rp.description,
            rp.created,
            rp.u_id,
            pi.image_path
        FROM ranked_products rp
        LEFT JOIN product_image pi ON rp.p_id = pi.product_id
        WHERE rp.rn <= 10
        ORDER BY rp.category_id, rp.created DESC`

    rows, err := db.DB.Query(query)
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to get products"})
        return
    }
    defer rows.Close()

    productMap := make(map[string]*ProductResponse)
    categoryMap := make(map[int][]ProductResponse)

    for rows.Next() {
        var productID, name, condition, location, description, userID string
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
            &userID,
            &imagePath,
        )
        if err != nil {
            w.WriteHeader(http.StatusInternalServerError)
            json.NewEncoder(w).Encode(map[string]string{"error": "Failed to get all product info"})
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
                UserID:      userID,
                Images:      []string{},
            }
        }

        // Add image path if it exists
        if imagePath.Valid && imagePath.String != "" {
            productMap[productID].Images = append(productMap[productID].Images, imagePath.String)
        }
    }

    if err = rows.Err(); err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to read product images"})
        return
    }

    // Group products by category ID
    for _, product := range productMap {
        categoryMap[product.Category] = append(categoryMap[product.Category], *product)
    }

    w.WriteHeader(http.StatusOK)

    if err := json.NewEncoder(w).Encode(categoryMap); err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to encode response"})
        return
    }
}

func GetUserProducts(w http.ResponseWriter, r *http.Request) {

    userContext, ok := r.Context().Value("userContext").(UserContext)
    if !ok {
        w.WriteHeader(http.StatusUnauthorized)
        json.NewEncoder(w).Encode(map[string]string{"error": "No user context found"})
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
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to get products"})
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
            w.WriteHeader(http.StatusInternalServerError)
            json.NewEncoder(w).Encode(map[string]string{"error": "Failed to get all product info"})
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
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to read product images"})
        return
    }

    // Convert map to slice
    var products []ProductResponse
    for _, product := range productMap {
        products = append(products, *product)
    }

    w.WriteHeader(http.StatusOK)

    if err := json.NewEncoder(w).Encode(products); err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to encode response"})
        return
    }
}

func DeleteProductById(w http.ResponseWriter, r *http.Request){
    productId := r.URL.Query().Get("id")

    if productId == "" {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{"error": "Invalid product URL"})
        return
    }

    userContext, ok := r.Context().Value("userContext").(UserContext)
    if !ok {
        w.WriteHeader(http.StatusUnauthorized)
        json.NewEncoder(w).Encode(map[string]string{"error": "No user context found"})
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
            w.WriteHeader(http.StatusNotFound)
            json.NewEncoder(w).Encode(map[string]string{"error": "Product not found"})
            return
        }
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete product"})
        return
    }

    if productUserId != userId {
        w.WriteHeader(http.StatusForbidden)
        json.NewEncoder(w).Encode(map[string]string{"error": "Not Authorized"})
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
            w.WriteHeader(http.StatusInternalServerError)
            json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete images"})
            return
        }
    }

    _, err = db.DB.Exec("DELETE FROM product WHERE p_id = $1", productId)
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete product from database"})
        return
    }

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"message": "Product deleted successfully"})
}