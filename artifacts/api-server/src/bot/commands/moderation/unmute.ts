import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { isOwnerOrAdmin } from "../../permissions.js";

export const unmute: Command = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("رفع الكتم عن عضو")
    .addUserOption((option) =>
      option.setName("العضو").setDescription("العضو المراد رفع الكتم عنه").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    if (!isOwnerOrAdmin(interaction)) {
      await interaction.editReply({ content: "❌ هذا الأمر متاح للمالك أو الأدمن فقط." });
      return;
    }
    const target = interaction.options.getUser("العضو", true);

    const member = await interaction.guild?.members.fetch(target.id).catch(() => null);
    if (!member) {
      await interaction.editReply({ content: "❌ لم يتم العثور على هذا العضو." });
      return;
    }

    if (!member.isCommunicationDisabled()) {
      await interaction.editReply({ content: "❌ هذا العضو غير مكتوم." });
      return;
    }

    await member.timeout(null);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("🔊 تم رفع الكتم")
      .addFields(
        { name: "العضو", value: `${target.tag}`, inline: true },
        { name: "بواسطة", value: `${interaction.user.tag}`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
