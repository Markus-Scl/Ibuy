import {useRef, useState, type FC} from 'react';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import LabelIcon from '@mui/icons-material/Label';
import {categoryMap, conditions} from '../utils';
import {CustomInput} from '../../../components/Form/CustomInput';
import {CustomSelect} from '../../../components/Form/CustomSelect';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import {mutationFetcher} from '../../../utils/fetcher';

interface AddProductModalProps {
	onClose: () => void;
}

export const AddProductModal: FC<AddProductModalProps> = ({onClose}) => {
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		price: '',
		category: 0,
		condition: '',
		location: '',
		image: null as File | null,
	});

	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

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
		const file = e.target.files?.[0];
		if (file) {
			setFormData((prev) => ({...prev, image: file}));
			const reader = new FileReader();
			reader.onload = (e) => setImagePreview(e.target?.result as string);
			reader.readAsDataURL(file);
		}
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

		mutationFetcher<string>('product', {
			method: 'POST',
			body: formData,
		})
			.then((res) => {
				if (res !== null) {
					console.log(res);
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

	const handleRemoveImage = () => {
		setFormData((prev) => ({...prev, image: null}));
		setImagePreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = ''; // Reset the file input
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={handleOverlayClick}>
			{isLoading ? (
				<span className="loading loading-spinner loading-sm mr-2 loading-xl text-primary"></span>
			) : (
				<div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
					{/* Header */}
					<div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
						<h2 className="text-2xl font-bold text-white">Add New Product</h2>
						<button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200 cursor-pointer">
							<CloseIcon />
						</button>
					</div>

					{/* Content */}
					<div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
						<div className="space-y-6">
							{/* Image Upload */}
							<div className="space-y-3">
								<label className="block text-sm font-semibold text-gray-700">Product Image</label>
								<div className="flex items-center space-x-4">
									<label className="relative cursor-pointer">
										<input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
										<div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
											<PhotoCameraIcon className="w-5 h-5" />
											<span>Upload Image</span>
										</div>
									</label>
									{imagePreview && (
										<div className="relative w-32 h-32">
											<div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
												<img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
											</div>
											<button
												onClick={handleRemoveImage}
												className="absolute -top-4 -right-4 w-8 h-8 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 rounded-full p-2 transition-colors bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer flex items-center justify-center">
												<CloseIcon />
											</button>
										</div>
									)}
								</div>
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
											options={categoryMap}
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
								<button
									type="button"
									onClick={onClose}
									className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-red-200 transition-colors duration-200 hover:border-white cursor-pointer">
									Cancel
								</button>
								<button
									type="button"
									onClick={handleSubmit}
									className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer">
									Create Product
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
