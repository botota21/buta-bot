export interface AutoReply {
  trigger: string;
  response: string;
  exact: boolean;
  addedBy: string;
  createdAt: Date;
}

const store = new Map<string, AutoReply[]>();

export function getAutoReplies(guildId: string): AutoReply[] {
  return store.get(guildId) ?? [];
}

export function addAutoReply(guildId: string, reply: AutoReply): boolean {
  const replies = store.get(guildId) ?? [];
  const exists = replies.some(
    (r) => r.trigger.toLowerCase() === reply.trigger.toLowerCase()
  );
  if (exists) return false;
  replies.push(reply);
  store.set(guildId, replies);
  return true;
}

export function removeAutoReply(guildId: string, trigger: string): boolean {
  const replies = store.get(guildId) ?? [];
  const index = replies.findIndex(
    (r) => r.trigger.toLowerCase() === trigger.toLowerCase()
  );
  if (index === -1) return false;
  replies.splice(index, 1);
  store.set(guildId, replies);
  return true;
}

export function findAutoReply(guildId: string, message: string): AutoReply | null {
  const replies = store.get(guildId) ?? [];
  const lower = message.toLowerCase();

  for (const reply of replies) {
    if (reply.exact) {
      if (lower === reply.trigger.toLowerCase()) return reply;
    } else {
      if (lower.includes(reply.trigger.toLowerCase())) return reply;
    }
  }
  return null;
}
