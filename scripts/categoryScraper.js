import fs from "node:fs";

/*
  This script scrapes category names from the Subito.it API by iterating through category IDs
  from 0 to 200. It saves the resulting category names and their IDs to a JSON file.
*/

const headers = {
	"X-Subito-Channel": "web",
};

const categories = [];

for (let i = 0; i <= 200; i++) {
	const res = await fetch(`https://hades.subito.it/v1/search/items?c=${i}`, {
		headers: headers,
		method: "GET",
	});

	const data = await res.json();
	const categoryName = data?.filters?.c;

	if (!res.ok) {
		console.log(`Failed to fetch category ${i}:`, res.statusText);
		continue;
	}

	console.log(`Category ${i}:`, categoryName);
	if (categoryName) categories.push({ id: i, name: categoryName });
}

fs.writeFile("categories.json", JSON.stringify(categories, null, 2), (err) => {
	if (err) throw err;
	console.log("Categories written to file");
});
