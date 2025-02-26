import {
  EthereumChainInfo,
  NativeEVMTokenConstantAddress,
} from "@osmosis-labs/utils";
import { Address, createPublicClient, erc20Abi, http } from "viem";

export async function getEvmBalance({
  address,
  userAddress,
  chainId,
}: {
  address: string;
  userAddress: string;
  chainId: number;
}) {
  const evmChain = EthereumChainInfo.find(
    (chain) => String(chain.id) === String(chainId)
  );

  if (!evmChain) {
    throw new Error(`Chain with id ${chainId} not found`);
  }

  // Get all available RPC URLs
  const rpcUrls = evmChain.rpcUrls.default.http;

  // Keep track of errors to report if all RPCs fail
  const errors: Error[] = [];

  // Try each RPC URL until one succeeds
  for (const rpcUrl of rpcUrls) {
    try {
      const publicClient = createPublicClient({
        chain: evmChain,
        transport: http(rpcUrl),
      });

      const balance =
        address === NativeEVMTokenConstantAddress
          ? await publicClient.getBalance({ address: userAddress as Address })
          : await publicClient.readContract({
              abi: erc20Abi,
              address: address as Address,
              functionName: "balanceOf",
              args: [userAddress as Address],
            });

      return balance;
    } catch (error) {
      // Store the error and try the next RPC URL
      errors.push(error as Error);
      console.warn(`RPC URL ${rpcUrl} failed: ${(error as Error).message}`);
    }
  }

  // If we've tried all RPC URLs and all failed, throw an error with details
  const errorMessage = `All RPC URLs failed for chain ${chainId}. Errors: ${errors
    .map((e) => e.message)
    .join("; ")}`;
  throw new Error(errorMessage);
}
