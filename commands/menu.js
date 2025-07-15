module.exports = {
  name: 'menu',
  description: 'Show command list',
  async execute({ sock, msg, args }) {
    const help = `┏━━━★ ParadoxGPT Commands ━━━┓
┃ Prefix: ${process.env.PREFIX} 
┃ Creator: ${process.env.OWNER_NAME} 
┣━━ Commands ━━━━━━━━━━━━━━━━━━┫
┃ .menu — Show this menu
┃ .ping — Check bot status
┃ .tagall — Mention everyone
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    await sock.sendMessage(msg.key.remoteJid, { text: help });
  }
};
