import type {FC} from 'react';
import {useEffect, useState} from 'react';
import {bottomItems, menuItems} from './Util/utils';
import {CustomDropdown} from './Form/CustomDropdown';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuthStore} from '../stores/useAuthStore';

export const SideNavbar: FC = () => {
	const [activeItem, setActiveItem] = useState('home');
	const navigate = useNavigate();
	const location = useLocation();
	const {user} = useAuthStore();

	useEffect(() => {
		setActiveItem(location.pathname.replace('/', ''));
	});

	return (
		<div className={`h-full w-64 bg-white shadow-xl transition-all duration-300 `}>
			{/* Navigation Menu */}
			<nav className="flex-1 p-4 space-y-2">
				{menuItems.map((item) => (
					<button
						key={item.id}
						onClick={() => {
							setActiveItem(item.id);
							navigate(item.id);
						}}
						className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group ${
							activeItem === item.id
								? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
								: 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600'
						}`}>
						<div className={`flex-shrink-0 ${activeItem === item.id ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`}>{item.icon}</div>
						<span className="font-medium truncate">{item.label}</span>
					</button>
				))}
			</nav>

			{/* Bottom Section */}
			<div className="p-4 border-t border-gray-200 space-y-2">
				{bottomItems.map((item) => (
					<button
						key={item.id}
						onClick={() => setActiveItem(item.id)}
						className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group ${
							activeItem === item.id
								? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
								: 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600'
						}`}>
						<div className={`flex-shrink-0 ${activeItem === item.id ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`}>{item.icon}</div>
						<span className="font-medium truncate">{item.label}</span>
					</button>
				))}
			</div>

			<div className="p-4 border-t border-gray-200 cursor-pointer dropdown dropdown-end w-full">
				<div tabIndex={0} role="button" className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 focus:outline-none">
					<div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
						<span className="text-white font-semibold text-sm">{user?.firstName[0] + '' + user?.lastName[0]}</span>
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-gray-900 truncate">{user?.firstName + ' ' + user?.lastName}</p>
						<p className="text-xs text-gray-500 truncate">{user?.email}</p>
					</div>
				</div>
				<CustomDropdown />
			</div>
		</div>
	);
};
