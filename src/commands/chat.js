const { SlashCommandBuilder } = require("discord.js");
const { chat } = require("../modules/open.ai.js");
const { getUser, updateCredits, getUserRoles } = require("../modules/user");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Chat with gpt-3")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message for gpt-3")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (interaction.channel.id != "1049275734675443744") {
      interaction.reply({
        content: `For use this utility go to <#1049275734675443744>`,
        ephemeral: true,
      });
      return;
    }
    var user = await getUser(interaction.user);
    var roles = await getUserRoles(interaction.member);
    if (user.credits < 1 && !roles.includes("admin")) {
      interaction.reply({
        content: `You don't have enough credits to this operation`,
        ephemeral: true,
      });
      return;
    }
    var model = "text-babbage-001";
    if (roles.includes("booster")) {
      model = "text-curie-001";
    }
    if (roles.includes("premium")) {
      model = "text-davinci-003";
    }
    await interaction.reply({
      content: `Generating your response with **${model}** for your message`,
      ephemeral: true,
    });
    var message = interaction.options.getString("message");
    var res = await chat(message, model);
    await interaction.channel.send(
      `${interaction.user}: ${message}\nAI: ${res}`
    );
    await updateCredits(user.id, user.credits - 1);
    return;
  },
};
