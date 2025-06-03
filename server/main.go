package main

import (
	"fmt"
	"ibuy-server/db"
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


    log.Println("Server listening on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}