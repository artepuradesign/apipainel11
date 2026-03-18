// cpf-check.js

const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const input = require("input");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ================= CONFIG =================
const apiId = 25531373;
const apiHash = "b4351e2d05023dbc2b0929e17f721525";
const stringSession = new StringSession("1AQAOMTQ5LjE1NC4xNzUuNTkBu3KZRw/EaV8PyeoMhYKOwjwGhB8Y/OlZqbs7XeZtF4+vmPbv6EtnXrFmDxnecCW0k7NC9qGHj0joNLoZRrMmEkzLmYhRH9pozIwskdMVNado0YcBR8jCUGDpj/WN+7gqyQZdEQwgM7M/1JA/vFSTlT/n+6hsnOs9vZNcI7RXyELJtE6pltpf/Cxj4atTj6+PMXPLpU+GFbxXDdKprJN9luwyARZLpruxG1SuFWhFY/JLjv9cj/o3v1avCANArkn+jREZa7V5sGiBk3oJKdynGsYmNaBkz6itzI3ne9UkDlc2XGxvqmEm+dUQBcB2ysjHi3ns1foYD/q5/ZaHqli8dvU=");
const TARGET_GROUP = "paineljsisis";
const RESULT_BOT = "FindexGrupo_Bot";
const N8N_WEBHOOK = "https://n8n.apipainel.com.br/webhook/telegram";

// Log file - usar /tmp para evitar problemas de permissão quando executado pelo PHP
const LOG_FILE = path.join(os.tmpdir(), "cpf-check-debug.log");
// =========================================

function log(msg, data = "") {
  const line =
    `[${new Date().toISOString()}] ${msg} ` +
    (data ? JSON.stringify(data) : "") +
    "\n";
  try {
    fs.appendFileSync(LOG_FILE, line);
  } catch (e) {
    // Ignora erro de escrita no log para não travar o script
  }
  console.log(msg, data || "");
}

let cpfAtual = null;
let linkAberto = false;
let enviado = false;

// Timeout de segurança: encerrar após 60s para não travar o PHP
const TIMEOUT_MS = 60000;
setTimeout(() => {
  log("⏰ Timeout atingido, encerrando...");
  process.exit(1);
}, TIMEOUT_MS);

(async () => {
  log("🚀 Iniciando Telegram");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => input.text("Telefone: "),
    password: async () => input.text("Senha 2FA: "),
    phoneCode: async () => input.text("Código: "),
  });

  log("✅ Logado");

  cpfAtual = process.argv[2];
  if (!cpfAtual) {
    log("❌ CPF não informado");
    process.exit(1);
  }

  await client.sendMessage(TARGET_GROUP, {
    message: `/cpf ${cpfAtual}`,
  });

  log("📤 CPF enviado", cpfAtual);

  client.addEventHandler(
    async (event) => {
      const msg = event.message;
      if (!msg) return;

      const sender = await msg.getSender();
      if (!sender) return;

      log("📩 Mensagem", {
        from: sender.username,
        text: msg.message,
      });

      // ====== BOT PRINCIPAL ======
      if (sender.username === RESULT_BOT && msg.buttons?.length && !linkAberto) {
        for (const row of msg.buttons) {
          for (const btn of row) {
            log("🔍 Botão", { text: btn.text, url: btn.url });

            if (
              btn.text?.toLowerCase().includes("abrir resultado") &&
              btn.url
            ) {
              linkAberto = true;
              log("🌐 Abrindo link do botão", btn.url);

              if (
                btn.text?.toLowerCase().includes("abrir resultado") &&
                btn.url &&
                btn.url.includes("https://api.fdxapis.us/temp/")
              ) {
                log("🔗 LINK FINAL (direto do botão)", btn.url);

                try {
                  log("📡 Enviando ao n8n", {
                    cpf: cpfAtual,
                    link: btn.url,
                  });

                  const res = await axios.post(
                    N8N_WEBHOOK,
                    {
                      cpf: cpfAtual,
                      link: btn.url,
                      origem: "telegram-findex",
                    },
                    {
                      headers: { "Content-Type": "application/json" },
                      timeout: 10000,
                    }
                  );

                  log("✅ n8n OK", res.status);
                  process.exit(0);
                } catch (err) {
                  log("❌ ERRO n8n", {
                    msg: err.message,
                    status: err.response?.status,
                    data: err.response?.data,
                  });
                  process.exit(1);
                }
              }
            }
          }
        }
      }

      // ====== LINK FINAL ======
      if (
        !enviado &&
        msg.message &&
        msg.message.includes("https://api.fdxapis.us/temp/")
      ) {
        const match = msg.message.match(
          /https?:\/\/api\.fdxapis\.us\/temp\/[A-Za-z0-9\-]+/
        );
        if (!match) return;

        const link = match[0];
        enviado = true;
        log("🔗 LINK FINAL", link);

        try {
          log("📡 Enviando ao n8n");

          const res = await axios.post(
            N8N_WEBHOOK,
            {
              cpf: cpfAtual,
              link: link,
              origem: "telegram-findex",
            },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 10000,
            }
          );

          log("✅ n8n OK", res.status);
          process.exit(0);
        } catch (err) {
          log("❌ ERRO n8n", {
            msg: err.message,
            status: err.response?.status,
            data: err.response?.data,
          });
          process.exit(1);
        }
      }
    },
    new NewMessage()
  );
})();
