const fs = require("fs");
const path = "./lib/warns.json";

module.exports = {
  name: "resetwarn",
  async execute({ m, sock }) {
    const id = m.key.remoteJid;
    const target = m.message.extendedTextMessage?.contextInfo?.participant;
    if (!target) return sock.sendMessage(id, { text: "Tag the user to reset their warns." }, { quoted: m });

    const warns = JSON.parse(fs.readFileSync(path, "utf-8"));
    warns[target] = 0;
    fs.writeFileSync(path, JSON.stringify(warns, null, 2));

    await sock.sendMessage(id, {
      text: `✅ Warnings reset for @${target.split("@")[0]}.`,
      mentions: [target]
    }, { quoted: m });
  }
};