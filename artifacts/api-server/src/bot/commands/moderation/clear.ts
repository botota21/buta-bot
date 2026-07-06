import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import type { Command } from "../../types.js";
import { isOwnerOrAdmin } from "../../permissions.js";
import { logger } from "../../../lib/logger.js";

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export const clear: Command = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("حذف رسائل من القناة")
    .addIntegerOption((option) =>
      option
        .setName("الكمية")
        .setDescription("عدد الرسائل المراد حذفها (1-100)")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .addUserOption((option) =>
      option.setName("العضو").setDescription("حذف رسائل عضو معين فقط").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!isOwnerOrAdmin(interaction)) {
      await interaction.reply({ content: "❌ هذا الأمر متاح للمالك أو الأدمن فقط.", ephemeral: true });
      return;
    }

    const amount = interaction.options.getInteger("الكمية", true);
    const targetUser = interaction.options.getUser("العضو");

    const channel = interaction.channel;
    if (!channel || !channel.isTextBased() || channel.isDMBased()) {
      await interaction.reply({ content: "❌ لا يمكن حذف الرسائل في هذه القناة.", ephemeral: true });
      return;
    }

    const textChannel = channel as TextChannel;

    const me = interaction.guild?.members.me;
    if (me && !textChannel.permissionsFor(me)?.has(PermissionFlagsBits.ManageMessages)) {
      await interaction.reply({
        content: "❌ لا أملك صلاحية 'إدارة الرسائل' في هذه القناة.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      let messages = await textChannel.messages.fetch({ limit: amount });

      if (targetUser) {
        messages = messages.filter((m) => m.author.id === targetUser.id);
      }

      const cutoff = Date.now() - FOURTEEN_DAYS_MS;
      const deletable = messages.filter((m) => m.createdTimestamp > cutoff);
      const tooOld = messages.size - deletable.size;

      if (deletable.size === 0) {
        await interaction.editReply({
          content:
            tooOld > 0
              ? "⚠️ لا يمكن حذف هذه الرسائل لأنها أقدم من 14 يوماً (قيد ديسكورد)."
              : "⚠️ لا توجد رسائل مطابقة للحذف.",
        });
        return;
      }

      const deleted = await textChannel.bulkDelete(deletable, true);

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle("🗑️ تم الحذف")
        .setDescription(
          `تم حذف **${deleted.size}** رسالة${targetUser ? ` من ${targetUser.tag}` : ""}` +
            (tooOld > 0 ? `\n⚠️ تم تجاهل ${tooOld} رسالة أقدم من 14 يوماً.` : "")
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      logger.error({ err }, "فشل حذف الرسائل");
      await interaction.editReply({
        content: "❌ حدث خطأ أثناء حذف الرسائل. تأكد من صلاحيات البوت في هذه القناة.",
      });
    }
  },
};
