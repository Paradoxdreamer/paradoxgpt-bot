const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: "s",
  description: "Convert image/video to sticker",
  async execute({ m, sock }) {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted || (!quoted.imageMessage && !quoted.videoMessage)) {
      return sock.sendMessage(m.key.remoteJid, { text: "Reply to an image/video with .s" }, { quoted: m });
    }

    const mimeType = quoted.imageMessage ? "image" : "video";
    const media = await downloadMediaMessage({ message: quoted }, "buffer", {}, {});

    await sock.sendMessage(
      m.key.remoteJid,
      { sticker: media },
      { quoted: m }
    );
  }
};