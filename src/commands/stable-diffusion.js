const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { generateAsync } = require("stability-client");
require("dotenv").config();
const { getUser, updateCredits, getUserRoles } = require("../modules/user");

module.exports = {
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
          { name: "20", value: "20" },
          { name: "30", value: "30" },
          { name: "40", value: "40" },
          { name: "50", value: "50" }
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
    var roles = await getUserRoles(interaction.member);
    var user = await getUser(interaction.user);
    const number = parseInt(interaction.options.getString("number"));
    const steps = parseInt(interaction.options.getString("steps"));

    if (user.credits < number * (steps / 10) && !roles.includes("admin")) {
      interaction.reply({
        content: `You don't have enough credits to this operation`,
        ephemeral: true,
      });
      return;
    }
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
      await updateCredits(user.id, user.credits - number * (steps / 20));
    } catch (e) {
      await interaction.reply({
        content: `Something wrong happen:\n${e}`,
        ephemeral: true,
      });
    }
  },
};
