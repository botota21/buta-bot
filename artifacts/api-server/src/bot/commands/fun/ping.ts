import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { Command } from "../../types.js";

export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("عرض سرعة استجابة الربات"),

  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({ content: "⏱️ جاري القياس...", fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🏓 Pong!")
      .addFields(
        { name: "⏱️ زمن الاستجابة", value: `${latency}ms`, inline: true },
        { name: "💓 WebSocket", value: `${wsLatency}ms`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ content: "", embeds: [embed] });
  },
};
