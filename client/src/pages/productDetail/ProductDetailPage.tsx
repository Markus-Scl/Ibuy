import {useEffect, useState, type FC} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import type {ProductResponse} from '../product/types';
import {fetcher} from '../../utils/fetcher';
import {useCategories} from '../../hooks/useCategories';
import {useProductStatuses} from '../../hooks/useProductStatuses';
import {statusClassMap} from '../product/utils';
import {useAuthStore} from '../../stores/useAuthStore';
import {DeleteModal} from '../../components/DeleteModal';
import {CustomButton} from '../../components/CustomButton';

export const ProductDetailPage: FC = () => {
	const {productId} = useParams();
	const navigate = useNavigate();
	const [product, setProduct] = useState<ProductResponse>();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
	const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const {categories} = useCategories();
	const {productStatuses} = useProductStatuses();
	const {user} = useAuthStore();

	useEffect(() => {
		if (!productId) return;
		fetcher(`product/${productId}`)
			.then((res) => {
				const productRes = res as ProductResponse;
				if (productRes) {
					setProduct(productRes);
				}
			})
			.catch((e) => {
				console.error(e);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [productId]);

	const handleDelete = () => {
		setDeleteModalOpen(false);
	};

	if (deleteModalOpen) {
		return (
			<div className="h-full w-full flex items-center justify-center">
				<DeleteModal type="Product" name={product?.name || ''} onClose={() => setDeleteModalOpen(false)} onDelete={handleDelete} />
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

	if (!product) {
		return (
			<div className="w-full h-full flex flex-col justify-center items-center p-8">
				<div className="text-center space-y-6 max-w-md">
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
						<div className="relative bg-gradient-to-r from-red-600 to-pink-600 rounded-full p-8 shadow-2xl">
							<ImageIcon className="text-white drop-shadow-lg" sx={{fontSize: '120px'}} />
						</div>
					</div>
					<div className="space-y-4">
						<h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Product Not Found</h2>
						<p className="text-gray-600 text-lg leading-relaxed">The product you're looking for doesn't exist or has been removed.</p>
					</div>
					<button
						onClick={() => navigate('/products')}
						className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out cursor-pointer">
						Back to Products
					</button>
				</div>
			</div>
		);
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const getImageUrl = (imagePath: string) => {
		return `${import.meta.env.VITE_SERVER_API}${imagePath}`;
	};

	return (
		<div className="w-full h-full bg-gray-50 overflow-auto">
			{/* Header with Back Button */}
			<div className="bg-white shadow-sm border-b border-gray-200 h-[8%]">
				<div className="max-w-9xl mx-auto px-12 py-4">
					<div className="flex items-center justify-between">
						<button onClick={() => navigate('/products')} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
							<ArrowBackIcon className="w-5 h-5" />
							<span className="font-medium">Back to Products</span>
						</button>
						<div className="flex items-center space-x-3">
							{product.userId === user?.userId ? (
								<>
									<CustomButton title="Edit" color="from-blue-600 to-purple-600 text-white" fullLength={false} icon={<EditIcon />} handleClick={() => console.log('edit click')} />
									<CustomButton title="Delete" color="from-red-600 to-pink-600 text-white" fullLength={false} icon={<DeleteIcon />} handleClick={() => setDeleteModalOpen(true)} />
								</>
							) : (
								<>
									<div className="tooltip tooltip-bottom" data-tip="Contact Seller">
										<button className="btn btn-circle btn-primary btn-lg shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
											<MessageOutlinedIcon />
										</button>
									</div>

									{/* Add to Favorites Button */}
									<div className="tooltip tooltip-bottom" data-tip="Add to Favorites">
										<button className="btn btn-circle btn-accent btn-lg shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
											<BookmarkBorderOutlinedIcon />
										</button>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="mx-auto px-12 py-8 h-[90%] w-full">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full w-full">
					{/* Image Section */}
					<div className="space-y-4 h-full">
						{/* Main Image */}
						<div className="relative bg-white rounded-3xl shadow-2xl  h-[80%]">
							{product.images && product.images.length > 0 ? (
								<img src={getImageUrl(product.images[selectedImageIndex])} alt={product.name} className="w-full h-full object-cover rounded-3xl" />
							) : (
								<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
									<div className="text-center space-y-4">
										<ImageIcon className="mx-auto text-gray-400" sx={{fontSize: '80px'}} />
										<p className="text-gray-500 font-medium">No Image Available</p>
									</div>
								</div>
							)}
						</div>

						{/* Thumbnail Images */}
						{product.images && product.images.length > 1 && (
							<div className="flex space-x-3 overflow-x-auto p-2 h-[20%]">
								{product.images.map((image, index) => (
									<button
										key={index}
										onClick={() => setSelectedImageIndex(index)}
										className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
											selectedImageIndex === index ? 'border-blue-500 shadow-lg transform scale-105' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
										}`}>
										<img src={getImageUrl(image)} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
									</button>
								))}
							</div>
						)}
					</div>

					{/* Product Details Section */}
					<div className="space-y-6 h-full">
						{/* Title and Price */}
						<div className="bg-white rounded-3xl p-6 shadow-lg h-[20%]">
							<div className="space-y-4">
								<div className="flex items-start justify-between">
									<h1 className="text-3xl font-bold text-gray-800 leading-tight">{product.name}</h1>
									<div className="text-right">
										<div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">${product.price}</div>
									</div>
								</div>

								{/* Status and Condition Badges */}
								<div className="flex items-center space-x-3">
									{productStatuses && productStatuses.get(product.status) && (
										<div className={`${statusClassMap.get(product.status)} text-sm px-3 py-2`}>{productStatuses.get(product.status)}</div>
									)}
									<div className="badge badge-secondary text-sm px-3 py-2">{product.condition}</div>
								</div>
							</div>
						</div>

						{/* Description */}
						<div className="bg-white rounded-3xl p-6 shadow-lg h-[35%] overflow-auto">
							<h3 className="text-xl font-bold text-gray-800 mb-4">Description</h3>
							<p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>
						</div>

						{/* Product Details Grid */}
						<div className="bg-white rounded-3xl p-6 shadow-lg h-[40%]">
							<h3 className="text-xl font-bold text-gray-800 mb-6">Product Details</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
								{/* Category */}
								<div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
									<div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-3">
										<CategoryIcon className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500">Category</p>
										<p className="text-lg font-semibold text-gray-800">{(categories && categories.get(product.category)) || 'Unknown'}</p>
									</div>
								</div>

								{/* Location */}
								<div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl">
									<div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-full p-3">
										<LocationOnIcon className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500">Location</p>
										<p className="text-lg font-semibold text-gray-800">{product.location}</p>
									</div>
								</div>

								{/* Condition */}
								<div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl">
									<div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full p-3">
										<PlaylistAddCheckOutlinedIcon className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500">Condition</p>
										<p className="text-lg font-semibold text-gray-800">{product.condition}</p>
									</div>
								</div>

								{/* Created Date */}
								{
									<div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
										<div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-3">
											<CalendarTodayIcon className="w-5 h-5 text-white" />
										</div>
										<div>
											<p className="text-sm font-medium text-gray-500">Listed On</p>
											<p className="text-lg font-semibold text-gray-800">{product.created ? formatDate(product.created) : 'Unknown'}</p>
										</div>
									</div>
								}
							</div>
						</div>

						{/* Seller Information (if available) */}
						{/*{product.seller && (
							<div className="bg-white rounded-3xl p-6 shadow-lg">
								<h3 className="text-xl font-bold text-gray-800 mb-4">Seller Information</h3>
								<div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl">
									<div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full p-3">
										<PersonIcon className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="text-lg font-semibold text-gray-800">{product.seller}</p>
										<p className="text-sm text-gray-500">Seller</p>
									</div>
								</div>
							</div>
						)}*/}

						{/* Action Buttons */}
						{product.userId !== user?.userId && (
							<div className="space-y-3">
								<button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
									Contact Seller
								</button>
								<button className="w-full border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer">
									Add to Favorites
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
