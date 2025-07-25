const { default: makeWASocket, useMultiFileAuthState } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');
const fs = require("fs");
const path = require("path");

const { state, saveCreds: saveState } = await useMultiFileAuthState('./auth_info');

// ENV CONFIG
const BOT_NAME = process.env.BOT_NAME || 'ParadoxGPT';
const PREFIX = process.env.PREFIX || '.';
const OWNER = process.env.OWNER_NUMBER || '2340000000000'; // fallback
const BOT_IMAGE_URL = process.env.BOT_IMAGE_URL || "https://i.imgur.com/YOUR_IMAGE_ID.jpg";

// Default settings
const settingsPath = './lib/settings.json';
let settings = { antilink: {}, antism: {}, banned: [] };

if (fs.existsSync(settingsPath)) {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
} else {
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

// Commands Loader
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

// Bot Start
async function startBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    // EVENTS LOADER
    const eventsPath = path.join(__dirname, "events");

    if (!fs.existsSync(eventsPath)) {
        fs.mkdirSync(eventsPath, { recursive: true });
        console.log("ℹ️ Created events directory. Add your .js handlers.");
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

    // CONNECTION LOGGING
    sock.ev.on("connection.update", async (update) => {
        const { connection, qr } = update;

        if (qr) {
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            console.log(`✅ Connected as ${sock.user.id.split(':')[0]}`);
            try {
                await sock.updateProfilePicture(sock.user.id, {
                    url: BOT_IMAGE_URL
                });
                console.log("🔄 Bot profile picture updated.");
            } catch (err) {
                console.error("⚠️ Failed to update profile picture:", err.message);
            }
        }

        if (connection === 'close') {
            console.log("🔌 Connection closed. Reconnecting...");
            startWithRetry();
        }
    });

    sock.ev.on('creds.update', saveState);
    console.log(`🚀 ${BOT_NAME} started!`);
}

// Retry system
async function startWithRetry() {
    try {
        await startBot();
    } catch (err) {
        console.error("❌ Startup failed:", err);
        console.log("🔄 Retrying in 5s...");
        setTimeout(startWithRetry, 5000);
    }
}

// Error handling
process.on('uncaughtException', (err) => {
    console.error('⚠️ Uncaught Exception:', err);
});
process.on('unhandledRejection', (err) => {
    console.error('⚠️ Unhandled Rejection:', err);
});

startWithRetry();
