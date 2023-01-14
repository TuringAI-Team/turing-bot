import {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} from "discord.js";
import "dotenv/config";
import { textToImg, getBalance } from "dreamstudio.js";
import supabase from "../modules/supabase.js";

export default {
  data: new SlashCommandBuilder()
    .setName("stable-diffusion")
    .setDescription("Generate an image using stable diffusion")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("The prompt for generating an image")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("number")
        .setDescription("The number of images you want")
        .setRequired(true)
        .addChoices(
          { name: "One", value: "1" },
          { name: "Two", value: "2" },
          { name: "Three", value: "3" },
          { name: "Four", value: "4" }
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
          { name: "100", value: "100" },
          { name: "150", value: "150" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type of the image you want to get")
        .setRequired(false)
        .addChoices(
          { name: "Realistic", value: "realistic" },
          { name: "Wallpaper", value: "wallpaper" },
          { name: "Draw", value: "drawn" },
          { name: "Anime", value: "anime" },
          { name: "Pastel", value: "pastel" },
          { name: "Watercolor", value: "watercolor" },
          { name: "Surreal", value: "surreal" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("negprompt")
        .setDescription("The negative prompt you want to use,")
        .setRequired(false)
    ),
  async execute(interaction) {
    var tags = ["masterpiece", "highres", "absurdres", "extreme detail"];
    if (interaction.channel.id != "1049275551568896000") {
      interaction.reply({
        content: `For use this utility go to <#1049275551568896000>`,
        ephemeral: true,
      });
      return;
    }
    var n = parseInt(interaction.options.getString("number"));
    var s = parseInt(interaction.options.getString("steps"));
    var t = interaction.options.getString("type");

    if (n != 1 && n != 2 && n != 3 && n != 4) {
      interaction.reply({
        content: `Invalid request`,
        ephemeral: true,
      });
      return;
    }
    if (s != 30 && s != 50 && s != 100 && s != 150) {
      await interaction.reply({
        content: `Invalid request`,
        ephemeral: true,
      });
      return;
    }
    var number: 1 | 2 | 3 | 4 = n;
    const steps: 30 | 50 | 100 | 150 = s;
    var prompt = interaction.options.getString("prompt");
    const negPrompt = interaction.options.getString("negprompt");
    console.log(t);

    if (t == "realistic") {
      tags.push("((realistic))");
      tags.push("((RTX))");
      tags.push("((photograph))");
      tags.push("((photorealistic))");
    }
    if (t == "wallpaper") {
      tags.push("((background))");
      tags.push("((wallpaper))");
      tags.push("colorful");
    }
    if (t == "drawn") {
      tags.push("((drawing))");
    }
    if (t == "pastel") {
      tags.push("((drawing))");
      tags.push("((pastel style))");
      tags.push("((pastel colors))");
    }
    if (t == "watercolor") {
      tags.push("((drawing))");
      tags.push("((watercolor style))");
      tags.push("((watercolor))");
    }
    if (t == "pastel") {
      tags.push("((impossible))");
      tags.push("((strange))");
      tags.push("((wonky))");
      tags.push("((surreal))");
    }
    prompt = `${prompt}, ${tags.join(", ")}`;

    await interaction.reply({
      content: `Generating your results for: **${prompt}**`,
    });
    let { data: dreamstudio, error } = await supabase
      .from("dreamstudio")
      .select("*");
    var firstOne = await dreamstudio[0];
    if (!firstOne) {
      await interaction.reply({
        content: `We are running out of credits, please wait until we solve the issue.`,
        ephemeral: true,
      });
      return;
    }
    var defaultNegPrompt = `lowres, bad anatomy, ((bad hands)), (error), ((missing fingers)), extra digit, fewer digits, awkward fingers, cropped, jpeg artifacts, worst quality, low quality, signature, blurry, extra ears, (deformed, disfigured, mutation, extra limbs:1.5),`;
    try {
      const res = await textToImg({
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
          {
            text: `${defaultNegPrompt}, ${negPrompt}`,
            weight: -1,
          },
        ],
        samples: number,
        apiKey: firstOne.key,
        steps: steps,
        engineId: "stable-diffusion-v1-5",
      });
      var balance = await getBalance(firstOne.key);
      if (balance.credits <= 10) {
        const { data, error } = await supabase
          .from("dreamstudio")
          .delete()
          .eq("eq", firstOne.key);
      }
      var images = res.artifacts;
      var imagesArr = images.map((file) => {
        const sfbuff = Buffer.from(file.base64, "base64");
        return new AttachmentBuilder(sfbuff, { name: "output.png" });
      });
      const { data, error } = await supabase.from("results").insert([
        {
          prompt: prompt,
          provider: "stable-diffusion-v1-5",
          result: images,
          uses: 1,
        },
      ]);
      await interaction.editReply({
        files: imagesArr,
        content: `**Prompt:** ${interaction.options.getString(
          "prompt"
        )} - ${steps}`,
      });
    } catch (e) {
      await interaction.editReply({
        content: `Something wrong happen:\n${e}`,
        ephemeral: true,
      });
    }
  },
};
