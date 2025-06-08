import React, {useState} from 'react';
import {mutationFetcher} from '../../utils/fetcher';

export const RegisterPage: React.FC = () => {
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [passwordMatch, setPasswordMatch] = useState(true);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value, type, checked} = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));

		// Check password match
		if (name === 'confirmPassword' || name === 'password') {
			const password = name === 'password' ? value : formData.password;
			const confirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;
			setPasswordMatch(password === confirmPassword || confirmPassword === '');
		}
	};

	const handleSubmit = async () => {
		if (formData.password !== formData.confirmPassword) {
			setPasswordMatch(false);
			return;
		}

		const {confirmPassword, ...dataToSend} = formData;

		mutationFetcher(`${import.meta.env.VITE_SERVER_API}register`, {
			method: 'POST',
			body: JSON.stringify(dataToSend),
		})
			.then((res) => {
				console.log(res);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const isFormValid = () => {
		return formData.firstName && formData.lastName && formData.email && formData.password && formData.confirmPassword && passwordMatch;
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="w-full max-w-lg">
				{/* Logo Section */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
						<span className="text-2xl font-bold text-white">IBuy</span>
					</div>
					<h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
					<p className="text-gray-600">Join millions of buyers and sellers worldwide</p>
				</div>

				{/* Register Card */}
				<div className="card bg-white shadow-2xl border-0">
					<div className="card-body p-8">
						<div className="space-y-6">
							{/* Name Fields Row */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="form-control">
									<label className="label">
										<span className="label-text font-medium text-gray-700">First Name</span>
									</label>
									<input
										type="text"
										name="firstName"
										value={formData.firstName}
										onChange={handleInputChange}
										placeholder="Enter first name"
										className="input input-bordered w-full focus:input-primary transition-all duration-200"
										required
									/>
								</div>

								<div className="form-control">
									<label className="label">
										<span className="label-text font-medium text-gray-700">Last Name</span>
									</label>
									<input
										type="text"
										name="lastName"
										value={formData.lastName}
										onChange={handleInputChange}
										placeholder="Enter last name"
										className="input input-bordered w-full focus:input-primary transition-all duration-200"
										required
									/>
								</div>
							</div>

							{/* Email Input */}
							<div className="form-control">
								<label className="label">
									<span className="label-text font-medium text-gray-700">Email Address</span>
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									placeholder="Enter your email"
									className="input input-bordered w-full focus:input-primary transition-all duration-200"
									required
								/>
							</div>

							{/* Password Input */}
							<div className="form-control">
								<label className="label">
									<span className="label-text font-medium text-gray-700">Password</span>
								</label>
								<div className="relative">
									<input
										type={showPassword ? 'text' : 'password'}
										name="password"
										value={formData.password}
										onChange={handleInputChange}
										placeholder="Create a password"
										className="input input-bordered w-full pr-12 focus:input-primary transition-all duration-200"
										required
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
								<label className="label">
									<span className="label-text-alt text-gray-500">Must be at least 8 characters</span>
								</label>
							</div>

							{/* Confirm Password Input */}
							<div className="form-control">
								<label className="label">
									<span className="label-text font-medium text-gray-700">Confirm Password</span>
								</label>
								<div className="relative">
									<input
										type={showConfirmPassword ? 'text' : 'password'}
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handleInputChange}
										placeholder="Confirm your password"
										className={`input input-bordered w-full pr-12 focus:input-primary transition-all duration-200 ${
											!passwordMatch && formData.confirmPassword ? 'input-error' : ''
										}`}
										required
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors">
										{showConfirmPassword ? (
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
								{!passwordMatch && formData.confirmPassword && (
									<label className="label">
										<span className="label-text-alt text-error">Passwords do not match</span>
									</label>
								)}
							</div>

							{/* Submit Button */}
							<button
								type="button"
								onClick={handleSubmit}
								disabled={isLoading || !isFormValid()}
								className="btn btn-primary w-full text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none">
								{isLoading ? (
									<>
										<span className="loading loading-spinner loading-sm mr-2"></span>
										Creating Account...
									</>
								) : (
									'Create Account'
								)}
							</button>
						</div>

						{/* Sign In Link */}
						<div className="text-center mt-6 pt-4 border-t border-gray-100">
							<p className="text-gray-600">
								Already have an account?{' '}
								<a href="/login" className="text-primary hover:text-primary-focus font-medium transition-colors">
									Sign in here
								</a>
							</p>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center mt-6 text-sm text-gray-500">
					<p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;
