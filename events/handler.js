const gemini = require('./geminiAi');

module.exports = async (sock, update, { commands, PREFIX }) => {
  try {
    const m = update.messages[0];
    if (!m.message || m.key.fromMe) return;

    const body =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      "";

    const sender = m.key.remoteJid;

    if (body.startsWith(PREFIX)) {
      const args = body.slice(PREFIX.length).trim().split(/ +/);
      const cmdName = args.shift().toLowerCase();
      const cmd = commands.get(cmdName);

      if (cmd) {
        await cmd.execute({ sock, m, args });
      } else {
        await sock.sendMessage(sender, { text: "Unknown command." });
      }
    } else {
      // 💬 No prefix? Treat it as convo, pass to Gemini AI
      const aiReply = await gemini.getAIResponse(body);
      if (aiReply) {
        await sock.sendMessage(sender, { text: aiReply });
      }
    }
  } catch (err) {
    console.error("🧨 Error in messages.upsert.js:", err);
  }
};
