import { z } from "zod";

// Generic and reused types
// Avoid adding single use types here

export type UserOsmoAddress = z.infer<typeof OsmoAddressSchema>;
export const OsmoAddressSchema = z.object({
  osmoAddress: z.string().startsWith("osmo").optional(),
});

export const UserOsmoAddressSchema = z.object({
  userOsmoAddress: z.string().startsWith("osmo").optional(),
});
