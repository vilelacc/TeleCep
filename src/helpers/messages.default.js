import { readFileSync } from "fs";

const pkg = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url))
);

const about = `🤖 Bot\nNome: TeleCEP\nUsername: @TeleCepBot\nVersão: ${pkg.version}\n\n👨‍💻 Desenvolvedor\nNome: ${pkg.author}\nLinkedin: <a href="https://www.linkedin.com/in/vilelacc/">@vilelacc</a>`;

const bugs =
  `🐞 Encontrou um bug ou tem alguma sugestão?\n` +
  `Abra uma <a href="${pkg.bugs.url}">issue no GitHub</a> para que possamos melhorar o bot!`;

export { about, bugs };
