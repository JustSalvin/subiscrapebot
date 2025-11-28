import messages from "../messages.json" with { type: "json" };
import { Database } from "../services/db.js";
import { Context } from "telegraf"
import { template } from "../utils.js";
import { message } from "telegraf/filters";

const db = await Database.getDb();

export async function listAlerts (ctx: Context) {
  const alerts = await db.collection("alerts").find().toArray();
  if ( alerts.length === 0 ) {
    await ctx.replyWithHTML(messages.alert_empty_list);
    return;
  }

  const list = alerts.map(a => template(
    messages.alert_list_item, 
    { alert_list_item: a.query }
  )).join('\n');

  await ctx.replyWithHTML(template(
    messages.alert_list, 
    { alert_list: list }
  ));
}