import {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} from "discord.js";
import "dotenv/config";
import { LexicaAPI } from "lexica-api";
const lexica = new LexicaAPI();
import { PagesBuilder, PagesManager } from "discord.js-pages";

export default {
  data: new SlashCommandBuilder()
    .setName("lexica")
    .setDescription("Search image generations from lexica")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The query for searching an image")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (interaction.channel.id != "1061572478675193867") {
      interaction.reply({
        content: `For use this utility go to <#1061572478675193867>`,
        ephemeral: true,
      });
      return;
    }
    try {
      var results = await lexica.search(interaction.options.getString("query"));
      var imgs = results.images;
      if (imgs.length < 0) {
        await interaction.editReply({
          files: imgs,
          content: `No results found for: ${interaction.options.getString(
            "query"
          )}`,
        });
      } else {
        new PagesBuilder(interaction)
          .setTitle(`Results for ${interaction.options.getString("query")}`)
          .setPages(
            imgs.map((el, i) => {
              return new EmbedBuilder()
                .setDescription(`${i}º page`)
                .setImage(el.src);
            })
          )

          .setColor("#5865F2")
          .build();
      }
    } catch (e) {
      await interaction.editReply({
        content: `Something wrong happen:\n${e}`,
        ephemeral: true,
      });
    }
  },
};
