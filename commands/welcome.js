const fs = require("fs");

module.exports = {
  name: "welcome",
  async execute({ m, sock, args }) {
    const id = m.key.remoteJid;
    const data = JSON.parse(fs.readFileSync("./lib/welcome.json", "utf-8"));
    if (!data.enabled) data.enabled = {};

    if (args[0] === "on") {
      data.enabled[id] = true;
      await sock.sendMessage(id, { text: "👋 Welcome messages *enabled*." });
    } else if (args[0] === "off") {
      data.enabled[id] = false;
      await sock.sendMessage(id, { text: "❌ Welcome messages *disabled*." });
    } else {
      await sock.sendMessage(id, { text: "Usage: .welcome on/off" });
    }

    fs.writeFileSync("./lib/welcome.json", JSON.stringify(data, null, 2));
  }
};