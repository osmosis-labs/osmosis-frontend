import { NativeEVMTokenConstantAddress } from "@osmosis-labs/utils";
import { createPublicClient } from "viem";

import { getEvmBalance } from "../ethereum";

// Mock viem
jest.mock("viem", () => {
  const originalModule = jest.requireActual("viem");

  return {
    ...originalModule,
    createPublicClient: jest.fn(),
    http: jest.fn().mockImplementation((url) => ({ url })),
  };
});

// Mock EthereumChainInfo
jest.mock("@osmosis-labs/utils", () => {
  const originalModule = jest.requireActual("@osmosis-labs/utils");

  return {
    ...originalModule,
    EthereumChainInfo: [
      {
        id: 1,
        name: "Ethereum",
        rpcUrls: {
          default: {
            http: [
              "https://test-rpc-1.com",
              "https://test-rpc-2.com",
              "https://test-rpc-3.com",
            ],
          },
        },
      },
    ],
    NativeEVMTokenConstantAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  };
});

describe("getEvmBalance", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if chain is not found", async () => {
    await expect(
      getEvmBalance({
        address: "0x123",
        userAddress: "0x456",
        chainId: 999999, // Non-existent chain ID
      })
    ).rejects.toThrow("Chain with id 999999 not found");
  });

  it("should cycle through RPC URLs if the first one fails", async () => {
    // Mock client for first RPC URL (fails)
    const mockClientFail = {
      getBalance: jest.fn().mockRejectedValue(new Error("Connection failed")),
      readContract: jest.fn().mockRejectedValue(new Error("Connection failed")),
    };

    // Mock client for second RPC URL (succeeds)
    const mockClientSuccess = {
      getBalance: jest.fn().mockResolvedValue(BigInt(100)),
      readContract: jest.fn().mockResolvedValue(BigInt(100)),
    };

    // Setup the mock to return different clients based on the URL
    (createPublicClient as jest.Mock).mockImplementation(({ transport }) => {
      if (transport.url === "https://test-rpc-1.com") {
        return mockClientFail;
      } else {
        return mockClientSuccess;
      }
    });

    // Test with native token
    const nativeBalance = await getEvmBalance({
      address: NativeEVMTokenConstantAddress,
      userAddress: "0x123",
      chainId: 1,
    });

    expect(nativeBalance).toEqual(BigInt(100));
    expect(createPublicClient).toHaveBeenCalledTimes(2);
    expect(mockClientFail.getBalance).toHaveBeenCalledTimes(1);
    expect(mockClientSuccess.getBalance).toHaveBeenCalledTimes(1);

    // Reset mocks
    jest.clearAllMocks();

    // Test with ERC20 token
    const erc20Balance = await getEvmBalance({
      address: "0xTokenAddress",
      userAddress: "0x123",
      chainId: 1,
    });

    expect(erc20Balance).toEqual(BigInt(100));
    expect(createPublicClient).toHaveBeenCalledTimes(2);
    expect(mockClientFail.readContract).toHaveBeenCalledTimes(1);
    expect(mockClientSuccess.readContract).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if all RPC URLs fail", async () => {
    // Mock all clients to fail
    const mockClient = {
      getBalance: jest.fn().mockRejectedValue(new Error("Connection failed")),
      readContract: jest.fn().mockRejectedValue(new Error("Connection failed")),
    };

    // Setup the mock to return failing clients for all URLs
    (createPublicClient as jest.Mock).mockReturnValue(mockClient);

    // Test with native token
    await expect(
      getEvmBalance({
        address: NativeEVMTokenConstantAddress,
        userAddress: "0x123",
        chainId: 1,
      })
    ).rejects.toThrow("All RPC URLs failed for chain 1");

    // Verify that we tried all RPC URLs (3 in our mock)
    expect(createPublicClient).toHaveBeenCalledTimes(3);
  });

  it("should succeed on the first try if the first RPC URL works", async () => {
    // Mock client that succeeds
    const mockClient = {
      getBalance: jest.fn().mockResolvedValue(BigInt(100)),
      readContract: jest.fn().mockResolvedValue(BigInt(100)),
    };

    // Setup the mock to return a successful client
    (createPublicClient as jest.Mock).mockReturnValue(mockClient);

    // Test with native token
    const balance = await getEvmBalance({
      address: NativeEVMTokenConstantAddress,
      userAddress: "0x123",
      chainId: 1,
    });

    expect(balance).toEqual(BigInt(100));
    expect(createPublicClient).toHaveBeenCalledTimes(1);
    expect(mockClient.getBalance).toHaveBeenCalledTimes(1);
  });
});
