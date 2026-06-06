import { Events, Message } from "discord.js";
import type { BotClient } from "../types.js";
import { findAutoReply } from "../autoReplyStore.js";
import { logger } from "../../lib/logger.js";

const replies = [
  "عيوني 👑",
  "لبيه يا طويل العمر 🤍",
  "هلا وغلا يا باشا ✨",
  "تفضل أمرني 👀",
  "اسمعك قول 🎧",
  "أبشر حاضر ⚡",
];

const animatedEmoji = "<a:pepe_dance:123456789>";

export function registerMessageEvent(client: BotClient) {
  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot) return;
    if (!message.guildId) return;

    const content = message.content.toLowerCase();

    const isMentioned = client.user ? message.mentions.has(client.user) : false;
    const hasBoti = content.includes("بوتي");
    const hasBotiBasha = content.includes("بوتي باشا");
    const hasBushi = content.includes("بوشي");

    if (isMentioned || hasBoti || hasBotiBasha || hasBushi) {
      const reply = replies[Math.floor(Math.random() * replies.length)];
      try {
        await message.reply(`${animatedEmoji} ${reply}`);
      } catch (err) {
        logger.error({ err }, "فشل إرسال رد المناداة");
      }
      return;
    }

    const autoReply = findAutoReply(message.guildId, message.content);
    if (!autoReply) return;

    try {
      await message.reply(autoReply.response);
    } catch (err) {
      logger.error({ err }, "فشل إرسال الرد التلقائي");
    }
  });
}
