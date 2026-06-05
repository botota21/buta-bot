import type {
  ChatInputCommandInteraction,
  Client,
  SharedSlashCommand,
} from "discord.js";

export interface Command {
  data: SharedSlashCommand;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface BotClient extends Client {
  commands: Map<string, Command>;
}
