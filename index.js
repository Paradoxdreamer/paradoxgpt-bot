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

  // Load all commands
  const commands = new Map();
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'commands', file));
    commands.set(command.name, command);
  }

  // Load settings or create default
  const settingsPath = './lib/settings.json';
  let settings = {};
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  } catch {
    settings = { antilink: {}, antism: {}, banned: [] };
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  }

  // Handle messages
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    // Check banned users
    if (settings.banned.includes(sender)) return;

    // Antilink
    if (settings.antilink?.[jid] && /(https?:\/\/|wa\.me|chat\.whatsapp\.com)/gi.test(text)) {
      await sock.sendMessage(jid, {
        text: `🚫 Link detected. ${BOT_NAME} is kicking violators.`,
        mentions: [sender]
      });
      await sock.groupParticipantsUpdate(jid, [sender], 'remove');
      return;
    }

    // Antism
    const scamWords = ["crypto", "investment", "binance", "return", "earn money", "airdrop"];
    if (settings.antism?.[jid] && scamWords.some(word => text.toLowerCase().includes(word))) {
      await sock.sendMessage(jid, {
        text: `⚠️ Suspicious text detected. Message blocked.`,
        mentions: [sender]
      });
      return;
    }

    // Commands
    if (!text.startsWith(PREFIX)) return;
    const [cmdName, ...args] = text.slice(PREFIX.length).split(/\s+/);
    const command = commands.get(cmdName.toLowerCase());
    if (!command) return;

    try {
      await command.execute({ sock, msg, args });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(jid, { text: `⚠️ Error executing ${cmdName}` });
    }
  });

  // Handle welcome/leave messages
  sock.ev.on("group-participants.update", async (update) => {
    const id = update.id;
    const welcomeData = JSON.parse(fs.readFileSync("./lib/welcome.json", "utf-8"));
    const leaveData = JSON.parse(fs.readFileSync("./lib/leave.json", "utf-8"));

    const metadata = await sock.groupMetadata(id);
    const groupName = metadata.subject;

    for (const user of update.participants) {
      const date = new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" });

      if (update.action === "add" && welcomeData.enabled?.[id]) {
        const msg = (welcomeData.messages?.[id] || "Welcome @user to @group on @date.")
          .replace(/@user/g, `@${user.split("@")[0]}`)
          .replace(/@group/g, groupName)
          .replace(/@date/g, date);
        await sock.sendMessage(id, { text: msg, mentions: [user] });
      }

      if (update.action === "remove" && leaveData.enabled?.[id]) {
        const msg = (leaveData.messages?.[id] || "Goodbye @user, may your journey be dark and long.")
          .replace(/@user/g, `@${user.split("@")[0]}`)
          .replace(/@group/g, groupName)
          .replace(/@date/g, date);
        await sock.sendMessage(id, { text: msg });
      }
    }
  });
}

// 🧠 THE FINAL RITUAL THAT BREATHES LIFE INTO THE CODE
startBot();