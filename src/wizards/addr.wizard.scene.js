import { Scenes, Composer, Markup } from "telegraf";
import axios from "axios";
import federativeUnits from "../helpers/federative.units.js";
import dataSchema from "../helpers/data.validation.js";

// Selecionar o Estado
const selectState = new Composer();

selectState.action(/[A-Z]{2}/, async (ctx) => {
  await ctx.editMessageReplyMarkup({ reply_markup: null });
  ctx.wizard.state.federativeUnit = ctx.match[0];
  await ctx.reply("Qual nome da cidade?");
  ctx.wizard.next();
});

selectState.use(async (ctx) => {
  await ctx.reply("❌ Dados inválidos. Selecione um estado da lista.");
});

// Teclado para confirmar a busca na api
const confirmation = Markup.inlineKeyboard([
  Markup.button.callback("✅ Sim", "s"),
  Markup.button.callback("❌ Não", "n"),
]);

// Se o usuário escolheu "sim"
const confirmSearch = new Composer();

confirmSearch.action("s", async (ctx) => {
  await ctx.editMessageReplyMarkup();

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
    await ctx.scene.leave();
  }

  try {
    const { data } = await axios.get(
      `https://viacep.com.br/ws/${federativeUnit}/${city}/${street}/json/`
    );

    ctx.wizard.state.response = data;

    if (ctx.wizard.state.response.length >= 1) {
      if (ctx.wizard.state.response.length === 1) {
        await ctx.replyWithHTML(
          `O CEP para o endereço indicado é <strong><code>${ctx.wizard.state.response[0].cep}</code></strong>`
        );
        await ctx.reply(`👋 Até logo`);
        await tx.scene.leave();
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
        ctx.wizard.next();
      }
    } else {
      await ctx.reply(
        "❌ Apesar dos dados serem válidos, o sistema não conseguiu localizar o CEP do endereço informado."
      );
    }
  } catch (error) {
    console.error(error);
    await ctx.reply(
      "Ops! Algo deu errado com sua consulta. Confira os dados e tente de novo, por favor."
    );
  }
});

// Se o usuario escolheu "não"
confirmSearch.action("n", async (ctx) => {
  await ctx.editMessageReplyMarkup();
  await ctx.reply(
    `${ctx.update.callback_query.from.first_name}, a operação foi cancelada com sucesso.`
  );
  await ctx.scene.leave();
});

const chooseResult = new Composer();

chooseResult.action(/\d{5}-\d{3}/, async (ctx) => {
  await ctx.editMessageReplyMarkup();
  await ctx.replyWithHTML(
    `O CEP para o endereço indicado é <strong><code>${ctx.match[0]}</code></strong>`
  );
  await ctx.reply(`👋 Até logo`);
  await ctx.scene.leave();
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
    ctx.wizard.next();
  },
  selectState,
  async (ctx) => {
    ctx.wizard.state.city = ctx.message.text;
    await ctx.reply("Qual nome da rua?");
    ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.street = ctx.message.text;
    const { federativeUnit, city, street } = ctx.wizard.state;
    await ctx.reply(
      `Você deseja realizar a busca do cep da rua ${street} - ${city}/${federativeUnit}?`,
      confirmation
    );
    ctx.wizard.next();
  },
  confirmSearch,
  chooseResult
);

addrWizardScene.command("sair", async (ctx) => {
  await ctx.reply(`👋 Até logo`);
  await ctx.scene.leave();
});

export default addrWizardScene;
