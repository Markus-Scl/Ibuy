import {toastManager} from './toastManager';
import type {ToastType} from './types';

export const toast = {
	success: (message: string) => toastManager.show(message, 'success'),
	error: (message: string) => toastManager.show(message, 'error'),
	warning: (message: string) => toastManager.show(message, 'warning'),
	info: (message: string) => toastManager.show(message, 'info'),
	show: (message: string, type: ToastType = 'info') => toastManager.show(message, type),
	remove: (id: string) => toastManager.remove(id),
	clear: () => toastManager.clear(),
};
