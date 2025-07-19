package handlers

import (
	"encoding/json"
	"ibuy-server/db"
	"net/http"
)


func GetCategory(w http.ResponseWriter, r *http.Request) {
	query := `SELECT id, name FROM category`

	rows, err := db.DB.Query(query)
	if err != nil {
		http.Error(w, "Failed to get categories", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	categoryMap := make(map[int]string)

	for rows.Next() {
		var id int
		var name string

		if err := rows.Scan(&id, &name); err != nil {
			http.Error(w, "Failed to scan category", http.StatusInternalServerError)
			return
		}

		categoryMap[id] = name
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Error iterating categories", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(categoryMap); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}