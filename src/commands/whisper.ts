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
import { generateRateRow, generateUpscaleRow } from "../modules/stablehorde.js";

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
            ).addStringOption((option) =>
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
        if (translate == 'true') translate = true;
        if (translate == 'false') translate = false;


        if (interaction.options.getSubcommand() === "url") {
            var url = interaction.options.getString("url");

        } else if (interaction.options.getSubcommand() === "file") {
            var file = interaction.options.getAttachment("file");

        }
    },
};
