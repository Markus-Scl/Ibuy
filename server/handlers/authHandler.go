package handlers

import (
	"encoding/json"
	"ibuy-server/db"
	"net/http"
)

func CheckAuth(w http.ResponseWriter, r *http.Request){
	var dbu DbUserResponse

	userId, ok := r.Context().Value("userId").(string)

	if !ok {
		http.Error(w, "User ID not found in context", http.StatusInternalServerError)
		return
	}

	err := db.DB.QueryRow(
		"SELECT u_id, name, last_name, email, created FROM web_user WHERE U_id = $1", userId,
		).Scan(&dbu.U_Id, &dbu.Name, &dbu.LastName, &dbu.Email, &dbu.Created)

	if err != nil{
		http.Error(w, "Failed to get User", http.StatusUnauthorized)
		return
	}

	response := UserResponse{
		U_Id:     dbu.U_Id,
		Name:     dbu.Name,
		LastName: dbu.LastName,
		Email:    dbu.Email,
		Created:  dbu.Created,
	}


	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

}