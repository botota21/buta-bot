import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { isOwnerOrAdmin } from "../../permissions.js";

export const unban: Command = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("رفع حظر عضو من السيرفر")
    .addStringOption((option) =>
      option.setName("المعرف").setDescription("ID العضو المحظور").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("السبب").setDescription("سبب رفع الحظر").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    if (!isOwnerOrAdmin(interaction)) {
      await interaction.editReply({ content: "❌ هذا الأمر متاح للمالك أو الأدمن فقط." });
      return;
    }
    const userId = interaction.options.getString("المعرف", true);
    const reason = interaction.options.getString("السبب") ?? "لم يُذكر سبب";

    const ban = await interaction.guild?.bans.fetch(userId).catch(() => null);
    if (!ban) {
      await interaction.editReply({ content: "❌ هذا العضو غير محظور." });
      return;
    }

    await interaction.guild?.members.unban(userId, reason);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("✅ تم رفع الحظر")
      .addFields(
        { name: "العضو", value: `${ban.user.tag}`, inline: true },
        { name: "بواسطة", value: `${interaction.user.tag}`, inline: true },
        { name: "السبب", value: reason }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
