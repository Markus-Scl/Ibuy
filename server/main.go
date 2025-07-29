package main

import (
	"fmt"
	"ibuy-server/db"
	routeHandler "ibuy-server/handlers"
	"ibuy-server/middleware"
	"ibuy-server/router"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	// Try to load .env file, but don't fail if it doesn't exist
	// This allows the app to work with environment variables from docker-compose
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	host := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")

	// Validate required environment variables
	if user == "" || password == "" || dbname == "" || host == "" || dbPort == "" {
		log.Fatal("Missing required database environment variables")
	}

	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, password, host, dbPort, dbname)

	db.InitDB(dsn)

	mux := router.NewMiddlewareMux(middleware.CORS(), middleware.Logging(), middleware.Auth())

	mux.Handle("OPTIONS /", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	fileServer := http.FileServer(http.Dir("./"))
	mux.Handle("GET /uploads/products/", func(w http.ResponseWriter, r *http.Request) {
		http.StripPrefix("/", fileServer).ServeHTTP(w, r)
	})

	//User handling
	mux.Handle("POST /register", routeHandler.AddUser)
	mux.Handle("POST /login", routeHandler.LoginUser)
	mux.Handle("PUT /logout", routeHandler.LogoutUser)
	mux.Handle("GET /auth/session", routeHandler.CheckAuth)

	//Products
	mux.Handle("GET /home", routeHandler.GetCategoryProducts)
	mux.Handle("GET /product", routeHandler.GetUserProducts)
	mux.Handle("GET /product/{id}", routeHandler.GetProductById)
	mux.Handle("POST /product", routeHandler.AddProduct)
	mux.Handle("PUT /product", routeHandler.UpdateProduct)
	mux.Handle("DELETE /product", routeHandler.DeleteProductById)

	//Categories
	mux.Handle("GET /category", routeHandler.GetCategories)

	//Product statuses
	mux.Handle("GET /productstatus", routeHandler.GetProductStatuses)

	serverPort := ":" + os.Getenv("SERVER_PORT")
	if os.Getenv("SERVER_PORT") == "" {
		serverPort = ":8080" // Default port
	}
	
	log.Println("Server listening on", serverPort)
	log.Fatal(http.ListenAndServe(serverPort, mux))
}