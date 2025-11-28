import messages from "../messages.json" with { type: "json" };
import { Database } from "../services/db.js";
import { Context } from "telegraf"

const db = await Database.getDb();

export async function removeAlert (ctx: Context) {
  const query = ctx.state.args.join(' ');

  const { deletedCount } = await db.collection("alerts").deleteOne({ query });
  if ( deletedCount === 0 ) {
    await ctx.replyWithHTML(messages.alert_not_found_error);
    return;
  }

  await ctx.reply(messages.alert_removed);
}
