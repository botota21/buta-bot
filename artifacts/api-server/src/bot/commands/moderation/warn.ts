import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types.js";

const warnings = new Map<string, { reason: string; moderator: string; timestamp: Date }[]>();

export function getWarnings(userId: string) {
  return warnings.get(userId) ?? [];
}

export const warn: Command = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("تحذير عضو")
    .addUserOption((option) =>
      option.setName("العضو").setDescription("العضو المراد تحذيره").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("السبب").setDescription("سبب التحذير").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    if (interaction.user.id !== interaction.guild?.ownerId) {
      await interaction.editReply({ content: "❌ هذا الأمر متاح لمالك السيرفر فقط." });
      return;
    }
    const target = interaction.options.getUser("العضو", true);
    const reason = interaction.options.getString("السبب", true);

    const key = `${interaction.guildId}-${target.id}`;
    const userWarnings = warnings.get(key) ?? [];
    userWarnings.push({ reason, moderator: interaction.user.tag, timestamp: new Date() });
    warnings.set(key, userWarnings);

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle("⚠️ تحذير")
      .addFields(
        { name: "العضو", value: `${target.tag}`, inline: true },
        { name: "التحذير رقم", value: `${userWarnings.length}`, inline: true },
        { name: "بواسطة", value: `${interaction.user.tag}`, inline: true },
        { name: "السبب", value: reason }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    try {
      await target.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xf1c40f)
            .setTitle(`⚠️ تلقيت تحذيراً في ${interaction.guild?.name}`)
            .addFields(
              { name: "السبب", value: reason },
              { name: "عدد التحذيرات", value: `${userWarnings.length}` }
            )
            .setTimestamp(),
        ],
      });
    } catch {
      // DM may be disabled
    }
  },
};

export { warnings };
