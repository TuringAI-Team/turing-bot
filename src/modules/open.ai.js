const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function chat(msg, model) {
  const response = await openai.createCompletion({
    model: model,
    prompt: `The following is a conversation with an intelligent person. The person is helpful, creative, clever, and very friendly.\n\nHuman: ${msg}\nAI:`,
    temperature: 0.9,
    max_tokens: 30,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.6,
    stop: [" Human:", " AI:"],
  });
  return response.data.choices[0].text;
}
async function dalle(prompt, number) {
  const response = await openai.createImage({
    prompt: prompt,
    n: number,
    size: "256x256",
  });
  var imagesArr = response.data.data.map((d, i) => {
    return { attachment: d.url, name: `result-${i}.png` };
  });
  return imagesArr;
}

module.exports = {
  chat,
  dalle,
};
