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
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }
    defer r.Body.Close()

	refreshSecret := os.Getenv("REFRESH_TOKEN_SECRET")

    config := crypto.NewTokenConfig()
    claims, err := crypto.ValidateToken(input.RefreshToken, refreshSecret)
    if err != nil {
        http.Error(w, "Invalid refresh token", http.StatusUnauthorized)
        return
    }

    // Verify stored refresh token
    storedToken, expiry, err := crypto.GetRefreshToken(claims.UserId)
    if err != nil || storedToken != input.RefreshToken || expiry.Before(time.Now()) {
        http.Error(w, "Invalid or expired refresh token", http.StatusUnauthorized)
        return
    }

    // Generate new access token
    accessToken, _, err := crypto.GenerateTokens(claims.UserId, claims.Email, claims.FirstName, claims.LastName, config)
    if err != nil {
        http.Error(w, "Failed to generate tokens", http.StatusInternalServerError)
        return
    }

    response := struct {
        AccessToken string `json:"access_token"`
    }{AccessToken: accessToken}

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(response)
}