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
              value: "large-v2",
            }
          )
      )
      // output option list
      .addStringOption((option) =>
        option
          .setName("output")
          .setDescription("The output of the command")
          .setRequired(true)
          .addChoices(
            {
              name: "Text",
              value: "text",
            },
            {
              name: "Text file",
              value: "textfile",
            },
            {
              name: "Speaker+text file",
              value: "speakerfile",
            },
            {
              name: "Srt file",
              value: "srt",
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
              value: "large-v2",
            }
          )
      )
      .addStringOption((option) =>
        option
          .setName("output")
          .setDescription("The output of the command")
          .setRequired(true)
          .addChoices(
            {
              name: "Text",
              value: "text",
            },
            {
              name: "Text file",
              value: "textfile",
            },
            {
              name: "Speaker+text file",
              value: "speakerfile",
            },
            {
              name: "Srt file",
              value: "srt",
            }
          )
      )
  );
export default {
  cooldown: "1m",
  data,
  /*
   */
  async execute(interaction, client) {
    var model = interaction.options.getString("model");
    var output = interaction.options.getString("output");

    await interaction.deferReply();
    var url;
    if (interaction.options.getSubcommand() === "url") {
      url = interaction.options.getString("url");
    } else if (interaction.options.getSubcommand() === "file") {
      url = interaction.options.getAttachment("file").url;
    }
    await interaction.editReply("Generating transcript...");
    var result = await getTranscription(url, model, output);

    if (typeof result === "object" && result.error) {
      await interaction.editReply({
        content: `Something wrong happned:\n${result.error}`,
        ephemeral: true,
      });
      return;
    }
    if (result && typeof result == "string") {
      if (
        output === "textfile" ||
        output === "srt" ||
        output == "speakerfile"
      ) {
        var file = new AttachmentBuilder(Buffer.from(result), {
          name: `transcript.${output == "srt" ? "srt" : "txt"}`,
        });
        console.log(file);
        await interaction.editReply({
          content: "Here is your transcript",
          files: [file],
        });
      } else if (output == "text" || output == "speaker") {
        if (result.split("").length > 2000)
          await sendLongText(result, interaction);
        else await interaction.editReply(`**Transcription:** ${result}`);
      }
    }
  },
};

async function getTranscription(fileUrl, model, output) {
  try {
    const form = new FormData();
    form.append("audio_url", fileUrl);
    form.append("language_behaviour", "automatic single language");
    if (output == "srt") form.append("output_format", "srt");

    const response = await axios.post(
      "https://api.gladia.io/audio/text/audio-transcription/",
      form,
      {
        params: {
          model: model,
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
    if (output == "text" || output == "textfile") {
      if (output == "text") transcription = "**Transcription:**\n";
      for (var i = 0; i < res.prediction.length; i++) {
        var tr = res.prediction[i];
        transcription += `${tr.transcription} `;
      }
    } else if (output == "speaker") {
      transcription = "**Transcription:**\n";
      // divide it by speaker making a dialog, speaker_0: complete text of speaker 0, speaker_1: complete text of speaker 1, speaker 0: complete text of speaker 0, etc
      var speaker = 0;
      for (var i = 0; i < res.prediction.length; i++) {
        var tr = res.prediction[i];
        if (tr.speaker != speaker) {
          speaker = tr.speaker;
          transcription += `\n**Speaker ${speaker}:** `;
        }
        transcription += `${tr.transcription} `;
      }
    } else if (output == "srt") {
      transcription = res.transcription;
    }

    return transcription;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
}
// send longer text in discord messages, split them in different messages of less than 2000 characteres each replying the message before it
async function sendLongText(text, interaction) {
  var textArray = text.match(/.{1,2000}/g);
  var lastMessage = interaction;
  for (var i = 0; i < textArray.length; i++) {
    if (lastMessage == interaction)
      lastMessage = await interaction.editReply(` ${textArray[i]}`);
    else lastMessage = await lastMessage.reply(textArray[i]);
  }
}
