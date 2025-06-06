package userhandler

import (
	"encoding/json"
	crypto "ibuy-server/auth"
	"ibuy-server/db"
	"net/http"
	"time"
)


type RegisterUser struct {
	Name string `json:"name"`
	LastName string `json:"lastName"`
	Email string `json:"email"`
	Password string `json:"password"`
	Birthday time.Time `json:"birthday"`
}

type UserResponse struct {
    U_ID string `json:"U_id"`
    Name string `json:"name"`
    LastName string `json:"lastName"`
    Email string `json:"email"`
    Birthday time.Time `json:"birthday"`
    Created time.Time `json:"created"` 
}

func AddUser(w http.ResponseWriter, r *http.Request){
	var newUser RegisterUser

	if err := json.NewDecoder(r.Body).Decode(&newUser); err != nil{
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	defer r.Body.Close()
	
	hashedPassword, err := crypto.HashPassword(newUser.Password)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	var userId string
	
	err = db.DB.QueryRow(
		"INSERT INTO web_user (name, last_name, email, password, birthday) VALUES ($1, $2, $3, $4, $5) RETURNING u_id",
		newUser.Name, newUser.LastName, newUser.Email, hashedPassword, newUser.Birthday,
	).Scan(&userId)


	if err != nil {
		http.Error(w, "Failed to register user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(userId)

}