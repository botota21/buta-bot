import { Events, ActivityType } from "discord.js";
import type { BotClient } from "../types.js";
import { logger } from "../../lib/logger.js";

export function registerReadyEvent(client: BotClient) {
  client.once(Events.ClientReady, (readyClient) => {
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
  });
}
