import messages from "../messages.json" with { type: "json" };
import { Context } from "telegraf"
import { template } from "../utils.js"

export async function start(ctx: Context) {
  await ctx.replyWithHTML(template(messages.start, { 
    user_name: ctx.from?.username, 
    bot_name: ctx.botInfo.first_name 
  }))
}