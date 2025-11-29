import { MongoServerError } from "mongodb";
import type { Context } from "telegraf";
import messages from "../assets/messages.json" with { type: "json" };
import { getDb } from "../services/db.js";

export async function addAlert(ctx: Context) {
	const db = await getDb();
	const query = ctx.state.args.join(" ");

	try {
		await db.collection("alerts").insertOne({ query });
	} catch (err) {
		if (err instanceof MongoServerError && err.code === 11000) {
			await ctx.replyWithHTML(messages.alert_already_exists);
			return;
		}
	}

	const alert = await db.collection("alerts").findOne({ query });
	await ctx.scene.enter("alert_config", { alert });
}
