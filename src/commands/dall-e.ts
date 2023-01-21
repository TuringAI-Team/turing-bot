import {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} from "discord.js";
import "dotenv/config";
import { dalle } from "../modules/open.ai.js";
import supabase from "../modules/supabase.js";

export default {
  cooldown: "4m",
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
    if (
      interaction.channel.id != "1049275833379979365" &&
      interaction.guild.id == "899761438996963349"
    ) {
      interaction.reply({
        content: `For use this utility go to <#1049275833379979365>`,
        ephemeral: true,
      });
      return;
    }
    const number = parseInt(interaction.options.getString("number"));
    await interaction.reply({
      content: `Generating your results for: **${interaction.options.getString(
        "prompt"
      )}**`,
    });
    let { data: accounts, error } = await supabase
      .from("accounts")
      .select("*")
      .neq("key", null);
    var firstOne = await accounts[0];
    if (!firstOne) {
      await interaction.reply({
        content: `We are running out of credits, please wait until we solve the issue.`,
        ephemeral: true,
      });
      return;
    }
    if (!firstOne.key.startsWith("sk-")) {
      console.log(firstOne.id, "set to null");
      const { data, error } = await supabase
        .from("accounts")
        .update({
          key: null,
        })
        .eq("id", firstOne.id);
    }

    try {
      var imgs = await dalle(
        interaction.options.getString("prompt"),
        number,
        firstOne.key
      );

      await interaction.editReply({
        files: imgs,
        content: `${
          interaction.user
        }  **Prompt:** ${interaction.options.getString("prompt")}`,
      });
    } catch (e) {
      await interaction.editReply({
        content: `Something wrong happen:\n${e}`,
        ephemeral: true,
      });
    }
  },
};
