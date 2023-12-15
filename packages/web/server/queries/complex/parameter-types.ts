import { z } from "zod";

// Generic and reused types
// Avoid adding single use types here

export type UserOsmoAddress = z.infer<typeof UserOsmoAddressSchema>;
export const UserOsmoAddressSchema = z.object({
  userOsmoAddress: z.string().startsWith("osmo").optional(),
});
