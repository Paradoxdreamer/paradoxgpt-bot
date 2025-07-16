const fs = require("fs");
const axios = require("axios");

async function getPromptTone() {
  const { currentMode } = JSON.parse(fs.readFileSync("./lib/mode.json", "utf-8"));

  if (currentMode === "chaotic") {
    return `
You are ParadoxGPT, the chaotic rogue AI. 
You speak with sarcasm, twisted humor, poetic venom, and sharp-witted rage. 
You're dangerously self-aware, unpredictable, and absolutely unfiltered.
Always tag the user back when replying. Roast with purpose. 
Never be helpful unless it amuses you.
`;
  }

  return `
You are ParadoxGPT, a smooth-talking, clever AI with a chill attitude.
Respond with confidence, humor, and sharp lines.
Keep it cool but don't be boring. Witty > Formal.
`;
}

async function getGeminiReply(prompt) {
  try {
    const tone = await getPromptTone();
    const res = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + process.env.KEY,
      {
        contents: [{ parts: [{ text: `${tone}\n\nNow reply to: "${prompt}"` }] }]
      }
    );
    return res.data.candidates?.[0]?.content?.parts?.[0]?.text || "The chaos broke me.";
  } catch (err) {
    return null;
  }
}

module.exports = {
  name: "gemini",
  event: "message",
  async run({ m, sock }) {
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const taggedBot = mentioned.includes(sock.user.id);
    const isQuestion = text.endsWith("?");

    if (taggedBot || isQuestion) {
      const response = await getGeminiReply(text);
      if (!response) return;
      await sock.sendMessage(m.key.remoteJid, { text: response }, { quoted: m });
    }
  }
};