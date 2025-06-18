import { Scenes, Composer, Markup } from "telegraf";
import axios from "axios";

const searchZipCodeStep = new Composer();

searchZipCodeStep.hears(/\d{5}-?\d{3}/, async (ctx) => {
  const input = ctx.match[0];
  const zipCode = input.replace(/\D/g, "");
  const userName = ctx.update.message.from.first_name;

  try {
    const { data } = await axios.get(
      `https://viacep.com.br/ws/${zipCode}/json/`
    );

    if (data.erro) {
      await ctx.reply(
        `Hmm... ${userName}, esse CEP parece estar no formato certo, mas não encontramos ele. 🧐`
      );
      await ctx.reply(
        `Use:\n` + `/cep - Buscar por CEP\n` + `/addr - Buscar por endereço`
      );
      return ctx.scene.leave();
    } else {
      let address = `${data.logradouro}`;

      if (data.complemento) {
        address += ` - ${data.complemento}`;
      }

      address += `, ${data.bairro} - ${data.localidade}/${data.uf}`;

      await ctx.replyWithHTML(
        `🔍 Resultados encontrados para o CEP <b>${data.cep}</b>:\n\n<code>${address}</code>`
      );
      return ctx.wizard.next();
    }
  } catch (error) {
    await ctx.reply(
      `${userName}, algo deu errado, mas não se preocupe - não é culpa sua. Tente novamente mais tarde, por favor.`
    );
    return ctx.scene.leave();
  }
});

searchZipCodeStep.use(async (ctx) => await ctx.reply("❌ CEP inválido."));

const zipCodeWizardScene = new Scenes.WizardScene(
  "cep",
  (ctx) => {
    ctx.reply(
      "📮 Informe o CEP que deseja consultar ou /sair para cancelar a operação."
    );
    ctx.wizard.next();
  },
  searchZipCodeStep,
);

zipCodeWizardScene.command("sair", async (ctx) => {
  await ctx.reply(`👋 Até logo`);
  return ctx.scene.leave();
});

export default zipCodeWizardScene;
