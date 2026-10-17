import {
  EthereumChainInfo,
  getServerEvmRpcUrls,
  NativeEVMTokenConstantAddress,
  redactConfiguredEvmRpcUrls,
} from "@osmosis-labs/utils";
import {
  Address,
  BaseError,
  ContractFunctionZeroDataError,
  createPublicClient,
  erc20Abi,
  http,
} from "viem";

export async function getEvmBalance({
  address,
  userAddress,
  chainId,
  rpcUrls: rpcUrlsOverride,
}: {
  address: string;
  userAddress: string;
  chainId: number;
  /** RPC URLs to try in order. Defaults to the server list (configured keyed
   *  providers, then public endpoints); callers running in the browser pass
   *  the client list, since keyed env vars are server-only. */
  rpcUrls?: string[];
}) {
  const evmChain = EthereumChainInfo.find(
    (chain) => String(chain.id) === String(chainId)
  );

  if (!evmChain) {
    throw new Error(`Chain with id ${chainId} not found`);
  }

  const rpcUrls = rpcUrlsOverride ?? getServerEvmRpcUrls(evmChain);

  // Keep track of errors to report if all RPCs fail
  const errors: Error[] = [];

  // Try each RPC URL until one succeeds
  for (const [index, rpcUrl] of rpcUrls.entries()) {
    try {
      const publicClient = createPublicClient({
        chain: evmChain,
        // The loop is the retry: a hung endpoint should hand over to the next
        // URL in seconds, not after viem's default 10s timeout and 3 retries.
        transport: http(rpcUrl, { timeout: 3_000, retryCount: 0 }),
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
      // The chain itself answered that the token address has no contract
      // code. Another RPC would answer the same, and the account holds none
      // of that token, so this is a real zero rather than an unknown
      // balance. A revert is not treated as zero: viem also builds
      // ContractFunctionRevertedError for -32603 internal errors, which
      // providers send for passing failures such as "header not found".
      if (
        error instanceof BaseError &&
        error.walk((e) => e instanceof ContractFunctionZeroDataError)
      ) {
        return BigInt(0);
      }

      // Store the error and try the next RPC URL. viem error messages
      // include the request URL, which for a keyed provider carries the key.
      errors.push(error as Error);
      console.warn(
        redactConfiguredEvmRpcUrls(
          `RPC URL #${index + 1} for chain ${chainId} failed: ${
            (error as Error).message
          }`
        )
      );
    }
  }

  // If we've tried all RPC URLs and all failed, throw an error with details
  const errorMessage = `All RPC URLs failed for chain ${chainId}. Errors: ${errors
    .map((e) => e.message)
    .join("; ")}`;
  throw new Error(redactConfiguredEvmRpcUrls(errorMessage));
}
