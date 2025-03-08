import CryptoJS from "crypto-es";

/**
 * Decrypts AES-CBC encrypted data using the provided key.
 * Expects the first 16 bytes (128 bits) of the Base64 string to be the IV.
 *
 * @param encryptedData Base64 encoded string with IV prepended
 * @param key Base64 encoded 32-byte key
 * @returns Decrypted data as UTF-8 string
 */
export function decryptAES(encryptedData: string, key: string): string {
  if (!encryptedData || !key) {
    throw new Error("Invalid input");
  }
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedData;
}
