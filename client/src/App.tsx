import {Outlet, Route, Routes} from 'react-router-dom';
import './App.css';
import {LoginPage} from './pages/login/LoginPage';
import {RegisterPage} from './pages/register/RegisterPage';
import {OutletWrapper} from './components/OutletWrapper';
import {ProductPage} from './pages/product/ProductPage';
import {useEffect} from 'react';
import {initAuth} from './auth/initAuth';
import {HomePage} from './pages/home/HomePage';

function App() {
	useEffect(() => {
		initAuth();
	}, []);

	return (
		<div>
			<Routes>
				<Route
					path="/"
					element={
						<OutletWrapper>
							<Outlet />
						</OutletWrapper>
					}>
					<Route path="/home" element={<HomePage />} />
					<Route path="/products" element={<ProductPage />} />
				</Route>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="*" element={<h1>404 - Page Not Found</h1>} />
			</Routes>
		</div>
	);
}

export default App;
