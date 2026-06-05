import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { warnings } from "./warn.js";

export const warningsList: Command = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("عرض تحذيرات عضو")
    .addUserOption((option) =>
      option.setName("العضو").setDescription("العضو المراد عرض تحذيراته").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    if (interaction.user.id !== interaction.guild?.ownerId) {
      await interaction.editReply({ content: "❌ هذا الأمر متاح لمالك السيرفر فقط." });
      return;
    }
    const target = interaction.options.getUser("العضو", true);
    const key = `${interaction.guildId}-${target.id}`;
    const userWarnings = warnings.get(key) ?? [];

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`⚠️ تحذيرات ${target.tag}`)
      .setThumbnail(target.displayAvatarURL());

    if (userWarnings.length === 0) {
      embed.setDescription("لا توجد تحذيرات لهذا العضو ✅");
    } else {
      embed.setDescription(`إجمالي التحذيرات: **${userWarnings.length}**`);
      userWarnings.slice(-10).forEach((w, i) => {
        embed.addFields({
          name: `تحذير #${i + 1}`,
          value: `**السبب:** ${w.reason}\n**بواسطة:** ${w.moderator}\n**التاريخ:** ${w.timestamp.toLocaleDateString("ar")}`,
        });
      });
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
