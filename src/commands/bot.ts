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

    var usersCount = 0;
    var users = client.guilds.cache.map((guild) => guild.memberCount);
    for (var i = 0; i < users.length; i++) {
      usersCount += users[i];
    }

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
          value: `${client.guilds.cache.size}`,
          inline: true,
        },
        {
          name: "Users",
          value: `${usersCount}`,
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
