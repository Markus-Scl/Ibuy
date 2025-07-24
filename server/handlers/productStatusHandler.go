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
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to get product statuses"})
		return
	}
	defer rows.Close()

	categoryMap := make(map[int]string)

	for rows.Next() {
		var id int
		var name string

		if err := rows.Scan(&id, &name); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to scan product statuses"})
			return
		}

		categoryMap[id] = name
	}

	if err := rows.Err(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Error iterating product statuses"})
		return
	}

	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(categoryMap); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to encode response"})
		return
	}
}