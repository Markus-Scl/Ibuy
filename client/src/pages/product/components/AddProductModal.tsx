import {useRef, useState, type FC} from 'react';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import LabelIcon from '@mui/icons-material/Label';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {conditions} from '../utils';
import {CustomInput} from '../../../components/Form/CustomInput';
import {CustomSelect} from '../../../components/Form/CustomSelect';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import {mutationFetcher} from '../../../utils/fetcher';
import {CustomButton} from '../../../components/CustomButton';
import {deleteColor, primaryColor} from '../../../utils/theme';
import {useCategoriesStore} from '../../../stores/useCategoriesStore';

interface AddProductModalProps {
	onClose: () => void;
	refreshProducts: () => void;
}

interface ImagePreview {
	file: File;
	preview: string;
	id: string;
}

export const AddProductModal: FC<AddProductModalProps> = ({onClose, refreshProducts}) => {
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		price: '',
		category: 0,
		condition: '',
		location: '',
		images: [] as File[],
	});

	const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const {categories} = useCategoriesStore();

	const MAX_IMAGES = 5;

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const {name, value} = e.target;

		// Convert category to number since it should be a number in your data
		const processedValue = name === 'category' ? Number(value) : value;

		setFormData((prev) => ({...prev, [name]: processedValue}));

		// Clear validation error when user starts typing
		if (validationErrors[name]) {
			setValidationErrors((prev) => ({...prev, [name]: false}));
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		const remainingSlots = MAX_IMAGES - imagePreviews.length;
		const filesToAdd = files.slice(0, remainingSlots);

		filesToAdd.forEach((file) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const newPreview: ImagePreview = {
					file,
					preview: e.target?.result as string,
					id: Math.random().toString(36).substr(2, 9),
				};

				setImagePreviews((prev) => [...prev, newPreview]);
				setFormData((prevForm) => ({
					...prevForm,
					images: [...prevForm.images, file],
				}));
			};
			reader.readAsDataURL(file);
		});

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const removeImage = (indexToRemove: number) => {
		setImagePreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
		setFormData((prev) => ({
			...prev,
			images: prev.images.filter((_, index) => index !== indexToRemove),
		}));

		// Adjust current index if necessary
		if (currentImageIndex >= imagePreviews.length - 1) {
			setCurrentImageIndex(Math.max(0, imagePreviews.length - 2));
		}
	};

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % imagePreviews.length);
	};

	const prevImage = () => {
		setCurrentImageIndex((prev) => (prev - 1 + imagePreviews.length) % imagePreviews.length);
	};

	const validateForm = () => {
		const errors: Record<string, boolean> = {};
		const requiredFields = ['name', 'description', 'price', 'category', 'condition', 'location'];

		requiredFields.forEach((field) => {
			if (!formData[field as keyof typeof formData] || formData[field as keyof typeof formData] === '') {
				errors[field] = true;
			}
		});

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = () => {
		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		const formDataObj = new FormData();
		formDataObj.append('name', formData.name);
		formDataObj.append('description', formData.description);
		formDataObj.append('price', formData.price);
		formDataObj.append('category', formData.category.toString());
		formDataObj.append('condition', formData.condition);
		formDataObj.append('location', formData.location);

		// Append all images
		formData.images.forEach((image) => {
			formDataObj.append('images', image);
		});

		mutationFetcher<string>('product', {
			method: 'POST',
			body: formDataObj,
		})
			.then((res) => {
				if (res !== null) {
					refreshProducts();
				}
			})
			.catch((error) => {
				console.error('Error details:', error);
				console.error('Error message:', error.message);
			})
			.finally(() => {
				setIsLoading(false);
				onClose();
			});
	};

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={handleOverlayClick}>
			{isLoading ? (
				<span className="loading loading-spinner loading-sm mr-2 loading-xl text-primary"></span>
			) : (
				<div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
					{/* Header */}
					<div className={`${primaryColor} px-6 py-4 flex items-center justify-between`}>
						<h2 className="text-2xl font-bold text-white">Add New Product</h2>
						<button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200 cursor-pointer">
							<CloseIcon />
						</button>
					</div>

					{/* Content */}
					<div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
						<div className="space-y-6">
							{/* Image Upload Section */}
							<div className="space-y-4">
								<label className="block text-sm font-semibold text-gray-700">
									Product Images ({imagePreviews.length}/{MAX_IMAGES})
								</label>

								{/* Upload Button */}
								<div className="flex items-center space-x-4">
									<label className="relative cursor-pointer">
										<input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" disabled={imagePreviews.length >= MAX_IMAGES} />
										<div
											className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
												imagePreviews.length >= MAX_IMAGES ? 'bg-gray-400 cursor-not-allowed' : `${primaryColor} hover:shadow-lg transform hover:scale-105`
											} text-white`}>
											<PhotoCameraIcon className="w-5 h-5" />
											<span>{imagePreviews.length === 0 ? 'Upload Images' : 'Add More Images'}</span>
										</div>
									</label>
									{imagePreviews.length >= MAX_IMAGES && <span className="text-sm text-gray-500">Maximum {MAX_IMAGES} images allowed</span>}
								</div>

								{/* Image Carousel */}
								{imagePreviews.length > 0 && (
									<div className="bg-gray-50 rounded-2xl p-4">
										{/* Main Image Display */}
										<div className="relative mb-4">
											<div className="relative w-full h-64 rounded-xl overflow-hidden bg-white shadow-lg">
												<img src={imagePreviews[currentImageIndex]?.preview} alt={`Preview ${currentImageIndex + 1}`} className="w-full h-full object-contain" />

												{/* Navigation Arrows */}
												{imagePreviews.length > 1 && (
													<>
														<button
															onClick={prevImage}
															className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors">
															<ChevronLeftIcon className="w-5 h-5" />
														</button>
														<button
															onClick={nextImage}
															className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors">
															<ChevronRightIcon className="w-5 h-5" />
														</button>
													</>
												)}

												{/* Image Counter */}
												<div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-lg text-sm">
													{currentImageIndex + 1} / {imagePreviews.length}
												</div>
											</div>
										</div>

										{/* Thumbnail Navigation */}
										{imagePreviews.length > 0 && (
											<div className="flex space-x-3 overflow-x-auto pb-2 p-4">
												{imagePreviews.map((preview, index) => (
													<div className="relative">
														<button
															key={preview.id}
															onClick={() => setCurrentImageIndex(index)}
															className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
																index === currentImageIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-400'
															}`}>
															<img src={preview.preview} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
															{/* Remove button on thumbnail */}
														</button>
														<button
															onClick={(e) => {
																e.stopPropagation();
																removeImage(index);
															}}
															className={`absolute -top-3 -right-3 w-6 h-6 ${primaryColor} text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 rounded-full p-2 transition-colors cursor-pointer flex items-center justify-center`}>
															<CloseIcon />
														</button>
													</div>
												))}
											</div>
										)}
									</div>
								)}
							</div>

							{/* Product Name */}
							<div className="space-y-3">
								<label className="block text-sm font-semibold text-gray-700">
									Product Name <span className="text-red-500">*</span>
								</label>
								<div className={validationErrors.name ? 'border-2 border-red-500 rounded-xl' : ''}>
									<CustomInput type="text" name="name" value={formData.name} onChange={handleInputChange} placeHolder="Enter product name" icon={<LabelIcon className="w-5 h-5" />} />
								</div>
							</div>

							{/* Price and Category Row */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Price */}
								<div className="space-y-3">
									<label className="block text-sm font-semibold text-gray-700">
										Price <span className="text-red-500">*</span>
									</label>
									<div className={validationErrors.price ? 'border-2 border-red-500 rounded-xl' : ''}>
										<CustomInput
											type="number"
											name="price"
											value={formData.price}
											onChange={handleInputChange}
											placeHolder="0.00"
											step={'0.01'}
											icon={<AttachMoneyIcon className="w-5 h-5" />}
										/>
									</div>
								</div>

								{/* Category */}
								<div className="space-y-3">
									<label className="block text-sm font-semibold text-gray-700">
										Category <span className="text-red-500">*</span>
									</label>
									<div className={validationErrors.category ? 'border-2 border-red-500 rounded-xl' : ''}>
										<CustomSelect
											name="category"
											value={formData.category}
											onChange={handleInputChange}
											options={categories ? categories : []}
											placeholder="Select category"
											icon={<CategoryIcon className="w-5 h-5" />}
										/>
									</div>
								</div>
							</div>

							{/* Condition and Location Row */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Condition */}
								<div className="space-y-3">
									<label className="block text-sm font-semibold text-gray-700">
										Condition <span className="text-red-500">*</span>
									</label>
									<div className={validationErrors.condition ? 'border-2 border-red-500 rounded-xl' : ''}>
										<CustomSelect
											name="condition"
											value={formData.condition}
											onChange={handleInputChange}
											options={conditions}
											placeholder="Select condition"
											icon={<PlaylistAddCheckOutlinedIcon className="w-5 h-5" />}
										/>
									</div>
								</div>

								{/* Location */}
								<div className="space-y-3">
									<label className="block text-sm font-semibold text-gray-700">
										Location <span className="text-red-500">*</span>
									</label>
									<div className={validationErrors.location ? 'border-2 border-red-500 rounded-xl' : ''}>
										<CustomInput
											type="text"
											name="location"
											value={formData.location}
											onChange={handleInputChange}
											placeHolder="Enter location"
											icon={<LocationOnIcon className="w-5 h-5" />}
										/>
									</div>
								</div>
							</div>

							{/* Description */}
							<div className="space-y-3">
								<label className="block text-sm font-semibold text-gray-700">
									Description <span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<div className="absolute left-3 top-4 text-gray-400">
										<DescriptionIcon className="w-5 h-5" />
									</div>
									<textarea
										name="description"
										value={formData.description}
										onChange={handleInputChange}
										rows={4}
										className={`w-full pl-11 pr-4 py-3 border-2 ${
											validationErrors.description ? 'border-red-500' : 'border-gray-200'
										} rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 resize-none placeholder-gray-400 text-gray-600 bg-white`}
										placeholder="Describe your product..."
									/>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex items-center space-x-4 pt-4">
								<CustomButton title="Cancel" color={deleteColor} textColor="text-white" fullLength={true} handleClick={() => onClose()} />
								<CustomButton title="Create Product" color={primaryColor} textColor="text-white" fullLength={true} handleClick={() => handleSubmit()} />
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
