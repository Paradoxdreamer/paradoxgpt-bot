module.exports = {
  name: 'menu',
  description: 'Show command list',
  async execute({ sock, m }) {
    const help = `┏━━━★ ParadoxGPT Commands ━━━┓
┃ Prefix: ${process.env.PREFIX || '.'} 
┃ Creator: ${process.env.OWNER_NAME || 'Paradox'} 
┣━━ Commands ━━━━━━━━━━━━━━━━━━┫
┃ .menu — Show this menu
┃ .ping — Check bot status
┃ .tagall — Mention everyone
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    await sock.sendMessage(m.key.remoteJid, { text: help });
  }
};