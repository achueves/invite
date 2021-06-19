const { createdAtCheck, fakeCheck } = require("../../modules/function/Checks");
const { MessageEmbed } = require("discord.js");
const { promisify } = require("util");
const sleep = promisify(setTimeout);

module.exports = async (client, member) => {
  if (member.user.bot) return;

  // ? Belirli bir süre sleep atıyoruz çünkü auditlog fetchlemek uzun sürebilir.
  await sleep(500);

  let temporaryInvites = client.tempInvites(),
    cache = client.cache(),
    log = client.log;

  try {
    const cachedInvites = client.invites.get(member.guild.id);
    const newInvites = await member.guild.fetchInvites();
    client.invites.set(member.guild.id, newInvites);

    let joinMessage;
    const usedInvite = newInvites.find(
      (invite) => cachedInvites.get(invite.code).uses < invite.uses
    );

    const temporaryUsedInvite = temporaryInvites[0];
    // ? Invite bulunamadıysa nasıl geldiğini bilmiyoruz
    // ? Ya temporary invite, ya da vanity url.
    if (!usedInvite) {
      if (temporaryUsedInvite) {
        // ? Temporary olarak oluşturulmuş bir invite,
        // ? bu yüzden bilgilerini alabildik!

        temporaryInvites = temporaryInvites.filter(
          (invites) => invites.code !== temporaryUsedInvite.code
        );

        const { code, uses, inviter, channel } = temporaryUsedInvite;
        const inviterObject = cache.find(
          (user) => user.inviterId == inviter.id
        );

        // ? Eğer cachede inviterin objecti yoksa oluştur.
        if (!inviterObject) {
          let inviterObject = {
            inviterId: inviter.id,
            counts: { inviteTotal: 0, fakeTotal: 0, leaveTotal: 0 },
            join: { real: [], fake: [] },
            leave: { real: [], fake: [] },
          };

          cache.push(inviterObject);
        }

        const objectInviter = cache.find(
          (user) => user.inviterId == inviter.id
        );

        // ? Gelen kişi, daha önceden gelmiş mi diye kontrol et.
        const memberLeaveCheck =
          cache.find((obj) =>
            obj.leave.real.find((user) => user.userId == member.id)
          ) ||
          cache.find((obj) =>
            obj.leave.fake.find((user) => user.userId == member.id)
          );

        if (memberLeaveCheck) {
          // ? Daha önceden gelmiş.

          // ? Gelen kullanıcı fake mi değil mi diye kontrol et.
          const memberFakeStatus = fakeCheck(member);

          // ? Gelen kullanıcı önceden geldiğinde fake mi değil mi diye kontrol et.
          const wasFakeBefore = createdAtCheck(
            memberLeaveCheck.leave.fake.find((user) => user.userId == member.id)
              ? memberLeaveCheck.leave.fake.find(
                  (user) => user.userId == member.id
                ).createdAt
              : false
          );

          if (!memberFakeStatus) {
            // * Gelen kullanıcı fake değilmiş.

            objectInviter.join.real.push({
              userId: member.id,
              inviteCode: code,
              joinDate: new Date().getTime(),
              createdAt: member.user.createdAt,
            });

            if (wasFakeBefore) {
              // * Önceden fakeymiş
              objectInviter.counts.fakeTotal--;
            }

            objectInviter.counts.inviteTotal++;
            memberLeaveCheck.counts.leaveTotal--;
          }

          if (memberFakeStatus) {
            // * Gelen kullanıcı fakeymiş.

            objectInviter.join.fake.push({
              userId: member.id,
              inviteCode: code,
              joinDate: new Date().getTime(),
              createdAt: member.user.createdAt,
            });

            if (wasFakeBefore) {
              // * Önceden fakeymiş
              objectInviter.counts.fakeTotal++;
            }

            objectInviter.counts.inviteTotal++;
            memberLeaveCheck.counts.leaveTotal--;
          }

          joinMessage = new MessageEmbed()
            .setTitle("🤗 Tekrardan hoşgeldin, " + member.user.username + "!")
            .setThumbnail(
              member.user.displayAvatarURL({ size: 4096, dynamic: true })
            )
            .setDescription(
              `Seni aramızda yeniden görmek güzel. \n Seni davet eden <@${inviter.id}> adlı kişinin istatistikleri: \n\n 👍 **${objectInviter.counts.inviteTotal}** tane gerçek davet!\n 💩 **${objectInviter.counts.fakeTotal}** tane sahte davet! \n 📤 **${objectInviter.counts.leaveTotal}** tane ayrılan davet! `
            )
            .setColor(member.guild.me.roles.highest.color || "#9abdfe")
            .setFooter(
              "inviteLogger",
              client.user.displayAvatarURL({ size: 4096, dynamic: true })
            )
            .setTimestamp();

          // * Arrayleri kontrol edip kaldır
          if (!wasFakeBefore)
            memberLeaveCheck.leave.real = memberLeaveCheck.leave.real.filter(
              (users) => users.userId !== member.id
            );
          if (wasFakeBefore)
            memberLeaveCheck.leave.fake = memberLeaveCheck.leave.fake.filter(
              (users) => users.userId !== member.id
            );
        }

        if (!memberLeaveCheck) {
          // ? Daha önceden gelmemiş.
          // v3Xdi(Y) h4z1rlad1. b0yl3 y4z10m cunku k0ntr0l 3tm3k k0l4y.
          // ? Gelen kullanıcı fake mi değil mi diye kontrol et.
          const memberFakeStatus = fakeCheck(member);

          if (!memberFakeStatus) {
            // * Gelen kullanıcı fake değilmiş.

            objectInviter.join.real.push({
              userId: member.id,
              inviteCode: code,
              joinDate: new Date().getTime(),
              createdAt: member.user.createdAt,
            });

            objectInviter.counts.inviteTotal++;
          }

          if (memberFakeStatus) {
            // * Gelen kullanıcı fakeymiş.

            objectInviter.join.fake.push({
              userId: member.id,
              inviteCode: code,
              joinDate: new Date().getTime(),
              createdAt: member.user.createdAt,
            });

            objectInviter.counts.inviteTotal++;
            objectInviter.counts.fakeTotal++;
          }

          joinMessage = new MessageEmbed()
            .setTitle("🤗 Hoşgeldin, " + member.user.username + "!")
            .setThumbnail(
              member.user.displayAvatarURL({ size: 4096, dynamic: true })
            )
            .setDescription(
              `Umarım sunucumuzu beğenirsin. \n Seni davet eden <@${inviter.id}> adlı kişinin istatistikleri: \n\n 👍 **${objectInviter.counts.inviteTotal}** tane gerçek davet!\n 💩 **${objectInviter.counts.fakeTotal}** tane sahte davet! \n 📤 **${objectInviter.counts.leaveTotal}** tane ayrılan davet! `
            )
            .setColor(member.guild.me.roles.highest.color || "#9abdfe")
            .setFooter(
              "inviteLogger",
              client.user.displayAvatarURL({ size: 4096, dynamic: true })
            )
            .setTimestamp();
        }
      }

      if (!temporaryUsedInvite) {
        // ? Nasıl geldiği hakkında bir fikrim yok.
        joinMessage = `<@${member.id}> adlı kişinin nasıl geldiğini çözemedim.`;
      }
    }

    if (usedInvite) {
      // ? Bir invitenin kullanıp kullanılmadığını kontrol et.
      const { code, uses, inviter, channel } = usedInvite;

      if (code == member.guild.vanityURLCode) {
        // ? Kişi vanity URL ile gelmiş.
        joinMessage = `<@${member.id}> adlı kişi, VANITY URL kullanarak geldi.`;
      }

      if (code != member.guild.vanityURLCode) {
        const inviterObject = cache.find(
          (user) => user.inviterId == inviter.id
        );

        // ? Eğer cachede inviterin objecti yoksa oluştur.
        if (!inviterObject) {
          let inviterObject = {
            inviterId: inviter.id,
            counts: { inviteTotal: 0, fakeTotal: 0, leaveTotal: 0 },
            join: { real: [], fake: [] },
            leave: { real: [], fake: [] },
          };

          cache.push(inviterObject);
        }

        const objectInviter = cache.find(
          (user) => user.inviterId == inviter.id
        );

        // ? Gelen kişi, daha önceden gelmiş mi diye kontrol et.
        const memberLeaveCheck =
          cache.find((obj) =>
            obj.leave.real.find((user) => user.userId == member.id)
          ) ||
          cache.find((obj) =>
            obj.leave.fake.find((user) => user.userId == member.id)
          );

        if (memberLeaveCheck) {
          // ? Daha önceden gelmiş.

          // ? Gelen kullanıcı fake mi değil mi diye kontrol et.
          const memberFakeStatus = fakeCheck(member);

          // ? Gelen kullanıcı önceden geldiğinde fake mi değil mi diye kontrol et.
          const wasFakeBefore = createdAtCheck(
            memberLeaveCheck.leave.fake.find((user) => user.userId == member.id)
              ? memberLeaveCheck.leave.fake.find(
                  (user) => user.userId == member.id
                ).createdAt
              : false
          );

          if (!memberFakeStatus) {
            // * Gelen kullanıcı fake değilmiş.

            objectInviter.join.real.push({
              userId: member.id,
              inviteCode: code,
              joinDate: new Date().getTime(),
              createdAt: member.user.createdAt,
            });

            if (wasFakeBefore) {
              // * Önceden fakeymiş
              objectInviter.counts.fakeTotal--;
            }

            objectInviter.counts.inviteTotal++;
            memberLeaveCheck.counts.leaveTotal--;
          }

          if (memberFakeStatus) {
            // * Gelen kullanıcı fakeymiş.

            objectInviter.join.fake.push({
              userId: member.id,
              inviteCode: code,
              joinDate: new Date().getTime(),
              createdAt: member.user.createdAt,
            });

            if (wasFakeBefore) {
              // * Önceden fakeymiş
              objectInviter.counts.fakeTotal++;
            }

            objectInviter.counts.inviteTotal++;
            memberLeaveCheck.counts.leaveTotal--;
          }

          joinMessage = new MessageEmbed()
            .setTitle("🤗 Tekrardan hoşgeldin, " + member.user.username + "!")
            .setThumbnail(
              member.user.displayAvatarURL({ size: 4096, dynamic: true })
            )
            .setDescription(
              `Seni aramızda yeniden görmek güzel. \n Seni davet eden <@${inviter.id}> adlı kişinin istatistikleri: \n\n 👍 **${objectInviter.counts.inviteTotal}** tane gerçek davet!\n 💩 **${objectInviter.counts.fakeTotal}** tane sahte davet! \n 📤 **${objectInviter.counts.leaveTotal}** tane ayrılan davet! `
            )
            .setColor(member.guild.me.roles.highest.color || "#9abdfe")
            .setFooter(
              "inviteLogger",
              client.user.displayAvatarURL({ size: 4096, dynamic: true })
            )
            .setTimestamp();

          // * Arrayleri kontrol edip kaldır
          if (!wasFakeBefore)
            memberLeaveCheck.leave.real = memberLeaveCheck.leave.real.filter(
              (users) => users.userId !== member.id
            );
          if (wasFakeBefore)
            memberLeaveCheck.leave.fake = memberLeaveCheck.leave.fake.filter(
              (users) => users.userId !== member.id
            );
        }

        if (!memberLeaveCheck) {
          // ? Daha önceden gelmemiş.

          // ? Gelen kullanıcı fake mi değil mi diye kontrol et.
          const memberFakeStatus = fakeCheck(member);

          if (!memberFakeStatus) {
            // * Gelen kullanıcı fake değilmiş.

            objectInviter.join.real.push({
              userId: member.id,
              inviteCode: code,
              joinDate: new Date().getTime(),
              createdAt: member.user.createdAt,
            });

            objectInviter.counts.inviteTotal++;
          }

          if (memberFakeStatus) {
            // * Gelen kullanıcı fakeymiş.

            objectInviter.join.fake.push({
              userId: member.id,
              inviteCode: code,
              joinDate: new Date().getTime(),
              createdAt: member.user.createdAt,
            });

            objectInviter.counts.inviteTotal++;
            objectInviter.counts.fakeTotal++;
          }

          joinMessage = new MessageEmbed()
            .setTitle("🤗 Hoşgeldin, " + member.user.username + "!")
            .setThumbnail(
              member.user.displayAvatarURL({ size: 4096, dynamic: true })
            )
            .setDescription(
              `Umarım sunucumuzu beğenirsin. \n Seni davet eden <@${inviter.id}> adlı kişinin istatistikleri: \n\n 👍 **${objectInviter.counts.inviteTotal}** tane gerçek davet!\n 💩 **${objectInviter.counts.fakeTotal}** tane sahte davet! \n 📤 **${objectInviter.counts.leaveTotal}** tane ayrılan davet! `
            )
            .setColor(member.guild.me.roles.highest.color || "#9abdfe")
            .setFooter(
              "inviteLogger",
              client.user.displayAvatarURL({ size: 4096, dynamic: true })
            )
            .setTimestamp();
        }
      }
    }

    await log.send(joinMessage);
  } catch (e) {
    console.error("\n" + e);
  }
};
