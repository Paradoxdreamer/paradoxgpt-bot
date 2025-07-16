module.exports = {
  name: "groupstats",
  alias: ["gs"],
  async execute({ m, sock }) {
    const id = m.key.remoteJid;

    if (!id.endsWith("@g.us")) {
      return sock.sendMessage(id, { text: "⚠️ This command only works in groups." });
    }

    const metadata = await sock.groupMetadata(id);
    const groupName = metadata.subject;
    const groupDesc = metadata.desc || "No description available.";
    const participants = metadata.participants;
    const admins = participants.filter(p => p.admin !== null);
    const isBotAdmin = participants.find(p => p.id === sock.user.id)?.admin !== null;

    const stats = `
📛 *Group Name:* ${groupName}
🆔 *Group ID:* ${id}
👥 *Members:* ${participants.length}
🛡️ *Admins:* ${admins.length}
🤖 *Bot Status:* ${isBotAdmin ? "Admin" : "Not Admin"}
📄 *Description:* ${groupDesc.length > 200 ? groupDesc.substring(0, 200) + "..." : groupDesc}
    `.trim();

    await sock.sendMessage(id, { text: stats });
  }
};