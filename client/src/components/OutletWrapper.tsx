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
			<div className="h-dvh w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
				<div className="flex-shrink-0">
					<TopToolBar />
				</div>
				<div className="flex-1 flex min-h-0">
					<SideNavbar />
					{children}
				</div>
			</div>
		</PrivateRoute>
	);
};
