import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { Command } from "../../types.js";

export const flip: Command = {
  data: new SlashCommandBuilder()
    .setName("flip")
    .setDescription("رمي عملة معدنية"),

  async execute(interaction: ChatInputCommandInteraction) {
    const result = Math.random() < 0.5 ? "صورة 🦅" : "كتابة 🪙";

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle("🪙 رمي العملة")
      .setDescription(`النتيجة: **${result}**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
