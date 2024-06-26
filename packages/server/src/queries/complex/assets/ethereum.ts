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
  const evmChain = Object.values(EthereumChainInfo).find(
    (chain) => String(chain.id) === String(chainId)
  );

  if (!evmChain) {
    throw new Error(`Chain with id ${chainId} not found`);
  }

  const publicClient = createPublicClient({
    chain: evmChain,
    transport: http(evmChain.rpcUrls.default.http[0]),
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
}
