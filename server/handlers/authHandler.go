package handlers

import (
	"encoding/json"
	crypto "ibuy-server/auth"
	"net/http"
)

func CheckAuth(w http.ResponseWriter, r *http.Request){
    
    claims, ok := r.Context().Value("claims").(*crypto.Claims)
	if !ok {
		http.Error(w, "No claims found in context", http.StatusUnauthorized)
		return
	}

	response := UserResponse{
		U_Id:     claims.UserId,
		Name:     claims.Name,
		LastName: claims.LastName,
		Email:    claims.Email,
	}


	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

}