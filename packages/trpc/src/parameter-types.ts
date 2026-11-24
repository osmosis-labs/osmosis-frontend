import { z } from "zod";

// Generic and reused types
// Avoid adding single use types here

/** Safe bech32 character set (no path traversal, query, or fragment chars). */
export const OsmoAddressValueSchema = z
  .string()
  .regex(/^osmo1[a-z0-9]{1,83}$/, "Invalid Osmosis address");

export const CosmosAddressValueSchema = z
  .string()
  .regex(/^[a-z0-9]{1,32}1[a-z0-9]{1,83}$/, "Invalid Cosmos address");

export const EvmAddressValueSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, "Invalid EVM address");

export const PoolIdValueSchema = z
  .string()
  .regex(/^\d{1,20}$/, "Invalid pool ID");

export const CoinGeckoIdValueSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9._-]{0,127}$/i, "Invalid CoinGecko ID")
  .refine((id) => !id.includes(".."), "Invalid CoinGecko ID");

export const OsmoAddressSchema = z.object({
  osmoAddress: OsmoAddressValueSchema.optional(),
});

export const UserOsmoAddressSchema = z.object({
  userOsmoAddress: OsmoAddressValueSchema.optional(),
});

export const UserCosmosAddressSchema = z.object({
  userCosmosAddress: CosmosAddressValueSchema.optional(),
});

export const UserEvmAddressSchema = z.object({
  userEvmAddress: EvmAddressValueSchema.optional(),
});
