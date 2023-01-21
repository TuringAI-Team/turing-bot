import {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} from "discord.js";
import "dotenv/config";
import { textToImg, getBalance } from "dreamstudio.js";
import {
  checkGeneration,
  generateImg,
  getModels,
} from "../modules/stablehorde.js";
import supabase from "../modules/supabase.js";
import Centra from "centra";

export default {
  cooldown: "3m",
  data: new SlashCommandBuilder()
    .setName("stablehorde")
    .setDescription("Generate an image using stable horde")
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
          { name: "Microworlds", value: "Microworlds" },
          { name: "Anything Diffusion", value: "Anything Diffusion" },
          { name: "Midjourney Diffusion", value: "Midjourney Diffusion" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("number")
        .setDescription("The number of images you want")
        .setRequired(true)
        .addChoices({ name: "One", value: "1" }, { name: "Two", value: "2" })
    )
    .addStringOption((option) =>
      option
        .setName("steps")
        .setDescription("The number of steps to generate the image")
        .setRequired(true)
        .addChoices({ name: "30", value: "30" }, { name: "50", value: "50" })
    ),
  async execute(interaction) {
    var tags = [];
    if (
      interaction.channel.id != "1049275551568896000" &&
      interaction.guild.id == "899761438996963349"
    ) {
      interaction.reply({
        content: `For use this utility go to <#1049275551568896000>`,
        ephemeral: true,
      });
      return;
    }
    var n = parseInt(interaction.options.getString("number"));
    var s = parseInt(interaction.options.getString("steps"));

    if (n != 1 && n != 2 && n != 3 && n != 4) {
      interaction.reply({
        content: `Invalid request`,
        ephemeral: true,
      });
      return;
    }
    if (s != 30 && s != 50) {
      await interaction.reply({
        content: `Invalid request`,
        ephemeral: true,
      });
      return;
    }
    var number: 1 | 2 | 3 | 4 = n;
    const steps: 30 | 50 = s;
    var prompt = interaction.options.getString("prompt");
    const negPrompt = interaction.options.getString("negprompt");
    var m = interaction.options.getString("model");
    if (m == "Midjourney Diffusion") {
      tags.push("mdjrny-v4 style");
    }
    prompt = `${prompt}, ${tags.join(", ")}`;

    await interaction.deferReply();
    console.log(prompt);
    var defaultNegPrompt = `lowres, bad anatomy, ((bad hands)), (error), ((missing fingers)), extra digit, fewer digits, awkward fingers, cropped, jpeg artifacts, worst quality, low quality, signature, blurry, extra ears, (deformed, disfigured, mutation, extra limbs:1.5),`;
    try {
      var generation = await generateImg(prompt, m, steps, number);
      var images = [];
      var interval = setInterval(async () => {
        var status = await checkGeneration(generation);
        console.log(status);
        if (status.done) {
          await sendResults(status.generations, interaction, m, prompt, steps);
          clearInterval(interval);
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

async function sendResults(images, interaction, m, prompt, steps) {
  var imagesArr = images.map(async (g, i) => {
    const sfbuff = Buffer.from(g.img, "base64");
    console.log(sfbuff);
    const attachment = new AttachmentBuilder(sfbuff, {
      name: `${g.id}.webp`,
    });
    return attachment;
  });
  const { data, error } = await supabase.from("results").insert([
    {
      prompt: prompt,
      provider: m,
      result: images,
      uses: 1,
    },
  ]);
  await interaction.editReply({
    files: imagesArr,
    content: `${interaction.user} **Prompt:** ${prompt} - ${steps}`,
  });
}

async function checkBooster(interaction) {
  if (
    interaction.member.roles.cache.find((x) => x.id == "899763684337922088") ||
    interaction.member.roles.cache.find((x) => x.id == "1061660141533007974")
  ) {
    return true;
  } else {
    return false;
  }
}
