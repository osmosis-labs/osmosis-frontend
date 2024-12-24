import * as SecureStore from "expo-secure-store";
import { randomBytes } from "react-native-get-random-values";
import { MMKV } from "react-native-mmkv";
import { StateStorage } from "zustand/middleware";

export const defaultStorage = new MMKV();

export const mmkvStorage = {
  getItem: (key: string) => defaultStorage.getString(key) ?? null,
  setItem: (key: string, value: string) => defaultStorage.set(key, value),
  removeItem: (key: string) => defaultStorage.delete(key),
};

const KEYCHAIN_NAME = "MMKV_ENCRYPTION_KEY";

/**
 * Retrieves the MMKV encryption key from secure storage,
 * or generates a new one if it doesn't exist.
 */
async function getOrCreateEncryptionKey(): Promise<string> {
  try {
    // Try loading the key from SecureStore
    const existingKey = await SecureStore.getItemAsync(KEYCHAIN_NAME);
    if (existingKey) {
      return existingKey;
    }

    // If no key exists, generate a new random 32-byte key (Base64 or hex)
    const rawKey = randomBytes(32); // 32 bytes = 256 bits
    // Convert to base64 (or hex) so it's string-safe
    const base64Key = btoa(String.fromCharCode(...rawKey));

    // Save it to the secure store
    await SecureStore.setItemAsync(KEYCHAIN_NAME, base64Key);

    return base64Key;
  } catch (error) {
    console.error("[getOrCreateEncryptionKey] Failed:", error);
    throw error;
  }
}

let mmkvInstance: MMKV | null = null;

/**
 * Returns an MMKV instance, creating it if needed.
 */
async function getMMKV(): Promise<MMKV> {
  if (mmkvInstance) {
    return mmkvInstance;
  }

  const encryptionKey = await getOrCreateEncryptionKey();
  mmkvInstance = new MMKV({
    id: "keyring-store",
    encryptionKey, // This ensures data is encrypted at rest
  });

  return mmkvInstance;
}

export const keyringMMKVStorage: StateStorage = {
  // Retrieve a value by key
  getItem: async (name: string) => {
    const storage = await getMMKV();
    const value = storage.getString(name);
    return value || null;
  },

  // Set or update a value by key
  setItem: async (name: string, value: string) => {
    const storage = await getMMKV();
    storage.set(name, value);
  },

  // Remove a value by key
  removeItem: async (name: string) => {
    const storage = await getMMKV();
    storage.delete(name);
  },
};
