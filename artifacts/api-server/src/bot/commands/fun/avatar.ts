import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { Command } from "../../types.js";
import { requireOwnerOrAdmin } from "../../permissions.js";

export const avatar: Command = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("عرض صورة عضو")
    .addUserOption((option) =>
      option.setName("العضو").setDescription("العضو المراد عرض صورته").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await requireOwnerOrAdmin(interaction))) return;
    const target = interaction.options.getUser("العضو") ?? interaction.user;
    const avatarUrl = target.displayAvatarURL({ size: 512 });

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle(`🖼️ صورة ${target.tag}`)
      .setImage(avatarUrl)
      .addFields({ name: "الرابط", value: `[اضغط هنا](${avatarUrl})` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
