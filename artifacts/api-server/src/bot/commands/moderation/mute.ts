import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { isOwnerOrAdmin } from "../../permissions.js";

export const mute: Command = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("كتم عضو (timeout)")
    .addUserOption((option) =>
      option.setName("العضو").setDescription("العضو المراد كتمه").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("المدة")
        .setDescription("مدة الكتم بالدقائق")
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("السبب").setDescription("سبب الكتم").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    if (!isOwnerOrAdmin(interaction)) {
      await interaction.editReply({ content: "❌ هذا الأمر متاح للمالك أو الأدمن فقط." });
      return;
    }
    const target = interaction.options.getUser("العضو", true);
    const minutes = interaction.options.getInteger("المدة", true);
    const reason = interaction.options.getString("السبب") ?? "لم يُذكر سبب";

    const member = await interaction.guild?.members.fetch(target.id).catch(() => null);
    if (!member) {
      await interaction.editReply({ content: "❌ لم يتم العثور على هذا العضو." });
      return;
    }

    if (!member.moderatable) {
      await interaction.editReply({ content: "❌ لا أستطيع كتم هذا العضو." });
      return;
    }

    const duration = minutes * 60 * 1000;
    await member.timeout(duration, reason);

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle("🔇 تم الكتم")
      .addFields(
        { name: "العضو", value: `${target.tag}`, inline: true },
        { name: "المدة", value: `${minutes} دقيقة`, inline: true },
        { name: "بواسطة", value: `${interaction.user.tag}`, inline: true },
        { name: "السبب", value: reason }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
