import { Scenes, Composer, Markup } from "telegraf";
import federativeUnits from "../helpers/federative.units.js";
import dataSchema from "../helpers/data.validation.js";
import searchByAddress from "../helpers/search.by.address.js";

// Selecionar o Estado
const selectState = new Composer();

selectState.action(/[A-Z]{2}/, async (ctx) => {
  await ctx.editMessageReplyMarkup({ reply_markup: null });
  ctx.wizard.state.federativeUnit = ctx.match[0].toLocaleLowerCase();
  await ctx.reply("Qual nome da cidade?");
  return ctx.wizard.next();
});

selectState.use(async (ctx) => {
  await ctx.reply("❌ Dados inválidos. Selecione um estado da lista.");
});

const chooseResult = new Composer();

chooseResult.action(/\d{5}-\d{3}/, async (ctx) => {
  await ctx.editMessageReplyMarkup();
  await ctx.replyWithHTML(
    `O CEP para o endereço indicado é <strong><code>${ctx.match[0]}</code></strong>`
  );
  await ctx.reply(`👋 Até logo`);
  return await ctx.scene.leave();
});

chooseResult.use(async (ctx) => {
  await ctx.reply("❌ Dados inválidos. Selecione um resultado da lista.");
});

// Conversa principal
const addrWizardScene = new Scenes.WizardScene(
  "addr",
  async (ctx) => {
    await ctx.reply(
      "📍 Selecione o estado ou /sair para cancelar a operação.",
      Markup.inlineKeyboard(
        federativeUnits.map((item) =>
          Markup.button.callback(item.name, item.federativeUnit)
        ),
        { columns: 2 }
      )
    );
    return ctx.wizard.next();
  },
  selectState,
  async (ctx) => {
    ctx.wizard.state.city = ctx.message.text.toLocaleLowerCase();
    await ctx.reply("Qual nome da rua?");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.street = ctx.message.text.toLocaleLowerCase();
    // pegando os valores fornecidos pelo usuário
    const { federativeUnit, city, street } = ctx.wizard.state;

    // validando as informações passadas pelo usuário
    const validationResult = dataSchema.validate({
      city,
      street,
      federativeUnit,
    });

    if (validationResult.error) {
      console.error(`ERRO: ${validationResult.error.message}`);
      await ctx.reply(
        `❌ A consulta foi cancelada devido ao envio de dados inválidos.`
      );
      return await ctx.scene.leave();
    }

    try {
      const data  = await searchByAddress(federativeUnit, city, street)
      ctx.wizard.state.response = data;

      // busca feita com sucesso, mas sem resultados
      if (ctx.wizard.state.response.length === 0) {
        await ctx.reply(
          "Ops! Algo deu errado com sua consulta. Confira os dados e tente de novo, por favor."
        );
        return await ctx.scene.leave();
      } else if (ctx.wizard.state.response.length === 1) {
        await ctx.replyWithHTML(
          `O CEP para o endereço indicado é <strong><code>${ctx.wizard.state.response[0].cep}</code></strong>`
        );
        await ctx.reply(`👋 Até logo`);
        return await ctx.scene.leave();
      } else {
        await ctx.reply(
          "Escolha um dos resultados:",
          Markup.inlineKeyboard(
            ctx.wizard.state.response.map((object) =>
              Markup.button.callback(
                `${object.logradouro}, bairro ${object.bairro}`,
                object.cep
              )
            ),
            { columns: 1 }
          )
        );
        return ctx.wizard.next();
      }
    } catch (error) {
      console.error(error);
      await ctx.reply(
        "Ops! Algo deu errado com sua consulta. Confira os dados e tente de novo, por favor."
      );
      return await ctx.scene.leave();
    }
  },
  chooseResult
);

addrWizardScene.command("sair", async (ctx) => {
  await ctx.reply(`👋 Até logo`);
  return await ctx.scene.leave();
});

export default addrWizardScene;
