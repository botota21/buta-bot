import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { Command } from "../../types.js";

const responses = [
  "بالتأكيد ✅",
  "نعم، بالتأكيد! ✅",
  "على ما يبدو نعم ✅",
  "آفاق جيدة ✅",
  "علاماتٌ تدل على نعم ✅",
  "يمكن ذلك 🤔",
  "لا أستطيع الإجابة الآن 🤔",
  "تركيزي ضعيف، أعد السؤال 🤔",
  "لا تعتمد عليه ❌",
  "إجابتي لا ❌",
  "مصادري تقول لا ❌",
  "الآفاق ليست جيدة ❌",
  "لا يبدو ذلك ❌",
];

export const eightball: Command = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("اسأل الكرة السحرية")
    .addStringOption((option) =>
      option.setName("السؤال").setDescription("سؤالك هنا").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const question = interaction.options.getString("السؤال", true);
    const response = responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setColor(0x2c3e50)
      .setTitle("🎱 الكرة السحرية")
      .addFields(
        { name: "السؤال", value: question },
        { name: "الإجابة", value: response! }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
