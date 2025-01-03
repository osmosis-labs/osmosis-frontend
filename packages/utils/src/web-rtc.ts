import { z } from "zod";

/**
 * STUN server configuration for WebRTC peer connections.
 * Enables NAT traversal and peer discovery through Google's public STUN server.
 * This allows peers behind different networks/firewalls to establish direct connections.
 * The server runs on Google's infrastructure at stun.l.google.com:19302
 */
export const STUN_SERVER = { urls: "stun:stun.l.google.com:19302" };

export const BaseMessageSchema = z.object({
  type: z.string(),
});

// Schema for verification message sent from mobile to desktop
export const VerificationMessageSchema = BaseMessageSchema.extend({
  type: z.literal("verification"),
  code: z.string().length(6),
  secret: z.string(),
});

// Schema for verification success message sent from desktop to mobile
export const VerificationSuccessMessageSchema = BaseMessageSchema.extend({
  type: z.literal("verification_success"),
});

// Union of all possible message types
export const WebRTCMessageSchema = z.discriminatedUnion("type", [
  VerificationMessageSchema,
  VerificationSuccessMessageSchema,
]);

// Type exports
export type WebRTCMessage = z.infer<typeof WebRTCMessageSchema>;
export type VerificationMessage = z.infer<typeof VerificationMessageSchema>;
export type VerificationSuccessMessage = z.infer<
  typeof VerificationSuccessMessageSchema
>;

// Message parameters
export type WebRTCMessageParams =
  | { type: "verification"; code: string; secret: string }
  | { type: "verification_success" };

// Unified message creation function
export const createWebRTCMessage = (
  params: WebRTCMessageParams
): WebRTCMessage => {
  return WebRTCMessageSchema.parse(params);
};

/**
 * Serializes a WebRTC message for sending through a data channel
 */
export const serializeWebRTCMessage = (
  message: WebRTCMessageParams
): string => {
  const validatedMessage = createWebRTCMessage(message);
  return JSON.stringify(validatedMessage);
};

/**
 * Deserializes a WebRTC message received from a data channel
 * Handles different data types that can be received (string, ArrayBuffer, Blob)
 */
export const deserializeWebRTCMessage = async (
  data: unknown
): Promise<WebRTCMessage> => {
  let rawData: string;

  if (typeof data === "string") {
    rawData = data;
  } else if (data instanceof ArrayBuffer) {
    rawData = new TextDecoder().decode(data);
  } else if (data instanceof Blob) {
    rawData = await data.text();
  } else {
    throw new Error("Unsupported message data type");
  }

  const parsedData = JSON.parse(rawData);
  return WebRTCMessageSchema.parse(parsedData);
};
