module.exports = {
  name: 'tagall',
  description: 'Mention all group members',
  async execute({ sock, msg, args }) {
    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const members = metadata.participants.map(u => u.id);
    const mentions = members;
    await sock.sendMessage(msg.key.remoteJid, { text: `@${members.join(' @')}`, mentions });
  }
};
