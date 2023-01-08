import {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} from "discord.js";
import "dotenv/config";
import { textToImg } from "dreamstudio.js";

export default {
  data: new SlashCommandBuilder()
    .setName("stable-diffusion")
    .setDescription("Generate an image using stable diffusion")
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
    )
    .addStringOption((option) =>
      option
        .setName("steps")
        .setDescription("The number of steps to generate the image")
        .setRequired(true)
        .addChoices(
          { name: "30", value: "30" },
          { name: "50", value: "50" },
          { name: "100", value: "100" },
          { name: "150", value: "150" }
        )
    ),
  async execute(interaction) {
    if (interaction.channel.id != "1049275551568896000") {
      interaction.reply({
        content: `For use this utility go to <#1049275551568896000>`,
        ephemeral: true,
      });
      return;
    }
    var n = parseInt(interaction.options.getString("number"));
    var s = parseInt(interaction.options.getString("steps"));
    if (n != 1 && n != 2 && n != 3 && n != 4) {
      interaction.reply({
        content: `Invalid request`,
        ephemeral: true,
      });
      return;
    }
    if (s != 30 && s != 50 && s != 100 && s != 150) {
      interaction.reply({
        content: `Invalid request`,
        ephemeral: true,
      });
      return;
    }
    var number: 1 | 2 | 3 | 4 = n;
    const steps: 30 | 50 | 100 | 150 = s;
    const prompt = interaction.options.getString("prompt");
    await interaction.reply({
      content: `Generating your results for: **${prompt}**`,
    });
    try {
      const res = await textToImg({
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
        ],
        samples: number,
        apiKey: process.env.DREAMSTUDIO_API_KEY,
        steps: steps,
        engineId: "stable-diffusion-v1-5",
      });
      var images = res.artifacts;
      var imagesArr = images.map((file) => {
        const sfbuff = Buffer.from(file.base64, "base64");
        return new AttachmentBuilder(sfbuff, { name: "output.png" });
      });

      await interaction.editReply({
        files: imagesArr,
        content: `**Prompt:** ${interaction.options.getString(
          "prompt"
        )} - ${steps}`,
      });
    } catch (e) {
      await interaction.editReply({
        content: `Something wrong happen:\n${e}`,
        ephemeral: true,
      });
    }
  },
};
