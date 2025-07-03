import type {FC} from 'react';
import {useState} from 'react';
import {bottomItems, menuItems} from './Util/utils';

interface SideNavbarProps {
	isOpen?: boolean;
	onToggle?: () => void;
}

export const SideNavbar: FC<SideNavbarProps> = ({isOpen = true, onToggle}) => {
	const [activeItem, setActiveItem] = useState('dashboard');

	return (
		<div className={`fixed left-0 top-16 h-full bg-white shadow-xl transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-16'}`}>
			{/* Navigation Menu */}
			<nav className="flex-1 p-4 space-y-2">
				{menuItems.map((item) => (
					<button
						key={item.id}
						onClick={() => setActiveItem(item.id)}
						className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group ${
							activeItem === item.id
								? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
								: 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600'
						}`}>
						<div className={`flex-shrink-0 ${activeItem === item.id ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`}>{item.icon}</div>
						{isOpen && <span className="font-medium truncate">{item.label}</span>}
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
						{isOpen && <span className="font-medium truncate">{item.label}</span>}
					</button>
				))}
			</div>

			{/* User Profile Section (when expanded) */}
			{isOpen && (
				<div className="p-4 border-t border-gray-200">
					<div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
						<div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
							<span className="text-white font-semibold text-sm">JD</span>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
							<p className="text-xs text-gray-500 truncate">admin@ibuy.com</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
