import {useCustomSWR} from './customSWR';

export function useCategories() {
	const {data, mutate: refreshCategories} = useCustomSWR<Record<number, string>>('category');

	return {
		categories: data ? new Map(Object.entries(data).map(([key, value]) => [parseInt(key), value])) : new Map<number, string>(),
		categoriesLoading: !data,
		refreshCategories,
	};
}
