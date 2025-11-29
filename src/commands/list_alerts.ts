import type { Context } from "telegraf";
import messages from "../messages.json" with { type: "json" };
import { getDb } from "../services/db.js";
import { template } from "../utils.js";

const db = await getDb();

export async function listAlerts(ctx: Context) {
	const alerts = await db.collection("alerts").find().toArray();
	if (alerts.length === 0) {
		await ctx.replyWithHTML(messages.empty_alert_list);
		return;
	}

	const list = alerts
		.map((a) =>
			template(messages.alert_list_item, { alert_list_item: a.query }),
		)
		.join("\n");

	await ctx.replyWithHTML(template(messages.alert_list, { alert_list: list }));
}
