import { db, botAllowedGuildsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../../lib/logger.js";

export async function isGuildAllowed(guildId: string): Promise<boolean> {
  try {
    const [row] = await db
      .select()
      .from(botAllowedGuildsTable)
      .where(eq(botAllowedGuildsTable.guildId, guildId))
      .limit(1);
    return !!row;
  } catch (err) {
    logger.error({ err }, "فشل التحقق من صلاحية السيرفر");
    return true;
  }
}

export async function approveGuild(guildId: string, guildName: string, ownerId: string | null) {
  try {
    await db
      .insert(botAllowedGuildsTable)
      .values({ guildId, guildName, ownerId })
      .onConflictDoNothing({ target: botAllowedGuildsTable.guildId });
  } catch (err) {
    logger.error({ err }, "فشل تسجيل السيرفر المعتمد");
  }
}
