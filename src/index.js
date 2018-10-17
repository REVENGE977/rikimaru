const Discord = require("discord.js");
const client = new Discord.Client();
const schedule = require("./getNextEpisode.js");

const botToken = process.env.botToken || require("./files/config.json").token;
const commandPrefix =
  process.env.commandPrefix || require("./files/config.json").prefix;

client.on("ready", () => {
  console.log(
    `Bot has started, with ${client.users.size} users, in ${
      client.channels.size
    } channels of ${client.guilds.size} guilds.`
  );
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
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

  if (message.content.indexOf(commandPrefix) !== 0) return;

  const args = message.content
    .slice(commandPrefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  switch (command) {
    case "when":
      const anime = args.join(" ");
      if (anime.trim() === "" || anime.length === 0) {
        message.delete();
      } else {
        schedule(anime, message);
      }
      break;
    case "dmwhen":
      const anime = args.join(" ");
      if (anime.trim() === "" || anime.length === 0) {
        message.delete();
      } else {
        schedule(anime, message, true);
      }
      break;
    case "prune":
      if (message.member.roles.some(r => ["Majesty", "Bot"].includes(r.name))) {
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
        `Pong! Latency is ${m.createdTimestamp -
          message.createdTimestamp}ms. API Latency is ${Math.round(
          client.ping
        )}ms`
      );
      break;
    default:
      message.delete();
      break;
  }
});

client.login(botToken);
