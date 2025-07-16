module.exports = {
  name: "roast",
  description: "Roast someone with AI fire",
  async execute({ m, sock, args }) {
    const userToRoast = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!userToRoast) return sock.sendMessage(m.key.remoteJid, { text: "Tag someone to roast." }, { quoted: m });

    const name = userToRoast.split("@")[0];
    const prompt = `Roast this person in a witty, humorous, creative way, with being too offensive. Name: ${name}`;
    const axios = require("axios");
    const apiKey = process.env.KEY;

    try {
      const res = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey,
        {
          contents: [{ parts: [{ text: prompt }] }]
        }
      );

      const roast = res.data.candidates?.[0]?.content?.parts?.[0]?.text || "Couldn't roast properly... saving them today.";
      await sock.sendMessage(m.key.remoteJid, { text: `@${name} 🔥\n\n${roast}`, mentions: [userToRoast] }, { quoted: m });
    } catch (err) {
      await sock.sendMessage(m.key.remoteJid, { text: "Roast machine broke. Gemini didn't feel funny." }, { quoted: m });
    }
  }
};