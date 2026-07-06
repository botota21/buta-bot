import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const botAllowedGuildsTable = pgTable("bot_allowed_guilds", {
  guildId: text("guild_id").primaryKey(),
  guildName: text("guild_name"),
  ownerId: text("owner_id"),
  approvedAt: timestamp("approved_at").notNull().defaultNow(),
});

export const insertBotAllowedGuildSchema = createInsertSchema(botAllowedGuildsTable).omit({
  approvedAt: true,
});
export type InsertBotAllowedGuild = z.infer<typeof insertBotAllowedGuildSchema>;
export type BotAllowedGuild = typeof botAllowedGuildsTable.$inferSelect;
