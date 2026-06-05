import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { Command } from "../../types.js";

const jokes = [
  "لماذا لا يثق المبرمجون في الطبيعة؟ لأن فيها bugs كثيرة! 🐛",
  "ما الفرق بين البيتزا والمبرمج؟ البيتزا تُوصَّل! 🍕",
  "كيف يسمي المبرمج ابنه؟ JavaScript أو Java... حسب الدعم! 😄",
  "لماذا يرتدي المبرمجون نظارات؟ لأنهم لا يستطيعون C#! 👓",
  "ما المشترك بين القهوة والمبرمج؟ كلاهما يعمل بدون نوم! ☕",
  "طرق المبرمج باب المنزل... ولم يفتح أحد لأن الـ while loop لم تنته! 🔄",
  "كم عدد المبرمجين لتغيير لمبة؟ لا أحد، هذه مشكلة hardware! 💡",
  "لماذا استغرق المبرمج وقتاً طويلاً في الحمام؟ لأنه قرأ شامبو: لف، اشطف، كرر! 🚿",
  "ما هو أفضل شيء في النكات عن البرمجة؟ يمكنك إعادة استخدامها! ♻️",
  "دخل المبرمج المطعم فطلب زوج من البيض... الجرسون قال: كيف تحبهم؟ قال: true! 🥚",
];

export const joke: Command = {
  data: new SlashCommandBuilder()
    .setName("joke")
    .setDescription("نكتة عشوائية للمبرمجين"),

  async execute(interaction: ChatInputCommandInteraction) {
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

    const embed = new EmbedBuilder()
      .setColor(0x1abc9c)
      .setTitle("😂 نكتة اليوم")
      .setDescription(randomJoke!)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
