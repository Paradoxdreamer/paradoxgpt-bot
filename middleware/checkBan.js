const banList = require("../lib/banList.json");

function isBanned(jid) {
  return banList.banned.includes(jid);
}

module.exports = isBanned;