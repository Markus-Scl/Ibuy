import {useState, useEffect, type FC} from 'react';
import type {ProductResponse} from '../pages/product/types';
import {useNavigate} from 'react-router-dom';
import {primaryColor} from '../utils/theme';
import {getImageUrl} from '../pages/productDetail/utils';
import ImageIcon from '@mui/icons-material/Image';

interface ProductCarouselProps<> {
	products: ProductResponse[];
	categoryId: number;
	productStatuses: Map<number, string>;
	statusClassMap: Map<number, string>;
}

export const ProductCarousel: FC<ProductCarouselProps> = ({products, categoryId, productStatuses, statusClassMap}) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState(5);

	// Update items per page based on screen size
	useEffect(() => {
		const updateItemsPerPage = () => {
			const width = window.innerWidth;
			if (width < 640) {
				setItemsPerPage(1); // sm: 1 item
			} else if (width < 768) {
				setItemsPerPage(2); // md: 2 items
			} else if (width < 1024) {
				setItemsPerPage(3); // lg: 3 items
			} else if (width < 1280) {
				setItemsPerPage(4); // xl: 4 items
			} else {
				setItemsPerPage(5); // 2xl: 5 items
			}
		};

		updateItemsPerPage();
		window.addEventListener('resize', updateItemsPerPage);

		return () => window.removeEventListener('resize', updateItemsPerPage);
	}, []);

	const navigate = useNavigate();

	// Reset current index when items per page changes
	useEffect(() => {
		setCurrentIndex(0);
	}, [itemsPerPage]);

	const totalPages = Math.ceil(products.length / itemsPerPage);
	const canGoNext = currentIndex < totalPages - 1;
	const canGoPrev = currentIndex > 0;

	const nextSlide = () => {
		if (canGoNext) {
			setCurrentIndex((prev) => prev + 1);
		}
	};

	const prevSlide = () => {
		if (canGoPrev) {
			setCurrentIndex((prev) => prev - 1);
		}
	};

	const getCurrentPageProducts = () => {
		const startIndex = currentIndex * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return products.slice(startIndex, endIndex);
	};

	const currentProducts = getCurrentPageProducts();

	console.log(currentProducts);

	if (products.length === 0) {
		return <div className="text-center py-8 text-gray-500">No products found</div>;
	}

	return (
		<div className="relative w-full">
			{/* Carousel Container */}
			<div className="carousel w-full">
				<div className="carousel-item w-full">
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
						{currentProducts.map((product, idx) => (
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
				</div>
			</div>

			{/* Navigation Buttons - Only show if there are multiple pages */}
			{totalPages > 1 && (
				<>
					{/* Previous Button */}
					<button
						onClick={prevSlide}
						disabled={!canGoPrev}
						className={`absolute left-2 top-1/2 transform -translate-y-1/2 btn btn-circle z-10 ${
							canGoPrev ? 'btn-primary hover:btn-primary-focus' : 'btn-disabled opacity-50 cursor-not-allowed'
						}`}>
						❮
					</button>

					{/* Next Button */}
					<button
						onClick={nextSlide}
						disabled={!canGoNext}
						className={`absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-circle z-10 ${
							canGoNext ? 'btn-primary hover:btn-primary-focus' : 'btn-disabled opacity-50 cursor-not-allowed'
						}`}>
						❯
					</button>
				</>
			)}

			{/* Page Indicators */}
			{totalPages > 1 && (
				<div className="flex justify-center mt-4 space-x-2">
					{Array.from({length: totalPages}, (_, i) => (
						<button
							key={i}
							onClick={() => setCurrentIndex(i)}
							className={`w-3 h-3 rounded-full transition-all duration-200 ${i === currentIndex ? 'bg-primary scale-110' : 'bg-gray-300 hover:bg-gray-400'}`}
						/>
					))}
				</div>
			)}

			{/* Products Counter */}
			<div className="text-center mt-2 text-sm text-gray-600">
				Showing {currentIndex * itemsPerPage + 1}-{Math.min((currentIndex + 1) * itemsPerPage, products.length)} of {products.length} products
			</div>
		</div>
	);
};
