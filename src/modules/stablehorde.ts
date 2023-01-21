import StableHorde from "@zeldafan0225/stable_horde";
const stable_horde = new StableHorde({
  cache_interval: 1000 * 10,
  cache: {
    generations_check: 1000 * 30,
  },
  default_token: process.env.STABLE_HORDE,
});

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

export async function checkGeneration(generation: any) {
  // check the status of your generation using the generations id
  const check = await stable_horde.getGenerationStatus(generation.id);
  console.log(check);
  return check;
}
