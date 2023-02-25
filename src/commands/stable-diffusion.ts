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
import { textToImg, getBalance } from "dreamstudio.js";
import supabase from "../modules/supabase.js";
import {
  checkGeneration,
  generateImg,
  generateImg2img,
  models,
  types,
  png2webp,
} from "../modules/stablehorde.js";
import { isPremium } from "../modules/premium.js";
import { createCanvas, loadImage, Image } from "canvas";
import sharp from "sharp";
import { generateRateRow, generateUpscaleRow } from "../modules/stablehorde.js";
import StableHorde from "@zeldafan0225/stable_horde";
import { PagesBuilder } from "discord.js-pages";

var data = new SlashCommandBuilder()
  .setName("stable-diffusion")
  .setDescription("Generate an image using stable diffusion.")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("text2img")
      .setDescription("Transform a normal text in to an image.")
      .addStringOption((option) =>
        option
          .setName("prompt")
          .setDescription("The prompt for generating an image")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("model")
          .setDescription("The stable diffusion model you want to use")
          .setRequired(true)
          .addChoices(
            {
              name: "Stable diffusion",
              value: "stable_diffusion",
            },
            { name: "Microworlds", value: "Microworlds" },
            { name: "Anything Diffusion", value: "Anything Diffusion" },
            { name: "Dreamshaper", value: "Dreamshaper" },
            {
              name: "Dreamlike Photoreal",
              value: "Dreamlike Photoreal",
            },
            {
              name: "Dreamlike Diffusion",
              value: "Dreamlike Diffusion",
            },
            {
              name: "ProtoGen",
              value: "ProtoGen",
            },
            {
              name: "Hentai Diffusion",
              value: "Hentai Diffusion",
            },

            {
              name: "Synthwave",
              value: "Synthwave",
            },
            {
              name: "Redshift Diffusion",
              value: "Redshift Diffusion",
            },
            {
              name: "Yiffy",
              value: "Yiffy",
            },
            {
              name: "Protogen Infinity",
              value: "Protogen Infinity",
            },
            {
              name: "Seek.art",
              value: "Seek.art MEGA",
            },
            {
              name: "PortraitPlus",
              value: "PortraitPlus",
            },
            {
              name: "3DKX",
              value: "3DKX",
            },
            {
              name: "Arcane Diffusion",
              value: "Arcane Diffusion",
            },
            {
              name: "HASDX",
              value: "HASDX",
            },
            {
              name: "Anygen",
              value: "Anygen",
            },
            {
              name: "vectorartz",
              value: "vectorartz",
            },
            {
              name: "Papercut Diffusion",
              value: "Papercut Diffusion",
            },
            {
              name: "Deliberate",
              value: "Deliberate",
            },
            {
              name: "MoistMix",
              value: "MoistMix",
            },
            {
              name: "ChromaV5",
              value: "ChromaV5",
            }
          )
      )
      .addStringOption((option) =>
        option
          .setName("steps")
          .setDescription("The number of steps to generate the image")
          .setRequired(true)
          .addChoices(
            { name: "30", value: "30" },
            { name: "50", value: "50" },
            { name: "100(Premium only)", value: "100" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("The type of the image you want to get")
          .setRequired(false)
          .addChoices(
            { name: "realistic", value: "realistic" },
            { name: "wallpaper", value: "wallpaper" },
            { name: "draw", value: "drawn" },
            { name: "anime", value: "anime" },
            { name: "pastel", value: "pastel" },
            { name: "watercolor", value: "watercolor" },
            { name: "surreal", value: "surreal" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("negprompt")
          .setDescription("The negative prompt you want to use.")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("cfg_scale")
          .setDescription(
            "Its how much the AI listens to your prompt, essentially."
          )
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("sampler")
          .setDescription(".")
          .setRequired(false)
          .addChoices(
            { name: "k_lms", value: "k_lms" },
            { name: "k_heun", value: "k_heun" },
            { name: "k_dpm_2", value: "k_dpm_2" },
            { name: "k_dpm_2_a", value: "k_dpm_2_a" },
            { name: "DDIM", value: "DDIM" },
            { name: "PLMS", value: "PLMS" },
            { name: "k_dpm_fast", value: "k_dpm_fast" },
            { name: "k_dpm_adaptive", value: "k_dpm_adaptive" },
            { name: "k_dpmpp_2s_a ", value: "k_dpmpp_2s_a" },
            { name: "k_dpmpp_2m", value: "k_dpmpp_2m" },
            { name: "dpmsolver", value: "dpmsolver" }
          )
      )

      .addStringOption((option) =>
        option
          .setName("size")
          .setDescription("The size of the images.")
          .setRequired(false)
          .addChoices(
            { name: "512x512", value: "512x512" },
            { name: "512x640", value: "512x640" },
            { name: "640x512", value: "640x512" },
            { name: "640x640", value: "640x640" },
            { name: "768x512(Premium only)", value: "768x512" },
            { name: "512x768(Premium only)", value: "512x768" }
          )
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("img2img")
      .setDescription("Transform an image to another image in base of a text.")
      .addAttachmentOption((option) =>
        option
          .setName("sourceimage")
          .setDescription("The image option for generating the new image")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("prompt")
          .setDescription("The prompt for generating an image")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("model")
          .setDescription("The stable diffusion model you want to use")
          .setRequired(true)
          .addChoices(
            {
              name: "Stable diffusion",
              value: "stable_diffusion",
            },
            { name: "Microworlds", value: "Microworlds" },
            { name: "Anything Diffusion", value: "Anything Diffusion" },
            { name: "Dreamshaper", value: "Dreamshaper" },
            {
              name: "Dreamlike Photoreal",
              value: "Dreamlike Photoreal",
            },
            {
              name: "Dreamlike Diffusion",
              value: "Dreamlike Diffusion",
            },
            {
              name: "ProtoGen",
              value: "ProtoGen",
            },
            {
              name: "Hentai Diffusion",
              value: "Hentai Diffusion",
            },
            {
              name: "Synthwave",
              value: "Synthwave",
            },
            {
              name: "Redshift Diffusion",
              value: "Redshift Diffusion",
            },
            {
              name: "Yiffy",
              value: "Yiffy",
            },
            {
              name: "Protogen Infinity",
              value: "Protogen Infinity",
            },
            {
              name: "Seek.art",
              value: "Seek.art MEGA",
            },
            {
              name: "PortraitPlus",
              value: "PortraitPlus",
            },
            { name: "3DKX", value: "3DKX" },
            {
              name: "Arcane Diffusion",
              value: "Arcane Diffusion",
            },
            {
              name: "HASDX",
              value: "HASDX",
            },
            {
              name: "Anygen",
              value: "Anygen",
            },
            {
              name: "vectorartz",
              value: "vectorartz",
            },
            {
              name: "Papercut Diffusion",
              value: "Papercut Diffusion",
            },
            {
              name: "Deliberate",
              value: "Deliberate",
            },
            {
              name: "MoistMix",
              value: "MoistMix",
            },
            {
              name: "ChromaV5",
              value: "ChromaV5",
            }
          )
      )
      .addStringOption((option) =>
        option
          .setName("steps")
          .setDescription("The number of steps to generate the image")
          .setRequired(true)

          .addChoices(
            { name: "30", value: "30" },
            { name: "50", value: "50" },
            { name: "100(Premium only)", value: "100" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("strength")
          .setDescription("The strength of denoising.")
          .setRequired(true)
          .addChoices(
            { name: "0%", value: "0" },
            { name: "10%", value: "0.1" },
            { name: "20%", value: "0.2" },
            { name: "25%", value: "0.25" },
            { name: "30%", value: "0.3" },
            { name: "35%", value: "0.35" },
            { name: "40%", value: "0.4" },
            { name: "45%", value: "0.45" },
            { name: "50%", value: "0.5" },
            { name: "55%", value: "0.55" },
            { name: "60%", value: "0.6" },
            { name: "65%", value: "0.65" },
            { name: "70%", value: "0.7" },
            { name: "75%", value: "0.75" },
            { name: "80%", value: "0.8" },
            { name: "85%", value: "0.85" },
            { name: "90%", value: "0.9" },
            { name: "95%", value: "0.95" },
            { name: "100%", value: "1" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("The type of the image you want to get")
          .setRequired(false)
          .addChoices(
            { name: "realistic", value: "realistic" },
            { name: "wallpaper", value: "wallpaper" },
            { name: "draw", value: "drawn" },
            { name: "anime", value: "anime" },
            { name: "pastel", value: "pastel" },
            { name: "watercolor", value: "watercolor" },
            { name: "surreal", value: "surreal" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("negprompt")
          .setDescription("The negative prompt you want to use.")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("cfg_scale")
          .setDescription(
            "Its how much the AI listens to your prompt, essentially."
          )
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("sampler")
          .setDescription(".")
          .setRequired(false)
          .addChoices(
            { name: "k_lms", value: "k_lms" },
            { name: "k_heun", value: "k_heun" },
            { name: "k_dpm_2", value: "k_dpm_2" },
            { name: "k_dpm_2_a", value: "k_dpm_2_a" },
            { name: "DDIM", value: "DDIM" },
            { name: "PLMS", value: "PLMS" },
            { name: "k_dpm_fast", value: "k_dpm_fast" },
            { name: "k_dpm_adaptive", value: "k_dpm_adaptive" },
            { name: "k_dpmpp_2s_a ", value: "k_dpmpp_2s_a" },
            { name: "k_dpmpp_2m", value: "k_dpmpp_2m" },
            { name: "dpmsolver", value: "dpmsolver" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("size")
          .setDescription("The size of the images.")
          .setRequired(false)
          .addChoices(
            { name: "512x512", value: "512x512" },
            { name: "512x640", value: "512x640" },
            { name: "640x512", value: "640x512" },
            { name: "640x640", value: "640x640" },
            { name: "512x768(Premium only)", value: "512x768" },
            { name: "512x768(Premium only)", value: "512x768" }
          )
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("models").setDescription("Get the list of models")
  );
export default {
  cooldown: "2m",
  data,
  /*
   */
  async execute(interaction, client) {
    var tags = [];
    var guildId;
    if (interaction.guild) guildId = interaction.guild.id;
    if (interaction.user.id != "530102778408861706") {
      interaction.reply({
        content: `This command is currently under maintenance, please try again later.`,
        ephemeral: true,
      });
      return;
    }
    var ispremium = await isPremium(interaction.user.id, guildId);
    if (
      interaction.channel &&
      interaction.channel.id != "1049275551568896000" &&
      interaction.channel.id != "1066440546379386991" &&
      interaction.guild.id == "899761438996963349"
    ) {
      interaction.reply({
        content: `For use this utility go to <#1049275551568896000>`,
        ephemeral: true,
      });
      return;
    }
    // models subcommand
    if (interaction.options.getSubcommand() == "models") {
      new PagesBuilder(interaction)
        .setColor("#347d9c")
        .setTimestamp()
        .setDescription(
          `You can use this model with /stable-diffusion text2img`
        )
        .setFooter({
          text: `Thanks to https://stablehorde.net`,
        })
        .setPages(
          models.map((el, i) => {
            return new EmbedBuilder().setTitle(el.name).setImage(el.img);
          })
        )
        .build();

      return;
    }
    var s = parseInt(interaction.options.getString("steps"));
    var t = interaction.options.getString("type");
    var cfg_scale = parseInt(interaction.options.getString("cfg_scale"));
    var sampler = interaction.options.getString("sampler");
    var size = interaction.options.getString("size");
    var userBans = await supabase
      .from("bans")
      .select("*")
      .eq("id", interaction.user.id);
    if (userBans.data[0] && userBans.data[0].banned) {
      interaction.reply({
        content: `You are banned from using this utility, If you think this is an error please contact [the support server](https://dsc.gg/tureing) .`,
        ephemeral: true,
      });
      return;
    }
    if (s != 30 && s != 50 && s != 100 && s != 150) {
      await interaction.reply({
        content: `Invalid request`,
        ephemeral: true,
      });
      return;
    }
    if (s >= 100 && ispremium == false) {
      await interaction.reply({
        content:
          `This option is for premium users only, If you want to donate to get premium use the command ` +
          "`/premium buy` .",
        ephemeral: true,
      });
      return;
    }
    const steps: 30 | 50 | 100 | 150 = s;

    var prompt = interaction.options.getString("prompt");
    const negPrompt = interaction.options.getString("negprompt");
    var m = interaction.options.getString("model");

    if (types.find((x) => x.name == t)) {
      var ts = types.find((x) => x.name == t);
      for (var i = 0; i < ts.tags.length; i++) {
        console.log(i, ts.tags[i]);
        tags.push(ts.tags[i]);
      }
    }
    if (models.find((x) => x.name == m && x.tags != null)) {
      var model = models.find((x) => x.name == m && x.tags != null);
      for (var i = 0; i < model.tags.length; i++) {
        console.log(i, model.tags[i]);
        tags.push(model.tags[i]);
      }
    }

    prompt = `${prompt}, ${tags.join(", ")}`;
    var defaultNegPrompt = `lowres, bad anatomy, ((bad hands)), (error), ((missing fingers)), extra digit, fewer digits, awkward fingers, cropped, jpeg artifacts, worst quality, low quality, signature, blurry, extra ears, (deformed, disfigured, mutation, extra limbs:1.5),`;
    var nsfw = false;
    var FullnegPrompt = defaultNegPrompt;
    if (negPrompt) FullnegPrompt = negPrompt;
    var fullPrompt = `${prompt} ### ${negPrompt}`;

    if (interaction.channel && interaction.channel.nsfw) nsfw = true;
    if (!interaction.channel) nsfw = true;

    var width = 512;
    var height = 512;
    if (size) {
      width = parseInt(size.split("x")[0]);
      height = parseInt(size.split("x")[1]);
      if (
        (width >= 768 && ispremium == false) ||
        (height >= 768 && ispremium == false)
      ) {
        await interaction.reply({
          content:
            `This option is for premium users only, If you want to donate to get premium use the command ` +
            "`/premium buy` .",
          ephemeral: true,
        });
        return;
      }
    }
    await interaction.deferReply();

    if (!cfg_scale) cfg_scale = 5;
    if (!sampler) sampler = "k_euler";
    try {
      var generation;
      if (interaction.options.getSubcommand() === "text2img") {
        generation = await generateImg(
          fullPrompt,
          m,
          steps,
          4,
          nsfw,
          cfg_scale,
          sampler,
          width,
          height
        );
      } else if (interaction.options.getSubcommand() === "img2img") {
        const attachment = interaction.options.getAttachment("sourceimage");
        const strength = parseFloat(interaction.options.getString("strength"));

        var image = await png2webp(attachment.url);
        generation = await generateImg2img(
          prompt,
          m,
          steps,
          2,
          nsfw,
          image,
          StableHorde.SourceImageProcessingTypes.img2img,
          cfg_scale,
          sampler,
          width,
          height,
          strength
        );
      }
      if (generation.message) {
        if (
          generation.message.toLowerCase().includes("nsfw") ||
          generation.message.includes("unethical image") ||
          generation.message.includes("violate")
        ) {
          const channel = client.channels.cache.get("1055943633716641853");
          channel.send(
            `**Wrong prompt from __${interaction.user.tag}__** (${
              interaction.user.id
            })\n**Prompt:** ${prompt}\n**Model:** ${m}\n**NSFW:** ${nsfw}\n**Turing filter:** ${
              generation.filter ? "yes" : "no"
            }`
          );
          if (!userBans.data[0]) {
            await supabase.from("bans").insert([
              {
                id: interaction.user.id,
                tries: 1,
                banned: false,
                prompts: [
                  { prompt: prompt, model: m, nsfw: nsfw, date: new Date() },
                ],
              },
            ]);
          } else {
            if (userBans.data[0].tries >= 2) {
              await supabase
                .from("bans")
                .update({
                  banned: true,
                  tries: userBans.data[0].tries + 1,
                  prompts: [
                    ...userBans.data[0].prompts,
                    { prompt: prompt, model: m, nsfw: nsfw, date: new Date() },
                  ],
                })
                .eq("id", interaction.user.id);
            } else {
              await supabase
                .from("bans")
                .update({
                  tries: userBans.data[0].tries + 1,
                  prompts: [
                    ...userBans.data[0].prompts,
                    { prompt: prompt, model: m, nsfw: nsfw, date: new Date() },
                  ],
                })
                .eq("id", interaction.user.id);
            }
          }
        }

        await interaction.editReply({
          content: `Something wrong happen:\n${generation.message}`,
          ephemeral: true,
        });
        return;
      }

      var interval = setInterval(async () => {
        try {
          var status = await checkGeneration(generation);
          if (status.done) {
            clearInterval(interval);
            const { data, error } = await supabase.from("results").insert([
              {
                id: generation.id,
                prompt: fullPrompt,
                provider: m,
                result: status.generations,
                uses: 1,
              },
            ]);

            await sendResults(
              status.generations,
              interaction,
              m,
              prompt,
              FullnegPrompt,
              steps,
              generation.id,
              interaction.user.id,
              cfg_scale,
              sampler,
              width,
              height
            );
          } else {
            if (status.wait_time == undefined) {
              console.log("No wait time", status);
              clearInterval(interval);
              await interaction.editReply({
                content: `Something wrong happen.`,
                ephemeral: true,
              });
            }
            try {
              var waittime = status.wait_time;
              if (waittime < 10) waittime = 10;
              await interaction.editReply({
                content: `Loading...(${waittime}s)`,
              });
            } catch (err) {
              console.log(err);
              clearInterval(interval);
              await interaction.editReply({
                content: `Something wrong happen.`,
                ephemeral: true,
              });
            }
          }
        } catch (err) {
          console.log(err);
          clearInterval(interval);
          await interaction.editReply({
            content: `Something wrong happen.`,
            ephemeral: true,
          });
        }
      }, 15000);
    } catch (e) {
      if (
        generation.message.toLowerCase().includes("nsfw") ||
        generation.message.includes("unethical image") ||
        generation.message.includes("violate")
      ) {
        const channel = client.channels.cache.get("1055943633716641853");
        channel.send(
          `**Wrong prompt from __${interaction.user.tag}__** (${
            interaction.user.id
          })\n**Prompt:** ${prompt}\n**Model:** ${m}\n**NSFW:** ${nsfw}\n**Turing filter:** ${
            generation.filter ? "yes" : "no"
          }`
        );
        if (!userBans.data[0]) {
          await supabase.from("bans").insert([
            {
              id: interaction.user.id,
              tries: 1,
              banned: false,
              prompts: [
                { prompt: prompt, model: m, nsfw: nsfw, date: new Date() },
              ],
            },
          ]);
        } else {
          if (userBans.data[0].tries >= 2) {
            await supabase
              .from("bans")
              .update({
                banned: true,
                tries: userBans.data[0].tries + 1,
                prompts: [
                  ...userBans.data[0].prompts,
                  { prompt: prompt, model: m, nsfw: nsfw, date: new Date() },
                ],
              })
              .eq("id", interaction.user.id);
          } else {
            await supabase
              .from("bans")
              .update({
                tries: userBans.data[0].tries + 1,
                prompts: [
                  ...userBans.data[0].prompts,
                  { prompt: prompt, model: m, nsfw: nsfw, date: new Date() },
                ],
              })
              .eq("id", interaction.user.id);
          }
        }
      }
      await interaction.editReply({
        content: `Something wrong happen:\n${e}`,
        ephemeral: true,
      });
    }
  },
};

async function sendResults(
  images,
  interaction,
  m,
  prompt,
  negPrompt: string,
  steps,
  id: string,
  userId,
  cfg_scale,
  sampler,
  width,
  height
) {
  var imagesArr = images.map(async (g, i) => {
    const sfbuff = Buffer.from(g.img, "base64");
    var img = await sharp(sfbuff).toFormat("png").toBuffer();

    return new AttachmentBuilder(img, { name: "output.png" });
  });

  var embed = new EmbedBuilder()
    .setColor("#347d9c")
    .setTimestamp()
    .setImage(`attachment://output.png`)
    .setFields(
      {
        name: "Prompt",
        value: prompt,
        inline: false,
      },
      {
        name: "Neg prompt",
        value: negPrompt,
        inline: false,
      },
      {
        name: "Steps",
        value: `${steps}`,
        inline: true,
      },
      {
        name: "Model",
        value: `${m}`,
        inline: true,
      },
      {
        name: "cfg_scale",
        value: `${cfg_scale}`,
        inline: true,
      },
      {
        name: "Sampler",
        value: `${sampler}`,
        inline: true,
      },
      {
        name: "Size",
        value: `${width}x${height}`,
        inline: true,
      }
    );

  var row = await generateRateRow(id, userId, images[0].id);
  if (imagesArr.length > 1) {
    row = await generateUpscaleRow(id, images);
  }
  var imgs = images.map((g, i) => {
    const sfbuff = Buffer.from(g.img, "base64");
    return sfbuff;
  });

  let base64: any = await mergeBase64(imgs, width / 2, height / 2);
  base64 = base64.split("base64,")[1];
  var sfbuff = Buffer.from(base64, "base64");
  var resfile = new AttachmentBuilder(sfbuff, { name: "output.png" });
  var resfiles = [resfile];

  var reply = await interaction.editReply({
    files: resfiles,
    components: row,
    content: `${interaction.user}`,
    embeds: [embed],
  });
  /*
  if (imagesArr.length > 1) {
    for (var j = 1; j < imagesArr.length; j++) {
      const row2 = new ActionRowBuilder();
      var img = imagesArr[j];
      var menu2 = new StringSelectMenuBuilder()
        .setCustomId(`rate_${id}_${images[j].id}_${userId}`)
        .setMinValues(1)
        .setMaxValues(1)
        .setOptions(
          {
            value: "1",
            label: "1/10",
          },
          {
            value: "2",
            label: "2/10",
          },
          {
            value: "3",
            label: "3/10",
          },
          {
            value: "4",
            label: "4/10",
          },
          {
            value: "5",
            label: "5/10",
          },
          {
            value: "6",
            label: "6/10",
          },
          {
            value: "7",
            label: "7/10",
          },
          {
            value: "8",
            label: "8/10",
          },
          {
            value: "9",
            label: "9/10",
          },
          {
            value: "10",
            label: "10/10",
          }
        )
        .setPlaceholder(`Rate the result(${j + 1}) with a number from 1 to 10`);
      row2.addComponents(menu2);
      reply = await reply.reply({
        files: [img],
        components: [row2],
      });
    }
  }*/
}

async function mergeBase64(imgs: string[], width, height) {
  var totalW = width * 2;
  var totalH = height * 2;

  if (imgs.length == 1) {
    totalW = totalW / 2;
    totalH = totalH / 2;
  }
  if (imgs.length == 2) {
    totalH = totalH / 2;
  }
  const canvas = createCanvas(totalW, totalH);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < imgs.length; i++) {
    var im = await sharp(imgs[i]).toFormat("png").toBuffer();
    var b64 = Buffer.from(im).toString("base64");
    const img = new Image();
    var x = 0;
    var y = 0;
    if (i == 0) {
      x = 0;
      y = 0;
    }
    if (i == 1) {
      x = width;
      y = 0;
    }
    if (i == 2) {
      x = 0;
      y = height;
    }
    if (i == 3) {
      x = width;
      y = height;
    }
    img.onload = () => ctx.drawImage(img, x, y, width, height);
    img.onerror = (err) => {
      throw err;
    };
    img.src = `data:image/png;base64,${b64}`;
  }

  const dataURL = canvas.toDataURL();
  return dataURL;
}
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
