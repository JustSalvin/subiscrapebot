import config from "../config.json" with { type: "json" };
import { getDb } from "../services/db.js";
import { logger } from "../services/logger.js";
import { fetchSubito } from "../services/subito_api.js";
import type { Alert } from "../types/alert.js";

type WatchCallback = (data: { ad: any; alert: Alert }) => void;

export async function watchSubito(callback: WatchCallback) {
	const db = await getDb();

	while (true) {
		const alerts = await db.collection<Alert>("alerts").find().toArray();

		for (const alert of alerts) {
			try {
				const data = await fetchSubito({
					query: alert.query,
					categoryId: alert.categoryId ?? undefined,
					priceMin: alert.priceMin ?? undefined,
					priceMax: alert.priceMax ?? undefined,
					urgentOnly: alert.urgentOnly,
					titleSearchOnly: alert.titleSearchOnly,
					sortOrder: "datedesc",
					shippingOnly: true,
				});

				for (const ad of data.ads) {
					const id = ad.urn.split(":")[2];

					const existingAd = await db.collection("ads").findOne({ id });
					if (existingAd) continue;

					await db.collection("ads").insertOne({ id, ...ad });
					callback({ ad, alert });
				}
			} catch (err) {
				logger.error("Error fetching data", { error: err });
			}
		}

		await new Promise((resolve) => setTimeout(resolve, config.fetchInterval));
	}
}
