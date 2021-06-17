const clean = (text) => {
  if (typeof text === "string")
    return text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
  else return text;
};

// Basit bir evaluate kodu. İşinize yarar mı bilmem ama
// benim test aşamasında baya bir işime yaramıştı.

exports.run = async (client, message, args) => {
  if (!message.member.hasPermission("ADMINISTRATOR")) return;
  try {
    const code = args.join(" ");
    let evaled = eval(code);

    if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

    message.channel.send({
      embed: {
        color: 3066993,
        title: "Evaluation executed!",
        description: `\`\`\`js\n${clean(evaled)}\n\`\`\``,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    message.channel.send({
      embed: {
        color: 15158332,
        title: "Evaluation cancelled!",
        description: `\`\`\`js\n${clean(error)}\n\`\`\``,
        timestamp: new Date(),
      },
    });
  }
};
