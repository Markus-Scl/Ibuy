package handlers

import (
	"encoding/json"
	"net/http"
)

func CheckAuth(w http.ResponseWriter, r *http.Request) {
	userContext, ok := r.Context().Value("userContext").(UserContext)

	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "No user context found"})
		return
	}

	response := UserResponse{
		U_Id:      userContext.UserId,
		FirstName: userContext.FirstName,
		LastName:  userContext.LastName,
		Email:     userContext.Email,
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to encode response"})
		return
	}
}