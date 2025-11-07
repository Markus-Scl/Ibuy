import {useEffect, useState, type FC} from 'react';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import CategoryIcon from '@mui/icons-material/Category';
import {statusClassMap} from '../product/utils';
import {primaryColor} from '../../utils/theme';
import {useCategoriesStore} from '../../stores/useCategoriesStore';
import {useProductStatusesStore} from '../../stores/useProductStatusesStore';
import type {ProductResponse} from '../product/types';
import {fetcher} from '../../utils/fetcher';
import {ProductCarousel} from '../../components/ProductCarousel';
import {useAuthStore} from '../../stores/useAuthStore';

export const HomePage: FC = () => {
	const {productStatuses} = useProductStatusesStore();
	const {categories} = useCategoriesStore();
	const [productCategoryMap, setProductCategoryMap] = useState<Map<number, ProductResponse[]>>(new Map());
	const {user} = useAuthStore();

	useEffect(() => {
		fetcher<Map<number, ProductResponse[]>>('home').then((data) => {
			const mapData = new Map<number, ProductResponse[]>();
			Object.entries(data).forEach(([key, value]) => {
				mapData.set(parseInt(key), value);
			});
			setProductCategoryMap(mapData);
		});
	}, [user?.userId]);

	if (productCategoryMap.size === 0) {
		return (
			<div className="w-full h-full flex flex-col justify-center items-center p-8">
				<div className="text-center space-y-6 max-w-md">
					{/* Animated Icon Container */}
					<div className="relative">
						<div className={`absolute inset-0 ${primaryColor} rounded-full blur-xl opacity-20 animate-pulse`}></div>
						<div className={`relative ${primaryColor} rounded-full p-8 shadow-2xl`}>
							<ShoppingCartOutlinedIcon className="text-white drop-shadow-lg" sx={{fontSize: '120px'}} />
						</div>
					</div>

					{/* Empty State Content */}
					<div className="space-y-4">
						<h2 className={`text-3xl font-bold ${primaryColor} bg-clip-text text-transparent`}>Welcome to IBuy store</h2>
						<p className="text-gray-600 text-lg leading-relaxed">The product catalog is empty. Start building your inventory to see products here.</p>
					</div>

					{/* Subtle Encouragement */}
					<div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
						<div className={`w-2 h-2 ${primaryColor} rounded-full`} />
						<span>Your products will appear here</span>
						<div className={`w-2 h-2 ${primaryColor} rounded-full`} />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-full overflow-auto">
			{/* Products by Category */}
			<div className="px-6 py-6 pb-6">
				{Array.from(productCategoryMap.entries()).map(([categoryId, categoryProducts]) => (
					<div key={categoryId} className="space-y-4 mb-8">
						{/* Category Header */}
						<div className="relative mb-6">
							<div className="flex items-center space-x-3">
								<div className={`${primaryColor} rounded-lg p-2 shadow-md`}>
									<CategoryIcon className="text-white w-6 h-6" />
								</div>
								<div>
									<h2 className="text-2xl font-bold text-gray-800">{categories?.get(categoryId)}</h2>
								</div>
							</div>
						</div>
						{productStatuses !== null && <ProductCarousel products={categoryProducts} categoryId={categoryId} productStatuses={productStatuses} statusClassMap={statusClassMap} />}

						{/* Category Divider */}
						<div className="w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
					</div>
				))}
			</div>
		</div>
	);
};
