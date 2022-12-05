const { SlashCommandBuilder } = require("discord.js");
const {
  getUser,
  updateCredits,
  claimReward,
  getLastClaim,
  getUserRoles,
} = require("../modules/user");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("claim")
    .setDescription("Use this command to obtain credits")
    .addStringOption((option) =>
      option
        .setName("way")
        .setDescription("The way you want to get the credits")
        .setRequired(true)
        .addChoices(
          { name: "Top.gg Vote", value: "topgg" },
          { name: "Linkvertise", value: "linkvertise" },
          { name: "Premium", value: "premium" },
          { name: "Boost", value: "boost" }
        )
    ),
  async execute(interaction) {
    var user = await getUser(interaction.user);
    var way = interaction.options.getString("way");
    var roles = await getUserRoles(interaction.member);
    if (way == "boost") {
      if (!roles.includes("booster")) {
        await interaction.reply({
          ephemeral: true,
          content: `${interaction.user} you aren't a server booster.`,
        });
        return;
      }
      var lastClaim = await getLastClaim(interaction.user.id, "boost");
      console.log(Date.now() - lastClaim);
      if (Date.now() - lastClaim < ms("24h")) {
        await interaction.reply({
          ephemeral: true,
          content: `${interaction.user} you have already claim your booster reward`,
        });
        return;
      }
      await interaction.reply({
        ephemeral: true,
        content: `${interaction.user}, added 10 credits to your account`,
      });
      await updateCredits(interaction.user.id, user.credits + 10);
      await claimReward(interaction.user.id, "boost", 10);
    } else if (way == "premium") {
    }
  },
};
