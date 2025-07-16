const fs = require("fs");

module.exports = {
  name: "setleave",
  async execute({ m, sock, args }) {
    const id = m.key.remoteJid;
    const data = JSON.parse(fs.readFileSync("./lib/leave.json", "utf-8"));
    const text = args.join(" ");

    if (!text.includes("@user")) {
      return sock.sendMessage(id, { text: "Message must include @user" });
    }

    if (!data.messages) data.messages = {};
    data.messages[id] = text;

    fs.writeFileSync("./lib/leave.json", JSON.stringify(data, null, 2));
    await sock.sendMessage(id, { text: "✅ Custom leave message saved." });
  }
};