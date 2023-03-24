import { Configuration, OpenAIApi } from "openai";
import "dotenv/config";
import axios from "axios";
import supabase from "./supabase.js";

async function dalle(prompt, number, key) {
  console.log(key);
  const configuration = new Configuration({
    apiKey: key,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createImage({
    prompt: prompt,
    n: number,
    size: "512x512",
  });
  var imagesArr = response.data.data.map((d, i) => {
    return { attachment: d.url, name: `result-${i}.png` };
  });
  const { data, error } = await supabase
    .from("results")
    .insert([
      { prompt: prompt, provider: "dall-e 2", result: imagesArr, uses: 1 },
    ]);
  return imagesArr;
}

export { dalle };
