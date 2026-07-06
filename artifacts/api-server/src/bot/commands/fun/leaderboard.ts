import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { Command } from "../../types.js";
import { db, botUserProfilesTable } from "@workspace/db";
import { and, desc, eq, gt } from "drizzle-orm";

const MEDALS = ["🥇", "🥈", "🥉"];

export const leaderboard: Command = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("عرض أفضل اللاعبين في السيرفر")
    .addStringOption((o) =>
      o
        .setName("النوع")
        .setDescription("رتب حسب النقاط أو العملات")
        .addChoices(
          { name: "النقاط 🏆", value: "points" },
          { name: "العملات 🪙", value: "coins" }
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.editReply({ content: "❌ لا يمكن استخدام هذا الأمر خارج السيرفر." });
      return;
    }

    const sortBy = (interaction.options.getString("النوع") ?? "points") as "points" | "coins";
    const column = sortBy === "coins" ? botUserProfilesTable.coins : botUserProfilesTable.points;

    const rows = await db
      .select()
      .from(botUserProfilesTable)
      .where(and(eq(botUserProfilesTable.guildId, guildId), gt(column, 0)))
      .orderBy(desc(column))
      .limit(10);

    if (rows.length === 0) {
      await interaction.editReply({ content: "📭 لا يوجد لاعبين بعد. جرّب /games عشان تبدأ!" });
      return;
    }

    const lines = await Promise.all(
      rows.map(async (row, index) => {
        const rank = MEDALS[index] ?? `#${index + 1}`;
        const member = await interaction.guild?.members.fetch(row.userId).catch(() => null);
        const displayName = row.name ?? member?.displayName ?? member?.user.username ?? `<@${row.userId}>`;
        const value = sortBy === "coins" ? `${row.coins} 🪙` : `${row.points} 🏆`;
        return `${rank} **${displayName}** — ${value}`;
      })
    );

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(sortBy === "coins" ? "🪙 أفضل اللاعبين بالعملات" : "🏆 أفضل اللاعبين بالنقاط")
      .setDescription(lines.join("\n"))
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
