export interface ProductResponse {
	productId: string;
	name: string;
	price: number;
	category: number;
	condition: string;
	status: number;
	location: string;
	description: string;
	Images: File[] | null;
}
