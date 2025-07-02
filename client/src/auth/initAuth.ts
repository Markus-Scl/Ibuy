import {useAuthStore} from '../stores/useAuthStore';
import type {User} from '../types/types';
import {fetcher} from '../utils/fetcher';

export const initAuth = async () => {
	const {setSession, clearSession, setLoading} = useAuthStore.getState();

	try {
		const user = await fetcher<User>('auth/session');
		setSession(user);
		setLoading(false);
	} catch {
		clearSession();
	} finally {
		setLoading(false);
	}
};
