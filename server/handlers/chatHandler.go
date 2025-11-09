package handlers

import (
	"database/sql"
	"encoding/json"
	"ibuy-server/db"
	"ibuy-server/websocket"
	"log"
	"net/http"
	"time"
)

type ChatMessage struct {
	ID       	int       `json:"id"`
	MID      	string    `json:"m_id"`
	Content  	string    `json:"content"`
	Created  	time.Time `json:"created"`
	Sender   	string    `json:"sender"`
	Receiver 	string    `json:"receiver"`
	ProductId 	string 	  `json:"productId"`
	Seen     	bool      `json:"seen"`
}

type SendMessageRequest struct {
	Content  string `json:"content"`
	Receiver string `json:"receiver"`
	ProductId string `json:"productId"`
}

type Chat struct {
	SenderFirstName  string `json:"senderFirstName"`
	SenderLastName   string `json:"senderLastName"`
	ProductId        string `json:"productId"`
	ProductTitle     string `json:"productTitle"`
	ProductImage     string `json:"productImage"`
	UnseenCount      int    `json:"unseenCount"`
}

var ChatHub *websocket.Hub

func SendMessage(w http.ResponseWriter, r *http.Request){
	userContext, ok := r.Context().Value("userContext").(UserContext)
    if !ok {
        w.WriteHeader(http.StatusUnauthorized)
        json.NewEncoder(w).Encode(map[string]string{"error": "No user context found"})
        return
    }
    var senderId = userContext.UserId

	var req SendMessageRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil{
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}


	var messageId string
	var created time.Time

	err := db.DB.QueryRow(
		"INSERT INTO message (content, sender, receiver, product_id, created, seen) VALUES ($1, $2, $3, $4, $5, $6) RETURNING m_id, created",
		req.Content, senderId, req.Receiver, req.ProductId, time.Now(), false).Scan(&messageId, &created)

	if err != nil{
		log.Printf("Error saving message: %v", err)
		http.Error(w, "Failed to save message", http.StatusInternalServerError)
		return
	}

	wsMessage := websocket.Message{
		Type:     "message",
		Content:  req.Content,
		Sender:   senderId,
		Receiver: req.Receiver,
		ProductId: req.ProductId,
		MID:      messageId,
	}

	ChatHub.SendMessage(wsMessage)

	response := ChatMessage{
		MID:      messageId,
		Content:  req.Content,
		Created:  created,
		Sender:   senderId,
		Receiver: req.Receiver,
		ProductId: req.ProductId,
		Seen:     false,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func GetUserChats(w http.ResponseWriter, r *http.Request){
	userContext, ok := r.Context().Value("userContext").(UserContext)
    if !ok {
        w.WriteHeader(http.StatusUnauthorized)
        json.NewEncoder(w).Encode(map[string]string{"error": "No user context found"})
        return
    }

	query := `
	SELECT DISTINCT ON (
		LEAST(sender, receiver),
		GREATEST(sender, receiver),
		product_id
	)
		wu.first_name,
		wu.last_name,
		m.product_id,
		p.name AS product_title,
		pi.image_path AS product_image,
		COUNT(*) FILTER (WHERE NOT m.seen AND m.receiver = $1) AS unseen_count
	FROM message m
	INNER JOIN web_user wu ON m.sender = wu.u_id
	INNER JOIN product p ON m.product_id = p.p_id
	LEFT JOIN LATERAL (
		SELECT image_path
		FROM product_image
		WHERE product_id = m.product_id
		ORDER BY uploaded_at ASC
		LIMIT 1
	) pi ON true
	WHERE m.receiver = $1
	GROUP BY wu.first_name, wu.last_name, m.sender, m.receiver, m.product_id, p.name, pi.image_path
	ORDER BY 
		LEAST(m.sender, m.receiver),
		GREATEST(m.sender, m.receiver),
		m.product_id;
	`

	rows, err := db.DB.Query(query, userContext.UserId)
	if err != nil {
		log.Printf("Error querying chats: %v", err)
		http.Error(w, "Failed to retrieve chats", http.StatusInternalServerError)
		return
	}

	defer rows.Close()

	var chats []Chat
	for rows.Next() {
		var chat Chat
		var productImage sql.NullString
		err := rows.Scan(
			&chat.SenderFirstName,
			&chat.SenderLastName,
			&chat.ProductId,
			&chat.ProductTitle,
			&productImage,
			&chat.UnseenCount,
		)
		if err != nil {
			log.Printf("Error scanning chats: %v", err)
			continue
		}
		
		if productImage.Valid {
			chat.ProductImage = productImage.String
		} else {
			chat.ProductImage = ""
		}
		
		chats = append(chats, chat)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chats)
}



func GetMessages(w http.ResponseWriter, r *http.Request) {
	userContext, ok := r.Context().Value("userContext").(UserContext)
    if !ok {
        w.WriteHeader(http.StatusUnauthorized)
        json.NewEncoder(w).Encode(map[string]string{"error": "No user context found"})
        return
    }
    var senderId = userContext.UserId

	if senderId == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	productId := r.URL.Query().Get("product_id")

	if productId == "" {
		http.Error(w, "Missing product_id parameter", http.StatusBadRequest)
		return
	}

	otherUserID := r.URL.Query().Get("user_id")

	if otherUserID == "" {
		http.Error(w, "Missing user_id parameter", http.StatusBadRequest)
		return
	}

	// Query messages between the two users
	query := `
		SELECT id, m_id, content, created, sender, receiver, seen 
		FROM message 
		WHERE ((sender = $1 AND receiver = $2) OR (sender = $2 AND receiver = $1)) AND product_id = $3
		ORDER BY created ASC
	`

	rows, err := db.DB.Query(query, senderId, otherUserID, productId)
	if err != nil {
		log.Printf("Error querying messages: %v", err)
		http.Error(w, "Failed to retrieve messages", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var messages []ChatMessage
	for rows.Next() {
		var msg ChatMessage
		err := rows.Scan(&msg.ID, &msg.MID, &msg.Content, &msg.Created, &msg.Sender, &msg.Receiver, &msg.Seen)
		if err != nil {
			log.Printf("Error scanning message: %v", err)
			continue
		}
		messages = append(messages, msg)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func MarkMessagesAsSeen(w http.ResponseWriter, r *http.Request) {
	userContext, ok := r.Context().Value("userContext").(UserContext)
    if !ok {
        w.WriteHeader(http.StatusUnauthorized)
        json.NewEncoder(w).Encode(map[string]string{"error": "No user context found"})
        return
    }
    var userId = userContext.UserId

	if userId == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	senderID := r.URL.Query().Get("sender_id")
	if senderID == "" {
		http.Error(w, "Missing sender_id parameter", http.StatusBadRequest)
		return
	}

	// Mark all messages from sender to current user as seen
	query := `UPDATE message SET seen = true WHERE sender = $1 AND receiver = $2 AND seen = false`
	_, err := db.DB.Exec(query, senderID, userId)
	if err != nil {
		log.Printf("Error marking messages as seen: %v", err)
		http.Error(w, "Failed to mark messages as seen", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func GetOnlineUsers(w http.ResponseWriter, r *http.Request) {
	users := ChatHub.GetOnlineUsers()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string][]string{"online_users": users})
}