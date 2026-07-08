import type { Message } from "discord.js";
import { awardGameWin, awardGameLoss } from "../store/userProfiles.js";

interface GameState {
  requiredLetter: string;
  lastWord: string;
  startedBy: string;
}

const activeGames = new Map<string, GameState>();

const startWords = ["كتاب", "شجرة", "قمر", "بحر", "مدرسة", "سيارة", "وردة", "نجمة", "قلم", "جبل"];

const winReplies = [
  (letter: string, points: number) => `✔️ صح! +2 نقاط (رصيدك: ${points}) — الحرف الجديد: **${letter}**`,
  (letter: string, points: number) => `🔗 عاش! كلمة صحيحة (رصيدك: ${points}) — دورك يا خصمك بحرف **${letter}**`,
  (letter: string, points: number) => `👏 ممتاز! (رصيدك: ${points}) — يلا كمل بحرف **${letter}**`,
];

const lossReplies = [
  (letter: string, points: number) => `❌ خطأ! لازم تبدأ بحرف **${letter}** (رصيدك: ${points})`,
  (letter: string, points: number) => `🚫 مو صحيحة! الكلمة الجديدة لازم تبدأ بـ **${letter}** (رصيدك: ${points})`,
  (letter: string, points: number) => `⛔ للأسف غلط، حاول بكلمة تبدأ بحرف **${letter}** (رصيدك: ${points})`,
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function normalizeArabic(word: string): string {
  return word
    .replace(/[إأآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();
}

export function isGameActive(channelId: string): boolean {
  return activeGames.has(channelId);
}

export function startLastLetterGame(channelId: string, startedBy: string): string {
  const word = startWords[Math.floor(Math.random() * startWords.length)]!;
  const normalized = normalizeArabic(word);
  activeGames.set(channelId, {
    requiredLetter: normalized.slice(-1),
    lastWord: word,
    startedBy,
  });
  return word;
}

export function stopLastLetterGame(channelId: string): boolean {
  return activeGames.delete(channelId);
}

export async function handleGameMessage(message: Message): Promise<boolean> {
  const state = activeGames.get(message.channelId);
  if (!state) return false;
  if (!message.guildId) return false;

  const word = message.content.trim();
  if (!word || word.startsWith("/")) return false;

  const normalized = normalizeArabic(word);
  const firstLetter = normalized.charAt(0);

  if (firstLetter === state.requiredLetter) {
    const { points, streak, bonusCoins } = await awardGameWin(message.guildId, message.author.id);
    state.requiredLetter = normalized.slice(-1);
    state.lastWord = word;
    const streakLine = bonusCoins > 0 ? `\n🔥 سلسلة أيامك: **${streak}** يوم متتالي! +${bonusCoins} عملة إضافية` : "";
    await message
      .reply(`${pick(winReplies)(state.requiredLetter, points)}${streakLine}`)
      .catch(() => null);
  } else {
    const { points } = await awardGameLoss(message.guildId, message.author.id);
    await message.reply(pick(lossReplies)(state.requiredLetter, points)).catch(() => null);
  }

  return true;
}
