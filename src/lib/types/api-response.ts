export type ApiResponse<T> = {
	success: boolean;
	message: string;
	data: T;
	timestamp: string;
};

export type PaginatedData<T> = {
	content: T[];
	page: number;
	size: number;
	totalElements: number;
	totalPages: number;
};

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;
