import useSWR from 'swr';

export const swrFetcher = async <T>(url: string): Promise<T> => {
	const response = await fetch(url, {credentials: 'include'});

	if (!response.ok) {
		throw new Error(`API request failed with status ${response.status}`);
	}

	return response.json();
};

// Custom Hook
export const useCustomSWR = <T>(url: string, options = {}) => {
	const {data, error, isValidating, mutate} = useSWR<T>(url, swrFetcher, {
		...options,
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});

	return {
		data,
		isLoading: !error && !data,
		isError: error,
		isValidating,
		mutate,
	};
};
