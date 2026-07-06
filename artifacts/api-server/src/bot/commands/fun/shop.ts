import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { Command } from "../../types.js";
import { getProfile, spendCoins } from "../../store/userProfiles.js";

const SHOP_ITEMS: Record<string, { label: string; price: number }> = {
  boost: { label: "⚡ 2× نقاط لمدة ساعة", price: 12 },
  hint: { label: "🧠 تلميح في الألعاب", price: 4 },
  emoji: { label: "😎 إيموجي مميز", price: 10 },
};

export const shop: Command = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("متجر العملات")
    .addSubcommand((sub) => sub.setName("list").setDescription("عرض المتجر"))
    .addSubcommand((sub) =>
      sub
        .setName("buy")
        .setDescription("شراء عنصر من المتجر")
        .addStringOption((o) =>
          o
            .setName("العنصر")
            .setDescription("العنصر المراد شراؤه")
            .setRequired(true)
            .addChoices(
              { name: "⚡ بوست نقاط (12 عملة)", value: "boost" },
              { name: "🧠 تلميح (4 عملات)", value: "hint" },
              { name: "😎 إيموجي (10 عملات)", value: "emoji" }
            )
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply({ content: "❌ لا يمكن استخدام هذا الأمر خارج السيرفر.", ephemeral: true });
      return;
    }

    const sub = interaction.options.getSubcommand();

    if (sub === "list") {
      const embed = new EmbedBuilder()
        .setColor(0xe67e22)
        .setTitle("🏪 المتجر")
        .setDescription(
          Object.values(SHOP_ITEMS)
            .map((item) => `${item.label} = **${item.price}** عملة 🪙`)
            .join("\n")
        )
        .setFooter({ text: "استخدم /shop buy لشراء عنصر" });

      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (sub === "buy") {
      await interaction.deferReply();
      const itemKey = interaction.options.getString("العنصر", true);
      const item = SHOP_ITEMS[itemKey];

      if (!item) {
        await interaction.editReply({ content: "❌ هذا العنصر غير موجود." });
        return;
      }

      const profile = await getProfile(guildId, interaction.user.id);
      if ((profile?.coins ?? 0) < item.price) {
        await interaction.editReply({
          content: `❌ ما عندك عملات كافية. تحتاج **${item.price}** 🪙 وعندك **${profile?.coins ?? 0}** 🪙.`,
        });
        return;
      }

      const success = await spendCoins(guildId, interaction.user.id, item.price);
      if (!success) {
        await interaction.editReply({ content: "❌ فشل الشراء، حاول مرة أخرى." });
        return;
      }

      await interaction.editReply({
        content: `✅ اشتريت ${item.label} مقابل **${item.price}** 🪙.`,
      });
    }
  },
};
