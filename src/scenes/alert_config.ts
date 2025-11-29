import { type Context, Markup, Scenes } from "telegraf";
import categories from "../assets/categories.json" with { type: "json" };
import messages from "../assets/messages.json" with { type: "json" };
import { getDb } from "../services/db.js";
import type { Alert } from "../types/alert.js";
import { template } from "../utils.js";

export const alertConfigScene = new Scenes.BaseScene("alert_config");

// ======================
// RENDER
// ======================

function renderAlertConfig(alert: Alert) {
	const categoryName = categories.find((cat) => {
		return cat.id === alert.categoryId;
	})?.name;

	const category = categoryName ?? messages.alert_config_category_not_set;
	const priceMin = alert.priceMin ? `${alert.priceMin}€` : messages.alert_config_no_limit;
	const priceMax = alert.priceMax ? `${alert.priceMax}€` : messages.alert_config_no_limit;
	const urgentOnly = alert.urgentOnly ? messages.alert_config_yes : messages.alert_config_no;
	const titleOnly = alert.titleSearchOnly ? messages.alert_config_yes : messages.alert_config_no;

	return [
		messages.alert_config_title,
		template(messages.alert_config_query, { query: alert.query }),
		"",
		template(messages.alert_config_category, { category }),
		template(messages.alert_config_price_min, { price_min: priceMin }),
		template(messages.alert_config_price_max, { price_max: priceMax }),
		template(messages.alert_config_urgent_only, { urgent_only: urgentOnly }),
		template(messages.alert_config_title_only, { title_only: titleOnly }),
		"",
		messages.alert_config_choose_option,
	].join("\n");
}

function buildKeyboard() {
	return Markup.inlineKeyboard([
		[Markup.button.callback(messages.alert_config_button_category, "category")],
		[Markup.button.callback(messages.alert_config_button_min_price, "min_price")],
		[Markup.button.callback(messages.alert_config_button_max_price, "max_price")],
		[Markup.button.callback(messages.alert_config_button_urgent_only, "urgent_only")],
		[Markup.button.callback(messages.alert_config_button_title_only, "title_only")],
		[
			Markup.button.callback(messages.alert_config_button_cancel, "cancel"),
			Markup.button.callback(messages.alert_config_button_save, "save"),
		],
	]);
}

// funzione per aggiornare unico messaggio
async function updateUI(ctx: Context) {
	const alert = ctx.scene.state.alert;

	try {
		await ctx.editMessageText(renderAlertConfig(alert), {
			parse_mode: "HTML",
			...buildKeyboard(),
		});
	} catch {
		await ctx.replyWithHTML(renderAlertConfig(alert), buildKeyboard());
	}
}

// ======================
// ENTER SCENE
// ======================

alertConfigScene.enter(async (ctx) => {
	ctx.scene.state.alert ??= {};
	ctx.scene.state.step = null;
	ctx.scene.state.page = 0;
	await ctx.replyWithHTML(
		renderAlertConfig(ctx.scene.state.alert),
		buildKeyboard(),
	);
});

// ======================
// ACTIONS
// ======================

alertConfigScene.action("urgent_only", async (ctx) => {
	ctx.scene.state.alert.urgentOnly = !ctx.scene.state.alert.urgentOnly;
	await updateUI(ctx);
});

alertConfigScene.action("title_only", async (ctx) => {
	ctx.scene.state.alert.titleSearchOnly =
		!ctx.scene.state.alert.titleSearchOnly;
	await updateUI(ctx);
});

// ======================
// CATEGORY SELECTION
// ======================

alertConfigScene.action("category", async (ctx) => {
	ctx.scene.state.step = "category";
	await showCategoryPage(ctx);
});

async function showCategoryPage(ctx: Context) {
	const page = ctx.scene.state.page;
	const perPage = 10;

	const start = page * perPage;
	const slice = categories.slice(start, start + perPage);

	const rows = slice.map((cat) => [
		Markup.button.callback(cat.name, `cat_${cat.id}`),
	]);

	const nav = [];
	if (page > 0) nav.push(Markup.button.callback(messages.alert_config_button_back, "cat_prev"));
	if (start + perPage < categories.length)
		nav.push(Markup.button.callback(messages.alert_config_button_next, "cat_next"));

	await ctx.editMessageText(
		template(messages.alert_config_select_category, { page: page + 1 }),
		{
			parse_mode: "HTML",
			...Markup.inlineKeyboard([
				...rows,
				nav,
				[Markup.button.callback(messages.alert_config_button_back_main, "back_main")],
			]),
		},
	);
}

alertConfigScene.action("cat_prev", async (ctx) => {
	ctx.scene.state.page--;
	await showCategoryPage(ctx);
});

alertConfigScene.action("cat_next", async (ctx) => {
	ctx.scene.state.page++;
	await showCategoryPage(ctx);
});

alertConfigScene.action(/cat_(\d+)/, async (ctx) => {
	const match = ctx.match;
	if (!match || !match[1]) return;

	const id = parseInt(match[1], 10);
	ctx.scene.state.alert.categoryId = id;
	ctx.scene.state.step = null;
	await updateUI(ctx);
});

// ======================
// PRICE INPUTS
// ======================

alertConfigScene.action("min_price", async (ctx) => {
	ctx.scene.state.step = "min_price";
	await ctx.editMessageText(
		messages.alert_config_min_price_prompt,
		{ parse_mode: "HTML" },
	);
});

alertConfigScene.action("max_price", async (ctx) => {
	ctx.scene.state.step = "max_price";
	await ctx.editMessageText(
		messages.alert_config_max_price_prompt,
		{ parse_mode: "HTML" },
	);
});

alertConfigScene.on("text", async (ctx) => {
	const step = ctx.scene.state.step;
	if (!step) return;

	const value = parseInt(ctx.message.text, 10);
	if (Number.isNaN(value) || value < 0) {
		await ctx.reply(messages.alert_config_invalid_number);
		return;
	}

	const val = value === 0 ? null : value;

	if (step === "min_price") ctx.scene.state.alert.priceMin = val;
	if (step === "max_price") ctx.scene.state.alert.priceMax = val;

	ctx.scene.state.step = null;
	await updateUI(ctx);
});

// ======================
// SAVE / CANCEL
// ======================

alertConfigScene.action("save", async (ctx) => {
	const db = await getDb();
	const alert = ctx.scene.state.alert;

	await db
		.collection("alerts")
		.updateOne({ query: alert.query }, { $set: alert }, { upsert: true });

	await ctx.editMessageText(messages.alert_config_saved, { parse_mode: "HTML" });
	await ctx.scene.leave();
});

alertConfigScene.action("cancel", async (ctx) => {
	await ctx.editMessageText(messages.alert_config_cancelled, { parse_mode: "HTML" });
	await ctx.scene.leave();
});

alertConfigScene.action("back_main", async (ctx) => {
	ctx.scene.state.step = null;
	await updateUI(ctx);
});
