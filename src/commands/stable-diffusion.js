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
    const number = parseInt(interaction.options.getString("number"));
    const steps = parseInt(interaction.options.getString("steps"));
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
        const sfbuff = new Buffer.from(file.base64, "base64");
        return new AttachmentBuilder(sfbuff, "output.png");
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
