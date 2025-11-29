import { Scenes, session, Telegraf } from "telegraf";
import { addAlert } from "./commands/add_alert.js";
import { editAlert } from "./commands/edit_alert.js";
import { help } from "./commands/help.js";
import { listAlerts } from "./commands/list_alerts.js";
import { removeAlert } from "./commands/remove_alert.js";
import { start } from "./commands/start.js";
import config from "./config.json" with { type: "json" };
import messages from "./messages.json" with { type: "json" };
import { checkArgs } from "./middlewares/check_args.js";
import { checkAuth } from "./middlewares/check_auth.js";
import { alertConfigScene } from "./scenes/alert_config.js";
import { getDb, initDatabase } from "./services/db.js";
import { template } from "./utils.js";
import { watchSubito } from "./watchers/subito.js";

const db = await getDb();
await initDatabase(db);

if (!process.env.BOT_TOKEN)
	throw new Error("BOT_TOKEN environment variable is not set.");
export const bot = new Telegraf(process.env.BOT_TOKEN);
const stage = new Scenes.Stage([alertConfigScene]);

// Middlewares
bot.use(checkAuth(config.authorizedUsers));
bot.use(session());
bot.use(stage.middleware());

// Commands
bot.command("add", checkArgs(1, messages.add_usage), addAlert);
bot.command("edit", checkArgs(1, messages.edit_usage), editAlert);
bot.command("remove", checkArgs(1, messages.remove_usage), removeAlert);
bot.command("list", listAlerts);
bot.command("help", help);
bot.start(start);

// Watchers
watchSubito(({ ad, alert }) => {
	for (const userId of config.authorizedUsers) {
		bot.telegram.sendMessage(
			userId,
			template(messages.ad_found, {
				ad_link: ad.urls.default,
				ad_title: ad.subject,
				ad_price: `${ad.features.find((f: any) => f.label === "Prezzo")?.values[0].key}€`,
				ad_date: ad.dates.display,
				query: alert.query,
			}),
			{ parse_mode: "HTML" },
		);
	}
});

bot.launch();
