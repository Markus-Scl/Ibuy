import {useEffect, useRef, useState, type FC} from 'react';
import {primaryColor} from '../utils/theme';
import CloseIcon from '@mui/icons-material/Close';
import {CustomInput} from './Form/CustomInput';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import {useAuthStore} from '../stores/useAuthStore';
import type {Message, WsMessage} from '../types/types';
import {fetcher, mutationFetcher} from '../utils/fetcher';
import {useWebSocketStore} from '../stores/useWebSocketStore';

interface LiveChatProps {
	productId: string;
	targetUserId: string;
	onClose: () => void;
}

export const LiveChat: FC<LiveChatProps> = ({targetUserId, productId, onClose}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const [isTargetOnline, setIsTargetOnline] = useState<boolean>(false);
	const [isConnected, setIsConnected] = useState<boolean>(false);

	const [currentMessage, setCurrentMessage] = useState<string>('');

	const {user} = useAuthStore();

	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	const ws = useRef<WebSocket | null>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
	};

	useEffect(scrollToBottom, [messages]);

	useEffect(() => {
		const connectWebSocket = () => {
			ws.current = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_API}${user?.userId}&product_id=${productId}`);

			ws.current.onopen = () => {
				console.log('WebSocket Connected');
				setIsConnected(true);
				loadChatHistory();
			};

			ws.current.onmessage = (event) => {
				const message = JSON.parse(event.data) as WsMessage;

				if (message.type === 'message') {
					setMessages((prev) => [
						...prev,
						{
							id: message.messageId,
							content: message.content,
							sender: message.sender,
							receiver: message.receiver,
							created: new Date(),
							seen: false,
						},
					]);
				}
			};

			ws.current.onclose = () => {
				console.log('WebSocket Disconnected');
				setIsConnected(false);
			};

			ws.current.onerror = (error) => {
				setIsConnected(false);
			};
		};

		connectWebSocket();

		return () => {
			if (ws.current) {
				ws.current.close();
			}
		};
	}, []);

	const loadChatHistory = () => {
		try {
			fetcher(`chat/messages?product_id=${productId}&user_id=${targetUserId}`).then((res) => {
				const history = res as Message[];

				if (history) {
					setMessages(history || []);
				}
			});
		} catch (error) {
			console.error('Error loading chat history:', error);
		}
	};

	const sendMessage = () => {
		if (!currentMessage.trim() || !isConnected) return;

		const messageData = {
			content: currentMessage.trim(),
			receiver: targetUserId,
			productId: productId,
		};

		console.log(messageData);

		// Send via HTTP API (which will then broadcast via WebSocket)
		mutationFetcher<Message>('chat/send', {
			method: 'POST',
			body: messageData,
		})
			.then((res: Message) => {
				if (res !== null) {
					setMessages((prev) => [...prev, res]);
					setCurrentMessage('');
				} else {
					console.error('Failed to send message');
				}
			})
			.catch((e) => {
				console.error(e);
			});
	};

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={handleOverlayClick}>
			{isLoading ? (
				<span className="loading loading-spinner loading-sm mr-2 loading-xl text-primary"></span>
			) : (
				<div className="bg-white rounded-3xl shadow-2xl h-[70%] w-[35%] overflow-hidden">
					<div className={`${primaryColor} px-6 py-4 flex items-center justify-between h-[10%]`}>
						<h2 className="text-2xl font-bold text-white">Chat with ...</h2>
						<button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200 cursor-pointer">
							<CloseIcon />
						</button>
					</div>
					<div className={`${primaryColor}  h-[75%]`}>
						<div className="h-full w-full p-4 overflow-auto">
							{messages.map((message, idx) => (
								<div key={idx} className={`chat ${message.sender === user?.userId ? 'chat-end' : 'chat-start'}`}>
									<div className="chat-bubble chat-bubble-primary">{message.content}</div>
								</div>
							))}
						</div>
					</div>
					<div className={`${primaryColor} p-4 h-[15%] flex`}>
						<CustomInput name="chat" value={currentMessage} type="text" placeHolder="Message" onChange={(e) => setCurrentMessage(e.target.value)} onEnter={() => sendMessage()} />
						<button className="btn btn-circle btn-primary btn-lg shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 ml-2" onClick={() => sendMessage()}>
							<SendOutlinedIcon />
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
