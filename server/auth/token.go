package crypto

import (
	"errors"
	"os"
	"time"

	"ibuy-server/db"

	"github.com/golang-jwt/jwt/v5"
)

// Claims defines the structure for JWT claims
type Claims struct {
    UserId string `json:"userId"`
    Email  string `json:"email"`
    jwt.RegisteredClaims
}

// TokenConfig holds configuration for token generation
type TokenConfig struct {
    AccessTokenExpiry  time.Duration 
    RefreshTokenExpiry time.Duration
}

// NewTokenConfig creates a default token configuration
func NewTokenConfig() *TokenConfig {
    return &TokenConfig{
        AccessTokenExpiry:  15 * time.Minute,
        RefreshTokenExpiry: 7 * 24 * time.Hour,
    }
}


// GenerateTokens creates access and refresh tokens for a user
func GenerateTokens(userId, email string, config *TokenConfig) (string, string, error) {
    // Generate access token
    accessClaims := &Claims{
        UserId: userId,
        Email:  email,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(config.AccessTokenExpiry)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            Subject:   userId,
        },
    }
    accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenSecret :=  os.Getenv("ACCESS_TOKEN_SECRET")
    accessTokenStr, err := accessToken.SignedString([]byte(accessTokenSecret))
    if err != nil {
        return "", "", err
    }

    // Generate refresh token
    refreshClaims := &Claims{
        UserId: userId,
        Email:  email,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(config.RefreshTokenExpiry)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            Subject:   userId,
        },
    }
    refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenSecret :=  os.Getenv("ACCESS_TOKEN_SECRET")
    refreshTokenStr, err := refreshToken.SignedString([]byte(refreshTokenSecret))
    if err != nil {
        return "", "", err
    }

    return accessTokenStr, refreshTokenStr, nil
}

// ValidateToken verifies a JWT token and returns its claims
func ValidateToken(tokenStr, secret string) (*Claims, error) {
    claims := &Claims{}
    token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, errors.New("unexpected signing method")
        }
        return []byte(secret), nil
    })
    if err != nil {
        return nil, err
    }
    if !token.Valid {
        return nil, errors.New("invalid token")
    }
    return claims, nil
}

// StoreRefreshToken saves or updates the refresh token in the database
func StoreRefreshToken(userId, refreshToken string, expiry time.Time) error {
    _, err := db.DB.Exec(
        `UPDATE web_user 
         SET refresh_token = $1, refresh_token_expiry = $2 
         WHERE u_id = $3`,
        refreshToken, expiry, userId,
    )
    return err
}

// GetRefreshToken retrieves the refresh token for a user
func GetRefreshToken(userId string) (string, time.Time, error) {
    var token string
    var expiry time.Time
    err := db.DB.QueryRow(
        `SELECT refresh_token, refresh_token_expiry 
         FROM web_user 
         WHERE u_id = $1`,
        userId,
    ).Scan(&token, &expiry)
    if err != nil {
        return "", time.Time{}, err
    }
    return token, expiry, nil
}


