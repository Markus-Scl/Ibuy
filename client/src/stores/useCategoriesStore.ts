import {create} from 'zustand';

type CategoriesState = {
	loading: boolean;
	categories: Map<number, string> | null;
	setSession: (categories: CategoriesState['categories']) => void;
	clearSession: () => void;
	setLoading: (loading: boolean) => void;
};

export const useCategoriesStore = create<CategoriesState>((set) => ({
	loading: true,
	categories: null,

	setSession: (categories) => set({categories}),
	clearSession: () => set({categories: null}),
	setLoading: (loading) => set({loading}),
}));
