import { Context } from "telegraf";
import { Database } from "../db.js";
import { MongoServerError } from "mongodb";

const db = await Database.getDb();

export const addAlert = async (ctx: Context) => {
  const query = ctx.state.args.join(' ');

  try {
    await db.collection("alerts").insertOne({ query })
  } catch (err: unknown) {
    if (err instanceof MongoServerError && err.code === 11000) {
      await ctx.reply('Alert già esistente.');
      return;
    }
  }

  await ctx.reply('Aggiunto Alert con query: ' + query)
  /* WIP
  const alert = await db.collection("alerts").findOne({ query });
  await ctx.scene.enter('alert_config', { alert });
  */
}

export const editAlert = async (ctx: Context) => {
  await ctx.reply('Non ancora implementato')
}

export const removeAlert = async (ctx: Context) => {
  const query = ctx.state.args.join(' ');

  const { deletedCount } = await db.collection("alerts").deleteOne({ query });
  if ( deletedCount === 0 ) {
    await ctx.reply('Alert non esistente.');
    return;
  }

  await ctx.reply('Rimosso Alert con query: ' + query);
}

export const listAlert = async (ctx: Context) => {
  const alerts = await db.collection("alerts").find().toArray();
  if ( alerts.length === 0 ) {
    await ctx.reply('Nessun Alert presente.');
    return;
  }

  const list = alerts.map(a => a.query).join('\n');
  await ctx.reply('Alert presenti:\n' + list);
}

export const getHelp = async (ctx: Context) => {
  await ctx.reply('Comandi:\n/add <query> - aggiungi alert\n/edit <query> - modifica alert\n/remove <query> - rimuovi alert\n/list - lista alert\n/help - aiuto')
}