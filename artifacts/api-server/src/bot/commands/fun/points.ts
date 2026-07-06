import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { Command } from "../../types.js";
import { getProfile } from "../../store/userProfiles.js";

export const points: Command = {
  data: new SlashCommandBuilder().setName("points").setDescription("عرض رصيدك من النقاط والعملات"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.editReply({ content: "❌ لا يمكن استخدام هذا الأمر خارج السيرفر." });
      return;
    }

    const profile = await getProfile(guildId, interaction.user.id);

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle(`🏆 رصيد ${interaction.user.username}`)
      .addFields(
        { name: "النقاط", value: `${profile?.points ?? 0}`, inline: true },
        { name: "العملات 🪙", value: `${profile?.coins ?? 0}`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
