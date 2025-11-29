import type { Context } from "telegraf";
import messages from "../assets/messages.json" with { type: "json" };

export async function help(ctx: Context) {
	await ctx.replyWithHTML(messages.help);
}
