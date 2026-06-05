import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { Command } from "../../types.js";

export const userinfo: Command = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("عرض معلومات عضو")
    .addUserOption((option) =>
      option.setName("العضو").setDescription("العضو المراد عرض معلوماته").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    if (interaction.user.id !== interaction.guild?.ownerId) {
      await interaction.editReply({ content: "❌ هذا الأمر متاح لمالك السيرفر فقط." });
      return;
    }
    const target = interaction.options.getUser("العضو") ?? interaction.user;
    const member = await interaction.guild?.members.fetch(target.id).catch(() => null);

    const joinedAt = member?.joinedAt
      ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>`
      : "غير معروف";

    const createdAt = `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`;

    const roles = member?.roles.cache
      .filter((r) => r.id !== interaction.guildId)
      .map((r) => r.toString())
      .join(", ") || "لا توجد أدوار";

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`👤 معلومات ${target.tag}`)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "الاسم", value: target.username, inline: true },
        { name: "المعرف", value: target.id, inline: true },
        { name: "بوت؟", value: target.bot ? "نعم 🤖" : "لا 👤", inline: true },
        { name: "تاريخ إنشاء الحساب", value: createdAt, inline: true },
        { name: "انضم إلى السيرفر", value: joinedAt, inline: true },
        { name: `الأدوار (${member?.roles.cache.size ? member.roles.cache.size - 1 : 0})`, value: roles }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
