import { z } from "zod";

// Generic and reused types
// Avoid adding single use types here

export const OsmoAddressSchema = z.object({
  osmoAddress: z.string().startsWith("osmo").optional(),
});

export const UserOsmoAddressSchema = z.object({
  userOsmoAddress: z.string().startsWith("osmo").optional(),
});

export const UserCosmosAddressSchema = z.object({
  userCosmosAddress: z.string().optional(),
});

export const UserEvmAddressSchema = z.object({
  userEvmAddress: z.string().startsWith("0x").optional(),
});
