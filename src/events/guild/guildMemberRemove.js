const { createdAtCheck } = require("../../modules/function/Checks");
const { MessageEmbed } = require("discord.js");

module.exports = async (client, member) => {
  if (member.user.bot) return;
  let cache = client.cache(),
    log = client.log;

  try {
    let leaveMessage;

    // ? Üyenin olup olmadığını kontrol et
    const userObject =
      cache.find((obj) =>
        obj.join.real.find((user) => user.userId == member.id)
      ) ||
      cache.find((obj) =>
        obj.join.fake.find((user) => user.userId == member.id)
      );

    if (!userObject) {
      // ? Üye cachede yokmuş
      leaveMessage = `<@${member.id}> adlı kişinin **davet izini** bulamadım.`;
    }

    if (userObject) {
      // ? Üye cachede varmış

      const wasFakeBefore = createdAtCheck(
        userObject.join.fake.find((user) => user.userId == member.id)
          ? userObject.join.fake.find((user) => user.userId == member.id)
              .createdAt
          : false
      );

      if (wasFakeBefore) {
        // ? Üye önceden fakeymiş
        userObject.leave.fake.push({
          userId: member.id,
          inviteCode: userObject.join.fake.find(
            (user) => user.userId == member.id
          ).inviteCode,
          joinDate: new Date().getTime(),
          createdAt: userObject.join.fake.find(
            (user) => user.userId == member.id
          ).createdAt,
        });

        userObject.counts.fakeTotal--;
        userObject.join.fake = userObject.join.fake.filter(
          (users) => users.userId !== member.id
        );
      }

      if (!wasFakeBefore) {
        // ? Üye önceden fake değilmiş
        userObject.leave.real.push({
          userId: member.id,
          inviteCode: userObject.join.real.find(
            (user) => user.userId == member.id
          ).inviteCode,
          joinDate: new Date().getTime(),
          createdAt: userObject.join.real.find(
            (user) => user.userId == member.id
          ).createdAt,
        });

        userObject.join.real = userObject.join.real.filter(
          (users) => users.userId !== member.id
        );
      }

      userObject.counts.inviteTotal--;
      userObject.counts.leaveTotal++;

      // Bu kodu vexdy hazırladı. Umarım başkasını üstlenirken görmem.
      leaveMessage = new MessageEmbed()
        .setTitle("👋 Hoşçakal, " + member.user.username + "..")
        .setThumbnail(
          member.user.displayAvatarURL({ size: 4096, dynamic: true })
        )
        .setDescription(
          `Daha sonra görüşmek dileğiyle. \n Seni davet eden <@${userObject.inviterId}> adlı kişinin istatistikleri: \n\n 👍 **${userObject.counts.inviteTotal}** tane gerçek davet!\n 💩 **${userObject.counts.fakeTotal}** tane sahte davet! \n 📤 **${userObject.counts.leaveTotal}** tane ayrılan davet! `
        )
        .setColor(member.guild.me.roles.highest.color || "#9abdfe")
        .setFooter(
          "inviteLogger",
          client.user.displayAvatarURL({ size: 4096, dynamic: true })
        )
        .setTimestamp();
    }

    await log.send(leaveMessage);
  } catch (e) {
    console.error("\n" + e);
  }
};
