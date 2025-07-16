const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

const BOT_NAME = process.env.BOT_NAME || 'ParadoxGPT';
const PREFIX = process.env.PREFIX || '.';
const OWNER = process.env.OWNER_NUMBER;

async function startBot() {
  const sock = makeWASocket({ auth: state });
  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update;
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === 'open') {
      console.log(`✅ Connected as ${sock.user.id.split(':')[0]}`);
      console.log(`${BOT_NAME} is online.`);
    }
  });

  // Load commands
  const commands = new Map();
  const files = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
  for (const file of files) {
    const cmd = require(path.join(__dirname, 'commands', file));
    commands.set(cmd.name, cmd);
  }

  // Handle messages
  sock.ev.on('messages.upsert', async m => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe || !msg.key.remoteJid.endsWith('@g.us')) return;

    const jid = msg.key.remoteJid;
    const sender = msg.key.participant;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    // 🔒 Load settings
    const settingsPath = './lib/settings.json';
    let settings = {};
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath));
    } catch {
      settings = { antilink: {}, antism: {} };
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    }

    // 🕸️ Antilink
    if (settings.antilink?.[jid] && /(https?:\/\/|wa\.me|chat\.whatsapp\.com)/gi.test(text)) {
      await sock.sendMessage(jid, {
        text: `🚫 Link detected. ${BOT_NAME} is kicking violators.`,
        mentions: [sender]
      });
      await sock.groupParticipantsUpdate(jid, [sender], 'remove');
      return;
    }

    // 🧹 Antism
    const scamWords = ["crypto", "investment", "binance", "return", "earn money", "airdrop"];
    if (settings.antism?.[jid] && scamWords.some(w => text.toLowerCase().includes(w))) {
      await sock.sendMessage(jid, {
        text: `⚠️ Suspicious text detected. That’s not allowed here.`,
        mentions: [sender]
      });
      return;
    }

    // ✅ Handle commands
    if (!text.startsWith(PREFIX)) return;
    const [cmdName, ...args] = text.slice(PREFIX.length).split(/\s+/);
    const cmd = commands.get(cmdName);
    if (!cmd) return;

    try {
      await cmd.execute({ sock, msg, args });
    } catch (e) {
      console.error(e);
      await sock.sendMessage(jid, { text: `⚠️ Error running ${cmdName}` });
    }
  });
}

// 🚀 THIS is what makes the bot **actually launch**
startBot();