import messages from './messages.json' with { type: "json" };
import { Scenes, Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { auth } from './middlewares/auth.js';
import { checkArgs } from './middlewares/checkArgs.js';
import { addAlert, editAlert, getHelp, listAlert, removeAlert } from './commands.js';
import { alertConfigScene } from './scenes/alertConfig.js';

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN environment variable is not set.");
}

export const bot = new Telegraf(process.env.BOT_TOKEN);
const stage = new Scenes.Stage([alertConfigScene])

// Middlewares
bot.use(auth);
bot.use(session());
bot.use(stage.middleware())

// Commands
bot.command('add', checkArgs(1, '/add &lt;query&gt;'), addAlert);
bot.command('edit', checkArgs(1, '/edit &lt;query&gt;'), editAlert);
bot.command('remove', checkArgs(1, '/remove &lt;query&gt;'), removeAlert);
bot.command('list', listAlert);
bot.command('help', getHelp);

// Default response for other text messages
bot.on(message('text'), async (ctx) => await ctx.reply(messages.default))