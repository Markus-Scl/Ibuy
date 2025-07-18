import {useState, type FC} from 'react';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import {AddProductModal} from './components/AddProductModal';
import {useProducts} from '../../hooks/useProducts';

export const ProductPage: FC = () => {
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const {products, isLoading, refreshProducts} = useProducts();

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

	if (isLoading) {
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
				<button
					onClick={() => console.log('hi')}
					className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 cursor-pointer">
					<AddBoxOutlinedIcon className="w-4 h-4" />
					<span>Add Product</span>
				</button>
			</div>
			<div className="w-full h-[93%] p-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-auto">
				{products.map((product, idx) => (
					<div
						key={idx}
						className="card bg-gradient-to-r from-blue-600 to-purple-600 max-w-sm  max-h-100 shadow-sm hover:shadow-lg transform hover:scale-103 transition-all duration-200 cursor-pointer">
						<figure>
							<img src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" alt="Shoes" />
						</figure>
						<div className="card-body">
							<h2 className="card-title">
								Card Title
								<div className="badge badge-secondary">NEW</div>
							</h2>
							<p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
							<div className="card-actions justify-end">
								<div className="badge badge-outline">Fashion</div>
								<div className="badge badge-outline">Products</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
