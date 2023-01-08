import {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} from "discord.js";
import "dotenv/config";
import { dalle } from "../modules/open.ai.js";

export default {
  data: new SlashCommandBuilder()
    .setName("dall-e")
    .setDescription("Generate an image using dall-e 2")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("The prompt for generating an image")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("number")
        .setDescription("The number of images you want")
        .setRequired(true)
        .addChoices(
          { name: "One", value: "1" },
          { name: "Two", value: "2" },
          { name: "Three", value: "3" },
          { name: "Four", value: "4" }
        )
    ),
  async execute(interaction) {
    if (interaction.channel.id != "1049275833379979365") {
      interaction.reply({
        content: `For use this utility go to <#1049275833379979365>`,
        ephemeral: true,
      });
      return;
    }
    const number = parseInt(interaction.options.getString("number"));
    await interaction.reply({
      content: `Generating your results for: **${interaction.options.getString(
        "prompt"
      )}**`,
    });
    try {
      var imgs = await dalle(interaction.options.getString("prompt"), number);

      await interaction.editReply({
        files: imgs,
        content: `**Prompt:** ${interaction.options.getString("prompt")}`,
      });
    } catch (e) {
      await interaction.editReply({
        content: `Something wrong happen:\n${e}`,
        ephemeral: true,
      });
    }
  },
};
