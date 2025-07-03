import type {FC} from 'react';
import {logout} from '../auth/auth';

export const CustomDropdown: FC = () => {
	return (
		<ul tabIndex={0} className="menu menu-sm dropdown-content bg-white border border-gray-100 rounded-lg shadow-lg z-50 mt-3 w-52 p-2 text-gray-700">
			<li>
				<a className="px-4 py-2 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150">Profile</a>
			</li>
			<li>
				<a className="px-4 py-2 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150">Settings</a>
			</li>
			<li>
				<hr className=" border-gray-300" />
			</li>
			<li>
				<a className="px-4 py-2 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors duration-150" onClick={() => logout()}>
					Logout
				</a>
			</li>
		</ul>
	);
};
