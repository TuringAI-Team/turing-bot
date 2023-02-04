import { SlashCommandBuilder, EmbedBuilder, time } from "discord.js";
import { PagesBuilder, PagesManager } from "discord.js-pages";
import { models } from "../modules/stablehorde.js";

export default {
  data: new SlashCommandBuilder()
    .setName("models")
    .setDescription("Get the model list of stable diffusion"),
  async execute(interaction, client, commands) {
    new PagesBuilder(interaction)
      .setColor("#347d9c")
      .setTimestamp()
      .setTitle("Turing Models")
      .setFooter({
        text: `Thanks to [stablehorde.net](https://stablehorde.net)`,
      })
      .setPages(
        models.map((el, i) => {
          return new EmbedBuilder()
            .setDescription(
              `${el.name}\nYou can use this model with /stable-diffusion`
            )
            .setImage(el.img);
        })
      )
      .build();

    return;
  },
};
