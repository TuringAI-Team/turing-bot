import { Events, ActivityType } from "discord.js";
import chalk from "chalk";

export default {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(
      chalk.white(`Ready! Logged in as `) + chalk.blue.bold(client.user.tag)
    );
    client.user.setPresence({
      activities: [
        { name: `v0.0.7 | dsc.gg/turing`, type: ActivityType.Playing },
      ],
      status: "online",
    });
  },
};
