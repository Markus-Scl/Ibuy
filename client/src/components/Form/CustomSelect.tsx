import type {FC} from 'react';

interface CustomSelectProps {
	name: string;
	value: string | number;
	options: string[] | Map<number, string>;
	placeholder: string;
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	icon?: React.ReactNode;
}

export const CustomSelect: FC<CustomSelectProps> = ({name, value, icon, options, placeholder, onChange}) => {
	return (
		<div className="relative w-full">
			{icon && <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>}
			<select
				name={name}
				value={value}
				onChange={onChange}
				className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 placeholder-gray-400 text-gray-600 bg-white"
				required>
				<option value="">{placeholder}</option>
				{Array.isArray(options)
					? options.map((option, idx) => (
							<option key={idx} value={option}>
								{option}
							</option>
					  ))
					: Array.from(options).map(([key, val]) => (
							<option key={key} value={key}>
								{val}
							</option>
					  ))}
			</select>
		</div>
	);
};
