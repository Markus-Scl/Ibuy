import type {FC} from 'react';
import {FormInput} from './FormInput';

export const TopToolBar: FC = () => {
	console.log('toolbar');
	return (
		<div className="navbar bg-gradient-to-r from-blue-600 to-purple-600 mb-4 shadow-lg w-full">
			<div className="flex-none">
				<button className="btn btn-square btn-ghost">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-5 w-5 stroke-current">
						{' '}
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>{' '}
					</svg>
				</button>
			</div>
			<div className="flex-1">
				<a className="btn btn-ghost text-xl">IBuy</a>
			</div>
			<div className="flex gap-2">
				<FormInput name="search" value="" placeHolder="Search..." type="text" inputChange={() => console.log('hi')} />
				<div className="dropdown dropdown-end">
					<div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
						<div className="w-10 rounded-full">
							<img alt="Tailwind CSS Navbar component" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
						</div>
					</div>
					<ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
						<li>
							<a className="justify-between">
								Profile
								<span className="badge">New</span>
							</a>
						</li>
						<li>
							<a>Settings</a>
						</li>
						<li>
							<a>Logout</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};
