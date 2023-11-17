import { z } from "zod";

export type Search = z.infer<typeof SearchSchema>;

export const SearchSchema = z.object({
  query: z.string(),
});

export type Sort = z.infer<typeof SortSchema>;

export const SortSchema = z.object({
  keyPath: z.string(),
  direction: z.enum(["asc", "desc"]),
});
