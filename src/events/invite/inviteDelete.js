module.exports = async (client, invite) => {
  // ? İlk başta bunun bilinçli bir silinme olup olmadığını kontrol etmemiz gerekiyor.
  const fetchedLogs = await invite.guild.fetchAuditLogs({
    limit: 1,
  });

  const deletionLog = fetchedLogs.entries.first();

  // ? Eğer INVITE_DELETE işlemi loglarda yazıyorsa, birisi gelmemiştir.
  if (deletionLog.action == "INVITE_DELETE") return client.invites.set(invite.guild.id, await invite.guild.fetchInvites());

  const guildInvites = client.invites.get(invite.guild.id);
  const findInvite = guildInvites.find((inv) => inv.code == invite.code);
  const temporaryInvites = client.tempInvites();

  temporaryInvites.unshift(findInvite);
  client.invites.set(invite.guild.id, await invite.guild.fetchInvites());
};
