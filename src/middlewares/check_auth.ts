import type { Context, MiddlewareFn } from "telegraf";
import messages from "../assets/messages.json" with { type: "json" };

export function checkAuth(authorizedUsers: number[]): MiddlewareFn<Context> {
	return async (ctx, next) => {
		const userId = ctx.from?.id;

		if (typeof userId !== "number") return;
		if (!authorizedUsers.includes(userId)) {
			ctx.state.role = "unauthorized";
			await ctx.reply(messages.unauthorized);
		}

		ctx.state.role = "authorized";
		await next();
	};
}
