export class LocalStorage {
  static get<T>(key: string): T | undefined {
    const value = localStorage.getItem(key);

    if (!value) return undefined;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }
  static store(key: string, value: unknown) {
    if (typeof value === "string") localStorage.setItem(key, value);
    else localStorage.setItem(key, JSON.stringify(value));
  }
}

export enum LocalStorageKeys {
  USER = "user",
}
