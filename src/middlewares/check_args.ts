import messages from "../messages.json" with { type: "json" };
import { Context } from "telegraf";

export function checkArgs(minArgs: number, usage: string) {
  return async (ctx: Context, next: Function) => {
    if (!ctx.message || !("text" in ctx.message)) return;

    const parts = ctx.message.text.split(" ");
    const args = parts.slice(1);

    if (args.length < minArgs) {
      await ctx.replyWithHTML(`${messages.bad_command_error}\nUsa:  ${usage}`, {
        parse_mode: "HTML"
      });
      return;
    }

    ctx.state.args = args;
    return next();
  };
}