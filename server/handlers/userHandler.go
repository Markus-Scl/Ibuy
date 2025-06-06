package handlers

import (
	"encoding/json"
	"fmt"
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
    U_Id string `json:"userId"`
    Name string `json:"name"`
    LastName string `json:"lastName"`
    Email string `json:"email"`
    Birthday time.Time `json:"birthday"`
    Created time.Time `json:"created"` 
	AccessToken   string    `json:"access_token"`
}
type DbUserResponse struct {
    U_Id string `json:"userId"`
    Name string `json:"name"`
    LastName string `json:"lastName"`
    Email string `json:"email"`
    Birthday time.Time `json:"birthday"`
    Created time.Time `json:"created"` 
	Password string `json:"password"` 
}

type LoginCredentials struct {
    Email string `json:"email"`
    Password string `json:"password"`
}

func AddUser(w http.ResponseWriter, r *http.Request){
	var newUser RegisterUser

	fmt.Printf("called")

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
	
	if err := json.NewEncoder(w).Encode(userId); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

}

func LoginUser(w http.ResponseWriter, r *http.Request){
	var credentials LoginCredentials
	var dbu DbUserResponse

	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := db.DB.QueryRow(
		"SELECT u_id, name, last_name, email, birthday, created, password FROM web_user WHERE email = $1", credentials.Email,
		).Scan(&dbu.U_Id, &dbu.Name, &dbu.LastName, &dbu.Email, &dbu.Birthday, &dbu.Created, &dbu.Password)

	if err != nil{
		http.Error(w, "Failed to Login User", http.StatusUnauthorized)
		return
	}

	if !crypto.CheckPasswordHash(credentials.Password, dbu.Password){
		http.Error(w, "Failed to Login User", http.StatusUnauthorized)
		return
	}
	config := crypto.NewTokenConfig()
	accessToken, refreshToken, err := crypto.GenerateTokens(dbu.U_Id, dbu.Email, config)

	if err != nil {
		http.Error(w, "Failed to generate tokens", http.StatusInternalServerError)
		return
	}

	// Store refresh token
	err = crypto.StoreRefreshToken(dbu.U_Id, refreshToken, time.Now().Add(config.RefreshTokenExpiry))
	if err != nil {
		http.Error(w, "Failed to store refresh token", http.StatusInternalServerError)
		return
	}

	response := UserResponse{
		U_Id:     dbu.U_Id,
		Name:     dbu.Name,
		LastName: dbu.LastName,
		Email:    dbu.Email,
		Birthday: dbu.Birthday,
		Created:  dbu.Created,
		AccessToken: accessToken,
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

}