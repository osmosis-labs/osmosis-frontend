import {
  KVStore,
  IndexedDBKVStore,
  MemoryKVStore,
  LocalKVStore,
} from "@keplr-wallet/common";

export function makeIndexedKVStore(prefix: string): KVStore {
  if (typeof window === "undefined") {
    // In server-side (nodejs), use memory kv store (volatile kv store).
    // TODO: investigate sharing kv store on node process
    return new MemoryKVStore(prefix);
  }
  return new IndexedDBKVStore(prefix);
}

export function makeLocalStorageKVStore(prefix: string): KVStore {
  if (typeof window === "undefined") {
    // In server-side (nodejs), use memory kv store (volatile kv store).
    // TODO: investigate sharing kv store on node process
    return new MemoryKVStore(prefix);
  }
  return new LocalKVStore(prefix);
}
