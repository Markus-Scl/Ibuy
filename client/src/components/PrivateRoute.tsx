import {Fragment} from 'react';
import type {FC, ReactNode} from 'react';
import {Navigate} from 'react-router-dom';
import {useAuthStore} from '../stores/useAuthStore';

interface PrivateRouteProps {
	children: ReactNode;
}

const PrivateRoute: FC<PrivateRouteProps> = ({children}) => {
	const {authenticated, loading} = useAuthStore();
	if (loading)
		return (
			<div className="h-dvh w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
				<span className="loading loading-bars loading-xl text-primary"></span>
			</div>
		);
	return <Fragment>{authenticated ? children : <Navigate to="/login" replace />}</Fragment>;
};

export default PrivateRoute;
