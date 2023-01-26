import {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from "discord.js";
import "dotenv/config";
import { textToImg, getBalance } from "dreamstudio.js";
import supabase from "../modules/supabase.js";
import {
  checkGeneration,
  generateImg,
  getModels,
} from "../modules/stablehorde.js";
import { isPremium } from "../modules/premium.js";

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
            name: "Stable diffusion v2.1",
            value: "stable_diffusion_2.1",
          },
          {
            name: "Stable diffusion v2.0",
            value: "stable_diffusion_2.0",
          },
          {
            name: "Stable diffusion",
            value: "stable_diffusion",
          },
          { name: "Microworlds", value: "Microworlds" },
          { name: "Anything Diffusion", value: "Anything Diffusion" },
          { name: "Midjourney Diffusion", value: "Midjourney Diffusion" },
          { name: "Dreamshaper", value: "Dreamshaper" },
          {
            name: "Dreamlike Photoreal",
            value: "Dreamlike Photoreal",
          },
          {
            name: "Dreamlike Diffusion",
            value: "Dreamlike Diffusion",
          },
          {
            name: "ProtoGen",
            value: "ProtoGen",
          },
          {
            name: "Hentai Diffusion",
            value: "Hentai Diffusion",
          },
          {
            name: "Waifu Diffusion",
            value: "waifu_diffusion",
          },
          {
            name: "Synthwave",
            value: "Synthwave",
          }
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
        .setDescription("The negative prompt you want to use.")
        .setRequired(false)
    ),
  async execute(interaction) {
    var tags = [];
    if (
      interaction.channel.id != "1049275551568896000" &&
      interaction.channel.id != "1066440546379386991" &&
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
      var ispremium = await isPremium(interaction.user.id);
      if (!ispremium) {
        await interaction.reply({
          content: `The model ${m} is only for donators. If you want to donate please conact us throught [our discord](https://discord.gg/turing-ai-899761438996963349) .`,
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
    if (m == "Midjourney Diffusion") {
      tags.push("mdjrny-v4 style");
    }
    if (m == "Microworlds") {
      tags.push("microworld render style");
    }
    if (m == "Hentai Diffusion") {
      tags.push("1girl");
      tags.push("anime");
    }
    if (m == "Dreamlike Diffusion") {
      tags.push("dreamlikeart");
    }
    if (m == "synthwave") {
      tags.push("snthwve");
      tags.push("style");
    }
    prompt = `${prompt}, ${tags.join(", ")}`;
    await interaction.deferReply();
    var defaultNegPrompt = `lowres, bad anatomy, ((bad hands)), (error), ((missing fingers)), extra digit, fewer digits, awkward fingers, cropped, jpeg artifacts, worst quality, low quality, signature, blurry, extra ears, (deformed, disfigured, mutation, extra limbs:1.5),`;
    var nsfw = false;
    if (interaction.channel.nsfw) nsfw = true;
    try {
      var generation = await generateImg(prompt, m, steps, number, nsfw);
      if (generation.message) {
        await interaction.editReply({
          content: `Something wrong happen:\n${generation.message}`,
          ephemeral: true,
        });
        return;
      }
      var interval = setInterval(async () => {
        try {
          var status = await checkGeneration(generation);
          if (status.done) {
            clearInterval(interval);
            const { data, error } = await supabase.from("results").insert([
              {
                prompt: prompt,
                provider: m,
                result: status.generations,
                uses: 1,
              },
            ]);
            await sendResults(
              status.generations,
              interaction,
              m,
              prompt,
              steps,
              generation.id,
              interaction.user.id
            );
          } else {
            console.log(status);
            if (status.wait_time == undefined) {
              console.log("No wait time");
              clearInterval(interval);
              await interaction.editReply({
                content: `Something wrong happen.`,
                ephemeral: true,
              });
            }
            try {
              await interaction.editReply({
                content: `Loading...(${status.wait_time}s)`,
              });
            } catch (err) {
              console.log(err);
              clearInterval(interval);
              await interaction.editReply({
                content: `Something wrong happen.`,
                ephemeral: true,
              });
            }
          }
        } catch (err) {
          console.log(err);
          clearInterval(interval);
          await interaction.editReply({
            content: `Something wrong happen.`,
            ephemeral: true,
          });
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
async function sendResults(
  images,
  interaction,
  m,
  prompt,
  steps,
  id: string,
  userId
) {
  var imagesArr = images.map((g, i) => {
    const sfbuff = Buffer.from(g.img, "base64");
    return new AttachmentBuilder(sfbuff, { name: "output.png" });
  });
  const { data, error } = await supabase.from("results").insert([
    {
      id: id,
      prompt: prompt,
      provider: m,
      result: images,
      uses: 1,
    },
  ]);

  const row = new ActionRowBuilder();
  for (var i = 0; i < 1; i++) {
    var menu = new StringSelectMenuBuilder()
      .setCustomId(`rate_${id}_${images[i].id}_${userId}`)
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        {
          value: "1",
          label: "1/10",
        },
        {
          value: "2",
          label: "2/10",
        },
        {
          value: "3",
          label: "3/10",
        },
        {
          value: "4",
          label: "4/10",
        },
        {
          value: "5",
          label: "5/10",
        },
        {
          value: "6",
          label: "6/10",
        },
        {
          value: "7",
          label: "7/10",
        },
        {
          value: "8",
          label: "8/10",
        },
        {
          value: "9",
          label: "9/10",
        },
        {
          value: "10",
          label: "10/10",
        }
      )
      .setPlaceholder(`Rate the result(${i + 1}) with a number from 1 to 10`);
    row.addComponents(menu);
  }
  await interaction.editReply({
    files: imagesArr,
    components: [row],
    content: `${interaction.user} **Prompt:** ${prompt} - ${steps}`,
  });
}
