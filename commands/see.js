const { getContentType, downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: "see",
  description: "View once breaker",
  async execute({ m, sock }) {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted || !quoted.viewOnceMessage) {
      return sock.sendMessage(m.key.remoteJid, { text: "Reply to a view-once image/video with .see" }, { quoted: m });
    }

    const mediaMsg = quoted.viewOnceMessage.message;
    const mediaType = getContentType(mediaMsg);
    const media = await downloadMediaMessage({ message: mediaMsg }, "buffer", {}, {});

    await sock.sendMessage(
      m.key.remoteJid,
      { [mediaType]: media },
      { quoted: m }
    );
  }
};