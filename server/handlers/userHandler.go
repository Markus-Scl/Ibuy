package handlers

import (
	"encoding/json"
	crypto "ibuy-server/auth"
	"ibuy-server/db"
	"net/http"
	"strings"
	"time"
)


type RegisterUser struct {
	FirstName string `json:"firstName"`
	LastName string `json:"lastName"`
	Email string `json:"email"`
	Password string `json:"password"`
}

type UserResponse struct {
    U_Id string `json:"userId"`
    FirstName string `json:"firstName"`
    LastName string `json:"lastName"`
    Email string `json:"email"` 
}
type DbUserResponse struct {
    U_Id string `json:"userId"`
    FirstName string `json:"firstName"`
    LastName string `json:"lastName"`
    Email string `json:"email"`
    Created time.Time `json:"created"` 
	Password string `json:"password"` 
}

type LoginCredentials struct {
    Email string `json:"email"`
    Password string `json:"password"`
}

type UserContext struct {
	UserId   string `json:"userId"`
	FirstName     string `json:"firstName"`
	LastName string `json:"lastName"`
	Email    string `json:"email"`
}


func AddUser(w http.ResponseWriter, r *http.Request){
	var newUser RegisterUser

	if err := json.NewDecoder(r.Body).Decode(&newUser); err != nil{
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	defer r.Body.Close()
	
	hashedPassword, err := crypto.HashPassword(newUser.Password)
	if err != nil {

		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to hash password"})
		return
	}

	var userId string
	
	err = db.DB.QueryRow(
		"INSERT INTO web_user (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING u_id",
		newUser.FirstName, newUser.LastName, newUser.Email, hashedPassword,
	).Scan(&userId)

	if err != nil {
		// Check if it's a unique constraint violation on email
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") && 
		   strings.Contains(err.Error(), "email") {

			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]string{"error": "Email already exists"})
			return
		}

		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to register user"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	
	if err := json.NewEncoder(w).Encode(map[string]string{"userId": userId}); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to encode response"})
		return
	}
}

func LoginUser(w http.ResponseWriter, r *http.Request) {
	var credentials LoginCredentials
	var dbu DbUserResponse

	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	err := db.DB.QueryRow(
		"SELECT u_id, first_name, last_name, email, created, password FROM web_user WHERE email = $1", credentials.Email,
	).Scan(&dbu.U_Id, &dbu.FirstName, &dbu.LastName, &dbu.Email, &dbu.Created, &dbu.Password)

	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to Login User"})
		return
	}

	if !crypto.CheckPasswordHash(credentials.Password, dbu.Password) {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to Login User"})
		return
	}

	config := crypto.NewTokenConfig()
	accessToken, refreshToken, err := crypto.GenerateTokens(dbu.U_Id, dbu.Email, dbu.FirstName, dbu.LastName, config)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to generate tokens"})
		return
	}

	// Store refresh token
	err = crypto.StoreRefreshToken(dbu.U_Id, refreshToken, time.Now().Add(config.RefreshTokenExpiry))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to store refresh token"})
		return
	}

	response := UserResponse{
		U_Id:      dbu.U_Id,
		FirstName: dbu.FirstName,
		LastName:  dbu.LastName,
		Email:     dbu.Email,
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
		MaxAge:   int(config.AccessTokenExpiry),
	})

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to encode response"})
		return
	}
}

func LogoutUser(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userContext, ok := r.Context().Value("userContext").(UserContext)
	if !ok {
		// Clear cookie even if context is missing to ensure logout
		http.SetCookie(w, &http.Cookie{
			Name:     "access_token",
			Value:    "",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteStrictMode,
			Path:     "/",
			MaxAge:   -1,
			Expires:  time.Now().Add(-24 * time.Hour),
		})
		w.WriteHeader(http.StatusOK)
		return
	}

	// Clear the access_token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
		MaxAge:   -1,
		Expires:  time.Now().Add(-24 * time.Hour),
	})

	// Delete the refresh token from the database
	err := crypto.DeleteRefreshToken(userContext.UserId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to invalidate refresh token"})
		return
	}

	w.WriteHeader(http.StatusOK)
}