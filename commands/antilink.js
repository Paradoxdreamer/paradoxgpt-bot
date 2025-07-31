module.exports = {
  name: "antilink",
  description: "Auto-delete links in groups",
  category: "moderation",
  async execute(sock, m, { isGroup }) {
    // No need to execute anything here — handled globally
  },
  async run(sock, m) {
    // Empty because the logic is handled in upsert directly
  },
  monitor: async (sock, m) => {
    try {
      const msg = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
      const from = m.key.remoteJid;

      // Don't act outside groups
      if (!from.endsWith("@g.us")) return;

      // Detect links with regex
      const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
      if (linkRegex.test(msg)) {
        await sock.sendMessage(from, { text: `🚫 Link detected and deleted by ParadoxGPT` }, { quoted: m });
        await sock.sendMessage(from, { delete: m.key });
      }
    } catch (e) {
      console.error("❌ AntiLink Error:", e);
    }
  },
};