import type { ObjectId } from "mongodb";

export type Alert = {
	_id?: ObjectId;
	query: string;
	categoryId?: number | null;
	priceMin?: number | null;
	priceMax?: number | null;
	urgentOnly?: boolean;
	titleSearchOnly?: boolean;
};
