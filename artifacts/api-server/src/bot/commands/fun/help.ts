import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { Command } from "../../types.js";

export const help: Command = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("عرض قائمة الأوامر"),

  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.user.id !== interaction.guild?.ownerId) {
      await interaction.reply({ content: "❌ هذا الأمر متاح لمالك السيرفر فقط.", ephemeral: true });
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📋 قائمة أوامر بوته")
      .setDescription("ربات الإشراف والمرح للسيرفر")
      .addFields(
        {
          name: "🛡️ أوامر الإشراف",
          value: [
            "`/kick` — طرد عضو",
            "`/ban` — حظر عضو",
            "`/unban` — رفع الحظر",
            "`/mute` — كتم عضو",
            "`/unmute` — رفع الكتم",
            "`/clear` — حذف رسائل",
            "`/warn` — تحذير عضو",
            "`/warnings` — عرض التحذيرات",
          ].join("\n"),
        },
        {
          name: "🎮 أوامر المرح",
          value: [
            "`/ping` — سرعة الاستجابة",
            "`/joke` — نكتة عشوائية",
            "`/roll` — رمي نرد",
            "`/flip` — رمي عملة",
            "`/8ball` — الكرة السحرية",
            "`/userinfo` — معلومات عضو",
            "`/serverinfo` — معلومات السيرفر",
            "`/avatar` — صورة عضو",
          ].join("\n"),
        }
      )
      .setFooter({ text: "بوته • ربات الإشراف والمرح" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
