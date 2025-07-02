import {create} from 'zustand';
import type {User} from '../types/types';

type AuthState = {
	authenticated: boolean;
	loading: boolean;
	user: User | null;
	setSession: (user: AuthState['user']) => void;
	clearSession: () => void;
	setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
	authenticated: false,
	loading: true,
	user: null,

	setSession: (user) => set({authenticated: true, user}),
	clearSession: () => set({authenticated: false, user: null}),
	setLoading: (loading) => set({loading}),
}));
