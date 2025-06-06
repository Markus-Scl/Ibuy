import {Navigate, Route, Routes} from 'react-router-dom';
import './App.css';
import {LoginPage} from './pages/login/LoginPage';
import {RegisterPage} from './pages/register/RegisterPage';

function App() {
	return (
		<div>
			<Routes>
				<Route path="/" element={<Navigate to="/login" replace />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="*" element={<h1>404 - Page Not Found</h1>} />
			</Routes>
		</div>
	);
}

export default App;
