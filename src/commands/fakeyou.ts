import {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} from "discord.js";
import "dotenv/config";

export default {
  data: new SlashCommandBuilder()
    .setName("fakeyou")
    .setDescription("Generate an audio using fakeyou")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("The text you want to make the voice speak.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("voice")
        .setDescription("The voice token to generate the audio")
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
          { name: "20", value: "20" },
          { name: "30", value: "30" },
          { name: "40", value: "40" },
          { name: "50", value: "50" }
        )
    ),
  async execute(interaction) {
    /*  if (interaction.channel.id != "1055404706966540309") {
      interaction.reply({
        content: `For use this utility go to <#1055404706966540309>`,
        ephemeral: true,
      });
      return;
    }
    const number = parseInt(interaction.options.getString("number"));
    const steps = parseInt(interaction.options.getString("steps"));

    try {
      await interaction.reply({
        content: `Generating your results for: **${interaction.options.getString(
          "prompt"
        )}**`,
        ephemeral: true,
      });
      const { res, images } = await generateAsync({
        prompt: interaction.options.getString("prompt"),
        samples: number,
        apiKey: process.env.DREAMSTUDIO_API_KEY,
        steps: steps,
      });
      var imagesArr = images.map(
        (file) => new AttachmentBuilder(file.filePath)
      );

      await interaction.channel.send({
        files: imagesArr,
        content: `**${interaction.options.getString("prompt")}** - ${
          interaction.user
        }`,
      });
    } catch (e) {
      await interaction.reply({
        content: `Something wrong happen:\n${e}`,
        ephemeral: true,
      });
    }*/
  },
};
