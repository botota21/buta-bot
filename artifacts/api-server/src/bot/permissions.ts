import { PermissionFlagsBits, type ChatInputCommandInteraction, type GuildMember } from "discord.js";

export function isOwner(interaction: ChatInputCommandInteraction): boolean {
  return interaction.guild?.ownerId === interaction.user.id;
}

export function isAdmin(interaction: ChatInputCommandInteraction): boolean {
  const member = interaction.member as GuildMember | null;
  if (!member || typeof member.permissions === "string") return false;
  return member.permissions.has(PermissionFlagsBits.Administrator);
}

export function isOwnerOrAdmin(interaction: ChatInputCommandInteraction): boolean {
  return isOwner(interaction) || isAdmin(interaction);
}

export async function requireOwner(interaction: ChatInputCommandInteraction): Promise<boolean> {
  if (isOwner(interaction)) return true;
  await interaction.reply({
    content: "❌ هذا الأمر متاح لمالك السيرفر فقط.",
    ephemeral: true,
  });
  return false;
}

export async function requireOwnerOrAdmin(interaction: ChatInputCommandInteraction): Promise<boolean> {
  if (isOwnerOrAdmin(interaction)) return true;
  await interaction.reply({
    content: "❌ هذا الأمر متاح للمالك أو الأدمن فقط.",
    ephemeral: true,
  });
  return false;
}
