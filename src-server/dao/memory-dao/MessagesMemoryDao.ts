import { Message } from "../../messages";
import type { IDao, MessageAdd, MessageSearch } from "../DaoTypes";

export class MessagesMemoryDao
  implements IDao<MessageAdd, MessageSearch, Message>
{
  messages: Record<string, Message[]> = {};

  async getItems({ convoId, dateRange }: MessageSearch) {
    const messages = this.messages[convoId] || [];
    const messagesToReturn: Message[] = [];

    const [before, after] = dateRange;

    for (let index = 0; index < messages.length; ++index) {
      const message = messages[index];
      if (message.timestamp < before) continue;
      if (message.timestamp > after) break;

      messagesToReturn.push(message);
    }

    return messagesToReturn;
  }

  async getItem({ convoId, dateRange }: MessageSearch) {
    const messages = this.messages[convoId] || [];

    const [before, after] = dateRange;

    for (let index = 0; index < messages.length; ++index) {
      const message = messages[index];
      if (message.timestamp > before) continue;
      if (message.timestamp < after) break;

      return message;
    }
  }

  async addItem({ convoId, message }: MessageAdd) {
    if (!this.messages[convoId]) this.messages[convoId] = [];
    this.messages[convoId].push(message);

    return undefined;
  }

  async deleteItem() {
    throw new Error("Cannot delete messages.");
  }
}
