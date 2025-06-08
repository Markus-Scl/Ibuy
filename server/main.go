package main

import (
	"fmt"
	"ibuy-server/db"
	userhandler "ibuy-server/handlers"
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
    port := os.Getenv("DB_PORT")

    dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, password, host, port, dbname)

    db.InitDB(dsn)

	mux := router.NewMiddlewareMux(middleware.Logging(), middleware.Auth(), middleware.CORS())

	mux.Handle("POST /register", userhandler.AddUser)
	mux.Handle("POST /login", userhandler.LoginUser)

    log.Println("Server listening on :8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}