import type { Message } from "discord.js";
import { awardGameWin, awardGameLoss } from "../store/userProfiles.js";

interface MemoryGameState {
  sequence: string[];
  startedBy: string;
}

const activeGames = new Map<string, MemoryGameState>();

const emojiPool = ["🐶", "🐱", "🐸", "🍎", "🚗", "⚽", "🌙", "⭐", "🔥", "🎈", "🎵", "🍕"];

const winReplies = [
  (points: number, next: number) => `🧠 حفظ ممتاز! +2 نقاط (رصيدك: ${points}) — استعد للتسلسل التالي (${next} رموز)`,
  (points: number, next: number) => `✨ ذاكرة قوية! (رصيدك: ${points}) — جولة جديدة بـ ${next} رموز`,
  (points: number, next: number) => `🎯 بالضبط صح! (رصيدك: ${points}) — يلا ${next} رموز هالمرة`,
];

const lossReplies = [
  (correct: string, points: number) => `🐟 ارتاح ياسمكة! التسلسل الصحيح كان: ${correct} (رصيدك: ${points})`,
  (correct: string, points: number) => `🐟 خذ راحتك ياسمكة، الصح كان: ${correct} (رصيدك: ${points})`,
  (correct: string, points: number) => `🐟 مو هذا يا سمكة الذاكرة! الصحيح: ${correct} (رصيدك: ${points})`,
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function generateSequence(length: number): string[] {
  return Array.from({ length }, () => emojiPool[Math.floor(Math.random() * emojiPool.length)]!);
}

export function isMemoryGameActive(channelId: string): boolean {
  return activeGames.has(channelId);
}

export function startMemoryGame(channelId: string, startedBy: string): string[] {
  const sequence = generateSequence(3);
  activeGames.set(channelId, { sequence, startedBy });
  return sequence;
}

export function stopMemoryGame(channelId: string): boolean {
  return activeGames.delete(channelId);
}

export async function handleMemoryGameMessage(message: Message): Promise<boolean> {
  const state = activeGames.get(message.channelId);
  if (!state) return false;
  if (!message.guildId) return false;

  const answer = message.content.trim();
  if (!answer || answer.startsWith("/")) return false;

  const submitted = Array.from(answer).filter((ch) => emojiPool.includes(ch));
  const correct =
    submitted.length === state.sequence.length && submitted.every((ch, i) => ch === state.sequence[i]);

  if (correct) {
    const { points } = await awardGameWin(message.guildId, message.author.id);
    const nextLength = Math.min(state.sequence.length + 1, 8);
    const nextSequence = generateSequence(nextLength);
    state.sequence = nextSequence;
    await message
      .reply(`${pick(winReplies)(points, nextLength)}\n${nextSequence.join(" ")}`)
      .catch(() => null);
  } else {
    const { points } = await awardGameLoss(message.guildId, message.author.id);
    await message.reply(pick(lossReplies)(state.sequence.join(" "), points)).catch(() => null);
    activeGames.delete(message.channelId);
  }

  return true;
}
