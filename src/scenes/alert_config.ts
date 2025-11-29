import { type Context, Markup, Scenes } from "telegraf";
import categories from "../categories.json" with { type: "json" };
import { getDb } from "../services/db.js";
import type { Alert } from "../types/alert.js";

const db = await getDb();
export const alertConfigScene = new Scenes.BaseScene("alert_config");

// ======================
// RENDER
// ======================

function renderAlertConfig(alert: Alert) {
	const categoryName = categories.find((cat) => {
		return cat.id === alert.categoryId;
	})?.name;

	return [
		`🛠️ <b>Configurazione Alert</b>`,
		`Query: <code>${alert.query}</code>`,
		``,
		`Categoria: <b>${categoryName ?? "❌ Non impostata"}</b>`,
		`Prezzo min: <b>${alert.priceMin ?? "❌ Nessun limite"}</b>`,
		`Prezzo max: <b>${alert.priceMax ?? "❌ Nessun limite"}</b>`,
		`Solo urgenti: <b>${alert.urgentOnly ? "✅ Sì" : "❌ No"}</b>`,
		`Solo titolo: <b>${alert.titleSearchOnly ? "✅ Sì" : "❌ No"}</b>`,
		``,
		`📌 Scegli cosa vuoi configurare:`,
	].join("\n");
}

function buildKeyboard() {
	return Markup.inlineKeyboard([
		[Markup.button.callback("🗂️ Categoria", "category")],
		[Markup.button.callback("💶 Prezzo minimo", "min_price")],
		[Markup.button.callback("💰 Prezzo massimo", "max_price")],
		[Markup.button.callback("🚨 Solo urgenti", "urgent_only")],
		[Markup.button.callback("🔍 Solo nel titolo", "title_only")],
		[
			Markup.button.callback("❌ Annulla", "cancel"),
			Markup.button.callback("💾 Salva alert", "save"),
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
	if (page > 0) nav.push(Markup.button.callback("⬅️ Indietro", "cat_prev"));
	if (start + perPage < categories.length)
		nav.push(Markup.button.callback("➡️ Avanti", "cat_next"));

	await ctx.editMessageText(
		`🗂️ <b>Seleziona una categoria</b>\nPagina ${page + 1}`,
		{
			parse_mode: "HTML",
			...Markup.inlineKeyboard([
				...rows,
				nav,
				[Markup.button.callback("🔙 Torna indietro", "back_main")],
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
		"💶 <b>Inserisci il prezzo minimo</b>\nScrivi un numero o '0' per nessun limite.",
		{ parse_mode: "HTML" },
	);
});

alertConfigScene.action("max_price", async (ctx) => {
	ctx.scene.state.step = "max_price";
	await ctx.editMessageText(
		"💰 <b>Inserisci il prezzo massimo</b>\nScrivi un numero o '0' per nessun limite.",
		{ parse_mode: "HTML" },
	);
});

alertConfigScene.on("text", async (ctx) => {
	const step = ctx.scene.state.step;
	if (!step) return;

	const value = parseInt(ctx.message.text, 10);
	if (Number.isNaN(value) || value < 0) {
		await ctx.reply("❌ Inserisci un numero valido.");
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
	const alert = ctx.scene.state.alert;

	await db
		.collection("alerts")
		.updateOne({ query: alert.query }, { $set: alert }, { upsert: true });

	await ctx.editMessageText("✅ Alert salvato!", { parse_mode: "HTML" });
	await ctx.scene.leave();
});

alertConfigScene.action("cancel", async (ctx) => {
	await ctx.editMessageText("❌ Operazione annullata.", { parse_mode: "HTML" });
	await ctx.scene.leave();
});

alertConfigScene.action("back_main", async (ctx) => {
	ctx.scene.state.step = null;
	await updateUI(ctx);
});
