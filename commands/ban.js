const fs = require("fs");
const banList = require("../lib/banList.json");

module.exports = {
  name: "ban",
  description: "Ban a user from using the bot",
  async execute({ m, sock }) {
    const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!target) {
      return sock.sendMessage(m.key.remoteJid, { text: "Tag the user to ban, genius." }, { quoted: m });
    }

    if (banList.banned.includes(target)) {
      return sock.sendMessage(m.key.remoteJid, { text: "Already banned, noob." }, { quoted: m });
    }

    banList.banned.push(target);
    fs.writeFileSync("./lib/banList.json", JSON.stringify(banList, null, 2));
    sock.sendMessage(m.key.remoteJid, { text: `@${target.split("@")[0]} has been **exiled.**`, mentions: [target] }, { quoted: m });
  }
};