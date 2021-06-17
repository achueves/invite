const fs = require("fs");
const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args) => {
  // Buradaki path doğru olmayabilir, test etmedim.
  const Database = JSON.parse(fs.readFileSync("./database/invites.json"));
  let sortedDatabase = Database.sort((a, b) => {
    return (
      a.counts.inviteTotal - a.counts.fakeTotal >
      b.counts.inviteTotal - b.counts.fakeTotal
    );
  });

  sortedDatabase = sortedDatabase.slice(0, 15);

  let leaderboardUsers = [];
  sortedDatabase.forEach((user) => {
    const totalInvite = user.counts.inviteTotal,
      fakeTotal = user.counts.fakeTotal,
      leaveTotal = user.counts.leaveTotal;

    leaderboardUsers.push(
      `<@${user.inviterId}> adlı kişinin **${
        totalInvite - fakeTotal - leaveTotal
      }** tane gerçek invitesi var!`
    );
  });

  const embed = new MessageEmbed()
    .setColor(message.member.guild.me.roles.highest.color || "#9abdfe")
    .setDescription(leaderboardUsers.join("\n"));

  await message.channel.send(embed);
};
