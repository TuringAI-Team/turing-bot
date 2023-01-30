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
              name: "Stable diffusion v2.1",
              value: "stable_diffusion_2.1",
            },
            {
              name: "Stable diffusion v2.0",
              value: "stable_diffusion_2.0",
            },
            {
              name: "Stable diffusion",
              value: "stable_diffusion",
            },
            { name: "Microworlds", value: "Microworlds" },
            { name: "Anything Diffusion", value: "Anything Diffusion" },
            { name: "Midjourney Diffusion", value: "Midjourney Diffusion" },
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
              name: "Waifu Diffusion",
              value: "waifu_diffusion",
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
              name: "Zack3D",
              value: "Zack3D",
            },
            {
              name: "Protogen Infinity",
              value: "Protogen Infinity",
            },
            {
              name: "Seek.art",
              value: "Seek.art MEGA",
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
          .setName("seed")
          .setDescription("The seed to use to generete this request.")
          .setRequired(false)
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
              name: "Stable diffusion v2.1",
              value: "stable_diffusion_2.1",
            },
            {
              name: "Stable diffusion v2.0",
              value: "stable_diffusion_2.0",
            },
            {
              name: "Stable diffusion",
              value: "stable_diffusion",
            },
            { name: "Microworlds", value: "Microworlds" },
            { name: "Anything Diffusion", value: "Anything Diffusion" },
            { name: "Midjourney Diffusion", value: "Midjourney Diffusion" },
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
              name: "Waifu Diffusion",
              value: "waifu_diffusion",
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
              name: "Zack3D",
              value: "Zack3D",
            },
            {
              name: "Protogen Infinity",
              value: "Protogen Infinity",
            },
            {
              name: "Seek.art",
              value: "Seek.art MEGA",
            }
          )
      )
      .addStringOption((option) =>
        option
          .setName("steps")
          .setDescription("The number of steps to generate the image")
          .setRequired(true)
          .addChoices({ name: "30", value: "30" }, { name: "50", value: "50" })
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
          .setName("seed")
          .setDescription("The seed to use to generete this request.")
          .setRequired(false)
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
  );
export default {
  cooldown: "2m",
  data,
  /*
   */
  async execute(interaction, client) {
    var tags = [];
    var ispremium = await isPremium(interaction.user.id);
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
    var s = parseInt(interaction.options.getString("steps"));
    var t = interaction.options.getString("type");
    var cfg_scale = parseInt(interaction.options.getString("cfg_scale"));
    var sampler = interaction.options.getString("sampler");
    var seed = interaction.options.getString("seed");
    var size = interaction.options.getString("size");

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
    }
    const steps: 30 | 50 | 100 | 150 = s;

    var prompt = interaction.options.getString("prompt");
    const negPrompt = interaction.options.getString("negprompt");
    var m = interaction.options.getString("model");

    console.log(tags);
    if (types.find((x) => x.name == t)) {
      var ts = types.find((x) => x.name == t);
      for (var i = 0; i < ts.tags.length; i++) {
        console.log(i, ts.tags[i]);
        tags.push(ts.tags[i]);
      }
    }
    console.log(tags);
    if (models.find((x) => x.name == m && x.tags != null)) {
      var model = models.find((x) => x.name == m && x.tags != null);
      for (var i = 0; i < model.tags.length; i++) {
        console.log(i, model.tags[i]);
        tags.push(model.tags[i]);
      }
    }
    console.log(tags);

    prompt = `${prompt}, ${tags.join(", ")}`;
    await interaction.deferReply();
    var defaultNegPrompt = `lowres, bad anatomy, ((bad hands)), (error), ((missing fingers)), extra digit, fewer digits, awkward fingers, cropped, jpeg artifacts, worst quality, low quality, signature, blurry, extra ears, (deformed, disfigured, mutation, extra limbs:1.5),`;
    var nsfw = false;
    var FullnegPrompt = defaultNegPrompt;
    if (negPrompt) FullnegPrompt = negPrompt;
    var fullPrompt = `${prompt} ### ${negPrompt}`;

    if (interaction.channel && interaction.channel.nsfw) nsfw = true;

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
      }
    }

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
          seed,
          width,
          height
        );
        console.log(generation);

        if (generation.message) {
          if (
            generation.message.includes(
              "This prompt appears to violate our terms of service and will be reported"
            )
          ) {
            const channel = client.channels.cache.get("1051425293715390484");
            await interaction.reply({
              content: `Sending...`,
              ephemeral: true,
            });
            channel.send(
              `**Wrong prompt from __${interaction.user.tag}__** (${interaction.user.id})\n**Prompt:** ${prompt}\n**Model:** ${m}\n**NSFW:** ${nsfw}`
            );
          }

          await interaction.editReply({
            content: `Something wrong happen:\n${generation.message}`,
            ephemeral: true,
          });
          return;
        }
      } else if (interaction.options.getSubcommand() === "img2img") {
        const attachment = interaction.options.getAttachment("sourceimage");
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
          seed,
          width,
          height
        );
      }

      async function check() {
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
            interaction.user.id
          );
        } else {
          if (status.wait_time == undefined) {
            console.log("No wait time");
            clearInterval(interval);
            await interaction.editReply({
              content: `Something wrong happen.`,
              ephemeral: true,
            });
          }
          try {
            var waittime = status.wait_time;
            if (waittime < 15) {
              clearInterval(interval);
              setTimeout(async () => {
                try {
                  await check();
                } catch (err) {
                  console.log(err);
                  clearInterval(interval);
                  await interaction.editReply({
                    content: `Something wrong happen.`,
                    ephemeral: true,
                  });
                }
              }, waittime * 1000 + 2000);
            }
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
      }
      var interval = setInterval(async () => {
        try {
          await check();
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
  userId
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

  let base64: any = await mergeBase64(imgs);
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

async function mergeBase64(imgs: string[]) {
  var totalW = 512;
  var totalH = 512;
  if (imgs.length == 1) {
    totalW = 256;
    totalH = 256;
  }
  if (imgs.length == 2) {
    totalW = 512;
    totalH = 256;
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
      x = 256;
      y = 0;
    }
    if (i == 2) {
      x = 0;
      y = 256;
    }
    if (i == 3) {
      x = 256;
      y = 256;
    }
    img.onload = () => ctx.drawImage(img, x, y, 256, 256);
    img.onerror = (err) => {
      throw err;
    };
    img.src = `data:image/png;base64,${b64}`;
  }

  const dataURL = canvas.toDataURL();
  return dataURL;
}
