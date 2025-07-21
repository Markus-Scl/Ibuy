import type {FC} from 'react';

interface CustomButtonProps {
	title: string;
	icon?: React.ReactNode;
	color: string;
	fullLength: boolean;
	handleClick: () => void;
}

export const CustomButton: FC<CustomButtonProps> = ({title, icon, color, fullLength, handleClick}) => {
	return (
		<button
			className={`${
				fullLength ? 'flex-1 py-3' : 'flex py-2'
			} px-6 bg-gradient-to-r ${color} rounded-lg font-semibold  shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer`}
			onClick={handleClick}>
			{icon}
			<span>{title}</span>
		</button>
	);
};
