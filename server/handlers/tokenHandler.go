package handlers

import (
	"encoding/json"
	crypto "ibuy-server/auth"
	"net/http"
	"os"
	"time"
)

func RefreshToken(w http.ResponseWriter, r *http.Request) {
	var input struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}
	defer r.Body.Close()

	refreshSecret := os.Getenv("REFRESH_TOKEN_SECRET")

	config := crypto.NewTokenConfig()
	claims, err := crypto.ValidateToken(input.RefreshToken, refreshSecret)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid refresh token"})
		return
	}

	// Verify stored refresh token
	storedToken, expiry, err := crypto.GetRefreshToken(claims.UserId)
	if err != nil || storedToken != input.RefreshToken || expiry.Before(time.Now()) {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid or expired refresh token"})
		return
	}

	// Generate new access token
	accessToken, _, err := crypto.GenerateTokens(claims.UserId, claims.Email, claims.FirstName, claims.LastName, config)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to generate tokens"})
		return
	}

	response := struct {
		AccessToken string `json:"access_token"`
	}{AccessToken: accessToken}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
