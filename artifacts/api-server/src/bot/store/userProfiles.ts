import { db, botUserProfilesTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { logger } from "../../lib/logger.js";

function makeId(guildId: string, userId: string) {
  return `${guildId}:${userId}`;
}

export async function getProfile(guildId: string, userId: string) {
  try {
    const [row] = await db
      .select()
      .from(botUserProfilesTable)
      .where(and(eq(botUserProfilesTable.guildId, guildId), eq(botUserProfilesTable.userId, userId)))
      .limit(1);
    return row ?? null;
  } catch (err) {
    logger.error({ err }, "فشل جلب بيانات المستخدم");
    return null;
  }
}

export async function setUserName(guildId: string, userId: string, name: string) {
  try {
    await db
      .insert(botUserProfilesTable)
      .values({ id: makeId(guildId, userId), guildId, userId, name })
      .onConflictDoUpdate({
        target: [botUserProfilesTable.guildId, botUserProfilesTable.userId],
        set: { name, updatedAt: new Date() },
      });
  } catch (err) {
    logger.error({ err }, "فشل حفظ اسم المستخدم");
  }
}

export async function getUserName(guildId: string, userId: string): Promise<string | null> {
  const profile = await getProfile(guildId, userId);
  return profile?.name ?? null;
}

async function bumpPoints(guildId: string, userId: string, delta: number) {
  try {
    await db
      .insert(botUserProfilesTable)
      .values({ id: makeId(guildId, userId), guildId, userId, points: Math.max(delta, 0) })
      .onConflictDoUpdate({
        target: [botUserProfilesTable.guildId, botUserProfilesTable.userId],
        set: {
          points: sql`GREATEST(${botUserProfilesTable.points} + ${delta}, 0)`,
          updatedAt: new Date(),
        },
      });
  } catch (err) {
    logger.error({ err }, "فشل تحديث النقاط");
  }
}

async function bumpCoins(guildId: string, userId: string, delta: number) {
  try {
    await db
      .insert(botUserProfilesTable)
      .values({ id: makeId(guildId, userId), guildId, userId, coins: Math.max(delta, 0) })
      .onConflictDoUpdate({
        target: [botUserProfilesTable.guildId, botUserProfilesTable.userId],
        set: {
          coins: sql`GREATEST(${botUserProfilesTable.coins} + ${delta}, 0)`,
          updatedAt: new Date(),
        },
      });
  } catch (err) {
    logger.error({ err }, "فشل تحديث العملات");
  }
}

export async function awardGameWin(guildId: string, userId: string) {
  await bumpPoints(guildId, userId, 2);
  await bumpCoins(guildId, userId, 1);
  const profile = await getProfile(guildId, userId);
  return { points: profile?.points ?? 0, coins: profile?.coins ?? 0 };
}

export async function awardGameLoss(guildId: string, userId: string) {
  await bumpPoints(guildId, userId, -2);
  const profile = await getProfile(guildId, userId);
  return { points: profile?.points ?? 0, coins: profile?.coins ?? 0 };
}

export async function spendCoins(guildId: string, userId: string, amount: number): Promise<boolean> {
  const profile = await getProfile(guildId, userId);
  const current = profile?.coins ?? 0;
  if (current < amount) return false;
  await bumpCoins(guildId, userId, -amount);
  return true;
}
