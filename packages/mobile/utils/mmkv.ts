import { MMKV } from "react-native-mmkv";

export const defaultStorage = new MMKV();

export const mmkvStorage = {
  getItem: (key: string) => defaultStorage.getString(key) ?? null,
  setItem: (key: string, value: string) => defaultStorage.set(key, value),
  removeItem: (key: string) => defaultStorage.delete(key),
};
