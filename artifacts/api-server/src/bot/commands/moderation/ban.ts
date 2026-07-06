import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { isOwnerOrAdmin } from "../../permissions.js";

export const ban: Command = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("حظر عضو من السيرفر")
    .addUserOption((option) =>
      option.setName("العضو").setDescription("العضو المراد حظره").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("السبب").setDescription("سبب الحظر").setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("حذف_الرسائل")
        .setDescription("حذف رسائل العضو (بالأيام)")
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    if (!isOwnerOrAdmin(interaction)) {
      await interaction.editReply({ content: "❌ هذا الأمر متاح للمالك أو الأدمن فقط." });
      return;
    }
    const target = interaction.options.getUser("العضو", true);
    const reason = interaction.options.getString("السبب") ?? "لم يُذكر سبب";
    const deleteMessageDays = interaction.options.getInteger("حذف_الرسائل") ?? 0;

    const member = await interaction.guild?.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable) {
      await interaction.editReply({ content: "❌ لا أستطيع حظر هذا العضو." });
      return;
    }

    await interaction.guild?.members.ban(target.id, {
      reason,
      deleteMessageSeconds: deleteMessageDays * 86400,
    });

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle("🔨 تم الحظر")
      .addFields(
        { name: "العضو", value: `${target.tag}`, inline: true },
        { name: "بواسطة", value: `${interaction.user.tag}`, inline: true },
        { name: "السبب", value: reason }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
