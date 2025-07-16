const fs = require("fs");
const data = JSON.parse(fs.readFileSync("./lib/reactions.json", "utf-8"));

module.exports = {
  name: "react",
  event: "message",
  async run({ m, sock }) {
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    for (const entry of data) {
      if (text.toLowerCase().includes(entry.trigger.toLowerCase())) {
        const resText = entry.response.replace("@user", `@${sender.split("@")[0]}`);
        await sock.sendMessage(from, {
          text: resText,
          mentions: [sender]
        }, { quoted: m });

        // Optionally send a sticker or emoji here
        // await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: m });

        break;
      }
    }
  }
};