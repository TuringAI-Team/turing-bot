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
async function jsHelper(prompt) {
  const response = await openai.createCompletion({
    model: "code-davinci-002",
    prompt: `You: ${prompt}\nJavaScript chatbot`,
    temperature: 0,
    max_tokens: 60,
    top_p: 1.0,
    frequency_penalty: 0.5,
    presence_penalty: 0.0,
    stop: ["You:"],
  });
  return response.data.choices[0].text;
}

module.exports = {
  chat,
  dalle,
  jsHelper,
};
