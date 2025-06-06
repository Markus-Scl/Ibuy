package middleware

import (
	"context"
	crypto "ibuy-server/auth"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

type Middleware func(http.HandlerFunc) http.HandlerFunc

func Logging() Middleware {
	return func(next http.HandlerFunc) http.HandlerFunc{
		return func(w http.ResponseWriter, r *http.Request){
			start := time.Now()
			defer func(){
				log.Printf("%s %s [%s]", r.Method, r.URL.Path, time.Since(start))
			}()

			next(w, r)
		}
	}
}

func Auth() Middleware {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			// Skip authentication for /login and /register
			if r.URL.Path == "/login" || r.URL.Path == "/register" {
				next(w, r)
				return
			}
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				http.Error(w, "Authorization header missing or invalid", http.StatusUnauthorized)
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			accessSecret := os.Getenv("ACCESS_TOKEN_SECRET")
			claims, err := crypto.ValidateToken(tokenStr, accessSecret)
			if err != nil {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}

			// Add claims to context for use in handlers
			ctx := context.WithValue(r.Context(), "userId", claims.UserId)
			next(w, r.WithContext(ctx))
		}
	}
}

func Chain (h http.HandlerFunc, middlewares ...Middleware) http.HandlerFunc{
	for i := len(middlewares) -1; i >= 0; i--{
		h = middlewares[i](h)
	}
	return h
}