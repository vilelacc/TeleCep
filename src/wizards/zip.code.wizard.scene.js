import { Scenes, Composer } from "telegraf";
import searchByZipCode from "../helpers/search.by.zip.code.js";

const searchZipCodeStep = new Composer();

searchZipCodeStep.hears(/\d{5}-?\d{3}/, async (ctx) => {
  const input = ctx.match[0];
  const zipCode = input.replace(/\D/g, "");
  const userName = ctx.update.message.from.first_name;

  try {
    const data = await searchByZipCode(zipCode);

    if (data.erro) {
      await ctx.reply(
        `Hmm... ${userName}, esse CEP parece estar no formato certo, mas não encontramos ele. 🧐`
      );
      return await ctx.scene.leave();
    } else {
      let address = `${data.logradouro}`;

      if (data.complemento) {
        address += ` - ${data.complemento}`;
      }

      address += `, ${data.bairro} - ${data.localidade}/${data.uf}`;

      await ctx.replyWithHTML(
        `<strong>Resultado encontrado para o CEP <b>${data.cep}</b></strong>:\n\n<strong>Endereço: </strong><code>${address}</code>\n\n<strong>Clique no endereço para copiá-lo facilmente!</strong>`
      );
      return await ctx.scene.leave();
    }
  } catch (error) {
    console.error(error.message);
    await ctx.reply(
      `${userName}, algo deu errado, mas não se preocupe - não é culpa sua. Tente novamente mais tarde, por favor.`
    );
    return await ctx.scene.leave();
  }
});

searchZipCodeStep.use(async (ctx) => await ctx.reply("❌ CEP inválido."));

const zipCodeWizardScene = new Scenes.WizardScene(
  "cep",
  (ctx) => {
    ctx.reply(
      "📮 Informe o CEP que deseja consultar ou /sair para cancelar a operação."
    );
    return ctx.wizard.next();
  },
  searchZipCodeStep
);

zipCodeWizardScene.command("sair", async (ctx) => {
  await ctx.reply(`👋 Até logo`);
  return await ctx.scene.leave();
});

export default zipCodeWizardScene;
