import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { isOwnerOrAdmin } from "../../permissions.js";

export const kick: Command = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("طرد عضو من السيرفر")
    .addUserOption((option) =>
      option.setName("العضو").setDescription("العضو المراد طرده").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("السبب").setDescription("سبب الطرد").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    if (!isOwnerOrAdmin(interaction)) {
      await interaction.editReply({ content: "❌ هذا الأمر متاح للمالك أو الأدمن فقط." });
      return;
    }
    const target = interaction.options.getUser("العضو", true);
    const reason = interaction.options.getString("السبب") ?? "لم يُذكر سبب";

    const member = await interaction.guild?.members.fetch(target.id).catch(() => null);
    if (!member) {
      await interaction.editReply({ content: "❌ لم يتم العثور على هذا العضو." });
      return;
    }

    if (!member.kickable) {
      await interaction.editReply({ content: "❌ لا أستطيع طرد هذا العضو." });
      return;
    }

    await member.kick(reason);

    const embed = new EmbedBuilder()
      .setColor(0xff6b35)
      .setTitle("👢 تم الطرد")
      .addFields(
        { name: "العضو", value: `${target.tag}`, inline: true },
        { name: "بواسطة", value: `${interaction.user.tag}`, inline: true },
        { name: "السبب", value: reason }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
