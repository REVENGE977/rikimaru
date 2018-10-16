const Discord = require("discord.js");
const client = new Discord.Client();
const schedule = require("./getNextEpisode.js");
const config = require("./files/config.json");

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

  if (message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content
    .slice(config.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "when") {
    const anime = args.join(" ");
    if (anime.trim() === "" || anime.length === 0) {
      message.delete();
    } else {
      schedule(anime, message);
    }
  }

  if (command === "dmwhen") {
    const anime = args.join(" ");
    if (anime.trim() === "" || anime.length === 0) {
      message.delete();
    } else {
      schedule(anime, message, true);
    }
  }

  if (command === "prune") {
    if (message.member.roles.some(r => ["Majesty", "Bot"].includes(r.name))) {
      async function clear() {
        message.delete();
        const fetched = await message.channel.fetchMessages({ limit: 100 });
        message.channel.bulkDelete(fetched);
      }
      clear();
    }
    message.delete();
  }

  if (command === "ping") {
    const m = await message.channel.send("Ping?");
    m.edit(
      `Pong! Latency is ${m.createdTimestamp -
        message.createdTimestamp}ms. API Latency is ${Math.round(
        client.ping
      )}ms`
    );
  }
});

client.login(config.token);
