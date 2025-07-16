import type {FC} from 'react';
import {FormInput} from './Form/FormInput';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

export const TopToolBar: FC = () => {
	return (
		<div className="navbar bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg w-full h-full">
			<div className="flex-1">
				<a className="text-xl cursor-pointer font-bold ml-3">IBuy</a>
			</div>
			<div className="flex gap-1">
				<FormInput name="search" value="" placeHolder="Search..." type="text" onChange={() => console.log('hi')} icon={<SearchOutlinedIcon />} />
			</div>
		</div>
	);
};
