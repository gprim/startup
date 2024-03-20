import type { IDao, TokenPair } from "../DaoTypes";

export class TokensMemoryDao implements IDao<TokenPair> {
  tokens: Record<string, string> = {};

  async getItems(): Promise<TokenPair[]> {
    throw new Error("Cannot retrieve multiple tokens");
  }

  async getItem({ token }: Partial<TokenPair>) {
    if (!this.tokens[token]) return undefined;

    return {
      token,
      username: this.tokens[token],
    };
  }

  async addItem(tokenPair: TokenPair) {
    const { token, username } = tokenPair;
    this.tokens[token] = username;

    return tokenPair;
  }

  async deleteItem({ token }: Partial<TokenPair>) {
    if (this.tokens[token]) delete this.tokens[token];
  }
}
