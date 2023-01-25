import { SlashCommandBuilder } from "discord.js";
import stable_horde from "../modules/stablehorde.js";
import supabase from "../modules/supabase.js";

export default {
  data: {
    customId: "rateMenu",
    description: "Select menu for rating an image",
  },
  async execute(interaction, client, generationId, imageId) {
    await interaction.deferReply();
    const rate = interaction.values[0];
    var { data, error } = await supabase
      .from("results")
      .select("*")
      .eq("id", generationId)
      .eq("rated", true);
    if (data && data[0]) {
      await interaction.followUp({
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

    await interaction.editReply(
      `${interaction.user} image rated successfully, thanks.`
    );
  },
};
