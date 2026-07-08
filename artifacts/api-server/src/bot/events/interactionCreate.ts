import { Events, ChatInputCommandInteraction } from "discord.js";
import type { BotClient } from "../types.js";
import { logger } from "../../lib/logger.js";
import { isGameActive, startLastLetterGame, stopLastLetterGame } from "../games/lastLetter.js";
import { isMemoryGameActive, startMemoryGame, stopMemoryGame } from "../games/memoryGame.js";

function isAnyGameActive(channelId: string): boolean {
  return isGameActive(channelId) || isMemoryGameActive(channelId);
}

function stopAnyGame(channelId: string): boolean {
  const stoppedLast = stopLastLetterGame(channelId);
  const stoppedMemory = stopMemoryGame(channelId);
  return stoppedLast || stoppedMemory;
}

export function registerInteractionEvent(client: BotClient) {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isStringSelectMenu() && interaction.customId === "games") {
      const value = interaction.values[0];
      try {
        if (value === "last") {
          if (isAnyGameActive(interaction.channelId)) {
            await interaction.reply({ content: "⚠️ في لعبة نشطة بالفعل في هذه القناة.", ephemeral: true });
            return;
          }
          const word = startLastLetterGame(interaction.channelId, interaction.user.id);
          await interaction.reply({
            content: `🎮 بدأت لعبة "آخر حرف"!\nالكلمة الأولى: **${word}**\nاكتب كلمة تبدأ بآخر حرف منها في القناة.`,
          });
        } else if (value === "memory") {
          if (isAnyGameActive(interaction.channelId)) {
            await interaction.reply({ content: "⚠️ في لعبة نشطة بالفعل في هذه القناة.", ephemeral: true });
            return;
          }
          const sequence = startMemoryGame(interaction.channelId, interaction.user.id);
          await interaction.reply({
            content: `🧠 بدأت "لعبة الذاكرة"!\nاحفظ هذا التسلسل واكتبه بنفس الترتيب:\n${sequence.join(" ")}`,
          });
        } else if (value === "stop") {
          const stopped = stopAnyGame(interaction.channelId);
          await interaction.reply({
            content: stopped ? "🛑 تم إيقاف اللعبة." : "لا توجد لعبة نشطة في هذه القناة.",
          });
        } else {
          await interaction.reply({ content: "🔜 قريباً!", ephemeral: true });
        }
      } catch (error) {
        logger.error({ error }, "خطأ في تنفيذ تفاعل الألعاب");
        await interaction.reply({ content: "❌ حدث خطأ.", ephemeral: true }).catch(() => null);
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      logger.warn({ command: interaction.commandName }, "أمر غير معروف");
      await interaction.reply({
        content: "❌ هذا الأمر غير موجود.",
        ephemeral: true,
      });
      return;
    }

    try {
      await command.execute(interaction as ChatInputCommandInteraction);
    } catch (error) {
      logger.error({ error, command: interaction.commandName }, "خطأ في تنفيذ الأمر");

      const msg = { content: "❌ حدث خطأ أثناء تنفيذ الأمر.", ephemeral: true };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg).catch(() => null);
      } else {
        await interaction.reply(msg).catch(() => null);
      }
    }
  });
}
