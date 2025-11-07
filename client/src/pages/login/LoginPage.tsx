import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {CustomInput} from '../../components/Form/CustomInput';
import {authenticate} from '../../auth/auth';
import type {LoginData} from '../../types/types';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import {CustomButton} from '../../components/CustomButton';
import {primaryColor} from '../../utils/theme';
import {useWebSocketStore} from '../../stores/useWebSocketStore';

export const LoginPage: React.FC = () => {
	const [formData, setFormData] = useState<LoginData>({
		email: '',
		password: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isAuth, setIsAuth] = useState(true);
	const [fieldErrors, setFieldErrors] = useState({
		email: false,
		password: false,
	});
	const {connect, disconnect} = useWebSocketStore();

	const navigate = useNavigate();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value, type, checked} = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));

		// Clear field error when user starts typing
		if (fieldErrors[name as keyof typeof fieldErrors]) {
			setFieldErrors((prev) => ({
				...prev,
				[name]: false,
			}));
		}
	};

	const validateForm = () => {
		const errors = {
			email: !formData.email.trim(),
			password: !formData.password.trim(),
		};

		setFieldErrors(errors);

		// Check if any field has an error
		return !Object.values(errors).some((error) => error);
	};

	const handleSubmit = async () => {
		// Validate form before proceeding
		if (!validateForm()) {
			return; // Don't proceed if validation fails
		}

		setIsLoading(true);

		const isAuthenticated = await authenticate(formData);

		if (isAuthenticated.success) {
			if (isAuthenticated.user) {
				connect(isAuthenticated.user.userId);
			}
			navigate('/home');
		} else {
			disconnect();
			setIsLoading(false);
			setIsAuth(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Logo Section */}
				<div className="text-center mb-8">
					<div className={`inline-flex items-center justify-center w-16 h-16 ${primaryColor} rounded-2xl mb-4 shadow-lg`}>
						<span className="text-2xl font-bold text-white">IBuy</span>
					</div>
					<h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
					<p className="text-gray-600">Sign in to your IBuy account</p>
				</div>

				{/* Login Card */}
				<div className="card bg-white shadow-2xl border-0">
					{!isAuth && (
						<div role="alert" className="alert alert-error">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>Email or password are incorrect.</span>
						</div>
					)}
					<div className="card-body p-8">
						<div className="space-y-6">
							{/* Email Input */}
							<div className="form-control">
								<label className="label">
									<span className="label-text font-medium text-gray-700">Email Address</span>
								</label>
								<div className={fieldErrors.email ? 'border-2 border-red-500 rounded-lg' : ''}>
									<CustomInput
										type="email"
										name="email"
										value={formData.email}
										onChange={handleInputChange}
										onEnter={handleSubmit}
										placeHolder="Enter your email"
										icon={<EmailOutlinedIcon />}
									/>
								</div>
								{fieldErrors.email && (
									<label className="label">
										<span className="label-text-alt text-red-500">Email is required</span>
									</label>
								)}
							</div>

							{/* Password Input */}
							<div className="form-control">
								<label className="label">
									<span className="label-text font-medium text-gray-700">Password</span>
								</label>
								<div className={`relative ${fieldErrors.password ? 'border-2 border-red-500 rounded-lg' : ''}`}>
									<CustomInput
										type={showPassword ? 'text' : 'password'}
										name="password"
										value={formData.password}
										onChange={handleInputChange}
										onEnter={handleSubmit}
										placeHolder="Enter your password"
										icon={<VpnKeyOutlinedIcon />}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors">
										{showPassword ? (
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.656 5.656l1.415 1.415m-1.415-1.415l1.415 1.415M12 3c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-.279.74"
												/>
											</svg>
										) : (
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
												/>
											</svg>
										)}
									</button>
								</div>
								{fieldErrors.password && (
									<label className="label">
										<span className="label-text-alt text-red-500">Password is required</span>
									</label>
								)}
							</div>

							{/* Remember Me & Forgot Password */}
							<div className="flex items-center justify-between">
								<div className="form-control">
									<label className="label cursor-pointer">
										<span className="label-text text-sm text-gray-600">Remember me</span>
									</label>
								</div>
								<a href="#" className="text-sm text-primary hover:text-primary-focus transition-colors">
									Forgot password?
								</a>
							</div>

							{/* Submit Button */}
							<CustomButton
								title="Sign In"
								isLoading={isLoading}
								loadingMessage="Signing in..."
								color={primaryColor}
								textColor="text-white"
								fullLength={true}
								handleClick={() => handleSubmit()}
							/>
						</div>

						{/* Sign Up Link */}
						<div className="text-center mt-6 pt-4 border-t border-gray-100">
							<p className="text-gray-600">
								Don't have an account?{' '}
								<a href="/register" className="text-primary hover:text-primary-focus font-medium transition-colors">
									Sign up for free
								</a>
							</p>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center mt-6 text-sm text-gray-500">
					<p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
