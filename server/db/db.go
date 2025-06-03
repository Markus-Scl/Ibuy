package db

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB(dataSourceName string){
	var err error
	DB, err = sql.Open("postgres", dataSourceName)
	if err != nil{
		log.Fatal("Failed to connect to DB:", err)
	}

	if err = DB.Ping(); err != nil{
		log.Fatal("Failed to ping DB", err)
	}

	log.Println("Database connection established.")
}