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

  sock.ev.on('messages.upsert', async m => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe || !msg.key.remoteJid.endsWith('@g.us')) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!text.startsWith(PREFIX)) return;

    const [cmdName, ...args] = text.slice(PREFIX.length).split(/\s+/);
    const cmd = commands.get(cmdName);
    if (!cmd) return;

    try {
      await cmd.execute({ sock, msg, args });
    } catch (e) {
      console.error(e);
      await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ Error running ${cmdName}` });
    }
  });
}

startBot();
