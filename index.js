const { default: makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion, makeInMemoryStore } = require("@whiskeysockets/baileys");
const P = require("pino");
const fs = require("fs");
const path = require("path");
const { Boom } = require("@hapi/boom");
const handler = require("./handler"); // Your main message handler
const axios = require("axios");

const { state, saveState } = useSingleFileAuthState("./auth_info.json");

const store = makeInMemoryStore({ logger: P().child({ level: "silent", stream: "store" }) });
store.readFromFile("./baileys_store.json");
setInterval(() => {
  store.writeToFile("./baileys_store.json");
}, 10000);

async function connect() {
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    logger: P({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    browser: ["ParadoxGPT", "Safari", "1.0.0"],
    generateHighQualityLinkPreview: true
  });

  store.bind(sock.ev);

  sock.ev.on("creds.update", saveState);

  // Load bot profile picture from URL
  const botPicUrl = "https://your-url-here.com/botpic.jpg"; // ⬅️ Your image URL here
  try {
    const res = await axios.get(botPicUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(res.data, "binary");
    await sock.updateProfilePicture(sock.user.id, imageBuffer);
    console.log("✅ Bot profile picture updated.");
  } catch (err) {
    console.log("⚠️ Failed to set bot profile picture:", err.message);
  }

  // Listen to messages
  sock.ev.on("messages.upsert", async (msg) => {
    try {
      await handler(sock, msg); // handler.js takes care of routing
    } catch (err) {
      console.error("❌ Handler error:", err);
    }
  });

  // Reconnect logic
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log("Reconnecting...");
        connect();
      } else {
        console.log("Logged out.");
      }
    } else if (connection === "open") {
      console.log("✅ Connected as", sock.user.id);
    }
  });
}

connect();