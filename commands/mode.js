const fs = require("fs");
const path = "./lib/mode.json";

module.exports = {
  name: "mode",
  description: "Set ParadoxGPT's mode (normal or chaotic)",
  async execute({ m, sock, args }) {
    const input = args[0]?.toLowerCase();
    const validModes = ["normal", "chaotic"];

    if (!validModes.includes(input)) {
      return sock.sendMessage(m.key.remoteJid, {
        text: `Only two personalities survive here:\n\n• normal\n• chaotic\n\nChoose wisely.`,
      }, { quoted: m });
    }

    fs.writeFileSync(path, JSON.stringify({ currentMode: input }, null, 2));
    const vibe = input === "chaotic" 
      ? "Brace yourself. The devil's awake 😈."
      : "Switching back to chill... for now 🧘‍♂️.";
    
    sock.sendMessage(m.key.remoteJid, {
      text: `ParadoxGPT is now in *${input.toUpperCase()} MODE*.\n${vibe}`,
    }, { quoted: m });
  }
};