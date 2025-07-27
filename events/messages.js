module.exports = async (sock, m, { commands, PREFIX }) => {
  try {
    const msg = m.messages[0];
    if (!msg.message || msg.key && msg.key.remoteJid === 'status@broadcast') return;

    const type = Object.keys(msg.message)[0];
    const content = msg.message[type];
    const body = type === 'conversation' ? content :
      type === 'extendedTextMessage' ? content.text : '';

    if (!body.startsWith(PREFIX)) return;

    const args = body.slice(PREFIX.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const command = commands.get(cmdName);

    if (!command) return;

    await command.execute({ sock, m: msg, args });
  } catch (err) {
    console.error("Message handler error:", err);
  }
};