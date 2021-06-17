/* Requirements */
const Discord = require("discord.js");
const Enmap = require("enmap");
const glob = require("glob");
const fs = require("fs");

/* Needed */

// Tüm datayı nerede tutacağımızın göstergesi olan path.
const databasePath = "./database/invites.json";
const client = new Discord.Client();
const config = require("./config/config.json");

/* Invite exports */
const guildInvites = new Discord.Collection();
client.invites = guildInvites;

/* Caching systems */
let temporaryInvites = [],
  cache = JSON.parse(fs.readFileSync(databasePath)) || [];

setInterval(() => {
  fs.writeFileSync(databasePath, JSON.stringify(cache, null, 2));
}, 1000);

/* Extra global variables & functions */
client.commands = new Enmap();
client.cache = () => {
  return cache;
};
client.tempInvites = () => {
  return temporaryInvites;
};
client.changeTempInvites = (tempInvites) => {
  return (tempInvites = client.tempInvites);
};
client.changeCache = (cache) => {
  return (cache = client.cache);
};
// Bu log kanalımızı belirtmek için var.
client.log;

// Offf ya glob kullanıyorum, türklerden farklıyım en azından
// fs yapıp teker teker tüm folderleri for döngüsünden almıyorum.

/* Require all commands & events within folder */
glob("commands/**/*.js", function (err, files) {
  // Change every name file to directory
  files = files.map((item) => {
    return "./" + item;
  });

  // Add to client emit
  files.forEach((file) => {
    const command = require(file),
      commandName = file.split("/")[3].split(".")[0];

    console.log("command(added): " + commandName);
    client.commands.set(commandName, command);
  });
});

glob("events/**/*.js", function (err, files) {
  // Change every name file to directory
  files = files.map((item) => {
    return "./" + item;
  });

  // Add to client emit
  files.forEach((file) => {
    const event = require(file),
      eventName = file.split("/")[3].split(".")[0];
    console.log("event(added): " + eventName);
    client.on(eventName, event.bind(null, client));
  });
});

// Kesinlike datanın databaseye kayıt olduğundan emin olmak için.
process.on("beforeExit", (code) => {
  fs.writeFileSync(databasePath, JSON.stringify(cache, null, 2));
  console.log("Process beforeExit event with code: ", code);
});

process.on("unhandledRejection", (err) => {
  console.log("\n" + err.stack);
  fs.writeFileSync(databasePath, JSON.stringify(cache, null, 2));
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.log("\n" + err.stack);
  fs.writeFileSync(databasePath, JSON.stringify(cache, null, 2));
  process.exit(1);
});

client.login(config.token);
