import {create} from 'zustand';

interface WebSocketStore {
	ws: WebSocket | null;
	isConnected: boolean;
	connect: (userId: string) => void;
	disconnect: () => void;
	getWebSocket: () => WebSocket | null;
}

export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
	ws: null,
	isConnected: false,

	connect: (userId: string) => {
		const {ws: currentWs, isConnected} = get();

		if (currentWs && isConnected) {
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

		ws.onclose = (event) => {
			console.log(`WebSocket closed for user: ${userId}`, event.code, event.reason);
			set({isConnected: false, ws: null});
		};

		ws.onerror = () => {
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

	getWebSocket: () => {
		return get().ws;
	},
}));
