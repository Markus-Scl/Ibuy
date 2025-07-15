import {useState, type FC} from 'react';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

export const ProductPage: FC = () => {
	const [products, setProducts] = useState<string[]>(['hi']);

	if (products.length === 0) {
		return (
			<div className="w-full h-full  flex justify-center items-center">
				<ShoppingCartOutlinedIcon className="text-gradient-to-r from-blue-600 to-purple-600 shadow-lg rounded-2xl cursor-pointer" sx={{fontSize: '200px'}} />
			</div>
		);
	}

	return (
		<div className="w-full h-full p-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mr-4 overflow-auto">
			{products.map((product, idx) => (
				<div key={idx} className="card bg-gradient-to-r from-blue-600 to-purple-600 max-w-sm  max-h-100 shadow-sm mr-2 mb-4">
					<figure>
						<img src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" alt="Shoes" />
					</figure>
					<div className="card-body">
						<h2 className="card-title">
							Card Title
							<div className="badge badge-secondary">NEW</div>
						</h2>
						<p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
						<div className="card-actions justify-end">
							<div className="badge badge-outline">Fashion</div>
							<div className="badge badge-outline">Products</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};
