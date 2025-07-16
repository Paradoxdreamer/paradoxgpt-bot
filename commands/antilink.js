const fs = require("fs");
const path = "./lib/settings.json";

module.exports = {
  name: "antilink",
  async execute({ m, sock, args }) {
    const id = m.key.remoteJid;
    if (!id.endsWith("@g.us")) return;

    const settings = JSON.parse(fs.readFileSync(path, "utf-8"));
    if (!settings.antilink) settings.antilink = {};

    const arg = args[0];
    if (arg === "on") {
      settings.antilink[id] = true;
      await sock.sendMessage(id, { text: `🛡️ Antilink enabled.` });
    } else if (arg === "off") {
      settings.antilink[id] = false;
      await sock.sendMessage(id, { text: `❌ Antilink disabled.` });
    } else {
      await sock.sendMessage(id, { text: `Usage: .antilink on/off` });
    }

    fs.writeFileSync(path, JSON.stringify(settings, null, 2));
  }
};