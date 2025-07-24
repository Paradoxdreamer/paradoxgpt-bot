const { default: makeWASocket, usemultifileAuthState } = require('@adiwajshing/baileys'); const qrcode = require('qrcode-terminal'); const fs = require("fs"); const path = require("path");

const { state, saveState } = usemultiFileAuthState('./auth_info.json');

const BOT_NAME = process.env.BOT_NAME || 'ParadoxGPT'; const PREFIX = process.env.PREFIX || '.'; const OWNER = process.env.OWNER_NUMBER; const BOT_IMAGE_URL = process.env.BOT_IMAGE_URL || "https://i.imgur.com/YOUR_IMAGE_ID.jpg";

async function startBot() { const sock = makeWASocket({ auth: state, printQRInTerminal: false });

// Load event handlers
const eventsPath = path.join(__dirname, "events");
try {
    if (!fs.existsSync(eventsPath)) {
        fs.mkdirSync(eventsPath, { recursive: true });
        console.log("ℹ️ Created events directory");

        const sampleEvents = {
            'connection.update.js': `module.exports = async function(sock, update) {
const { connection, qr } = update;
if (qr) require('qrcode-terminal').generate(qr, { small: true });
if (connection === 'open') {
    console.log(\`✅ Connected as \${sock.user.id.split(':')[0]}\`);
    console.log(\`\${process.env.BOT_NAME || 'Bot'} is online.\`);

    try {
        await sock.updateProfilePicture(sock.user.id, { 
            url: process.env.BOT_IMAGE_URL || "https://i.imgur.com/YOUR_IMAGE_ID.jpg" 
        });
        console.log("🔄 Updated bot profile picture successfully");
    } catch (err) {
        console.error("⚠️ Failed to update profile picture:", err.message);
    }
}

if (update.connection === "close") {
    console.log("🔌 Connection closed, reconnecting...");
    require('../index.js').startBot();
}

};, 'messages.upsert.js': module.exports = async function(sock, { messages }, { commands, settings, PREFIX, OWNER, BOT_NAME }) { const msg = messages[0]; if (!msg.message || msg.key.fromMe) return;

const jid = msg.key.remoteJid;
const sender = msg.key.participant || msg.key.remoteJid;
const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

if (settings.banned.includes(sender.split('@')[0]) || settings.banned.includes(sender)) {
    console.log(\`🚫 Blocked banned user: \${sender}\`);
    return;
}

if (settings.antilink?.[jid] && /(https?:\/\/|www\.|wa\.me|chat\.whatsapp\.com)/i.test(text)) {
    await sock.sendMessage(jid, {
        text: \`🚫 Link detected. \${BOT_NAME} is kicking violators.\`,
        mentions: [sender]
    });
    if (jid.endsWith('@g.us')) {
        await sock.groupParticipantsUpdate(jid, [sender], 'remove');
    }
    return;
}

const scamWords = ["crypto", "investment", "binance", "return", "earn money", "airdrop", "free money"];
if (settings.antism?.[jid] && scamWords.some(word => text.toLowerCase().includes(word))) {
    await sock.sendMessage(jid, {
        text: "⚠️ Suspicious text detected. Message blocked,",
        mentions: [sender]
    });
    return;
}

if (!text.startsWith(PREFIX)) return;

const [cmdName, ...args] = text.slice(PREFIX.length).trim().split(/\s+/);
const command = commands.get(cmdName.toLowerCase());
if (!command) return;

if (command.ownerOnly && sender !== OWNER) {
    await sock.sendMessage(jid, { 
        text: "⛔ This command is restricted to the PARADOX DREAMER only!"
    });
    return;
}

await command.execute({ sock, msg, args, settings });

};, 'group-participants.update.js': module.exports = async function(sock, update) { const id = update.id; if (!id.endsWith('@g.us')) return;

const welcomeData = require('fs').existsSync("./lib/welcome.json") ? 
    JSON.parse(require('fs').readFileSync("./lib/welcome.json", "utf-8")) : 
    { enabled: {}, messages: {} };

const leaveData = require('fs').existsSync("./lib/leave.json") ? 
    JSON.parse(require('fs').readFileSync("./lib/leave.json", "utf-8")) : 
    { enabled: {}, messages: {} };

const metadata = await sock.groupMetadata(id);
const groupName = metadata.subject;

for (const user of update.participants) {
    const date = new Date().toLocaleString("en-US", { 
        timeZone: "Africa/Lagos",
        dateStyle: "medium",
        timeStyle: "short"
    });

    if (update.action === "add" && welcomeData.enabled?.[id]) {
        const msg = (welcomeData.messages?.[id] || 
                    "Welcome @user to @group on @date.")
            .replace(/@user/g, `@${user.split("@")[0]}`)
            .replace(/@group/g, groupName)
            .replace(/@date/g, date);
        await sock.sendMessage(id, { text: msg, mentions: [user] });
    }

    if (update.action === "remove" && leaveData.enabled?.[id]) {
        const msg = (leaveData.messages?.[id] || 
                   "Goodbye @user, may your journey be dark and long.")
            .replace(/@user/g, `@${user.split("@")[0]}`)
            .replace(/@group/g, groupName)
            .replace(/@date/g, date);
        await sock.sendMessage(id, { text: msg });
    }
}

};` };

for (const [fileName, content] of Object.entries(sampleEvents)) {
            fs.writeFileSync(path.join(eventsPath, fileName), content);
        }
    }

    fs.readdirSync(eventsPath).forEach((file) => {
        if (!file.endsWith('.js')) return;

        const event = require(path.join(eventsPath, file));
        const eventName = file.split('.')[0];

        if (typeof event === "function") {
            sock.ev.on(eventName, async (update) => {
                try {
                    await event(sock, update, { 
                        commands, 
                        settings, 
                        PREFIX, 
                        OWNER, 
                        BOT_NAME 
                    });
                } catch (err) {
                    console.error(`⚠️ Error in ${eventName} handler:`, err);
                }
            });
            console.log(`🔌 Loaded event handler: ${eventName}`);
        }
    });
} catch (err) {
    console.error("⚠️ Failed to load events:", err);
}

const commands = new Map();
try {
    const commandFiles = fs.readdirSync('./commands')
        .filter(file => file.endsWith('.js') && !file.startsWith('_'));

    for (const file of commandFiles) {
        const command = require(path.join(__dirname, 'commands', file));
        commands.set(command.name.toLowerCase(), command);
    }
    console.log(`🔧 Loaded ${commands.size} commands`);
} catch (err) {
    console.error("❌ Failed to load commands:", err);
}

const settingsPath = './lib/settings.json';
let settings = { antilink: {}, antism: {}, banned: [] };

try {
    if (fs.existsSync(settingsPath)) {
        settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    } else {
        fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    }
} catch (err) {
    console.error("⚠️ Settings error, using defaults:", err);
}

process.on('uncaughtException', (err) => {
    console.error('⚠️ Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('⚠️ Unhandled Rejection:', err);
});

console.log(`🚀 Starting ${BOT_NAME}...`);

}

async function startWithRetry() { try { await startBot(); } catch (err) { console.error("❌ Initialization failed:", err); console.log("🔄 Retrying in 5 seconds..."); setTimeout(startWithRetry, 5000); } }

startWithRetry();

