import CryptoJS from "crypto-es";

/**
 * Encrypts data using AES-CBC with the provided key
 * @param data Data to encrypt
 * @param key Base64 encoded 32-byte key
 * @returns Base64 encoded encrypted data with IV prepended
 */
export function encryptAES(data: string, key: string): string {
  return CryptoJS.AES.encrypt(data, key).toString();
}
