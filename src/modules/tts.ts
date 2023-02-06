import {
  AudioPlayer,
  createAudioResource,
  StreamType,
  entersState,
  VoiceConnectionStatus,
  joinVoiceChannel,
  getVoiceConnection,
} from "@discordjs/voice";
import discordTTS from "discord-tts";
import delay from "delay";
import { EndBehaviorType, VoiceReceiver } from "@discordjs/voice";
import axios from "axios";
import * as prism from "prism-media";
import "dotenv/config";
import { pipeline } from "node:stream";
import fs from "fs";
import { createWriteStream } from "node:fs";
import type { User } from "discord.js";
import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import Stream from "node:stream";
import cld from "cld";
import { isPremium } from "./premium.js";

export async function voiceAudio(interaction, client, text, model) {
  await interaction.deferReply();
  if (client.guildsVoice.find((x) => x == interaction.guildId)) {
    await interaction.reply({
      ephemeral: true,
      content: `The bot is already processing a request in this server, please wait until the bot finish this request.`,
    });
    return;
  }
  if (!interaction.member.voice.channelId) {
    await interaction.reply({
      ephemeral: true,
      content: `You are not connected to a voice channel.`,
    });
    return;
  }
  client.guildsVoice.push(interaction.guildId);
  let audioPlayer = new AudioPlayer();

  let voiceConnection = await startVoiceConnection(interaction, client);
  console.log("voice", voiceConnection._state.status);

  if (
    voiceConnection._state.status === VoiceConnectionStatus.Connecting ||
    voiceConnection._state.status === VoiceConnectionStatus.Ready
  ) {
    await voiceConnection.subscribe(audioPlayer);
    console.log("voice");
    await responseWithVoice(interaction, text, audioPlayer, model);

    const index = client.guildsVoice.indexOf(interaction.guildId);
    if (index > -1) {
      // only splice array when item is found
      client.guildsVoice.splice(index, 1); // 2nd parameter means remove one item only
    }

    /*  var text = await getTranscription();
      console.log(text);*/
  }
}

async function responseWithVoice(interaction, result, audioPlayer, model) {
  if (!result) result = "Something went wrong with your prompt.";
  var charsCount = result.split("").length;
  var audioResources = [];
  var langCode = "en";
  try {
    var langObj = await cld.detect(result);
    if (langObj.reliable && langObj.languages[0].code != "en") {
      langCode = langObj.languages[0].code;
    }
  } catch (err) {}
  console.log(langCode, charsCount);
  if (charsCount >= 200) {
    if (charsCount >= 1000) {
      interaction.reply(`Text is too long to read it`);
      return;
    }
    var loops = Math.ceil(charsCount / 200);
    for (var i = 0; i < loops; i++) {
      if (i == 0) {
        let stream = await genStream(
          model,
          `${result.split("").slice(0, 200).join("")}`,
          langCode
        );
        let audioResource = createAudioResource(stream, {
          inputType: StreamType.Arbitrary,
          inlineVolume: true,
        });
        audioResources.push({ ar: audioResource, chars: 200 });
      } else {
        let stream = await genStream(
          model,
          `${result
            .split("")
            .slice(200 * i, 200 * i + 200)
            .join("")}`,
          langCode
        );
        let audioResource = createAudioResource(stream, {
          inputType: StreamType.Arbitrary,
          inlineVolume: true,
        });
        audioResources.push({
          ar: audioResource,
          chars: result.split("").slice(200 * i, 200 * i + 200).length,
        });
      }
    }
  } else {
    var stream = await genStream(model, `${result}`, langCode);
    var audioResource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
      inlineVolume: true,
    });
  }

  if (audioResources.length >= 1) {
    for (let i = 0; i < audioResources.length; i++) {
      var ar = audioResources[i].ar;
      console.log(`playing ${i} with ${audioResources[i].chars} characters`);
      audioPlayer.play(ar);
      await delay(audioResources[i].chars * 80);
    }
  } else {
    audioPlayer.play(audioResource);
    await delay(charsCount * 80);
  }
}

async function startVoiceConnection(interaction, client) {
  let voiceConnection;
  if (getVoiceConnection(interaction.guildId)) {
    voiceConnection = getVoiceConnection(interaction.guildId);
  }
  if (
    !voiceConnection ||
    voiceConnection._state.status === VoiceConnectionStatus.Disconnected
  ) {
    voiceConnection = joinVoiceChannel({
      channelId: interaction.member.voice.channelId,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false,
    });
    voiceConnection = await entersState(
      voiceConnection,
      VoiceConnectionStatus.Connecting,
      10_000
    );
  }
  console.log(voiceConnection);
  return voiceConnection;
}

async function genStream(model, text, langCode) {
  console.log(model);
  if (model == "GoogleTTS") {
    return discordTTS.getVoiceStream(text, { lang: langCode });
  } else {
    var stream = await Elevenlabs(text);
    return stream;
  }
}
export async function Elevenlabs(string) {
  try {
    var res = await axios({
      baseURL: "https://api.pawan.krd/tts",
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      data: JSON.stringify({
        text: string,
        voice: "adam",
      }),
      responseType: "arraybuffer",
    });
    var data = res.data;
    var stream = await convertBufferToStream(data);
    return stream;
  } catch (err) {
    console.log(err);
    return null;
  }
}
async function convertBufferToStream(buffer) {
  const binaryStream = new Stream.Readable();
  binaryStream.push(buffer);
  binaryStream.push(null);
  return binaryStream;
}
async function buttons() {
  const row = new ActionRowBuilder();
  var btn1 = new ButtonBuilder() //1
    .setCustomId(`leave-vc`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel(`Stop voice system`);
  row.addComponents(btn1);

  return [row];
}
