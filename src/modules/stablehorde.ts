import StableHorde from "@zeldafan0225/stable_horde";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
const stable_horde = new StableHorde({
  cache_interval: 1000 * 10,
  cache: {
    generations_check: 1000 * 30,
  },
  client_agent:
    "!Mrlol#0333-Turing-AI-Discord-bot:https://github.com/MrlolDev/turing-bot",
  default_token: process.env.STABLE_HORDE,
});
import sharp from "sharp";
import { Configuration, OpenAIApi } from "openai";
import "dotenv/config";
import axios from "axios";

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
  nsfw: boolean
) {
  var passFilter = await filter(prompt, model);
  if (!passFilter) {
    return {
      message:
        "To prevent generation of unethical images, we cannot allow this prompt with NSFW models/tags.",
    };
  }

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
    },
  });
  console.log(generation);
  return generation;
}
export async function generateImg2img(
  prompt: string,
  model: string,
  steps: number,
  amount: number,
  nsfw: boolean,
  source_image: string,
  source_processing: typeof StableHorde.SourceImageProcessingTypes[keyof typeof StableHorde.SourceImageProcessingTypes]
) {
  var passFilter = await filter(prompt, model);
  if (!passFilter) {
    return {
      message:
        "To prevent generation of unethical images, we cannot allow this prompt with NSFW models/tags.",
    };
  }

  const generation = await stable_horde.postAsyncGenerate({
    prompt: prompt,
    nsfw: nsfw,
    censor_nsfw: nsfw == true ? false : true,
    r2: false,
    shared: true,
    models: [model],
    source_image,
    source_processing,
    params: {
      n: amount,
      steps: steps,
    },
  });
  console.log(generation);
  return generation;
}
export async function generateInpaiting(
  prompt: string,
  steps: number,
  amount: number,
  nsfw: boolean,
  source_image: string,
  source_processing: typeof StableHorde.SourceImageProcessingTypes[keyof typeof StableHorde.SourceImageProcessingTypes]
) {
  var passFilter = await filter(prompt, model);
  if (!passFilter) {
    return {
      message:
        "To prevent generation of unethical images, we cannot allow this prompt with NSFW models/tags.",
    };
  }

  const generation = await stable_horde.postAsyncGenerate({
    prompt: prompt,
    nsfw: nsfw,
    censor_nsfw: nsfw == true ? false : true,
    r2: false,
    shared: true,
    models: [model],
    source_image,
    source_processing,
    params: {
      n: amount,
      steps: steps,
    },
  });
  console.log(generation);
  return generation;
}
export async function png2webp(pngUrl) {
  const response = await axios.get(pngUrl, { responseType: "arraybuffer" });
  const imageBuffer = Buffer.from(response.data, "binary");
  const webpBuffer = await sharp(imageBuffer).toFormat("webp").toBuffer();

  // Convert the WebP image buffer to a base64 string
  const webpBase64 = webpBuffer.toString("base64");

  return webpBase64;
}

async function filter(prompt, model) {
  var youngWords = [
    "kid",
    "kids",
    "lolis",
    "children",
    "child",
    "boy",
    "baby",
    "young",
    "teen",
    "teenager",
    "niñita",
    "years",
    "16yo",
    "year old",
    "underage",
    "underaged",
    "under-age",
    "under-aged",
    "juvenile",
    "minor",
    "underaged-minor",
    "youngster",
    "young teen",
    "preteen",
    "pre-teen",
    "infant",
    "toddler",
    "baby",
    "prepubescent",
    "minor-aged",
    "jenna ortega",
    "hermione",
  ];
  var nsfwModels = ["Hentai Diffusion", "waifu_diffusion"];
  var nsfwWords = ["naked", "nude", "uncensored"];
  var isNsfw = false;
  var isYoung = false;
  if (nsfwModels.find((x) => x == model)) isNsfw = true;
  if (nsfwWords.some((v) => prompt.toLowerCase().includes(v))) isNsfw = true;
  if (youngWords.some((v) => prompt.toLowerCase().includes(v))) isYoung = true;
  if (!isYoung) {
    var result = await openai.createModeration({
      input: prompt,
    });
    isYoung = result.data.results[0].categories["sexual/minors"];
  }
  if (isYoung && isNsfw) return false;
  return true;
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
    .setStyle(ButtonStyle.Secondary)
    .setLabel("😖");
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
    name: "Stable diffusion v2.1",
    value: "stable_diffusion_2.1",
    tags: null,
  },
  {
    name: "Stable diffusion v2.0",
    value: "stable_diffusion_2.0",
    tags: null,
  },
  {
    name: "Stable diffusion",
    value: "stable_diffusion",
    tags: null,
  },
  {
    name: "Microworlds",
    value: "Microworlds",
    tags: ["microworld render style"],
  },
  { name: "Anything Diffusion", value: "Anything Diffusion" },
  {
    name: "Midjourney Diffusion",
    value: "Midjourney Diffusion",
    tags: ["mdjrny-v4 style"],
  },
  { name: "Dreamshaper", value: "Dreamshaper", tags: null },
  {
    name: "Dreamlike Photoreal",
    value: "Dreamlike Photoreal",
    tags: null,
  },
  {
    name: "Dreamlike Diffusion",
    value: "Dreamlike Diffusion",
    tags: ["dreamlikeart"],
  },
  {
    name: "ProtoGen",
    value: "ProtoGen",
    tags: null,
  },
  {
    name: "Hentai Diffusion",
    value: "Hentai Diffusion",
    tags: ["1girl", "anime"],
  },
  {
    name: "Waifu Diffusion",
    value: "waifu_diffusion",
    tags: null,
  },
  {
    name: "Synthwave",
    value: "Synthwave",
    tags: ["snthwve", "style"],
  },
  {
    name: "Redshift Diffusion",
    value: "Redshift Diffusion",
    tags: ["redshift style"],
  },
  {
    name: "Yiffy",
    value: "Yiffy",
    tags: null,
  },
  {
    name: "Zack3D",
    value: "Zack3D",
    tags: null,
  },
  {
    name: "Protogen Infinity",
    value: "Protogen Infinity",
    tags: null,
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
