import { Context } from "telegraf";

export function checkArgs(minArgs: number, usage: string) {
  return async (ctx: Context, next: Function) => {
    if (!ctx.message || !("text" in ctx.message)) return;

    const parts = ctx.message.text.split(" ");
    const args = parts.slice(1);

    if (args.length < minArgs) {
      await ctx.reply(`Comando errato.\nUsa:  <code>${usage}</code>`, {
        parse_mode: "HTML"
      });
      return;
    }

    // Salviamo gli argomenti nel context
    ctx.state.args = args;

    return next();
  };
}