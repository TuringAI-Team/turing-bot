// Require the necessary discord.js classes
import chalk from "chalk";
import fs from "node:fs";
import { fileURLToPath } from "url";
import path from "node:path";
import {
  Client,
  Events,
  Collection,
  GatewayIntentBits,
  ActivityType,
  REST,
  Routes,
} from "discord.js";
import "dotenv/config";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import ms from "ms";
// Create a new client instance
const client: any = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
import supabase from "./modules/supabase.js";
import { isPremium } from "./modules/premium.js";

client.commands = new Collection();
const commands = [];
const commandsPath = path.join(__dirname, "commands");

const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = `./commands/${file}`;
  console.log(filePath);
  const { default: command } = await import(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else {
    console.log(
      chalk.yellow(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      )
    );
  }
}

// Construct and prepare an instance of the REST module

// and deploy your commands!

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log(`Successfully reloaded application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async (c) => {
  console.log(
    chalk.white(`Ready! Logged in as `) + chalk.blue.bold(c.user.tag)
  );
  client.user.setPresence({
    activities: [
      { name: `v0.0.6 | dsc.gg/turing`, type: ActivityType.Playing },
    ],
    status: "online",
  });

  await checkUsers();
  setInterval(async () => {
    await checkUsers();
  }, 10 * 60 * 1000);
});
async function checkUsers() {
  var guilds = client.guilds.cache.map((guild) => guild);
  for (var i = 0; i < guilds.length; i++) {
    var guild = client.guilds.cache.get(guilds[i].id);
    var owner = await guild.fetchOwner();
    if (guild.memberCount <= 4) {
      var ch = client.channels.cache.get("1051425293715390484");
      ch.send(
        `I have left **${guild.name}**(${guild.id})\nIt has a total of **${guild.memberCount} members**.\nThe owner is: **${owner.user.tag}(${owner.id})**`
      );
      await guild.leave();
    }
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  var ispremium = await isPremium(interaction.user.id);
  try {
    if (command.cooldown && ispremium == false) {
      let { data: cooldowns, error } = await supabase
        .from("cooldown")
        .select("*")

        // Filters
        .eq("userId", interaction.user.id)
        .eq("command", interaction.commandName);
      if (cooldowns && cooldowns[0]) {
        var cooldown = cooldowns[0];
        var createdAt = new Date(cooldown.created_at);
        var milliseconds = createdAt.getTime();
        var now = Date.now();
        var diff = now - milliseconds;
        var count = ms(command.cooldown) - diff;
        if (diff >= ms(command.cooldown)) {
          const { data, error } = await supabase
            .from("cooldown")
            .update({ created_at: new Date() })
            .eq("userId", interaction.user.id)
            .eq("command", interaction.commandName);
          await command.execute(interaction, client);
        } else {
          await interaction.reply({
            content: `Please wait **${ms(
              count
            )}** to use this command again.\nIf you want to **avoid this cooldown** you can **donate to get premium**. If you want to donate please conact us throught [our discord](https://discord.gg/turing-ai-899761438996963349).`,
            ephemeral: true,
          });
        }
      } else {
        const { data, error } = await supabase
          .from("cooldown")
          .insert([
            { userId: interaction.user.id, command: interaction.commandName },
          ]);
        await command.execute(interaction, client);
      }
    } else {
      await command.execute(interaction, client);
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});
// Log in to Discord with your client's token
client.login(process.env.TOKEN);
