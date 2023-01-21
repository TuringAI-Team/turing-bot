import {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} from "discord.js";
import "dotenv/config";
import { textToImg, getBalance } from "dreamstudio.js";
import supabase from "../modules/supabase.js";

export default {
  cooldown: "2m",
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
        .setName("model")
        .setDescription("The stable diffusion model you want to use")
        .setRequired(true)
        .addChoices(
          {
            name: "Stable diffusion v2.1(premium only)",
            value: "stable-diffusion-512-v2-1",
          },
          {
            name: "Stable diffusion v2.0(premium only)",
            value: "stable-diffusion-512-v2-0",
          },
          {
            name: "Stable diffusion v1.5 (default option)",
            value: "stable-diffusion-v1-5",
          },
          { name: "Stable diffusion v1", value: "stable-diffusion-v1" }
        )
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
          { name: "100", value: "100" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type of the image you want to get")
        .setRequired(false)
        .addChoices(
          { name: "realistic", value: "realistic" },
          { name: "wallpaper", value: "wallpaper" },
          { name: "draw", value: "drawn" },
          { name: "anime", value: "anime" },
          { name: "pastel", value: "pastel" },
          { name: "watercolor", value: "watercolor" },
          { name: "surreal", value: "surreal" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("negprompt")
        .setDescription("The negative prompt you want to use,")
        .setRequired(false)
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
    var m = interaction.options.getString("model");
    if (m == "stable-diffusion-512-v2-0" || m == "stable-diffusion-512-v2-1") {
      var isBooster = await checkBooster(interaction);
      if (!isBooster) {
        await interaction.reply({
          content: `The model ${m} is only for server boosters.`,
          ephemeral: true,
        });
        return;
      }
    }
    if (t == "realistic") {
      tags.push("((realistic))");
      tags.push("((RTX))");
      tags.push("highres");
      tags.push("extreme detail");
      tags.push("((photograph))");
      tags.push("((photorealistic))");
    }
    if (t == "wallpaper") {
      tags.push("((background))");
      tags.push("((wallpaper))");
      tags.push("colorful");
      tags.push("highres");
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
    if (t == "anime") {
      tags.push("((anime))");
      tags.push("((anime style))");
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
        engineId: m,
      });
      var balance = await getBalance(firstOne.key);
      if (balance.credits <= 10) {
        const { data, error } = await supabase
          .from("dreamstudio")
          .delete()
          .eq("key", firstOne.key);
      }
      var images = res.artifacts;
      var imagesArr = images.map((file) => {
        const sfbuff = Buffer.from(file.base64, "base64");
        return new AttachmentBuilder(sfbuff, { name: "output.png" });
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
      555;
    } catch (e) {
      const { data, error } = await supabase
        .from("dreamstudio")
        .delete()
        .eq("key", firstOne.key);
      await interaction.editReply({
        content: `Something wrong happen:\n${e}`,
        ephemeral: true,
      });
    }
  },
};

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
