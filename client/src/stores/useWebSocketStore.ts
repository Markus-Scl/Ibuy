import {create} from 'zustand';
import type {WsMessage, WSNotificationMessage} from '../types/types';

type WebSocketMessage = WsMessage | WSNotificationMessage;
type MessageHandler = (message: WebSocketMessage) => void;

interface WebSocketStore {
	ws: WebSocket | null;
	isConnected: boolean;
	messageHandlers: Set<MessageHandler>;

	connect: (userId: string) => void;
	disconnect: () => void;
	updateView: (productId: string) => void;
	addMessageHandler: (handler: MessageHandler) => () => void;
	removeMessageHandler: (handler: MessageHandler) => void;
}

export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
	ws: null,
	isConnected: false,
	messageHandlers: new Set(),

	connect: (userId: string) => {
		const {ws: currentWs, isConnected} = get();

		// Already connected with same user
		if (currentWs && isConnected) {
			console.log('WebSocket already connected');
			return;
		}

		// Close existing connection if any
		if (currentWs) {
			currentWs.close();
		}

		const ws = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_API}${userId}`);

		ws.onopen = () => {
			console.log(`WebSocket connected for user: ${userId}`);
			set({isConnected: true});
		};

		ws.onmessage = (event) => {
			try {
				const message: WebSocketMessage = JSON.parse(event.data);
				const {messageHandlers} = get();

				// Notify all registered handlers
				messageHandlers.forEach((handler) => {
					try {
						handler(message);
					} catch (error) {
						console.error('Error in message handler:', error);
					}
				});
			} catch (error) {
				console.error('Failed to parse WebSocket message:', error);
			}
		};

		ws.onclose = (event) => {
			console.log(`WebSocket closed for user: ${userId}`, event.code, event.reason);
			set({isConnected: false, ws: null});

			// Optional: Auto-reconnect after 3 seconds if it wasn't a clean close
			if (!event.wasClean) {
				console.log('Connection lost, attempting to reconnect...');
				setTimeout(() => {
					const {isConnected: currentlyConnected} = get();
					if (!currentlyConnected) {
						get().connect(userId);
					}
				}, 3000);
			}
		};

		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
			set({isConnected: false});
		};

		set({ws});
	},

	disconnect: () => {
		const {ws} = get();
		if (ws) {
			ws.close();
			set({ws: null, isConnected: false});
		}
	},

	updateView: (productId: string) => {
		const {ws, isConnected} = get();

		if (!ws || !isConnected) {
			console.error('WebSocket is not connected');
			return;
		}

		ws.send(
			JSON.stringify({
				type: 'update_view',
				productId: productId,
			})
		);
	},

	addMessageHandler: (handler: MessageHandler) => {
		set((state) => {
			const newHandlers = new Set(state.messageHandlers);
			newHandlers.add(handler);
			return {messageHandlers: newHandlers};
		});

		// Return cleanup function
		return () => get().removeMessageHandler(handler);
	},

	removeMessageHandler: (handler: MessageHandler) => {
		set((state) => {
			const newHandlers = new Set(state.messageHandlers);
			newHandlers.delete(handler);
			return {messageHandlers: newHandlers};
		});
	},
}));
