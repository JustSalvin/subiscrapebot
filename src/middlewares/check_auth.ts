import messages from "../messages.json" with { type: "json" };
import { Context } from "telegraf";

export function checkAuth(authorizedUsers: number[]) {
  return async (ctx: Context, next: Function) => {
    const userId = ctx.from?.id;

    if (typeof userId !== "number") return
    if (!authorizedUsers.includes(userId)) {
      ctx.state.role = "unauthorized";
      await ctx.reply(messages.unauthorized_error);
    }
    
    ctx.state.role = "authorized";
    await next();
  };
}
