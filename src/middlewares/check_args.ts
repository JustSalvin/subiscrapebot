import type { Context, MiddlewareFn } from "telegraf";
import messages from "../assets/messages.json" with { type: "json" };

export function checkArgs(
	minArgs: number,
	usage: string,
): MiddlewareFn<Context> {
	return async (ctx, next) => {
		if (!ctx.message || !("text" in ctx.message)) return;

		const parts = ctx.message.text.split(" ");
		const args = parts.slice(1);

		if (args.length < minArgs) {
			await ctx.replyWithHTML(`${messages.bad_command}\nUsa:  ${usage}`, {
				parse_mode: "HTML",
			});
			return;
		}

		ctx.state.args = args;
		return next();
	};
}
