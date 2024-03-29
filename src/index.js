const Discord = require("discord.js");
const client = new Discord.Client();
const schedule = require("./getNextEpisode.js");
const canMessage = require("./channels.js");

const config = "./files/config.json";
const botToken = process.env.botToken || require(config).token;
const commandPrefix = process.env.commandPrefix || require(config).prefix;

const openshift = require("openshift-uptimer");
openshift.log(true);
openshift.auto_configure();

client.on("ready", () => {
  console.log(
    `Bot has started, with ${client.users.size} users, in ${
      client.channels.size
    } channels of ${client.guilds.size} guilds.`
  );
  client.user.setActivity(`as a Bot`);
});

client.on("guildCreate", guild => {
  console.log(
    `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${
      guild.memberCount
    } members!`
  );
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("message", async message => {
  if (message.author.bot) return;

  const isCommand = message.content.indexOf(commandPrefix) === 0;

  const hasPermission = message.member.roles.some(r =>
    ["Ōnā", "Botto"].includes(r.name)
  );

  const args = message.content
    .slice(commandPrefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();
  const anime = args.join(" ");

  if (canMessage(message, isCommand, hasPermission) === true) {
    console.log(command);
    switch (command) {
      case "when":
        if (anime.trim() === "" || anime.length === 0) {
          message.reply(
            "The command was missing a parameter, the correct usage is `-when anime name or keyword here`"
          );
        } else {
          schedule(anime, message);
        }
        break;
      case "dmwhen":
        if (anime.trim() === "" || anime.length === 0) {
          message.reply(
            "The command was missing a parameter, the correct usage is `-dmwhen anime name or keyword here`"
          );
        } else {
          schedule(anime, message, true);
        }
        break;
      case "prune":
        if (hasPermission) {
          async function clear() {
            message.delete();
            const fetched = await message.channel.fetchMessages({ limit: 100 });
            message.channel.bulkDelete(fetched);
          }
          clear();
        }
        message.delete();
        break;
      case "ping":
        const m = await message.channel.send("Ping?");
        m.edit(
          `Ping Pong! Latency is ${m.createdTimestamp -
            message.createdTimestamp}ms. API Latency is ${Math.round(
            client.ping
          )}ms`
        );
        break;
      default:
        if (isCommand) {
          message.reply(
            `
          That was an unknown command, here are the commands available:
          ***-when anime name or keyword here***
          ***-dmwhen***  - similar to ***-when*** but it dm you with the schedule
          ***-ping***  - just check your ping and the bot.`
          );
        }
        break;
    }
  }
});

client.login(botToken);
