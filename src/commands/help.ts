import messages from "../messages.json" with { type: "json" };
import { Context } from "telegraf"

export async function help (ctx: Context) {
  await ctx.replyWithHTML(messages.help)
}