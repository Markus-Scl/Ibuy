import type {FC} from 'react';
import CloseIcon from '@mui/icons-material/Close';

interface DeleteProps {
	type: string;
	name: string;
	onClose: () => void;
	onDelete: () => void;
}

export const DeleteModal: FC<DeleteProps> = ({type, name, onClose, onDelete}) => {
	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};
	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={handleOverlayClick}>
			<div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
				<div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
					<h2 className="text-2xl font-bold text-white">Delete {type}</h2>
					<button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200 cursor-pointer">
						<CloseIcon />
					</button>
				</div>
				<div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
					<h1>Are you sure you want to delete {name}</h1>
				</div>
			</div>
		</div>
	);
};
