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

var data = new SlashCommandBuilder()
  .setName("whisper")
  .setDescription("Generate an image using stable diffusion.")
  /*.addSubcommand((subcommand) =>
    subcommand
      .setName("url")
      .setDescription("Transform an audio url in to text(youtube supported).")
      .addStringOption((option) =>
        option
          .setName("url")
          .setDescription("The urlof the audio you want to transcript")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("model")
          .setDescription("The whisper ai model you want to use")
          .setRequired(true)
          .addChoices(
            {
              name: "tiny",
              value: "tiny",
            },
            {
              name: "base",
              value: "base",
            },
            {
              name: "small",
              value: "small",
            },

            {
              name: "medium",
              value: "medium",
            },
            {
              name: "large(Premium only)",
              value: "lage",
            }
          )
      )
  )*/
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
              name: "tiny",
              value: "tiny",
            },
            {
              name: "base",
              value: "base",
            },
            {
              name: "small",
              value: "small",
            },

            {
              name: "medium",
              value: "medium",
            },
            {
              name: "large(Premium only)",
              value: "lage",
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
      if (url.includes("youtube.com")) {
        const file = await getBuffer(url);
        console.log(file);
      } else {
        file = await getFile(url);
      }

      var result = await getTranscription(file, model);
      if (result.error) {
        await interaction.editReply({
          content: result.error,
          ephemeral: true,
        });
        return;
      }
      if (result.text) {
        await interaction.editReply(`**Transcription:** ${result.text}`);
      }
    } else if (interaction.options.getSubcommand() === "file") {
      var file = interaction.options.getAttachment("file");
      file = await getFile(file.url);
      var result = await getTranscription(file, model);
      if (result.error) {
        await interaction.editReply({
          content: result.error,
          ephemeral: true,
        });
        return;
      }
      if (result.text) {
        await interaction.editReply(`**Transcription:** ${result.text}`);
      }
    }
  },
};
async function getBuffer(url) {
  return new Promise((resolve, reject) => {
    ytdl(url, { filter: "audioonly" })
      .on("error", reject)
      // @ts-ignore
      .pipe(Buffer.alloc(0), (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer);
      });
  });
}
async function getTranscription(file, model) {
  try {
    const response = await axios({
      baseURL: `https://api-inference.huggingface.co/models/openai/whisper-${model}`,
      headers: { Authorization: `Bearer ${process.env.HF}` },
      method: "POST",
      data: file,
    });
    const result = response.data;
    return result;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
}

async function getFile(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data, "binary");

  return buffer;
}
