import React, {useEffect, useState, type ReactNode} from 'react';
import type {Toast} from './types';
import {toastManager} from './toastManager';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface ToastContextProviderProps {
	children: ReactNode;
}

const ToastContextProvider: React.FC<ToastContextProviderProps> = ({children}) => {
	const [toasts, setToasts] = useState<Toast[]>([]);

	useEffect(() => {
		const unsubscribe = toastManager.subscribe(setToasts);
		// Set initial toasts
		setToasts(toastManager.getToasts());

		return unsubscribe;
	}, []);

	const getToastClasses = (type: string) => {
		const baseClasses = 'alert shadow-lg';
		switch (type) {
			case 'success':
				return `${baseClasses} alert-success`;
			case 'error':
				return `${baseClasses} alert-error`;
			case 'warning':
				return `${baseClasses} alert-warning`;
			case 'info':
			default:
				return `${baseClasses} alert-info`;
		}
	};

	const getIcon = (type: string) => {
		switch (type) {
			case 'success':
				return <CheckCircleOutlineOutlinedIcon />;
			case 'error':
				return <CancelOutlinedIcon />;
			case 'warning':
				return <WarningAmberOutlinedIcon />;
			case 'info':
			default:
				return <InfoOutlinedIcon />;
		}
	};

	return (
		<>
			{children}
			{toasts.length > 0 && (
				<div className="toast toast-start z-50">
					{toasts.map((toast) => (
						<div key={toast.id} className={getToastClasses(toast.type)}>
							{getIcon(toast.type)}
							<span>{toast.message}</span>
							<button className="btn btn-sm btn-circle btn-ghost ml-2" onClick={() => toastManager.remove(toast.id)}>
								✕
							</button>
						</div>
					))}
				</div>
			)}
		</>
	);
};

export default ToastContextProvider;
