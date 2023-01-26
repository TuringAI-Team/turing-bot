import StableHorde from "@zeldafan0225/stable_horde";
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

  return generation;
}

async function filter(prompt, model) {
  var youngWords = [
    "kid",
    "kids",
    "lolis",
    "children",
    "child",
    "girl",
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
  ];
  var nsfwModels = ["Hentai Diffusion", "waifu_diffusion"];
  var nsfwWords = ["naked", "nude", "uncensored"];
  var isNsfw = false;
  var isYoung = false;
  if (nsfwModels.find((x) => x == model)) isNsfw = true;
  if (nsfwWords.some((v) => prompt.includes(v))) isNsfw = true;
  if (youngWords.some((v) => prompt.includes(v))) isYoung = true;
  if (!isYoung) {
    var result = await openai.createModeration({
      input: prompt,
    });
    console.log(result.data.results[0]);
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
