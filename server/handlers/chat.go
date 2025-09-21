package handlers

import (
	"encoding/json"
	"ibuy-server/db"
	"ibuy-server/websocket"
	"log"
	"net/http"
	"time"
)

type ChatMessage struct {
	ID       int       `json:"id"`
	MID      string    `json:"m_id"`
	Content  string    `json:"content"`
	Created  time.Time `json:"created"`
	Sender   string    `json:"sender"`
	Receiver string    `json:"receiver"`
	Seen     bool      `json:"seen"`
}

type SendMessageRequest struct {
	Content  string `json:"content"`
	Receiver string `json:"receiver"`
}

var ChatHub *websocket.Hub

func SendMessage(w http.ResponseWriter, r *http.Request){
	userContext, ok := r.Context().Value("userContext").(UserContext)
    if !ok {
        w.WriteHeader(http.StatusUnauthorized)
        json.NewEncoder(w).Encode(map[string]string{"error": "No user context found"})
        return
    }
    var userId = userContext.UserId

	var req SendMessageRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil{
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var messageId string
	var created time.Time

	err := db.DB.QueryRow(
		"INSERT INTO message (content, sender, receiver, created, seen) VALUES ($1, $2, $3, $4) RETURNING m_id, created",
		req.Content, userId, req.Receiver, time.Now(), false).Scan(&messageId, &created)

	if err != nil{
		log.Printf("Error saving message: %v", err)
		http.Error(w, "Failed to save message", http.StatusInternalServerError)
		return
	}

	wsMessage := websocket.Message{
		Type:     "message",
		Content:  req.Content,
		Sender:   userId,
		Receiver: req.Receiver,
		MID:      messageId,
	}

	ChatHub.SendMessage(wsMessage)

		response := ChatMessage{
		MID:      messageId,
		Content:  req.Content,
		Created:  created,
		Sender:   userId,
		Receiver: req.Receiver,
		Seen:     false,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}