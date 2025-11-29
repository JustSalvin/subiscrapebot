import type { Context } from "telegraf";
import messages from "../messages.json" with { type: "json" };
import { getDb } from "../services/db.js";

const db = await getDb();

export async function removeAlert(ctx: Context) {
	const query = ctx.state.args.join(" ");

	const { deletedCount } = await db.collection("alerts").deleteOne({ query });
	if (deletedCount === 0) {
		await ctx.replyWithHTML(messages.alert_not_found);
		return;
	}

	await ctx.reply(messages.alert_removed);
}
