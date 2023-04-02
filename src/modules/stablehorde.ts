import StableHorde from "@zeldafan0225/stable_horde";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
const stable_horde = new StableHorde({
  cache_interval: 1000 * 10,
  cache: {
    generations_check: 1000 * 30,
  },
  client_agent: "Turing-AI-Discord-bot:1.0:(discord)Mrlol#0333",
  default_token: process.env.STABLE_HORDE,
});
import sharp from "sharp";
import { Configuration, OpenAIApi } from "openai";
import "dotenv/config";
import axios from "axios";
import underagedCebs from "./all_name_regex.js";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

export default stable_horde;
export async function getModels() {
  var models = await stable_horde.getModels();
  return models;
}

export async function generateImg(
  prompt: string,
  model: string,
  steps: number,
  amount: number,
  nsfw: boolean,
  cfg_scale,
  sampler,
  width,
  height
) {
  var passFilter = await filter(prompt, model);
  if (!passFilter) {
    return {
      message:
        "To prevent generation of unethical images, we cannot allow this prompt with NSFW models/tags.",
      filter: true,
    };
  }
  try {
    const generation = await stable_horde.postAsyncGenerate({
      prompt: prompt,
      nsfw: nsfw,
      censor_nsfw: nsfw == true ? false : true,
      r2: false,
      shared: true,
      models: [model],
      params: {
        n: amount,
        steps: steps,
        cfg_scale,
        sampler_name: sampler,
        width,
        height,
      },
    });
    return generation;
  } catch (e) {
    return { message: e };
  }
}
export async function generateImg2img(
  prompt: string,
  model: string,
  steps: number,
  amount: number,
  nsfw: boolean,
  source_image: string,
  source_processing,
  cfg_scale,
  sampler,
  width,
  height,
  strength
) {
  var passFilter = await filter(prompt, model);
  if (!passFilter.filter) {
    return {
      message:
        "To prevent generation of unethical images, we cannot allow this prompt with NSFW models/tags.",
    };
  }
  try {
    const generation = await stable_horde.postAsyncGenerate({
      prompt: prompt,
      nsfw: nsfw,
      censor_nsfw: nsfw == true ? false : true,
      r2: false,
      shared: true,
      models: [model],
      source_image,
      source_processing: StableHorde.SourceImageProcessingTypes.img2img,
      params: {
        n: amount,
        steps: steps,
        // @ts-ignore
        sampler_name: sampler,
        width,
        height,
        cfg_scale,
        denoising_strength: strength,
      },
    });
    return { ...generation, isNsfw: passFilter.isNsfw };
  } catch (e) {
    return { message: e, isNsfw: passFilter.isNsfw };
  }
}
export async function png2webp(pngUrl) {
  const response = await axios.get(pngUrl, { responseType: "arraybuffer" });
  const imageBuffer = Buffer.from(response.data, "binary");
  const webpBuffer = await sharp(imageBuffer).toFormat("webp").toBuffer();

  // Convert the WebP image buffer to a base64 string
  const webpBase64 = webpBuffer.toString("base64");

  return webpBase64;
}

async function filter(prompt, model?) {
  var req = await axios.post(
    "https://api.turingai.tech/filter",
    {
      prompt: prompt,
      model: model,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.TURING_API}`,
      },
    }
  );
  var res = req.data;
  if (res.isCP) {
    return { filter: false, ...res };
  }
  return { filter: true, ...res };
}

export async function checkGeneration(generation: any) {
  // check the status of your generation using the generations id
  const check = await stable_horde.getGenerationStatus(generation.id);
  return check;
}
export async function generateUpscaleRow(generationId, images) {
  const row = new ActionRowBuilder();
  for (var i = 0; i < images.length; i++) {
    var btn1 = new ButtonBuilder() //1
      .setCustomId(`u_${generationId}_${images[i].id}`)
      .setStyle(ButtonStyle.Secondary)
      .setLabel(`U${i + 1}`);
    row.addComponents(btn1);
  }
  return [row];
}
export async function generateRateRow(generationId, userId, imageId) {
  const row = new ActionRowBuilder();
  const btn1 = new ButtonBuilder() //1
    .setCustomId(`r_${generationId}_${imageId}_${userId}_1`)
    .setLabel("😖")
    .setStyle(ButtonStyle.Secondary);
  row.addComponents(btn1);
  //\😒  \😀 \😍️️️️️️\☹️
  const btn2 = new ButtonBuilder() //3
    .setCustomId(`r_${generationId}_${imageId}_${userId}_3`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel("☹️");
  row.addComponents(btn2);
  const btn3 = new ButtonBuilder() //5
    .setCustomId(`r_${generationId}_${imageId}_${userId}_5`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel("😒");
  row.addComponents(btn3);
  const btn4 = new ButtonBuilder() //7
    .setCustomId(`r_${generationId}_${imageId}_${userId}_7`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel("😀");
  row.addComponents(btn4);
  const btn5 = new ButtonBuilder() //9
    .setCustomId(`r_${generationId}_${imageId}_${userId}_9`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel("😍️️️️️️");
  row.addComponents(btn5);
  return [row];
}

export var models = [
  {
    name: "Stable diffusion",
    value: "stable_diffusion",
    tags: null,
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845901233160232/Stable_Diffusion.png",
  },
  {
    name: "Microworlds",
    value: "Microworlds",
    tags: ["microworld render style"],
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845875341742130/Microworlds.png",
  },
  {
    name: "Anything Diffusion",
    value: "Anything Diffusion",
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845812599132241/Anything_Diffusion.png",
  },

  {
    name: "Dreamshaper",
    value: "Dreamshaper",
    tags: null,
    img: "https://media.discordapp.net/attachments/1049270671764619264/1083845811638652928/Dreamshaper.png?width=382&height=382",
  },
  {
    name: "Dreamlike Photoreal",
    value: "Dreamlike Photoreal",
    tags: null,
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845814926970930/Dreamlike_Photoreal.png",
  },
  {
    name: "Dreamlike Diffusion",
    value: "Dreamlike Diffusion",
    tags: ["dreamlikeart"],
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845814633386074/Dreamlike_Diffusion.png",
  },
  {
    name: "ProtoGen",
    value: "ProtoGen",
    tags: null,
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845876688101546/ProtoGen.png",
  },
  {
    name: "Hentai Diffusion",
    value: "Hentai Diffusion",
    tags: ["anime"],
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845874913910844/Hentai_Diffusion.png",
  },
  {
    name: "Synthwave",
    value: "Synthwave",
    tags: ["snthwve", "style"],
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845901493227681/Synthwave.png",
  },
  {
    name: "Redshift Diffusion",
    value: "Redshift Diffusion",
    tags: ["redshift style"],
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845874163130378/Redshift_Diffusion.png",
  },
  {
    name: "Yiffy",
    value: "Yiffy",
    tags: null,
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845900662755339/Yiffy.png",
  },

  {
    name: "Protogen Infinity",
    value: "Protogen Infinity",
    tags: null,
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845876470001705/Protogen_Infinity.png",
  },

  {
    name: "Seek.art",
    value: "Seek.art MEGA",
    tags: null,
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845900918591600/Seek.art.png",
  },
  {
    name: "PortraitPlus",
    value: "PortraitPlus",
    tags: ["portrait"],
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845876243517540/PortraitPlus.png",
  },
  {
    name: "3DKX",
    value: "3DKX",
    tags: null,
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845811936432128/3DKX.png",
  },
  {
    name: "Arcane Diffusion",
    value: "Arcane Diffusion",
    tags: ["arcane style"],
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845813521895474/Arcane_Diffusion.png",
  },
  {
    name: "HASDX",
    value: "HASDX",
    tags: null,
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845874528047244/HASDX.png",
  },
  {
    name: "vectorartz",
    value: "vectorartz",
    tags: ["vectorartz"],
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845900385910814/vectorartz.png",
  },
  {
    name: "Papercut Diffusion",
    value: "Papercut Diffusion",
    tags: ["PaperCut"],
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845875882795098/Papercut_Diffusion.png",
  },
  {
    name: "Deliberate",
    value: "Deliberate",
    tags: null,
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845814302031962/Deliberate.png",
  },
  {
    name: "MoistMix",
    value: "MoistMix",
    tags: null,
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845875572420669/MoistMix.png",
  },
  {
    name: "ChromaV5",
    value: "ChromaV5",
    tags: ["ChromaV5"],
    img: "https://cdn.discordapp.com/attachments/1049270671764619264/1083845813870006312/ChromaV5.png",
  },
];

export var types = [
  {
    name: "realistic",
    tags: [
      "((realistic))",
      "((RTX))",
      "highres",
      "extreme detail",
      "((photograph))",
      "((photorealistic))",
    ],
  },
  {
    name: "wallpaper",
    tags: ["((background))", "((wallpaper))", "colorful", "highres"],
  },
  {
    name: "drawn",
    tags: ["((drawing))"],
  },
  {
    name: "pastel",
    tags: ["((drawing))", "((pastel style))", "((pastel colors))"],
  },
  {
    name: "watercolor",
    tags: ["((drawing))", "((watercolor style))", "((watercolor))"],
  },
  {
    name: "anime",
    tags: ["((anime))", "((anime style))"],
  },
  {
    name: "surreal",
    tags: ["((impossible))", "((strange))", "((wonky))", "((surreal))"],
  },
];
