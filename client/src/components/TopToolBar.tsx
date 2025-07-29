import type {FC} from 'react';
import {CustomInput} from './Form/CustomInput';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {primaryColor} from '../utils/theme';

export const TopToolBar: FC = () => {
	return (
		<div className={`navbar ${primaryColor} shadow-lg w-full h-full`}>
			<div className="flex-1">
				<a className="text-xl cursor-pointer font-bold ml-3 text-white">IBuy</a>
			</div>
			<div className="flex gap-1">
				<CustomInput name="search" value="" placeHolder="Search..." type="text" onChange={() => console.log('hi')} icon={<SearchOutlinedIcon />} />
			</div>
		</div>
	);
};
