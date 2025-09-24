package websocket

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Message struct {
	Type     	string `json:"type"`     
	Content  	string `json:"content"`  
	Sender   	string `json:"sender"`   
	Receiver 	string `json:"receiver"`
	ProductId 	string `json:"productId"`
	MID      	string `json:"m_id"`    
}

type NotificationMessage struct {
	Type      string `json:"type"`
	ProductId string `json:"productId"`
	Sender    string `json:"sender"`
	Content   string `json:"content"`
	MID       string `json:"m_id"`
}

type Client struct {
	UserID string 
	ProductID string         
	Conn   *websocket.Conn 
	Hub    *Hub            
}

// Hub manages all active connections
type Hub struct {
	clients    map[string]*Client // Map of userID to client
	register   chan *Client       // Register new clients
	unregister chan *Client       // Unregister clients
	broadcast  chan Message       // Broadcast message to specific user
	notify     chan Message		  // Send notification to user
	mutex      sync.RWMutex       // Protect concurrent access
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan Message),
		notify:     make(chan Message),
	}
}

func (h *Hub) Run(){
	for{
		select{
		case client := <- h.register:
			h.mutex.Lock()
			h.clients[client.UserID] = client
			h.mutex.Unlock()
			log.Printf("User %s connected. Total connections: %d", client.UserID, len(h.clients))

		case client := <- h.unregister:
			h.mutex.Lock()
			if _, exists := h.clients[client.UserID]; exists{
				delete(h.clients, client.UserID)
				client.Conn.Close()
			}
			h.mutex.Unlock()
			log.Printf("User %s disconnected. Total connections: %d", client.UserID, len(h.clients))

		case message := <-h.broadcast:
			h.handleMessage(message)

		case message := <-h.notify:
			h.sendNotification(message)
		
		}
	
	}
}

func (h *Hub) handleMessage(message Message) {
	h.mutex.RLock()
	receiver, exists := h.clients[message.Receiver]
	h.mutex.RUnlock()

	if !exists {
		log.Printf("User %s is not connected, message not delivered", message.Receiver)
		return
	}

	// Check if receiver is viewing the same product chat
	if receiver.ProductID == message.ProductId {
		// User is viewing the same product chat - send as regular message
		if err := receiver.Conn.WriteJSON(message); err != nil {
			log.Printf("Error sending message to %s: %v", message.Receiver, err)
			h.unregister <- receiver
		}
		log.Printf("Message delivered to %s in product %s", message.Receiver, message.ProductId)
	} else {
		// User is not viewing this product chat - send as notification
		notification := NotificationMessage{
			Type:      "notification",
			ProductId: message.ProductId,
			Sender:    message.Sender,
			Content:   message.Content,
			MID:       message.MID,
		}

		if err := receiver.Conn.WriteJSON(notification); err != nil {
			log.Printf("Error sending notification to %s: %v", message.Receiver, err)
			h.unregister <- receiver
		}
		log.Printf("Notification sent to %s for product %s", message.Receiver, message.ProductId)
	}
}

func (h *Hub) sendNotification(message Message) {
	h.handleMessage(message)
}

func (h *Hub) SendMessage(message Message) {
	h.broadcast <- message
}

func (h *Hub) IsUserOnline(userId string) bool {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	_, exists := h.clients[userId]

	return exists
}

func (h *Hub) GetOnlineUsers() []string {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	users := make([]string, 0, len(h.clients))

	for userId := range h.clients {
		users = append(users, userId)
	}
	return users
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *Hub) HandleWebSocket(w http.ResponseWriter, r *http.Request){
	userId := r.URL.Query().Get("user_id")
	productId := r.URL.Query().Get("product_id")

	if userId == ""{
		http.Error(w, "Missing user_id parameter", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}


	client := &Client{
		UserID: userId,
		ProductID: productId,
		Conn: conn,
		Hub: h,
	}

	h.register <- client

	go client.readMessages()
}

func (c *Client) readMessages() {
	defer func(){
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	for{
		var msg Message
		err := c.Conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error for user %s: %v", c.UserID, err)
			}
			break
		}

		msg.Sender = c.UserID

		log.Printf("Received message from %s to %s: %s", msg.Sender, msg.Receiver, msg.Content)

		c.Hub.SendMessage(msg)
	}
}
