import type { Convo, ConvoSearch, IDao } from "../DaoTypes";
import * as crypto from "node:crypto";

export class ConvoMemoryDao implements IDao<string[], ConvoSearch, Convo> {
  convos: Record<string, { convoId: string; lastMessage: number }[]> = {};

  convoUsers: Record<string, string[]> = {};

  async getItems({ username, convoId, daterange }: ConvoSearch) {
    if (convoId) return [{ convoId, users: this.convoUsers[convoId] || [] }];
    const [before, after] = daterange;

    const convos = this.convos[username] || [];

    return convos
      .filter(
        (convo) => convo.lastMessage >= before && convo.lastMessage <= after,
      )
      .map((convo) => ({
        convoId: convo.convoId,
        users: this.convoUsers[convo.convoId],
      }));
  }

  async getItem({ username, convoId }: ConvoSearch) {
    if (!convoId || !username) return undefined;

    for (const convo of this.convos[username]) {
      if (convoId !== convo.convoId) continue;

      convo.lastMessage = new Date().getUTCMilliseconds();
      break;
    }
  }

  async addItem(users: string[]) {
    const convoId = crypto.randomUUID();

    for (const username of users) {
      if (!this.convos[username]) this.convos[username] = [];
      this.convos[username].push({ convoId, lastMessage: 0 });
    }

    this.convoUsers[convoId] = users;

    return { convoId, users };
  }

  async deleteItem() {
    throw new Error("Cannot delete a conversation.");
  }
}
