package handlers

import (
	"encoding/json"
	"net/http"
)

func CheckAuth(w http.ResponseWriter, r *http.Request){

    userContext, ok := r.Context().Value("userContext").(UserContext)

	if !ok {
		http.Error(w, "No user context found", http.StatusUnauthorized)
		return
	}

	response := UserResponse{
		U_Id:     userContext.UserId,
		Name:     userContext.Name,
		LastName: userContext.LastName,
		Email:    userContext.Email,
	}


	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

}