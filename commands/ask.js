module.exports = {
  name: "ask",
  description: "Ask ParadoxGPT anything via Gemini",
  async execute({ m, sock, args }) {
    const text = args.join(" ");
    if (!text) return sock.sendMessage(m.key.remoteJid, { text: "Ask me something, dammit." }, { quoted: m });

    const axios = require("axios");
    const apiKey = process.env.KEY;

    try {
      const res = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey,
        {
          contents: [{ parts: [{ text }] }]
        }
      );

      const reply = res.data.candidates?.[0]?.content?.parts?.[0]?.text || "That question broke my brain.";
      await sock.sendMessage(m.key.remoteJid, { text: reply }, { quoted: m });
    } catch (err) {
      await sock.sendMessage(m.key.remoteJid, { text: "Error talking to Gemini. API dead?" }, { quoted: m });
    }
  }
};