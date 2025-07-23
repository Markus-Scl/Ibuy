import {useEffect, useState, type FC, type ReactNode} from 'react';
import {TopToolBar} from './TopToolBar';
import PrivateRoute from './PrivateRoute';
import {SideNavbar} from './SideNavBar';
import {useCategoriesStore} from '../stores/useCategoriesStore';
import {fetcher} from '../utils/fetcher';
import {useProductStatusesStore} from '../stores/UseProductStatusesStore';
import {initAuth} from '../auth/initAuth';

interface OutletWrapperProps {
	children: ReactNode;
}
export const OutletWrapper: FC<OutletWrapperProps> = ({children}) => {
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchData = async () => {
			await initAuth();
			try {
				setIsLoading(true);

				const [categoriesRes, productStatusesRes] = await Promise.allSettled([fetcher<Record<number, string>>('category'), fetcher<Record<number, string>>('productstatus')]);

				// Handle categories
				if (categoriesRes.status === 'fulfilled') {
					const categoriesMap = new Map(Object.entries(categoriesRes.value).map(([key, value]) => [parseInt(key), value]));
					useCategoriesStore.getState().setSession(categoriesMap);
					useCategoriesStore.getState().setLoading(false);
				} else {
					console.error('Failed to load categories:', categoriesRes.reason);
				}

				// Handle product statuses
				if (productStatusesRes.status === 'fulfilled') {
					const statusesMap = new Map(Object.entries(productStatusesRes.value).map(([key, value]) => [parseInt(key), value]));
					useProductStatusesStore.getState().setSession(statusesMap);
					useProductStatusesStore.getState().setLoading(false);
				} else {
					console.error('Failed to load product statuses:', productStatusesRes.reason);
				}

				// If both failed, show error
				if (categoriesRes.status === 'rejected' && productStatusesRes.status === 'rejected') {
				}
			} catch (error) {
				console.error('Unexpected error loading initial data:', error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	fetcher<Record<number, string>>('category')
		.then((res) => {
			useCategoriesStore.getState().setSession(new Map(Object.entries(res).map(([key, value]) => [parseInt(key), value])));
			useCategoriesStore.getState().setLoading(false);
		})
		.catch((e) => {
			console.error(e);
		})
		.finally(() => setIsLoading(false));

	fetcher<Record<number, string>>('productstatus')
		.then((res) => {
			useProductStatusesStore.getState().setSession(new Map(Object.entries(res).map(([key, value]) => [parseInt(key), value])));
			useProductStatusesStore.getState().setLoading(false);
		})
		.catch((e) => {
			console.error(e);
		})
		.finally(() => setIsLoading(false));

	return (
		<PrivateRoute>
			<div className="h-dvh w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
				<div className="flex-shrink-0">
					<TopToolBar />
				</div>
				<div className="flex-1 flex min-h-0">
					<SideNavbar />
					{isLoading ? (
						<div className="w-full h-full flex flex-col justify-center items-center p-8">
							<span className="loading loading-spinner loading-sm mr-2 loading-xl text-primary"></span>
						</div>
					) : (
						children
					)}
				</div>
			</div>
		</PrivateRoute>
	);
};
