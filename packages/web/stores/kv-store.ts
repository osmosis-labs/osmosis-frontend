import {
  IndexedDBKVStore,
  KVStore,
  LocalKVStore,
  MemoryKVStore,
} from "@keplr-wallet/common";

const USER_CLEARED_CACHE_MESSAGE =
  "Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing.";

/** Wrapper class with dep injected KV store to catch and ignore certain errors. */
class CaughtKVStore implements KVStore {
  constructor(private readonly kvStore: KVStore) {}

  async get<T = unknown>(key: string): Promise<T | undefined> {
    try {
      return await this.kvStore.get<T>(key);
    } catch (e: unknown) {
      if ((e as any).message === USER_CLEARED_CACHE_MESSAGE) {
        // Ignore InvalidStateError
        return undefined;
      }
      throw e;
    }
  }
  async set<T = unknown>(key: string, data: T | null): Promise<void> {
    try {
      return await this.kvStore.set<T>(key, data);
    } catch (e: unknown) {
      if ((e as any).message === USER_CLEARED_CACHE_MESSAGE) {
        // Ignore InvalidStateError
        return;
      }
      throw e;
    }
  }
  prefix(): string {
    return this.kvStore.prefix();
  }
}

export function makeIndexedKVStore(prefix: string): KVStore {
  if (typeof window === "undefined") {
    // In server-side (nodejs), use memory kv store (volatile kv store).
    // TODO: investigate sharing kv store on node process
    return new CaughtKVStore(new MemoryKVStore(prefix));
  }
  return new CaughtKVStore(new IndexedDBKVStore(prefix));
}

export function makeLocalStorageKVStore(prefix: string): KVStore {
  if (typeof window === "undefined") {
    // In server-side (nodejs), use memory kv store (volatile kv store).
    // TODO: investigate sharing kv store on node process
    return new CaughtKVStore(new MemoryKVStore(prefix));
  }
  return new CaughtKVStore(new LocalKVStore(prefix));
}
