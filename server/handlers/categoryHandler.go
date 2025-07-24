package handlers

import (
	"encoding/json"
	"ibuy-server/db"
	"net/http"
)

func GetCategories(w http.ResponseWriter, r *http.Request) {
	query := `SELECT id, name FROM category`

	rows, err := db.DB.Query(query)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to get categories"})
		return
	}
	defer rows.Close()

	categoryMap := make(map[int]string)

	for rows.Next() {
		var id int
		var name string

		if err := rows.Scan(&id, &name); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to scan category"})
			return
		}

		categoryMap[id] = name
	}

	if err := rows.Err(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Error iterating categories"})
		return
	}

	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(categoryMap); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to encode response"})
		return
	}
}