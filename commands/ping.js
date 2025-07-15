module.exports = {
  name: 'ping',
  description: 'Check latency',
  async execute({ sock, msg, args }) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Pong 🏓' });
  }
};
