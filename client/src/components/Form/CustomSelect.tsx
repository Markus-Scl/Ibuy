import type {FC} from 'react';

interface CustomSelect {
	name: string;
	value: string;
	options: string[];
	placeholder: string;
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	icon?: React.ReactNode;
}

/*
<select
    name="category_id"
    value={formData.category_id}
    onChange={handleInputChange}
    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 appearance-none bg-white"
    required>
    <option value="">Select category</option>
    {categories.map((category) => (
        <option key={category.id} value={category.id}>
            {category.name}
        </option>
    ))}
</select>
*/

export const CustomSelect: FC<CustomSelect> = ({name, value, icon, options, placeholder, onChange}) => {
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
				{options.map((option, idx) => (
					<option key={idx} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	);
};
