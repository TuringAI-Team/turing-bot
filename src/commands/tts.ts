import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} from "discord.js";
import supabase from "../modules/supabase.js";
import { isPremium } from "../modules/premium.js";
import { voiceAudio } from "../modules/tts.js";
var maintenance = false;

export default {
  cooldown: "30s",
  data: new SlashCommandBuilder()
    .setName("tts")
    .setDescription("Use tts with an AI")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message for the AI")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("model")
        .setDescription("The model you want to use for the AI.")
        .setRequired(true)
        .addChoices(
          { name: "GoogleTTS", value: "GoogleTTS" },
          { name: "ElevenLabs", value: "ElevenLabs" }
        )
    ),
  async execute(interaction, client, commands, commandType, options) {
    var message = interaction.options.getString("message");
    var model = interaction.options.getString("model");
    var ispremium = await isPremium(interaction.user.id);
    await voiceAudio(interaction, client, message, model);
  },
};
