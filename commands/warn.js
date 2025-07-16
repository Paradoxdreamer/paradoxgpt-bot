const fs = require("fs");
const path = "./lib/warns.json";

module.exports = {
  name: "warn",
  async execute({ m, sock, args }) {
    const id = m.key.remoteJid;
    const target = m.message.extendedTextMessage?.contextInfo?.participant;
    if (!target) return sock.sendMessage(id, { text: "Tag the user to warn." }, { quoted: m });

    const reason = args.slice(1).join(" ") || "No reason given";
    const warns = JSON.parse(fs.readFileSync(path, "utf-8"));

    if (!warns[target]) warns[target] = 0;
    warns[target] += 1;

    if (warns[target] >= 3) {
      await sock.sendMessage(id, {
        text: `⚠️ @${target.split("@")[0]} has received 3 warnings and will be *banned*.`,
        mentions: [target]
      }, { quoted: m });

      // Optional: integrate with .ban system
      const banned = JSON.parse(fs.readFileSync("./lib/banned.json", "utf-8"));
      banned[target] = true;
      fs.writeFileSync("./lib/banned.json", JSON.stringify(banned, null, 2));

      warns[target] = 0;
    } else {
      await sock.sendMessage(id, {
        text: `⚠️ Warned @${target.split("@")[0]} (${warns[target]}/3) — Reason: ${reason}`,
        mentions: [target]
      }, { quoted: m });
    }

    fs.writeFileSync(path, JSON.stringify(warns, null, 2));
  }
};