import type {FC} from 'react';

interface CustomButtonProps {
	title: string;
	color: string;
	fullLength?: boolean;
	icon?: React.ReactNode;
	isLoading?: boolean;
	loadingMessage?: string;
	handleClick: () => void;
}

export const CustomButton: FC<CustomButtonProps> = ({title, icon, color, fullLength, isLoading, loadingMessage, handleClick}) => {
	return (
		<button
			className={`${
				fullLength ? 'flex-1 py-3 w-full' : 'flex py-2'
			} px-6 bg-gradient-to-r ${color} rounded-lg font-semibold  shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer`}
			onClick={handleClick}>
			{icon}
			{isLoading ? (
				<>
					<span className="loading loading-spinner loading-sm mr-2"></span>
					{loadingMessage}...
				</>
			) : (
				<span className="ml-1">{title}</span>
			)}
		</button>
	);
};
