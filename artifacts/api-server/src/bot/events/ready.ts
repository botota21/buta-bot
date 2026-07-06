import { Events, ActivityType } from "discord.js";
import type { BotClient } from "../types.js";
import { logger } from "../../lib/logger.js";
import { isGuildAllowed, approveGuild } from "../store/allowedGuilds.js";

export function registerReadyEvent(client: BotClient) {
  client.once(Events.ClientReady, async (readyClient) => {
    logger.info(`الربات جاهز! تم تسجيل الدخول بـ ${readyClient.user.tag}`);

    readyClient.user.setPresence({
      activities: [
        {
          name: "بوته | /help",
          type: ActivityType.Watching,
        },
      ],
      status: "online",
    });

    for (const guild of readyClient.guilds.cache.values()) {
      const allowed = await isGuildAllowed(guild.id);
      if (!allowed) {
        await approveGuild(guild.id, guild.name, guild.ownerId);
        logger.info({ guildId: guild.id }, "تم اعتماد سيرفر موجود مسبقاً كسيرفر مصرح به");
      }
    }
  });
}
