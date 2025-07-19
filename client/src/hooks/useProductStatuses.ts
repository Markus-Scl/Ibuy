import {useCustomSWR} from './customSWR';

export function useProductStatuses() {
	const {data, mutate: refreshPrductStatuses} = useCustomSWR<Record<number, string>>('productstatus');

	return {
		productStatuses: data ? new Map(Object.entries(data).map(([key, value]) => [parseInt(key), value])) : new Map<number, string>(),
		statusesLoading: !data,
		refreshPrductStatuses,
	};
}
