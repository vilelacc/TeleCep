import { Telegraf, Scenes, session } from "telegraf";

import zipCodeWizardScene from "./wizards/zip.code.wizard.scene.js";
import addrWizardScene from "./wizards/addr.wizard.scene.js";

import { readFileSync } from "fs";

const token = process.env.BOT_TOKEN;

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url))
);

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
bot.command("cep", async (ctx) => {
  await ctx.scene.enter("cep");
});

bot.command("addr", async (ctx) => {
  await ctx.scene.enter("addr");
});

bot.command("about", async (ctx) => {
  await ctx.reply(
    `🤖 Bot\nNome: TeleCEP\nUsername: @TeleCepBot\nVersão: ${pkg.version}\n\n👤 Desenvolvedor\nNome: ${pkg.author}\nLinkedin: https://www.linkedin.com/in/vilelacc/`
  );
});

bot.command("help", async (ctx) => {
  await ctx.replyWithHTML(
    `<b>🛠 Ajuda & Suporte</b>\n\n` +
      `🐞 Encontrou um bug ou tem alguma sugestão?\n` +
      `Abra uma <a href="${pkg.bugs.url}">issue no GitHub</a> para que possamos melhorar o bot!`
  );
});

bot.start(async (ctx) => {
  const nameUser = ctx.update.message.from.first_name;

  await ctx.reply(
    `E aí, ${nameUser}! 👋 Tudo certo?\n\nVocê pode me controlar enviando estes comandos:\n\n📬 CEP:\n/cep - Buscar por CEP\n/addr - Buscar por endereço\n\n🆘 Ajuda & Suporte:\n/help - Orientações de contato\n/about - Sobre este projeto\n\n🔥Boas-vindas:\n/start - Iniciar o bot`
  );
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
