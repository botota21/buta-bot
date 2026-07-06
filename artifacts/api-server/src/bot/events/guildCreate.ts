import { Events, Guild } from "discord.js";
import type { BotClient } from "../types.js";
import { isGuildAllowed, approveGuild } from "../store/allowedGuilds.js";
import { logger } from "../../lib/logger.js";

const OWNER_ID = process.env["OWNER_ID"];

export function registerGuildCreateEvent(client: BotClient) {
  client.on(Events.GuildCreate, async (guild: Guild) => {
    try {
      const alreadyAllowed = await isGuildAllowed(guild.id);
      if (alreadyAllowed) return;

      const isOwnerServer = !!OWNER_ID && guild.ownerId === OWNER_ID;
      if (isOwnerServer) {
        await approveGuild(guild.id, guild.name, guild.ownerId);
        logger.info({ guildId: guild.id }, "تمت إضافة البوت لسيرفر معتمد من المالك");
        return;
      }

      logger.warn(
        { guildId: guild.id, ownerId: guild.ownerId },
        "محاولة إضافة البوت لسيرفر غير مصرح به — سيتم المغادرة"
      );

      const message =
        "🚫 هذا البوت خاص ولا يمكن إضافته لأي سيرفر إلا بإذن من مالكه. سأغادر السيرفر الآن.";

      const me = guild.members.me;
      const systemChannel = guild.systemChannel;

      if (systemChannel && me && systemChannel.permissionsFor(me)?.has("SendMessages")) {
        await systemChannel.send(message).catch(() => null);
      } else {
        const owner = await guild.fetchOwner().catch(() => null);
        await owner?.send(message).catch(() => null);
      }

      await guild.leave();
    } catch (err) {
      logger.error({ err }, "خطأ أثناء التحقق من صلاحية السيرفر الجديد");
    }
  });
}
