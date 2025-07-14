export interface ApiError {
	message: string;
	status: number;
}

export class AuthError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'AuthError';
		this.status = status;
	}
}

export interface User {
	firstName: string;
	lastName: string;
	email: string;
	userId: string;
}

export interface LoginData {
	email: string;
	password: string;
}
