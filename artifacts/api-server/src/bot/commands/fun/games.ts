import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import type { Command } from "../../types.js";

export const games: Command = {
  data: new SlashCommandBuilder().setName("games").setDescription("عرض قائمة الألعاب المتاحة"),

  async execute(interaction: ChatInputCommandInteraction) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId("games")
      .setPlaceholder("🎮 اختر لعبة")
      .addOptions([
        { label: "كلمة آخر حرف", description: "ابدأ لعبة السلسلة في هذه القناة", value: "last" },
        { label: "إيقاف اللعبة الحالية", description: "أوقف أي لعبة نشطة في هذه القناة", value: "stop" },
        { label: "قريباً", description: "المزيد من الألعاب قادمة", value: "soon" },
      ]);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

    await interaction.reply({
      content: "🎮 اختر لعبة تبدأها في هذه القناة:",
      components: [row],
    });
  },
};
