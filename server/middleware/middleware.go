package middleware

import (
	"context"
	crypto "ibuy-server/auth"
	"log"
	"net/http"
	"os"
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

			cookie, err := r.Cookie("access_token")
			if err != nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			
			accessSecret := os.Getenv("ACCESS_TOKEN_SECRET")
			claims, err := crypto.ValidateToken(cookie.Value, accessSecret)
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

// CORS middleware function
func CORS() Middleware {
    return func(next http.HandlerFunc) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
            
            origin := r.Header.Get("Origin")
            
            // Set CORS headers for allowed origins
            if origin == "http://localhost:5173" || origin == "http://localhost:3000" {
                w.Header().Set("Access-Control-Allow-Origin", origin)
                w.Header().Set("Access-Control-Allow-Credentials", "true")
            }
            
            w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
            w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie")
            
            // Handle preflight OPTIONS request
            if r.Method == "OPTIONS" {
                w.WriteHeader(http.StatusOK)
                return // Don't call next() for OPTIONS
            }
            
            next(w, r)
        }
    }
}
  

func Chain (h http.HandlerFunc, middlewares ...Middleware) http.HandlerFunc{
	for i := len(middlewares) -1; i >= 0; i--{
		h = middlewares[i](h)
	}
	return h
}