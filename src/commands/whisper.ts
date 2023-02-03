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
  .addSubcommand((subcommand) =>
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
      .addStringOption((option) =>
        option
          .setName("transcription")
          .setDescription("The transcription result you want to receive")
          .setRequired(true)
          .addChoices(
            {
              name: "plain text",
              value: "plain text",
            },
            {
              name: "Subtitles",
              value: "srt",
            }
          )
      )
      .addStringOption((option) =>
        option
          .setName("translate")
          .setDescription(
            "If you want to translate the audio to english or not"
          )
          .setRequired(false)
          .addChoices(
            {
              name: "translate to english",
              value: "true",
            },
            {
              name: "mantain language",
              value: "false",
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
      .addStringOption((option) =>
        option
          .setName("transcription")
          .setDescription("The transcription result you want to receive")
          .setRequired(true)
          .addChoices(
            {
              name: "plain text",
              value: "plain text",
            },
            {
              name: "Subtitles",
              value: "srt",
            }
          )
      )
      .addStringOption((option) =>
        option
          .setName("translate")
          .setDescription(
            "If you want to translate the audio to english or not"
          )
          .setRequired(false)
          .addChoices(
            {
              name: "translate to english",
              value: "true",
            },
            {
              name: "mantain language",
              value: "false",
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
    var transcription = interaction.options.getString("transcription");
    var translate = interaction.options.getString("translate");
    if (translate == "true") translate = true;
    if (translate == "false") translate = false;

    await interaction.deferReply();
    if (interaction.options.getSubcommand() === "url") {
      var url = interaction.options.getString("url");
      const file = ytdl(url, { filter: "audioonly" });
      var result = await getTranscription(
        file,
        model,
        transcription,
        translate
      );
      await interaction.editReply("Success");
    } else if (interaction.options.getSubcommand() === "file") {
      var file = interaction.options.getAttachment("file");
      file = await getFile(file.url);
      console.log(file);
      var result = await getTranscription(
        file,
        model,
        transcription,
        translate
      );
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

async function getTranscription(file, model, transcription, translate) {
  try {
    const response = await axios({
      baseURL: `https://api-inference.huggingface.co/models/openai/whisper-${model}`,
      headers: { Authorization: `Bearer ${process.env.HF}` },
      method: "POST",
      data: file,
    });
    const result = response.data;
    console.log(result.data);
    return result.data;
    var res = await axios({
      baseURL: "https://api.replicate.com/v1/prediction",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_KEY}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        version:
          "30414ee7c4fffc37e260fcab7842b5be470b9b840f2b608f5baa9bbef9a259ed",
        input: {
          audio: file,
          model,
          //  transcription,
          //translate,
        },
      }),
    });
    console.log(res.data);
    return res.data;
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
