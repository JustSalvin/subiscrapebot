import config from "../../config.json" with { type: "json" };
import messages from "../messages.json" with { type: "json" };

export const auth = async (ctx: any, next: () => Promise<any>) => {
  const userId = ctx.from?.id;

  if (config.authorizedUsers.includes(userId)) {
    ctx.state.role = "authorized";
    await next();
  } else {
    ctx.state.role = "unauthorized";
    await ctx.reply(messages.unauthorized);
  }
}