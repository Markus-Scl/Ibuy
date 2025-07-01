import type {FC, ReactNode} from 'react';
import {TopToolBar} from './TopToolBar';

interface OutletWrapperProps {
	children: ReactNode;
}
export const OutletWrapper: FC<OutletWrapperProps> = ({children}) => {
	return (
		<div className="h-dvh w-full bg-gradient-to-br from-blue-50 to-indigo-100">
			<TopToolBar />
			{children}
		</div>
	);
};
