import { getChain } from "@osmosis-labs/server";
import {
  BitcoinChainInfo,
  EthereumChainInfo,
  SolanaChainInfo,
} from "@osmosis-labs/utils";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const chainsRouter = createTRPCRouter({
  /** Get Cosmos chain. */
  getChain: publicProcedure
    .input(
      z.object({
        findChainNameOrId: z.string(),
      })
    )
    .query(({ input: { findChainNameOrId }, ctx }) =>
      getChain({
        ...ctx,
        chainNameOrId: findChainNameOrId,
      })
    ),
  getEvmChain: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
      })
    )
    .query(({ input: { chainId } }) =>
      Object.values(EthereumChainInfo).find((chain) => chain.id === chainId)
    ),
  getChainDisplayInfo: publicProcedure
    .input(
      z.object({
        chainId: z.union([z.string(), z.number()]),
      })
    )
    .query(
      ({
        input: { chainId },
        ctx,
      }):
        | {
            chainId: string | number;
            prettyName: string;
            relativeLogoUrl?: string;
            color?: string;
          }
        | undefined => {
        // cosmos chains
        try {
          const cosmosChain = getChain({
            ...ctx,
            chainNameOrId: String(chainId),
          });

          return {
            chainId: cosmosChain.chain_id,
            prettyName: cosmosChain.pretty_name,
            relativeLogoUrl: cosmosChain?.logoURIs?.svg,
            color: cosmosChain?.logoURIs?.theme?.background_color_hex,
          };
        } catch (error) {
          // if cosmos chain is undefined, check evm chains
          const evmChain = Object.values(EthereumChainInfo).find(
            (chain) => chain.id === chainId
          );

          if (evmChain) {
            return {
              chainId: evmChain.id,
              prettyName: evmChain.chainName,
              relativeLogoUrl: evmChain.relativeLogoUrl,
              color: evmChain.color,
            };
          }

          const bitcoinChain =
            BitcoinChainInfo.chainId === chainId ? BitcoinChainInfo : undefined;
          if (bitcoinChain) {
            return {
              chainId: bitcoinChain.chainId,
              prettyName: bitcoinChain.prettyName,
              relativeLogoUrl: bitcoinChain.relativeLogoUrl,
              color: bitcoinChain.color,
            };
          }

          const solanaChain =
            SolanaChainInfo.chainId === chainId ? SolanaChainInfo : undefined;
          if (solanaChain) {
            return {
              chainId: solanaChain.chainId,
              prettyName: solanaChain.prettyName,
              relativeLogoUrl: solanaChain.relativeLogoUrl,
              color: solanaChain.color,
            };
          }
        }
      }
    ),
});
