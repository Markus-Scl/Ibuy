import type {FC, ReactNode} from 'react';
import {TopToolBar} from './TopToolBar';
import PrivateRoute from './PrivateRoute';
import {SideNavbar} from './SideNavBar';

interface OutletWrapperProps {
	children: ReactNode;
}
export const OutletWrapper: FC<OutletWrapperProps> = ({children}) => {
	return (
		<PrivateRoute>
			<div className="h-dvh w-full bg-gradient-to-br from-blue-50 to-indigo-100">
				<div className="h-[7%]">
					<TopToolBar />
				</div>
				<div className="h-[93%] flex">
					<div className="w-[25%]">
						<SideNavbar />
					</div>
					{children}
				</div>
			</div>
		</PrivateRoute>
	);
};
