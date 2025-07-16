const fs = require("fs");
const banList = require("../lib/banList.json");

module.exports = {
  name: "unban",
  description: "Free a previously banned user",
  async execute({ m, sock }) {
    const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!target) {
      return sock.sendMessage(m.key.remoteJid, { text: "Tag someone to free. Who’s getting mercy today?" }, { quoted: m });
    }

    if (!banList.banned.includes(target)) {
      return sock.sendMessage(m.key.remoteJid, { text: "They're not even banned... chill." }, { quoted: m });
    }

    banList.banned = banList.banned.filter(jid => jid !== target);
    fs.writeFileSync("./lib/banList.json", JSON.stringify(banList, null, 2));
    sock.sendMessage(m.key.remoteJid, { text: `@${target.split("@")[0]} has been **forgiven.**`, mentions: [target] }, { quoted: m });
  }
};