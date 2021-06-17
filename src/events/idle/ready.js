const config = require("../../configs/config.json");
module.exports = async (client) => {
  console.log("\n" + "event(giriş): " + client.user.tag);

  client.user.setStatus("dnd");
  client.log = client.channels.cache.get(config.channel);

  setTimeout(() => {
    for (const guild of client.guilds.cache.values()) {
      guild
        .fetchInvites()
        .then((invite) => client.invites.set(guild.id, invite))
        .catch((error) => console.log(error));
    }
  }, 1000);
  console.log("event(ready): tüm sunucuların invitelerini aldım");

  setInterval(async () => {
    await client.guilds.fetch(config.guild);
  }, 1000 * 15);
};
