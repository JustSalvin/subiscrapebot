type Params = {
	query: string; // q
	categoryId?: number; // c
	sortOrder?: string; // sort
	pageSize?: number; // lim
	offset?: number; // start
	priceMin?: number; // ps
	priceMax?: number; // pe
	urgentOnly?: boolean; // urg
	shippingOnly?: boolean; // shp
	titleSearchOnly?: boolean; // qso
};

function queryBuilder(params: Params) {
	const query = new URLSearchParams();

	if (params.query !== undefined) query.set("q", params.query);
	if (params.categoryId !== undefined)
		query.set("c", String(params.categoryId));
	if (params.sortOrder !== undefined) query.set("sort", params.sortOrder);
	if (params.pageSize !== undefined) query.set("lim", String(params.pageSize));
	if (params.offset !== undefined) query.set("start", String(params.offset));
	if (params.priceMin !== undefined) query.set("ps", String(params.priceMin));
	if (params.priceMax !== undefined) query.set("pe", String(params.priceMax));
	if (params.urgentOnly !== undefined)
		query.set("urg", String(params.urgentOnly));
	if (params.shippingOnly !== undefined)
		query.set("shp", String(params.shippingOnly));
	if (params.titleSearchOnly !== undefined)
		query.set("qso", String(params.titleSearchOnly));

	return query.toString();
}

export async function fetchSubito(params: Params) {
	const headers = { "X-Subito-Channel": "web" };
	const url = `https://hades.subito.it/v1/search/items?${queryBuilder(params)}`;

	console.log("Fetching URL:", url);
	const res = await fetch(url, {
		headers: headers,
		method: "GET",
	});

	if (!res.ok) {
		throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
	}

	return await res.json();
}
