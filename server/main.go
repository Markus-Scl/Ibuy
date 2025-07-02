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
    dbPort := os.Getenv("DB_PORT")


    dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, password, host, dbPort, dbname)

    db.InitDB(dsn)

	mux := router.NewMiddlewareMux(middleware.CORS(), middleware.Logging(), middleware.Auth())

	mux.Handle("POST /register", userhandler.AddUser)
	mux.Handle("POST /login", userhandler.LoginUser)
	mux.Handle("GET /auth/session", userhandler.CheckAuth)


	serverPort:= ":" + os.Getenv("SERVER_PORT")
    log.Println("Server listening on", serverPort)
    log.Fatal(http.ListenAndServe(serverPort, mux))
}