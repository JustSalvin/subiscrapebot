import { Markup, Scenes } from "telegraf";

export const alertConfigScene = new Scenes.BaseScene('alert_config')

function buildKeyboard(alert: any) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(alert?.category ? "Modifica Categoria" : "Aggiungi Categoria", "category")
    ],
    [
      Markup.button.callback(alert?.minPrice ? "Modifica Prezzo Min" : "Aggiungi Prezzo Min", "min_price"),
      Markup.button.callback(alert?.maxPrice ? "Modifica Prezzo Max" : "Aggiungi Prezzo Max", "max_price")],
    [
      Markup.button.callback(alert?.titleSearchOnly ? "Disabilita Solo Titolo" : "Abilita Solo Titolo", "title_only"),
      Markup.button.callback(alert?.urgentOnly ? "Disabilita Solo Urgenti" : "Abilita Solo Urgenti", "urgent_only")
    ],
    [
      Markup.button.callback("Elimina", "delete"), 
      Markup.button.callback("Salva", "save")
    ]
  ])
}

alertConfigScene.enter(async (ctx) => {
  const alert = ctx.scene.state.alert;

  await ctx.reply('<b>Configurazione Alert</b>', buildKeyboard(alert))
})

alertConfigScene.action('category', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText('tony')
})

alertConfigScene.action('min_price', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('rox')
})

alertConfigScene.action('max_price', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('rox')
})

alertConfigScene.action('title_only', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('rox')
})

alertConfigScene.action('urgent_only', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('rox')
})
