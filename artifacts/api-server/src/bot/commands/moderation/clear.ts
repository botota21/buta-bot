import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import type { Command } from "../../types.js";

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
    if (interaction.user.id !== interaction.guild?.ownerId) {
      await interaction.reply({ content: "❌ هذا الأمر متاح لمالك السيرفر فقط.", ephemeral: true });
      return;
    }
    const amount = interaction.options.getInteger("الكمية", true);
    const targetUser = interaction.options.getUser("العضو");

    const channel = interaction.channel as TextChannel;
    if (!channel) {
      await interaction.reply({ content: "❌ لا يمكن حذف الرسائل في هذه القناة.", ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    let messages = await channel.messages.fetch({ limit: amount });

    if (targetUser) {
      messages = messages.filter((m) => m.author.id === targetUser.id);
    }

    const deleted = await channel.bulkDelete(messages, true);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle("🗑️ تم الحذف")
      .setDescription(`تم حذف **${deleted.size}** رسالة${targetUser ? ` من ${targetUser.tag}` : ""}`)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
