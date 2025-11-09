import {useEffect, useState, type FC} from 'react';
import type {Chat} from './types';
import {fetcher} from '../../utils/fetcher';
import {toast} from '../../components/Toast/utils';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import {primaryColor} from '../../utils/theme';
import {useNavigate} from 'react-router-dom';
import {getImageUrl} from '../productDetail/utils';

export const ChatPage: FC = () => {
	const [chats, setChats] = useState<Chat[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const navigate = useNavigate();

	useEffect(() => {
		fetcher<Chat[]>('chats')
			.then((res: Chat[]) => {
				if (res) {
					console.log(res);
					setChats(res);
				}
			})
			.catch((e) => {
				console.error(e);
				toast.error('Failed to load chats');
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	if (isLoading) {
		return (
			<div className="w-full h-full flex flex-col justify-center items-center p-8">
				<span className="loading loading-spinner loading-sm mr-2 loading-xl text-primary"></span>
			</div>
		);
	}

	if (chats.length === 0) {
		return (
			<div className="w-full h-full flex flex-col justify-center items-center p-8">
				<div className="text-center space-y-6 max-w-md">
					{/* Animated Icon Container */}
					<div className="relative">
						<div className={`absolute inset-0 ${primaryColor} rounded-full blur-xl opacity-20 animate-pulse`}></div>
						<div className={`relative ${primaryColor} rounded-full p-8 shadow-2xl`}>
							<ChatBubbleOutlineIcon className="text-white drop-shadow-lg" sx={{fontSize: '120px'}} />
						</div>
					</div>

					{/* Empty State Content */}
					<div className="space-y-4">
						<h2 className={`text-3xl font-bold ${primaryColor} bg-clip-text text-transparent`}>No Conversations Yet</h2>
						<p className="text-gray-600 text-lg leading-relaxed">You don't have any active chats. Start connecting with buyers and sellers to see your conversations here.</p>
					</div>

					{/* Subtle Encouragement */}
					<div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
						<div className={`w-2 h-2 ${primaryColor} rounded-full`} />
						<span>Your messages will appear here</span>
						<div className={`w-2 h-2 ${primaryColor} rounded-full`} />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-full relative">
			<div className="flex justify-between items-center p-4 pb-2 h-[7%]">
				<h1 className="text-2xl font-bold text-gray-800">My Conversations</h1>
			</div>
			<div className="w-full h-[93%] p-4 overflow-auto">
				<div className="max-w-4xl mx-auto space-y-3">
					{chats.map((chat, idx) => (
						<div
							key={idx}
							onClick={() => navigate(`/chat/${chat.productId}`)}
							className="card bg-white shadow-sm hover:shadow-lg transform hover:scale-[1.01] transition-all duration-200 cursor-pointer border border-gray-100">
							<div className="card-body p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4 flex-1">
										{/* Avatar */}
										<div className={`${primaryColor} text-white rounded-full w-12 h-12 flex items-center justify-center`}>
											<PersonOutlineIcon sx={{fontSize: '24px'}} />
										</div>

										{/* Chat Info */}
										<div className="flex w-[80%] items-center">
											<div className="w-[30%]">
												<div className="flex items-center gap-2">
													<h3 className="font-semibold text-gray-800 text-lg">{(chat.senderFirstName as string) + ' ' + chat.senderLastName}</h3>
													<div className="fled"></div>
													<ChatBubbleOutlineIcon className="text-gray-400" sx={{fontSize: '16px'}} />
												</div>
												<p className="text-gray-500 text-sm">Product: {chat.productTitle as string}</p>
											</div>
											<div className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer`}>
												<img src={getImageUrl(chat.productImage as string)} className="w-full h-full object-cover" />
											</div>
										</div>

										{/* Unseen Count Badge */}
										{chat.unseenCount > 0 && <div className={`badge ${primaryColor} text-white badge-lg font-semibold px-3 py-3`}>{chat.unseenCount} new</div>}
									</div>

									{/* Arrow indicator */}
									<div className="text-gray-400 ml-4">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
