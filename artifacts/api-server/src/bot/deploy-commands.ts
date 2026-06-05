import { REST, Routes } from "discord.js";
import { ALL_COMMANDS } from "./index.js";
import { logger } from "../lib/logger.js";

export async function deployCommands() {
  const token = process.env["DISCORD_TOKEN"];
  const clientId = process.env["DISCORD_CLIENT_ID"];

  if (!token || !clientId) {
    logger.warn(
      "DISCORD_TOKEN أو DISCORD_CLIENT_ID غير موجود — تخطي تسجيل الأوامر. " +
      "أضف DISCORD_CLIENT_ID (Application ID من Developer Portal) لتسجيل الأوامر تلقائياً."
    );
    return;
  }

  const rest = new REST().setToken(token);
  const commandsData = ALL_COMMANDS.map((cmd) => cmd.data.toJSON());

  try {
    logger.info(`جاري تسجيل ${commandsData.length} أمر...`);
    await rest.put(Routes.applicationCommands(clientId), { body: commandsData });
    logger.info("تم تسجيل الأوامر بنجاح!");
  } catch (err) {
    logger.error({ err }, "فشل تسجيل الأوامر");
  }
}
