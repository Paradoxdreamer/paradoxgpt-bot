// handler.js — THE SOUL OF PARADOX GPT

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { serialize } = require("./lib/serializer");

// TEMP MEMORY: Scoped per chat
let tempMemory = {};

// COMMAND COOLDOWNS + ANTISPAM
let cooldowns = {};
let spamCounter = {};
let banned = {};

const COOLDOWN = 3000; // 3 sec
const SPAM_LIMIT = 5;
const BAN_DURATION = 60 * 60 * 1000; // 1 hour

module.exports = async function handler(sock, msg, store, commands, options = {}) {
  try {
    const m = await serialize(msg, sock);
    if (!m || !m.command) return;

    // OWNER ONLY
    if (commands[m.command]?.ownerOnly && !options.owner.includes(m.sender)) {
      return sock.sendMessage(m.chat, { text: "🚫 Only my Paradox Master may wield this." }, { quoted: m });
    }

    // BAN CHECK
    if (banned[m.sender]) {
      if (Date.now() < banned[m.sender]) return;
      else delete banned[m.sender];
    }

    // ANTI-SPAM
    cooldowns[m.sender] ??= 0;
    spamCounter[m.sender] ??= 0;

    if (Date.now() - cooldowns[m.sender] < COOLDOWN) {
      spamCounter[m.sender]++;
      if (spamCounter[m.sender] >= SPAM_LIMIT) {
        banned[m.sender] = Date.now() + BAN_DURATION;
        return sock.sendMessage(m.chat, { text: `🚫 @${m.sender.split("@")[0]} auto-banned for spam.` }, { quoted: m, mentions: [m.sender] });
      }
      return;
    }

    cooldowns[m.sender] = Date.now();
    spamCounter[m.sender] = 0;

    // TEMP MEMORY INIT
    tempMemory[m.chat] ??= {};

    // COMMAND EXECUTION
    if (commands[m.command]) {
      await commands[m.command].run({ sock, m, store, tempMemory });
    } else {
      // AI FALLBACK
      const response = await fallbackAI(m.body);
      if (response) {
        await sock.sendMessage(m.chat, { text: response }, { quoted: m });
      }
    }

    // LOG
    console.log(`[CMD] ${m.sender} => ${m.command}`);

  } catch (e) {
    console.error("Handler error:", e);
  }
};

// DYNAMIC PLUGIN LOADER
module.exports.loadPlugins = function () {
  const plugins = {};
  const pluginDir = path.join(__dirname, "commands");

  fs.readdirSync(pluginDir).forEach(file => {
    if (file.endsWith(".js")) {
      const command = require(path.join(pluginDir, file));
      plugins[command.name] = command;
    }
  });

  return plugins;
};

// BASIC AI FALLBACK SYSTEM
async function fallbackAI(text) {
  try {
    const res = await axios.post("https://api.paradoxgpt.fake/ask", { text });
    return res.data?.reply || null;
  } catch {
    return null;
  }
}

// View Once Nuker
module.exports.antiViewOnce = function (message) {
  if (message.message?.viewOnceMessage) {
    const actual = message.message.viewOnceMessage.message;
    message.message = actual;
    delete message.message.viewOnceMessage;
  }
  return message;
};

// Anti-delete
module.exports.antiDelete = async function (sock, msg) {
  try {
    if (msg.key?.remoteJid) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `🕵️ Message deleted by ${msg.key.participant.split("@")[0]}`,
      });
    }
  } catch (err) {
    console.error("Anti-delete error:", err);
  }
};