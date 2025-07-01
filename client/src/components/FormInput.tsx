import type {FC} from 'react';

interface FormInputProps {
	name: string;
	value: string;
	placeHolder: string;
	type: string;
	inputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormInput: FC<FormInputProps> = ({name, value, placeHolder, type, inputChange}) => {
	return (
		<input
			type={type}
			name={name}
			value={value}
			onChange={inputChange}
			placeholder={placeHolder}
			className="input input-bordered w-full focus:input-primary transition-all duration-200 placeholder-gray-400 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-600"
			required
		/>
	);
};
