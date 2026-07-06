import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { Command } from "../../types.js";
import { isOwnerOrAdmin } from "../../permissions.js";

export const serverinfo: Command = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("عرض معلومات السيرفر"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    if (!isOwnerOrAdmin(interaction)) {
      await interaction.editReply({ content: "❌ هذا الأمر متاح للمالك أو الأدمن فقط." });
      return;
    }
    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply({ content: "❌ لا يمكن استخدام هذا الأمر خارج السيرفر." });
      return;
    }

    await guild.fetch();

    const owner = await guild.fetchOwner();
    const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;
    const onlineMembers = guild.members.cache.filter(
      (m) => m.presence?.status !== "offline" && m.presence?.status !== undefined
    ).size;

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle(`🏠 ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 256 }) ?? null)
      .addFields(
        { name: "المالك", value: owner.user.tag, inline: true },
        { name: "المعرف", value: guild.id, inline: true },
        { name: "تاريخ الإنشاء", value: createdAt, inline: true },
        { name: "الأعضاء", value: `${guild.memberCount}`, inline: true },
        { name: "القنوات", value: `${guild.channels.cache.size}`, inline: true },
        { name: "الأدوار", value: `${guild.roles.cache.size}`, inline: true },
        { name: "الإيموجي", value: `${guild.emojis.cache.size}`, inline: true },
        { name: "مستوى التحقق", value: `${guild.verificationLevel}`, inline: true },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
