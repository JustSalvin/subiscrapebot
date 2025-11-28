import messages from "../messages.json" with { type: "json" };
import { MongoServerError } from "mongodb";
import { Database } from "../services/db.js";
import { Context } from "telegraf"

const db = await Database.getDb();

export async function addAlert (ctx: Context) {
  const query = ctx.state.args.join(' ');

  try {
    await db.collection("alerts").insertOne({ query })
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      await ctx.replyWithHTML(messages.alert_conflict_error);
      return;
    }
  }

  await ctx.replyWithHTML(messages.alert_added)
  /* WIP
  const alert = await db.collection("alerts").findOne({ query });
  await ctx.scene.enter('alert_config', { alert });
  */
}