package handlers

import (
	"encoding/json"
	"ibuy-server/db"
	"net/http"
)


func GetProductStatuses(w http.ResponseWriter, r *http.Request) {
	query := `SELECT id, name FROM product_status`

	rows, err := db.DB.Query(query)
	if err != nil {
		http.Error(w, "Failed to get product statuses", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	categoryMap := make(map[int]string)

	for rows.Next() {
		var id int
		var name string

		if err := rows.Scan(&id, &name); err != nil {
			http.Error(w, "Failed to scan product statuses", http.StatusInternalServerError)
			return
		}

		categoryMap[id] = name
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Error iterating product statuses", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(categoryMap); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}