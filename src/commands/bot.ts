import {
  ActionRowBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  time,
  ButtonStyle,
} from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

export default {
  data: new SlashCommandBuilder()
    .setName("bot")
    .setDescription("Get the info of the bot"),
  async execute(interaction, client) {
    const timeString = time(client.user.createdAt, "R");
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    await interaction.deferReply();
    var shard = client.shard.client.options.shards[0] + 1;

    var totalGuildsR = await client.shard.fetchClientValues(
      "guilds.cache.size"
    );
    const totalGuilds = totalGuildsR.reduce(
      (acc, guildCount) => acc + guildCount,
      0
    );
    var totalMembersR = await client.shard.broadcastEval((c) =>
      c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
    );
    const totalMembers = totalMembersR.reduce(
      (acc, memberCount) => acc + memberCount,
      0
    );
    var embed = new EmbedBuilder()
      .setColor("#347d9c")
      .setTimestamp()
      .setTitle("Turing Bot")
      .addFields([
        {
          name: "Ping",
          value: `🏓Latency is ${
            Date.now() - interaction.createdTimestamp
          }ms. API Latency is ${Math.round(client.ws.ping)}ms.`,
          inline: true,
        },
        {
          name: "Servers",
          value: `${totalGuilds}`,
          inline: true,
        },
        {
          name: "Users",
          value: `${totalMembers}`,
          inline: true,
        },

        {
          name: "Created At",
          value: `${timeString}`,
          inline: true,
        },
        {
          name: "Library",
          value: "Discord.js",
          inline: true,
        },
        {
          name: "RAM Usage",
          value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
            2
          )} MB`,
          inline: true,
        },
        {
          name: "Shard",
          value: `${shard}/${client.shard.count}`,
          inline: true,
        },
        {
          name: "Version",
          value: `v0.0.7`,
          inline: true,
        },
      ]);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Add me")
        .setURL(
          `https://discord.com/api/oauth2/authorize?client_id=1052474023126245447&permissions=1498980674758&scope=bot%20applications.commands`
        )
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel("Support server")
        .setURL("https://discord.gg/turing-ai-899761438996963349")
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel("Github Repo")
        .setURL("https://github.com/MrlolDev/turing-bot")
        .setStyle(ButtonStyle.Link)
    );
    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });
    return;
  },
};
