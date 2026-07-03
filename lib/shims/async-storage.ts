type StorageValue = string | null;
type StoragePair = [string, string | null];

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const asyncStorage = {
  async getItem(key: string): Promise<StorageValue> {
    return getStorage()?.getItem(key) ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    getStorage()?.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    getStorage()?.removeItem(key);
  },

  async clear(): Promise<void> {
    getStorage()?.clear();
  },

  async getAllKeys(): Promise<string[]> {
    const storage = getStorage();

    if (!storage) {
      return [];
    }

    return Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
      (key): key is string => key !== null,
    );
  },

  async multiGet(keys: string[]): Promise<StoragePair[]> {
    const storage = getStorage();
    return keys.map((key) => [key, storage?.getItem(key) ?? null]);
  },

  async multiSet(entries: Array<[string, string]>): Promise<void> {
    const storage = getStorage();

    if (!storage) {
      return;
    }

    entries.forEach(([key, value]) => storage.setItem(key, value));
  },

  async multiRemove(keys: string[]): Promise<void> {
    const storage = getStorage();

    if (!storage) {
      return;
    }

    keys.forEach((key) => storage.removeItem(key));
  },
};

export default asyncStorage;
