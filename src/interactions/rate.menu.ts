import { SlashCommandBuilder } from "discord.js";
import stable_horde from "../modules/stablehorde.js";
import supabase from "../modules/supabase.js";

export default {
  data: {
    customId: "rateMenu",
    description: "Select menu for rating an image",
  },
  async execute(interaction, client, generationId, imageId, userId) {
    const rate = interaction.values[0];
    if (userId != interaction.user.id) {
      await interaction.reply({
        content: `You can't rate a image that you haven't generated.`,
        ephemeral: true,
      });
      return;
    }
    var { data, error } = await supabase
      .from("results")
      .select("*")
      .eq("id", generationId)
      .eq("rated", true);
    if (data && data[0]) {
      await interaction.reply({
        content: `This image have already been rated`,
        ephemeral: true,
      });
      return;
    }
    const res = await stable_horde
      .postRating(generationId, {
        ratings: [{ id: imageId, rating: parseInt(rate) }],
      })
      .catch(console.error);
    await supabase
      .from("results")
      .update({
        rated: true,
      })
      .eq("id", generationId);

    await interaction.reply(
      `${interaction.user} image rated successfully, thanks.`
    );
  },
};
