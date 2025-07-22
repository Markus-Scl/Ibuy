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
	err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }

	user := os.Getenv("DB_USER")
    password := os.Getenv("DB_PASSWORD")
    dbname := os.Getenv("DB_NAME")
    host := os.Getenv("DB_HOST")
    dbPort := os.Getenv("DB_PORT")


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
	mux.Handle("GET /auth/session", routeHandler.CheckAuth)

	//Products
	mux.Handle("GET /product", routeHandler.GetUserProducts)
	mux.Handle("GET /product/{id}", routeHandler.GetProductById)
	mux.Handle("POST /product", routeHandler.AddProduct)
	mux.Handle("PUT /product", routeHandler.UpdateProduct)
	mux.Handle("DELETE /product", routeHandler.DeleteProductById)

	//Categories
	mux.Handle("GET /category", routeHandler.GetCategories)

	//Product statuses
	mux.Handle("GET /productstatus", routeHandler.GetProductStatuses)


	serverPort:= ":" + os.Getenv("SERVER_PORT")
    log.Println("Server listening on", serverPort)
    log.Fatal(http.ListenAndServe(serverPort, mux))
}