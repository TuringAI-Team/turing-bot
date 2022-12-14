const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
require("dotenv").config();
const { getUser, updateCredits, getUserRoles } = require("../modules/user");
const { dalle } = require("../modules/open.ai");

module.exports = {
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
    var roles = await getUserRoles(interaction.member);
    var user = await getUser(interaction.user);
    const number = parseInt(interaction.options.getString("number"));
    if (user.credits < number * 2 && !roles.includes("admin")) {
      interaction.reply({
        content: `You don't have enough credits to this operation`,
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({
      content: `Dall-e 2 is not available right now. Please use <#1049275551568896000>`,
      ephemeral: true,
    });
    return;
    try {
      await interaction.reply({
        content: `Generating your results for: **${interaction.options.getString(
          "prompt"
        )}**`,
        ephemeral: true,
      });
      var imgs = await dalle(interaction.options.getString("prompt"), number);

      await interaction.channel.send({
        files: imgs,
        content: `**${interaction.options.getString("prompt")}** - ${
          interaction.user
        }`,
      });
      await updateCredits(user.id, user.credits - number * 2);
    } catch (e) {
      await interaction.reply({
        content: `Something wrong happen:\n${e}`,
        ephemeral: true,
      });
    }
  },
};
