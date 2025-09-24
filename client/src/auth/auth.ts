import {useAuthStore} from '../stores/useAuthStore';
import type {LoginData, User} from '../types/types';
import {mutationFetcher} from '../utils/fetcher';

export async function authenticate(loginData: LoginData) {
	try {
		const user = await mutationFetcher<User>('login', {
			method: 'POST',
			body: loginData,
		});

		useAuthStore.getState().setSession(user);
		useAuthStore.getState().setLoading(false);

		return {success: true, user: user, error: undefined};
	} catch (error) {
		return {success: false, error: error};
	}
}

export async function logout() {
	try {
		await mutationFetcher<User>('logout', {
			method: 'PUT',
			body: {},
		});
	} catch (e) {
		console.warn('Logout request failed:', e);
	}

	localStorage.clear();
	sessionStorage.clear();

	// Reset Zustand store (if using)
	useAuthStore.getState().clearSession();

	// Optionally redirect
	window.location.href = '/login';
}
