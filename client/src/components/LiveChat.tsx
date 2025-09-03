import type {FC} from 'react';
import {primaryColor} from '../utils/theme';
import CloseIcon from '@mui/icons-material/Close';
import {CustomInput} from './Form/CustomInput';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';

interface LiveChatProps {
	onClose: () => void;
}

export const LiveChat: FC<LiveChatProps> = ({onClose}) => {
	const isLoading = false;
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
						<CustomInput name="chat" value="" type="text" placeHolder="Message" onChange={() => console.log('change')} />
						<button className="btn btn-circle btn-primary btn-lg shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 ml-2" onClick={() => console.log('send')}>
							<SendOutlinedIcon />
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
