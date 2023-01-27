import StableHorde from "@zeldafan0225/stable_horde";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
const stable_horde = new StableHorde({
  cache_interval: 1000 * 10,
  cache: {
    generations_check: 1000 * 30,
  },
  default_token: process.env.STABLE_HORDE,
});
import { Configuration, OpenAIApi } from "openai";
import "dotenv/config";

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
