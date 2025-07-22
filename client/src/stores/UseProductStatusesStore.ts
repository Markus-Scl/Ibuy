import {create} from 'zustand';

type ProductStatusesState = {
	loading: boolean;
	productStatuses: Map<number, string> | null;
	setSession: (productStatuses: ProductStatusesState['productStatuses']) => void;
	clearSession: () => void;
	setLoading: (loading: boolean) => void;
};

export const useProductStatusesStore = create<ProductStatusesState>((set) => ({
	loading: true,
	productStatuses: null,

	setSession: (productStatuses) => set({productStatuses}),
	clearSession: () => set({productStatuses: null}),
	setLoading: (loading) => set({loading}),
}));
