module.exports = {
  name: 'menu',
  description: '🩸『𝙏𝙃𝙀 𝙋𝘼𝙍𝘼𝘿𝙊𝙓 𝙇𝙄𝙎𝙏』🩸',
  async execute({ sock, m }) {
    const sections = [
      {
        title: "✨ Commands",
        rows: [
          { title: ".menu", description: "☯ 𝕋𝕙𝕖 𝕆𝕣𝕚𝕘𝕚𝕟" },
          { title: ".ping", description: "𝓣𝓱𝓮 𝓖𝓵𝓲𝓽𝓬𝓱𝓮𝓭 status" },
          { title: ".tagall", description: "𝔖𝔲𝔪𝔪𝔬𝔫 𝔪𝔢𝔯𝔢 𝔪𝔬𝔯𝔱𝔞𝔩𝔰" }
        ]
      }
    ];

    const listMessage = {
      text: "🖤 *ParadoxGPT Main Menu*",
      footer: "Select a command or tap a button below.",
      title: "🇵 🇦 🇷 🇦 🇩 🇴 🇽 - 🇬 🇵 🇹",
      buttonText: "Open Menu",
      sections
    };

    const images = [
      "https://files.catbox.moe/ot5txl.jpg",
      "https://files.catbox.moe/frctb0.jpg",
      "https://files.catbox.moe/bdgsap.jpg"
    ];

    const buttons = [
      { buttonId: '.ping', buttonText: { displayText: '💥 Ping' }, type: 1 },
      { buttonId: '.tagall', buttonText: { displayText: '👥 Tag All' }, type: 1 }
    ];

    for (let i = 0; i < images.length; i++) {
      await sock.sendMessage(m.key.remoteJid, {
        image: { url: images[i] },
        caption: `🧠 *ParadoxGPT Command* ${i + 1}`,
        footer: "ParadoxGPT v1.0",
        buttons,
        headerType: 4
      });
    }

    // Then send the full list menu
    await sock.sendMessage(m.key.remoteJid, listMessage);
  }
};