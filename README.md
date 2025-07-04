# 🤖 [@TeleCEP](https://telegram.me/TeleCepBot) 

Chatbot para consultas de CEPs, feito com JavaScript usando o [Telegraf.js](https://telegraf.js.org/). O bot está integrado à API [ViaCEP](https://viacep.com.br/), permitindo buscar endereços por CEP e vice-versa de forma rápida e prática. 

## ✨ Funcionalidades

* 🔍 Consulta de endereços a partir de um CEP.
* 🧭 Busca de CEPs com base em informações de endereço (UF, cidade e logradouro).

## 🚀 Comandos Disponíveis

| **Comandos** |                   **Descrição**                  |
|:------------:|--------------------------------------------------|
|   _/start_   | Inicia a conversa com o bot.                                   |
|    _/help_   | Exibe instruções de como obter suporte.       |
|   _/about_   | Informações sobre o projeto e o desenvolvedor. |
|    _/cep_    | Consulta um endereço a partir de um número de CEP.      |
|    _/addr_   | Busca possíveis CEPs a partir de um endereço.    |

## 📦 Como Executar

1. Clone o repositório:

```bash
git clone https://github.com/vilelacc/TeleCep.git
cd TeleCep
```

2. Instale as dependências:
```bash
npm i
```

3. Crie um arquivo ``.env ``com seu token do Telegram:

```bash
BOT_TOKEN=seu_token_aqui
```
> [!IMPORTANT]  
> Inicie uma conversa com o [@BotFather](https://telegram.me/BotFather) para obter o  token do seu bot.

4. Execute o bot:

```bash
npm start
```
<p align="center">Made with 💙</p>
