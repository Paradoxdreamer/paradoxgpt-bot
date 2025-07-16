const isBanned = require("../middleware/checkBan");

module.exports = {
  name: "yourcommand",
  description: "Describe the command, genius.",
  async execute({ m, sock, args }) {
    if (isBanned(m.key.participant)) {
      return sock.sendMessage(m.key.remoteJid, {
        text: "You're banned from speaking to the Paradox Lord. 🧱",
      }, { quoted: m });
    }

    // Your command logic goes here
    sock.sendMessage(m.key.remoteJid, { text: "Command executed." }, { quoted: m });
  }
};