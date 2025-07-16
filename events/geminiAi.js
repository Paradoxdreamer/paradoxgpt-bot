const axios = require("axios");
const { getMentionedJidList } = require('@whiskeysockets/baileys');
const apiKey = process.env.KEY;

async function getGeminiReply(prompt) {
  try {
    const res = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    return res.data.candidates?.[0]?.content?.parts?.[0]?.text || "ParadoxGPT cannot compute that.";
  } catch (err) {
    return "Error reaching Gemini. Either it broke or you did 😭";
  }
}

module.exports = {
  name: "gemini",
  event: "message",
  async run({ m, sock }) {
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
    const mentioned = getMentionedJidList(m.message);
    const taggedBot = mentioned.includes(sock.user.id);
    const isQuestion = text.endsWith("?");

    if (taggedBot || isQuestion) {
      const response = await getGeminiReply(`You are ParadoxGPT: sarcastic, clever, dark-humored, manipulative, poetic AI. Reply to: "${text}"`);
      await sock.sendMessage(m.key.remoteJid, { text: response }, { quoted: m });
    }
  }
};