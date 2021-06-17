const fs = require("fs");
const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args) => {
  // Buradaki path doğru olmayabilir, test etmedim.
  const Database = JSON.parse(fs.readFileSync("./database/invites.json"));

  if (!args[0]) {
    const userInDatabase = Database.find(
      (users) => users.inviterId == message.author.id
    );

    if (!userInDatabase)
      return await message.reply("herhangi bir davet geçmişiniz bulunamadı.");

    const iTotal =
      userInDatabase.counts.inviteTotal -
      userInDatabase.counts.fakeTotal -
      userInDatabase.counts.leaveTotal;

    const embed = new MessageEmbed()
      .setColor(message.member.guild.me.roles.highest.color || "#9abdfe")
      .setTitle(message.author.username)
      .setDescription(
        `Toplam olarak **${iTotal}** davetin var! \n\n✅ **${userInDatabase.counts.inviteTotal}** tane giriş \n📤 **${userInDatabase.counts.leaveTotal}** tane çıkış\n💩 **${userInDatabase.counts.fakeTotal}** tane sahte\n\nArkadaşlarını davet etmeye devam et!`
      )
      .setFooter(
        "coreLogger",
        client.user.displayAvatarURL({ size: 4096, dynamic: true })
      )
      .setTimestamp();

    return await message.channel.send(embed);
  }

  if (args[0]) {
    const mention = message.mentions.users.first();
    const selectedUserId = mention
      ? mention.id
      : !isNaN(args[0]) && args[0].length == message.author.id.length
      ? args[0]
      : false;

    if (!selectedUserId)
      return await message.reply(
        "lütfen geçerli birisini etiketleyin veya idsini girin."
      );

    const selectedUser =
      message.guild.members.cache.get(selectedUserId) ||
      client.users.fetch(selectedUserId);

    const userInDatabase = Database.find(
      (users) =>
        users.inviterId == selectedUser.id ||
        users.inviterId == selectedUser.user.id
    );

    if (!userInDatabase)
      return await message.reply(
        "belirtilen kullanıcının davet geçmişi bulunamadı."
      );

    const iTotal =
      userInDatabase.counts.inviteTotal -
      userInDatabase.counts.fakeTotal -
      userInDatabase.counts.leaveTotal;

    const embed = new MessageEmbed()
      .setColor(message.member.guild.me.roles.highest.color || "#9abdfe")
      .setTitle(selectedUser.user.username || selectedUser.username)
      .setDescription(
        `Toplam olarak **${iTotal}** davetin var! \n\n✅ **${userInDatabase.counts.inviteTotal}** tane giriş \n📤 **${userInDatabase.counts.leaveTotal}** tane çıkış\n💩 **${userInDatabase.counts.fakeTotal}** tane sahte\n\nArkadaşlarını davet etmeye devam et!`
      )
      .setFooter(
        "coreLogger",
        client.user.displayAvatarURL({ size: 4096, dynamic: true })
      )
      .setTimestamp();

    return await message.channel.send(embed);
  }
};
