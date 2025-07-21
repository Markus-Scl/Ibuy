import {useMemo, useState, type FC} from 'react';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import {AddProductModal} from './components/AddProductModal';
import {useProducts} from '../../hooks/useProducts';
import {useCategories} from '../../hooks/useCategories';
import {useProductStatuses} from '../../hooks/useProductStatuses';
import {statusClassMap} from './utils';
import {useNavigate} from 'react-router-dom';
import {CustomButton} from '../../components/CustomButton';

export const ProductPage: FC = () => {
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const {products, productsLoading, refreshProducts} = useProducts();
	const {categories, categoriesLoading} = useCategories();
	const {productStatuses, statusesLoading} = useProductStatuses();

	const sortedProducts = useMemo(() => {
		return [...products].sort((a, b) => a.name.localeCompare(b.name));
	}, [products]);

	const navigate = useNavigate();

	const handleCloseModal = () => {
		setModalOpen(false);
	};

	if (modalOpen) {
		return (
			<div className="h-full w-full flex items-center justify-center">
				<AddProductModal onClose={handleCloseModal} refreshProducts={refreshProducts} />
			</div>
		);
	}

	if (productsLoading || categoriesLoading || statusesLoading) {
		return (
			<div className="w-full h-full flex flex-col justify-center items-center p-8">
				<span className="loading loading-spinner loading-sm mr-2 loading-xl text-primary"></span>
			</div>
		);
	}

	if (products.length === 0) {
		return (
			<div className="w-full h-full flex flex-col justify-center items-center p-8">
				<div className="text-center space-y-6 max-w-md">
					{/* Animated Icon Container */}
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
						<div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-8 shadow-2xl">
							<ShoppingCartOutlinedIcon className="text-white drop-shadow-lg" sx={{fontSize: '120px'}} />
						</div>
					</div>

					{/* Empty State Content */}
					<div className="space-y-4">
						<h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">No Products Yet</h2>
						<p className="text-gray-600 text-lg leading-relaxed">Your product catalog is empty. Start building your inventory by adding your first product.</p>
					</div>

					{/* Create Button */}
					<button
						onClick={() => setModalOpen(true)}
						className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out cursor-pointer">
						<div className="flex items-center space-x-3">
							<div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-colors flex items-center">
								<AddBoxOutlinedIcon className="w-5 h-5" />
							</div>
							<span>Create Your First Product</span>
						</div>

						{/* Hover Effect */}
						<div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
					</button>

					{/* Subtle Encouragement */}
					<div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
						<div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
						<span>Start selling in minutes</span>
						<div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-full relative">
			<div className="flex justify-between items-center p-4 pb-2 h-[7%]">
				<h1 className="text-2xl font-bold text-gray-800">My Products</h1>
				<CustomButton title="Add Product" color=" from-blue-600 to-purple-600 text-white" icon={<AddBoxOutlinedIcon />} fullLength={false} handleClick={() => setModalOpen(true)} />
			</div>
			<div className="w-full h-[93%] p-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-auto">
				{sortedProducts.map((product, idx) => (
					<div
						onClick={() => navigate(`/product/${product.productId}`)}
						key={idx}
						className="card bg-gradient-to-r from-blue-600 to-purple-600 max-w-sm  h-100 shadow-sm hover:shadow-lg transform hover:scale-103 transition-all duration-200 cursor-pointer">
						<figure className="h-1/2">
							<img src={product.images.length > 0 ? `${import.meta.env.VITE_SERVER_API}${product.images[0]}` : '/placeholder-image.png'} alt="Product Image" />
						</figure>
						<div className="card-body h-1/2">
							<h2 className="card-title flex justify-between items-center">
								<div className="flex items-center gap-2">
									{product.name}
									<div className="badge badge-secondary">{product.condition}</div>
								</div>
								<div>{product.price}$</div>
							</h2>
							<p>{product.description.length > 150 ? `${product.description.substring(0, 150)}...` : product.description}</p>
							<div className="card-actions justify-end">
								{productStatuses && productStatuses.get(product.status) && <div className={statusClassMap.get(product.status)}>{productStatuses.get(product.status)}</div>}
								{categories && categories.get(product.category) && <div className="badge badge-outline">{categories.get(product.category)}</div>}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
