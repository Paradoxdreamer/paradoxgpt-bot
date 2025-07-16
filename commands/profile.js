const fs = require("fs");
const path = "./lib/profiles.json";

module.exports = {
  name: "profile",
  description: "View your ParadoxGPT profile",
  async execute({ m, sock }) {
    const id = m.key.participant || m.key.remoteJid;
    const profiles = JSON.parse(fs.readFileSync(path, "utf-8"));

    if (!profiles[id]) {
      profiles[id] = {
        name: id.split("@")[0],
        energy: Math.floor(Math.random() * 70) + 30,
        chaos: Math.floor(Math.random() * 60) + 20,
        darkness: Math.floor(Math.random() * 60),
        married: null,
        vibe: "Emerging Shadow",
        level: 1,
        experience: 0
      };
      fs.writeFileSync(path, JSON.stringify(profiles, null, 2));
    }

    const p = profiles[id];
    const text = `🧠 *PARADOXGPT PROFILE* 🧠

👤 Name: ${p.name}
💥 Energy: ${p.energy}
😈 Chaos: ${p.chaos}
🌑 Darkness: ${p.darkness}
📈 Level: ${p.level}
⚡ Vibe: ${p.vibe}
❤️ Married: ${p.married || "No one (yet)"}
`;

    await sock.sendMessage(m.key.remoteJid, { text }, { quoted: m });
  }
};