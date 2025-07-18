import type {ProductResponse} from '../pages/product/types';
import {useAuthStore} from '../stores/useAuthStore';
import {useCustomSWR} from './customSWR';

export function useProducts() {
	const {user} = useAuthStore();

	const userId = user?.userId;

	if (!userId) {
		return {
			products: [],
			isLoading: false,
			refreshProducts: () => Promise.resolve(),
		};
	}

	const {data, isLoading, mutate: refreshProducts} = useCustomSWR<ProductResponse[]>('product');

	return {
		products: data ?? [],
		isLoading,
		refreshProducts,
	};
}
