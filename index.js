require("dotenv").config();
const { default: makeWASocket, useMultiFileAuthState, makeInMemoryStore, fetchLatestBaileysVersion, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

const { loadCommands } = require("./lib/loader");
const handleMessage = require("./events/handler");

const PREFIX = process.env.PREFIX || ".";

const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const { version, isLatest } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    browser: ["ParadoxGPT", "Safari", "1.0"],
  });

  store.bind(sock.ev);

  // Load commands
  const commands = loadCommands("./commands");

  sock.ev.on("messages.upsert", async (update) => {
    try {
      const msg = update.messages[0];
      if (!msg.message || msg.key.fromMe) return;
      await handleMessage(sock, msg, { commands, PREFIX });
    } catch (err) {
      console.error("❌ Error in message handler:", err);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log("🌀 Reconnecting...");
        startBot();
      } else {
        console.log("🚪 Logged out");
      }
    } else if (connection === "open") {
      console.log("✅ Connected as", sock.user.id);
    }
  });
}

startBot();