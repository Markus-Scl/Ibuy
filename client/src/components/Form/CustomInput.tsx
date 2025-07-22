import type {FC} from 'react';

interface CustomInputProps {
	name: string;
	value: string;
	placeHolder: string;
	type: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	step?: string;
	icon?: React.ReactNode;
	onEnter?: () => void;
}

export const CustomInput: FC<CustomInputProps> = ({name, value, placeHolder, type, icon, step, onChange, onEnter}) => {
	return (
		<div className="relative w-full">
			{icon && <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>}
			<input
				type={type}
				step={step}
				name={name}
				value={value}
				onChange={onChange}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && onEnter) {
						onEnter();
					}
				}}
				placeholder={placeHolder}
				className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 placeholder-gray-400 text-gray-600 bg-white"
				required
			/>
		</div>
	);
};
