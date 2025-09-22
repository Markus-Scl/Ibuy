import {useEffect, useRef, useState, type FC} from 'react';
import {primaryColor} from '../utils/theme';
import CloseIcon from '@mui/icons-material/Close';
import {CustomInput} from './Form/CustomInput';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import {useAuthStore} from '../stores/useAuthStore';
import type {Message, WsMessage} from '../types/types';

interface LiveChatProps {
	targetUserId: string;
	onClose: () => void;
}

export const LiveChat: FC<LiveChatProps> = ({targetUserId, onClose}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const [isTargetOnline, setIsTargetOnline] = useState(false);

	const [currentMessage, setCurrentMessage] = useState<string>('');

	const {user} = useAuthStore();

	const ws = useRef<WebSocket | null>(null);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
	};

	useEffect(scrollToBottom, [messages]);

	useEffect(() => {
		const connectWebSocket = () => {
			ws.current = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_API}${user?.userId}`);

			ws.current.onopen = () => {
				console.log('WebSocket Connected');
				setIsConnected(true);
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
							<div className="chat chat-start">
								<div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
							</div>
							<div className="chat chat-start">
								<div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
							</div>
							<div className="chat chat-start">
								<div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
							</div>
							<div className="chat chat-end">
								<div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
							</div>
							<div className="chat chat-end">
								<div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
							</div>
							<div className="chat chat-start">
								<div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
							</div>
							<div className="chat chat-start">
								<div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
							</div>
							<div className="chat chat-start">
								<div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
							</div>
							<div className="chat chat-end">
								<div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
							</div>
							<div className="chat chat-end">
								<div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
							</div>
							<div className="chat chat-start">
								<div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
							</div>
							<div className="chat chat-start">
								<div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
							</div>
							<div className="chat chat-start">
								<div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
							</div>
							<div className="chat chat-end">
								<div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
							</div>
							<div className="chat chat-end">
								<div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
							</div>
						</div>
					</div>
					<div className={`${primaryColor} p-4 h-[15%] flex`}>
						<CustomInput name="chat" value={currentMessage} type="text" placeHolder="Message" onChange={(e) => setCurrentMessage(e.target.value)} />
						<button className="btn btn-circle btn-primary btn-lg shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 ml-2" onClick={() => console.log('send')}>
							<SendOutlinedIcon />
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
