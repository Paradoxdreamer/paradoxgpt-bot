const fs = require("fs");
const path = "./lib/settings.json";

module.exports = {
  name: "antism",
  async execute({ m, sock, args }) {
    const id = m.key.remoteJid;
    if (!id.endsWith("@g.us")) return;

    const settings = JSON.parse(fs.readFileSync(path, "utf-8"));
    if (!settings.antism) settings.antism = {};

    const arg = args[0];
    if (arg === "on") {
      settings.antism[id] = true;
      await sock.sendMessage(id, { text: `🧹 Antiscam enabled.` });
    } else if (arg === "off") {
      settings.antism[id] = false;
      await sock.sendMessage(id, { text: `🔓 Antiscam disabled.` });
    } else {
      await sock.sendMessage(id, { text: `Usage: .antism on/off` });
    }

    fs.writeFileSync(path, JSON.stringify(settings, null, 2));
  }
};