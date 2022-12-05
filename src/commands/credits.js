const { SlashCommandBuilder } = require("discord.js");
const { getUser } = require("../modules/user");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("credits")
    .setDescription("See your available credits"),
  async execute(interaction) {
    var user = await getUser(interaction.user);

    return interaction.reply({
      ephemeral: true,
      content: `${interaction.user} you have a total of ${user.credits} credits.\nIf you want more credits read <#1047053083710079026>`,
    });
  },
};
