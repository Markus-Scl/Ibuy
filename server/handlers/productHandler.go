package handlers

import (
	"encoding/json"
	"ibuy-server/db"
	"net/http"
	"time"
)

type NewProduct struct {
	Name        string  `json:"name"`
	Price       float32 `json:"price"`
	Category    int     `json:"category"`
	Condition   int     `json:"condition"`
	Status   int     `json:"status"`
	Location    string  `json:"location"`
	Description string  `json:"description"`
}

func AddProduct(w http.ResponseWriter, r *http.Request){
	userContext, ok := r.Context().Value("userContext").(UserContext)

	if !ok {
		http.Error(w, "No user context found", http.StatusUnauthorized)
		return
	}
	var userId = userContext.UserId

	var newProduct NewProduct

	if err := json.NewDecoder(r.Body).Decode(&newProduct); err != nil{
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	defer r.Body.Close()

	var productId string

	err := db.DB.QueryRow(
		"INSERT INTO product (name, description, price, uploaded_at, u_id, category_id, status_id, condition, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING p_id",
		newProduct.Name, newProduct.Description, newProduct.Price, time.Now().Local(), userId, newProduct.Category, newProduct.Status, newProduct.Condition, newProduct.Location,
	).Scan(&productId)

	if err != nil {
		http.Error(w, "Failed to create product", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)

	if err:= json.NewEncoder(w).Encode(newProduct); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}



