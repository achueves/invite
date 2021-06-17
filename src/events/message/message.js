// Basit olarak message event handler.

const config = require("../../configs/config.json");

module.exports = (client, message) => {
  if (message.author.bot || message.channel.type == "dm") return;
  if (message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const cmd = client.commands.get(command);
  if (!cmd) return;

  cmd.run(client, message, args);
};
