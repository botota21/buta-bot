import { Client, GatewayIntentBits, Collection, Partials } from "discord.js";
import type { BotClient, Command } from "./types.js";
import { logger } from "../lib/logger.js";

import { kick } from "./commands/moderation/kick.js";
import { ban } from "./commands/moderation/ban.js";
import { unban } from "./commands/moderation/unban.js";
import { mute } from "./commands/moderation/mute.js";
import { unmute } from "./commands/moderation/unmute.js";
import { clear } from "./commands/moderation/clear.js";
import { warn } from "./commands/moderation/warn.js";
import { warningsList } from "./commands/moderation/warnings.js";

import { ping } from "./commands/fun/ping.js";
import { joke } from "./commands/fun/joke.js";
import { roll } from "./commands/fun/roll.js";
import { flip } from "./commands/fun/flip.js";
import { eightball } from "./commands/fun/eightball.js";
import { userinfo } from "./commands/fun/userinfo.js";
import { serverinfo } from "./commands/fun/serverinfo.js";
import { avatar } from "./commands/fun/avatar.js";
import { help } from "./commands/fun/help.js";
import { autoreply } from "./commands/fun/autoreply.js";
import { games } from "./commands/fun/games.js";
import { points } from "./commands/fun/points.js";
import { shop } from "./commands/fun/shop.js";

import { registerReadyEvent } from "./events/ready.js";
import { registerInteractionEvent } from "./events/interactionCreate.js";
import { registerMessageEvent } from "./events/messageCreate.js";
import { registerGuildCreateEvent } from "./events/guildCreate.js";

const ALL_COMMANDS: Command[] = [
  kick, ban, unban, mute, unmute, clear, warn, warningsList,
  ping, joke, roll, flip, eightball, userinfo, serverinfo, avatar, help, autoreply,
  games, points, shop,
];

export function startBot() {
  const token = process.env["DISCORD_TOKEN"];

  if (!token) {
    logger.warn("DISCORD_TOKEN غير موجود — الربات لن يعمل. أضف التوكن لتفعيل الربات.");
    return;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel],
  }) as BotClient;

  client.commands = new Collection<string, Command>();

  for (const command of ALL_COMMANDS) {
    client.commands.set(command.data.name, command);
  }

  registerReadyEvent(client);
  registerInteractionEvent(client);
  registerMessageEvent(client);
  registerGuildCreateEvent(client);

  client.login(token).catch((err) => {
    logger.error({ err }, "فشل تسجيل الدخول إلى Discord");
  });

  return client;
}

export { ALL_COMMANDS };
