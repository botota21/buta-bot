import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import type { Command } from "../../types.js";
import { addAutoReply, removeAutoReply, getAutoReplies } from "../../autoReplyStore.js";
import { requireOwner } from "../../permissions.js";

export const autoreply: Command = {
  data: new SlashCommandBuilder()
    .setName("autoreply")
    .setDescription("إدارة الردود التلقائية")
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("إضافة رد تلقائي جديد")
        .addStringOption((o) =>
          o.setName("trigger").setDescription("الكلمة أو الجملة التي تُطلق الرد").setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("response").setDescription("الرد التلقائي").setRequired(true)
        )
        .addBooleanOption((o) =>
          o.setName("exact").setDescription("مطابقة تامة فقط؟ (افتراضي: لا، يكفي أن تحتوي الرسالة على الكلمة)").setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("حذف رد تلقائي")
        .addStringOption((o) =>
          o.setName("trigger").setDescription("الكلمة المراد حذف ردها").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("عرض جميع الردود التلقائية")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await requireOwner(interaction))) return;

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;

    if (sub === "add") {
      const trigger = interaction.options.getString("trigger", true);
      const response = interaction.options.getString("response", true);
      const exact = interaction.options.getBoolean("exact") ?? false;

      const success = addAutoReply(guildId, {
        trigger,
        response,
        exact,
        addedBy: interaction.user.tag,
        createdAt: new Date(),
      });

      if (!success) {
        await interaction.reply({
          content: `❌ يوجد رد تلقائي لـ \`${trigger}\` مسبقاً. احذفه أولاً ثم أضف الجديد.`,
          ephemeral: true,
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("✅ تم إضافة الرد التلقائي")
        .addFields(
          { name: "المُشغِّل", value: `\`${trigger}\``, inline: true },
          { name: "النوع", value: exact ? "مطابقة تامة" : "يحتوي على الكلمة", inline: true },
          { name: "الرد", value: response }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else if (sub === "remove") {
      const trigger = interaction.options.getString("trigger", true);
      const success = removeAutoReply(guildId, trigger);

      if (!success) {
        await interaction.reply({
          content: `❌ لا يوجد رد تلقائي لـ \`${trigger}\`.`,
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle("🗑️ تم حذف الرد التلقائي")
            .setDescription(`تم حذف الرد التلقائي لـ \`${trigger}\``)
            .setTimestamp(),
        ],
      });
    } else if (sub === "list") {
      const replies = getAutoReplies(guildId);

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle("📋 الردود التلقائية")
        .setTimestamp();

      if (replies.length === 0) {
        embed.setDescription("لا توجد ردود تلقائية حتى الآن.\nاستخدم `/autoreply add` لإضافة واحد.");
      } else {
        embed.setDescription(`إجمالي الردود: **${replies.length}**`);
        replies.slice(0, 25).forEach((r, i) => {
          embed.addFields({
            name: `${i + 1}. \`${r.trigger}\` ${r.exact ? "🎯" : "🔍"}`,
            value: r.response.length > 80 ? r.response.slice(0, 80) + "..." : r.response,
          });
        });
        embed.setFooter({ text: "🎯 = مطابقة تامة | 🔍 = يحتوي على الكلمة" });
      }

      await interaction.reply({ embeds: [embed] });
    }
  },
};
