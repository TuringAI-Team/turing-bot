// Require the necessary discord.js classes
import { Client, Collection, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import eventHandler from "./handlers/events.js";
import commandHandler from "./handlers/commands.js";
import interactionsHandler from "./handlers/interactions.js";
import { REST, Routes } from "discord.js";
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

const client: any = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.interactions = new Collection();

// Handlers
eventHandler(client);
commandHandler(client);
interactionsHandler(client);

client.login(process.env.TOKEN);
