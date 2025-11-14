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
}

type NotificationMessage struct {
	Type      string `json:"type"`
	ProductId string `json:"productId"`
	Sender    string `json:"sender"`
}

// Message to update which product the user is currently viewing
type UpdateViewMessage struct {
	Type      string `json:"type"` // "update_view"
	ProductId string `json:"productId"` // empty string means no chat open
}

type Client struct {
	UserID string 
	ProductID string         
	Conn   *websocket.Conn 
	Hub    *Hub      
	mutex     sync.RWMutex      
}

// Hub manages all active connections
type Hub struct {
	clients    	map[string]*Client // Map of userID to client
	register   	chan *Client       // Register new clients
	unregister 	chan *Client       // Unregister clients
	message 	chan Message
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		message: 	make(chan Message),
	}
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

	go client.updateViewListener()
}

func (c *Client) updateViewListener() {
	defer func(){
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	for {
		var updateViewMsg UpdateViewMessage
		err := c.Conn.ReadJSON(&updateViewMsg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error for user %s: %v", c.UserID, err)
			}
			break
		}

		c.SetViewingProduct(updateViewMsg.ProductId)
	}
}

// Update which product this client is viewing
func (c *Client) SetViewingProduct(productId string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	c.ProductID = productId
	log.Printf("User %s now viewing product: %s", c.UserID, productId)
}

func (h *Hub) Run(){
	for{
		select{
			case client := <- h.register:

				// If user already has a connection, close it
				if oldClient, exists := h.clients[client.UserID]; exists {
					log.Printf("Closing previous connection for user %s", client.UserID)
					oldClient.Conn.Close()
				}

				h.clients[client.UserID] = client

				log.Printf("User %s connected. Total connections: %d", client.UserID, len(h.clients))

			case client := <- h.unregister:
				if existing, ok := h.clients[client.UserID]; ok && existing == client {
					delete(h.clients, client.UserID)
					client.Conn.Close()
				}
				log.Printf("User %s disconnected. Total connections: %d", client.UserID, len(h.clients))

			case message := <- h.message:
				receiver, ok := h.clients[message.Receiver]
				if ok {
                    h.SendMessage(message, receiver)
                } else {
					log.Printf("User %s is not connected, message not delivered but saved in db", message.Receiver)
				}
		}
	
	}
}

func (h *Hub) RegisterMessage(message Message){
	h.message <- message
}

func (h *Hub) SendMessage(message Message, receiver *Client) {


	receiver.mutex.Lock()
    viewingProduct := receiver.ProductID
    sendAsMessage := viewingProduct == message.ProductId && viewingProduct != ""
    receiver.mutex.Unlock()

	// Check if receiver is viewing the same product chat
	if sendAsMessage{
		// User is viewing the same product chat - send as regular message
		if err := receiver.Conn.WriteJSON(message); err != nil {
			log.Printf("Error sending message to %s: %v", message.Receiver, err)
			h.unregister <- receiver
			return 
		}
		log.Printf("Message delivered to %s in product %s", message.Receiver, message.ProductId)
	} else {
		// User is online but not viewing this product chat - send as notification
		notification := NotificationMessage{
			Type:      "notification",
			ProductId: message.ProductId,
			Sender:    message.Sender,
		}

		if err := receiver.Conn.WriteJSON(notification); err != nil {
			log.Printf("Error sending notification to %s: %v", message.Receiver, err)
			h.unregister <- receiver
			return
		}
		log.Printf("Notification sent to %s for product %s", message.Receiver, message.ProductId)
	}
}

// Get which product this client is viewing
func (c *Client) GetViewingProduct() string {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	return c.ProductID
}



