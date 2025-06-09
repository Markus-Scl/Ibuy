import type {FC, ReactNode} from 'react';

interface OutletWrapperProps {
	children: ReactNode;
}
export const OutletWrapper: FC<OutletWrapperProps> = ({children}) => {
	return <div className="h-dvh w-dvh content-center">{children}</div>;
};
