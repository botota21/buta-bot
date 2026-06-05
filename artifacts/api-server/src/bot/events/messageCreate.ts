import { Events, Message } from "discord.js";
import type { BotClient } from "../types.js";
import { findAutoReply } from "../autoReplyStore.js";
import { logger } from "../../lib/logger.js";

export function registerMessageEvent(client: BotClient) {
  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot) return;
    if (!message.guildId) return;

    const reply = findAutoReply(message.guildId, message.content);
    if (!reply) return;

    try {
      await message.reply(reply.response);
    } catch (err) {
      logger.error({ err }, "فشل إرسال الرد التلقائي");
    }
  });
}
