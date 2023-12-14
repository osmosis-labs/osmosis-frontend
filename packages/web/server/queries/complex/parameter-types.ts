import { z } from "zod";

// Generic and reused types
// Avoid adding single use types here

export type Search = z.infer<typeof SearchSchema>;
export const SearchSchema = z.object({
  query: z.string(),
  limit: z.number().optional(),
});

export type Sort = z.infer<typeof SortSchema>;
export const SortSchema = z.object({
  keyPath: z.string().optional(),
  direction: z.enum(["asc", "desc"]).default("desc").optional(),
});

export type UserOsmoAddress = z.infer<typeof UserOsmoAddressSchema>;
export const UserOsmoAddressSchema = z.object({
  userOsmoAddress: z.string().startsWith("osmo").optional(),
});
