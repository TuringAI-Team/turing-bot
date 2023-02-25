import {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from "discord.js";
import "dotenv/config";
import supabase from "../modules/supabase.js";
import { isPremium } from "../modules/premium.js";
import axios from "axios";
import fs from "fs";
import ytdl from "ytdl-core";
import FormData from "form-data";

var data = new SlashCommandBuilder()
  .setName("transcript")
  .setDescription("Generate an audio transcription using whisper AI.")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("url")
      .setDescription("Transform an audio url in to text(youtube supported).")
      .addStringOption((option) =>
        option
          .setName("url")
          .setDescription("The url of the audio you want to transcript")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("model")
          .setDescription("The whisper ai model you want to use")
          .setRequired(true)
          .addChoices(
            {
              name: "medium",
              value: "medium",
            },
            {
              name: "large(Premium only)",
              value: "lage-v2",
            }
          )
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("file")
      .setDescription("Transform an audio file into text.")
      .addAttachmentOption((option) =>
        option
          .setName("file")
          .setDescription("The audio file for generating the text")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("model")
          .setDescription("The whisper ai model you want to use")
          .setRequired(true)
          .addChoices(
            {
              name: "medium",
              value: "medium",
            },
            {
              name: "large(Premium only)",
              value: "lage-v2",
            }
          )
      )
  );
export default {
  cooldown: "2m",
  data,
  /*
   */
  async execute(interaction, client) {
    var model = interaction.options.getString("model");
    var translate = interaction.options.getString("translate");
    if (translate == "true") translate = true;
    if (translate == "false") translate = false;

    await interaction.deferReply();
    if (interaction.options.getSubcommand() === "url") {
      var url = interaction.options.getString("url");

      var result = await getTranscription(url, model);
      if (typeof result === "object" && result.error) {
        await interaction.editReply({
          content: result.error,
          ephemeral: true,
        });
        return;
      }
      if (result) {
        await interaction.editReply(`**Transcription:** ${result}`);
      }
    } else if (interaction.options.getSubcommand() === "file") {
      var file = interaction.options.getAttachment("file");
      var result = await getTranscription(file.url, model);
      if (typeof result === "object" && result.error) {
        await interaction.editReply({
          content: result.error,
          ephemeral: true,
        });
        return;
      }
      if (result) {
        await interaction.editReply(`**Transcription:** ${result}`);
      }
    }
  },
};

async function getTranscription(fileUrl, model) {
  try {
    const form = new FormData();
    form.append("audio_url", fileUrl);
    form.append("language_behaviour", "automatic single language");

    const response = await axios.post(
      "https://api.gladia.io/audio/text/audio-transcription/",
      form,
      {
        params: {
          model: "large-v2",
        },
        headers: {
          ...form.getHeaders(),
          accept: "application/json",
          "x-gladia-key": process.env.GLADIA_API_KEY,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    var res = response.data;
    var transcription = "";
    for (var i = 0; i < res.prediction.length; i++) {
      var tr = res.prediction[i];
      transcription += `${tr.transcription} `;
    }
    return transcription;
  } catch (err) {
    return { error: err };
  }
}
