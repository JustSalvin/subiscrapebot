import type { Context } from "telegraf";
import messages from "../assets/messages.json" with { type: "json" };
import { getDb } from "../services/db.js";

const db = await getDb();

export async function editAlert(ctx: Context) {
	const query = ctx.state.args.join(" ");
	const alert = await db.collection("alerts").findOne({ query });

	if (!alert) {
		await ctx.replyWithHTML(messages.alert_not_found);
		return;
	}

	await ctx.scene.enter("alert_config", { alert });
}
