import { Events, Message } from "discord.js";
import type { BotClient } from "../types.js";
import { findAutoReply } from "../autoReplyStore.js";
import { getUserName, setUserName } from "../store/userProfiles.js";
import { handleGameMessage } from "../games/lastLetter.js";
import { logger } from "../../lib/logger.js";

const ownerName = "روز";

const ownerReplies = [
  ownerName,
  `${ownerName} 👑`,
  `${ownerName} 🤍`,
  `${ownerName} ✨`,
  `${ownerName} 🌸`,
];

const mentionReplies = [
  "عيوني 👑",
  "لبيه يا طويل العمر 🤍",
  "هلا وغلا يا باشا ✨",
  "تفضل أمرني 👀",
  "اسمعك قول 🎧",
];

const mentionRepliesWithName = [
  (n: string) => `هلا ${n} 👋`,
  (n: string) => `لبيه ${n} 🤍`,
  (n: string) => `تفضل ${n} ✨`,
  (n: string) => `اسمعك يا ${n} 🎧`,
  (n: string) => `حياك ${n} 😎`,
  (n: string) => `عيوني يا ${n} 👑`,
];

const morningReplies = ["صباح النور ☀️", "صباح الورد 🌸", "صباح الخير عليك 🌞", "يصبحك بخير وسرور ✨"];

const eveningReplies = ["مساء النور 🌙", "مساء الورد 🌸", "مساء الخير عليك ✨", "يمسيك بخير وسعادة 🌟"];

const islamicReplies = [
  "وعليكم السلام ورحمة الله وبركاته 🤍",
  "وعليكم السلام 🌸",
  "وعليكم السلام ورحمة الله ✨",
];

const rememberNameReplies = [
  (n: string) => `أكيد لا 😌 اسمك ${n}.`,
  (n: string) => `كيف أنساه؟ اسمك ${n} 🤍`,
  (n: string) => `ولا يوم نسيت، انت ${n} ✨`,
];

const noNameReplies = [
  "لسه ما قلت لي اسمك، قل: اسمي ... وأنا بتذكره. 🌸",
  "ما تعرفت عليك بعد 👀 قول لي: اسمي فلان.",
];

const nameSavedReplies = [
  (n: string) => `تشرفت فيك ${n} 🤍 بتذكر اسمك من الحين.`,
  (n: string) => `يعطيك العافية ${n} ✨ حفظت اسمك.`,
  (n: string) => `أهلاً ${n} 👋 ما بنساه بعد اليوم.`,
];

const nameBlacklist = new Set([
  "بخير", "تعبان", "زعلان", "هنا", "موجود", "جاهز", "متعب", "مشغول", "نايم", "صايم", "جوعان",
]);

const animatedEmoji = "<a:pepe_dance:123456789>";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function getRiyadhHour(): number {
  const formatted = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: "Asia/Riyadh",
  }).format(new Date());
  return parseInt(formatted, 10) % 24;
}

function timeGreeting(): string | null {
  const hour = getRiyadhHour();
  if (hour >= 5 && hour < 12) return pick(morningReplies);
  if (hour >= 17 || hour < 5) return pick(eveningReplies);
  return null;
}

function extractName(raw: string): string | null {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(?:اسمي هو|اسمي|أنا اسمي|انا اسمي|أنا|انا)\s+([\u0621-\u064Aa-zA-Z]{2,20})$/);
  if (!match) return null;
  const name = match[1]!.trim();
  if (nameBlacklist.has(name)) return null;
  return name;
}

export function registerMessageEvent(client: BotClient) {
  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot) return;
    if (!message.guildId) return;

    const guildId = message.guildId;
    const userId = message.author.id;
    const rawContent = message.content;
    const content = rawContent.toLowerCase();

    // 🎮 إذا في لعبة نشطة بالقناة، كل الرسائل تعتبر محاولات لعب
    const handledByGame = await handleGameMessage(message);
    if (handledByGame) return;

    // 📝 حفظ الاسم
    const detectedName = extractName(rawContent);
    if (detectedName) {
      await setUserName(guildId, userId, detectedName);
      await message.reply(pick(nameSavedReplies)(detectedName)).catch((err) => {
        logger.error({ err }, "فشل تأكيد حفظ الاسم");
      });
      return;
    }

    // ❓ نسيت اسمي؟
    const isAskingName =
      content.includes("نسيت اسمي") ||
      content.includes("تتذكر اسمي") ||
      content.includes("تعرف اسمي") ||
      content.includes("شسمي");

    if (isAskingName) {
      const savedName = await getUserName(guildId, userId);
      const reply = savedName ? pick(rememberNameReplies)(savedName) : pick(noNameReplies);
      await message.reply(reply).catch((err) => {
        logger.error({ err }, "فشل الرد على سؤال الاسم");
      });
      return;
    }

    // 👑 سؤال عن المالك
    const isAskingOwner =
      content.includes("انت حق منو") ||
      content.includes("انت تابع من") ||
      content.includes("مين صاحبك") ||
      content.includes("من صاحبك") ||
      content.includes("ملك من");

    if (isAskingOwner) {
      await message.reply(pick(ownerReplies)).catch((err) => {
        logger.error({ err }, "فشل إرسال رد المالك");
      });
      return;
    }

    // 🌅 تحيات حسب الوقت والمناسبة
    if (content.includes("صباح الخير") || content.includes("صباح النور")) {
      await message.reply(pick(morningReplies)).catch(() => null);
      return;
    }
    if (content.includes("مساء الخير") || content.includes("مساء النور")) {
      await message.reply(pick(eveningReplies)).catch(() => null);
      return;
    }
    if (content.includes("السلام عليكم")) {
      await message.reply(pick(islamicReplies)).catch(() => null);
      return;
    }

    // 🤖 المناداة العامة
    const isMentioned = client.user ? message.mentions.has(client.user) : false;
    const hasBoti = content.includes("بوتي");
    const hasBushi = content.includes("بوشي");

    if (isMentioned || hasBoti || hasBushi) {
      const savedName = await getUserName(guildId, userId);
      const useName = !!savedName && Math.random() < 0.5;
      const base = useName ? pick(mentionRepliesWithName)(savedName!) : pick(mentionReplies);
      const greeting = Math.random() < 0.3 ? timeGreeting() : null;
      const finalReply = greeting ? `${greeting} ${base}` : base;

      await message.reply(`${animatedEmoji} ${finalReply}`).catch((err) => {
        logger.error({ err }, "فشل إرسال رد المناداة");
      });
      return;
    }

    // ردود تلقائية مخصصة
    const autoReply = findAutoReply(guildId, message.content);
    if (!autoReply) return;

    try {
      await message.reply(autoReply.response);
    } catch (err) {
      logger.error({ err }, "فشل إرسال الرد التلقائي");
    }
  });
}
