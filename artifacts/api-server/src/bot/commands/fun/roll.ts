import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { Command } from "../../types.js";

export const roll: Command = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("رمي نرد")
    .addIntegerOption((option) =>
      option
        .setName("الأوجه")
        .setDescription("عدد أوجه النرد (افتراضي: 6)")
        .setMinValue(2)
        .setMaxValue(1000)
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sides = interaction.options.getInteger("الأوجه") ?? 6;
    const result = Math.floor(Math.random() * sides) + 1;

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle("🎲 رمي النرد")
      .setDescription(`رميت نرداً بـ **${sides}** أوجه\nالنتيجة: **${result}**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
