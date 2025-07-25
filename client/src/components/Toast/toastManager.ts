import type {Toast, ToastType} from './types';

class ToastManager {
	private toasts: Toast[] = [];
	private listeners: Array<(toasts: Toast[]) => void> = [];
	private autoRemoveTimeout = 5000; // 5 seconds

	subscribe(callback: (toasts: Toast[]) => void) {
		this.listeners.push(callback);
		// Return unsubscribe function
		return () => {
			this.listeners = this.listeners.filter((listener) => listener !== callback);
		};
	}

	private notify() {
		this.listeners.forEach((callback) => callback([...this.toasts]));
	}

	show(message: string, type: ToastType = 'info') {
		const toast: Toast = {
			id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			message,
			type,
			timestamp: Date.now(),
		};

		this.toasts.push(toast);
		this.notify();

		// Auto remove after timeout
		setTimeout(() => {
			this.remove(toast.id);
		}, this.autoRemoveTimeout);

		return toast.id;
	}

	remove(id: string) {
		this.toasts = this.toasts.filter((toast) => toast.id !== id);
		this.notify();
	}

	clear() {
		this.toasts = [];
		this.notify();
	}

	getToasts() {
		return [...this.toasts];
	}
}

// Create singleton instance
export const toastManager = new ToastManager();
