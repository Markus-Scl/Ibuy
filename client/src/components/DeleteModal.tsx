import type {FC} from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import {CustomButton} from './CustomButton';

interface DeleteModalProps {
	type: string;
	name: string;
	onClose: () => void;
	onDelete: () => void;
}

export const DeleteModal: FC<DeleteModalProps> = ({type, name, onClose, onDelete}) => {
	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-in fade-in duration-300" onClick={handleOverlayClick}>
			<div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-white/20">
				{/* Header */}
				<div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 px-6 py-5 flex items-center justify-between rounded-t-3xl">
					<div className="flex items-center gap-3">
						<div className="bg-white/20 rounded-full p-2">
							<ReportProblemOutlinedIcon className="w-6 h-6 text-white" />
						</div>
						<h2 className="text-2xl font-bold text-white">Delete {type}</h2>
					</div>
					<button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 group">
						<CloseIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200 cursor-pointer" />
					</button>
				</div>

				{/* Content */}
				<div className="p-8 text-center">
					<div className="mb-6">
						<div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
							<ReportProblemOutlinedIcon sx={{fontSize: '50px'}} className="w-16 h-16 text-red-500" />
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">Are you absolutely sure?</h3>
						<p className="text-gray-600 text-lg leading-relaxed">
							You're about to permanently delete
							<br />
							<span className="font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">{name}</span>
							<br />
							<span className="text-sm text-red-500 mt-2 block">This action cannot be undone.</span>
						</p>
					</div>

					{/* Buttons */}
					<div className="flex items-center space-x-3 pt-4">
						<CustomButton title="Delete" color="from-red-600 to-pink-600 text-white" fullLength={true} handleClick={onDelete} />
						<CustomButton title="Cancel" color="from-gray-100 to-gray-200 text-gray-700 border border-gray-300" fullLength={true} handleClick={onClose} />
					</div>
				</div>
			</div>
		</div>
	);
};
