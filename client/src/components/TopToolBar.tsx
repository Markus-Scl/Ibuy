import type {FC} from 'react';
import {FormInput} from './FormInput';
import {CustomDropdown} from './CustomDropdown';

export const TopToolBar: FC = () => {
	return (
		<div className="navbar bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg w-full h-full">
			<div className="flex-1">
				<a className="text-xl cursor-pointer font-bold ml-3">IBuy</a>
			</div>
			<div className="flex gap-2">
				<FormInput name="search" value="" placeHolder="Search..." type="text" inputChange={() => console.log('hi')} />
				<div className="dropdown dropdown-end">
					{/* Clean avatar button */}
					<div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar hover:bg-blue-50 transition-colors duration-200">
						<div className="w-10 rounded-full">
							<img alt="User avatar" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" className="rounded-full" />
						</div>
					</div>

					<CustomDropdown />
				</div>
			</div>
		</div>
	);
};
