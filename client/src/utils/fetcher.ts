import {logout} from '../auth/auth';
import {AuthError} from '../types/types';
import {useNavigate} from 'react-router-dom';

export const fetcher = async <T>(url: string): Promise<T> => {
	try {
		const response = await fetch(`${import.meta.env.VITE_SERVER_API}${url}`, {
			method: 'GET',
			credentials: 'include', // Important: Include cookies in requests
			headers: {
				'Content-Type': 'application/json',
			},
		});

		// Handle different response statuses
		if (!response.ok) {
			if (response.status === 401) {
				// Try to refresh token first
				const refreshSuccess = await tryRefreshToken();
				if (refreshSuccess) {
					// Retry the original request
					const retryResponse = await fetch(`${import.meta.env.VITE_SERVER_API}${url}`, {
						method: 'GET',
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
						},
					});

					if (retryResponse.ok) {
						return retryResponse.json();
					}
					logout();
				}
				throw new AuthError('Authentication failed', 401);
			}

			if (response.status === 403) {
				throw new AuthError('Access forbidden', 403);
			}

			// Handle other HTTP errors
			const errorData = await response.json().catch(() => ({
				message: 'An error occurred',
			}));
			throw new Error(errorData.message || `HTTP ${response.status}`);
		}

		return response.json();
	} catch (error) {
		// Re-throw AuthError and other known errors
		if (error instanceof AuthError) {
			throw error;
		}

		// Handle network errors
		if (error instanceof TypeError && error.message.includes('fetch')) {
			throw new Error('Network error - please check your connection');
		}

		throw error;
	}
};

// POST/PUT/DELETE fetcher
export const mutationFetcher = async <T>(
	url: string,
	options: {
		method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
		body?: any;
	} = {}
): Promise<T> => {
	const {method = 'POST', body} = options;

	try {
		const response = await fetch(`${import.meta.env.VITE_SERVER_API}${url}`, {
			method,
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!response.ok) {
			if (response.status === 401) {
				const refreshSuccess = await tryRefreshToken();
				if (refreshSuccess) {
					const retryResponse = await fetch(`${import.meta.env.VITE_SERVER_API}${url}`, {
						method,
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
						},
						body: body ? JSON.stringify(body) : undefined,
					});

					if (retryResponse.ok) {
						return retryResponse.json();
					}
				}

				throw new AuthError('Authentication failed', 401);
			}

			const errorData = await response.json().catch((err) => ({
				message: err,
			}));
			throw new Error(errorData.message || `HTTP ${response.status}`);
		}

		return response.json();
	} catch (error) {
		throw error;
	}
};

// Token refresh function
const tryRefreshToken = async (): Promise<boolean> => {
	try {
		const response = await fetch('/api/auth/refresh', {
			method: 'POST',
			credentials: 'include',
		});

		return response.ok;
	} catch {
		return false;
	}
};

// Custom hook for handling auth errors in components
export const useAuthHandler = () => {
	const navigate = useNavigate();

	const handleAuthError = () => {
		navigate('/login', {replace: true});
	};

	return {handleAuthError};
};
