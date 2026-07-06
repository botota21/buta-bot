import { pgTable, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const botUserProfilesTable = pgTable(
  "bot_user_profiles",
  {
    id: text("id").primaryKey(),
    guildId: text("guild_id").notNull(),
    userId: text("user_id").notNull(),
    name: text("name"),
    points: integer("points").notNull().default(0),
    coins: integer("coins").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("bot_user_profiles_guild_user_idx").on(table.guildId, table.userId)]
);

export const insertBotUserProfileSchema = createInsertSchema(botUserProfilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBotUserProfile = z.infer<typeof insertBotUserProfileSchema>;
export type BotUserProfile = typeof botUserProfilesTable.$inferSelect;
