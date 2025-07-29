import {useEffect, useState, type FC} from 'react';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ImageIcon from '@mui/icons-material/Image';
import CategoryIcon from '@mui/icons-material/Category';
import {statusClassMap} from '../product/utils';
import {useNavigate} from 'react-router-dom';
import {primaryColor} from '../../utils/theme';
import {useCategoriesStore} from '../../stores/useCategoriesStore';
import {useProductStatusesStore} from '../../stores/useProductStatusesStore';
import {getImageUrl} from '../productDetail/utils';
import type {ProductResponse} from '../product/types';
import {fetcher} from '../../utils/fetcher';

export const HomePage: FC = () => {
	const {productStatuses} = useProductStatusesStore();
	const {categories} = useCategoriesStore();
	const navigate = useNavigate();
	const [productCategoryMap, setProductCategoryMap] = useState<Map<number, ProductResponse[]>>(new Map());

	useEffect(() => {
		fetcher<Map<number, ProductResponse[]>>('home').then((data) => {
			const mapData = new Map<number, ProductResponse[]>();
			Object.entries(data).forEach(([key, value]) => {
				mapData.set(parseInt(key), value);
			});
			console.log(mapData);
			setProductCategoryMap(mapData);
		});
	}, []);

	/*if (productsLoading) {
		return (
			<div className="w-full h-full flex flex-col justify-center items-center p-8">
				<span className="loading loading-spinner loading-sm mr-2 loading-xl text-primary"></span>
			</div>
		);
	}*/

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

						{/* Products Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
							{categoryProducts.map((product, idx) => (
								<div
									onClick={() => navigate(`/product/${product.productId}`)}
									key={`${categoryId}-${idx}`}
									className={`group card ${primaryColor} shadow-sm hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden`}>
									{/* Product Image */}
									<figure className="h-48 relative overflow-hidden">
										{product.images.length > 0 ? (
											<img src={getImageUrl(product.images[0])} alt="Product Image" className="w-full h-full object-cover" />
										) : (
											<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
												<div className="text-center space-y-4">
													<ImageIcon className="mx-auto text-gray-400" sx={{fontSize: '80px'}} />
													<p className="text-gray-500 font-medium">No Image Available</p>
												</div>
											</div>
										)}
									</figure>

									{/* Product Info */}
									<div className="card-body p-4 space-y-3">
										<div className="space-y-2">
											<h3 className="font-bold text-lg text-white">{product.name}</h3>
											<div className="flex items-center justify-between">
												<span className="text-2xl font-bold text-white">${product.price}</span>
												<div className="badge badge-secondary text-xs text-white">{product.condition}</div>
											</div>
										</div>

										<p className="text-sm text-white">{product.description.length > 100 ? `${product.description.substring(0, 100)}...` : product.description}</p>

										<div className="flex items-center justify-between pt-2">
											{productStatuses && productStatuses.get(product.status) && (
												<div className={`${statusClassMap.get(product.status)} text-xs px-2 py-1 rounded-full`}>{productStatuses.get(product.status)}</div>
											)}
											<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
												<span className="text-xs text-blue-600 font-medium">View Details →</span>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Category Divider */}
						<div className="w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
					</div>
				))}
			</div>
		</div>
	);
};
