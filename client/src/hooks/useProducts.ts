import type {ProductResponse} from '../pages/product/types';
import {useAuthStore} from '../stores/useAuthStore';
import {useCustomSWR} from './customSWR';

export function useProducts() {
	const {user} = useAuthStore();

	const userId = user?.userId;

	if (!userId) {
		return {
			products: [],
			productsLoading: false,
			refreshProducts: () => Promise.resolve(),
		};
	}

	const {data, mutate: refreshProducts} = useCustomSWR<ProductResponse[]>(`product?id=${userId}`);

	return {
		products: data ?? [],
		productsLoading: false,
		refreshProducts,
	};
}
