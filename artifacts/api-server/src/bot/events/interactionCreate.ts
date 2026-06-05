import { Events, ChatInputCommandInteraction } from "discord.js";
import type { BotClient } from "../types.js";
import { logger } from "../../lib/logger.js";

export function registerInteractionEvent(client: BotClient) {
  client.on(Events.InteractionCreate, async (interaction) => {
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
