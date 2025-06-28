import { Telegraf, Scenes, session } from "telegraf";

import zipCodeWizardScene from "./wizards/zip.code.wizard.scene.js";
import addrWizardScene from "./wizards/addr.wizard.scene.js";

import { about, bugs } from "./helpers/messages.default.js";

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error(
    "Token do bot não definido. Verifique se a variável de ambiente 'BOT_TOKEN' está configurada corretamente."
  );
}

const bot = new Telegraf(token);

// Stages
const stage = new Scenes.Stage([zipCodeWizardScene, addrWizardScene]);

// Middleware
bot.use(session());
bot.use(stage.middleware());
bot.use(Telegraf.log());

// Commands
bot.start(async (ctx) => {
  const nameUser = ctx.update.message.from.first_name;
  await ctx.replyWithHTML(
    `E aí, ${nameUser}! 👋 Tudo certo?\n\nVocê pode me controlar enviando estes comandos:\n\n<strong>CEP</strong>\n/cep - Buscar por CEP\n/addr - Buscar por endereço\n\n<strong>Informações & Ajuda</strong>\n/bugs - Orientações de contato\n/about - Sobre este projeto`
  );
});

bot.command("cep", async (ctx) => {
  await ctx.scene.enter("cep");
});

bot.command("addr", async (ctx) => {
  await ctx.scene.enter("addr");
});

bot.command("about", async (ctx) => {
  await ctx.reply(about);
});

bot.command("bugs", async (ctx) => {
  await ctx.replyWithHTML(bugs);
});

bot.on(
  "message",
  async (ctx) => await ctx.reply("Entre com um comando válido para iniciar...")
);

bot.launch(() => {
  console.log("O Bot está operacional.");
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
