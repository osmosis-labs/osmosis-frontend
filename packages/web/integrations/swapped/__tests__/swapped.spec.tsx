import { WalletStatus } from "@cosmos-kit/core";
import { render } from "@testing-library/react";

import { Swapped } from "../index";

let mockAddress: string | undefined;
let mockWalletStatus: WalletStatus | undefined;
const mockGetSignature = jest.fn();

jest.mock("~/hooks/use-wallet", () => {
  const { useState } = jest.requireActual<typeof import("react")>("react");
  return {
    useWallet: () => {
      useState();
      return { address: mockAddress, walletStatus: mockWalletStatus };
    },
  };
});

jest.mock("~/utils/trpc", () => {
  const { useState } = jest.requireActual<typeof import("react")>("react");
  return {
    api: {
      local: {
        swapped: {
          getSignature: {
            useQuery: (...args: unknown[]) => {
              useState();
              return mockGetSignature(...args);
            },
          },
        },
      },
    },
  };
});

it("updates the on-ramp across wallet connection, account changes, and disconnection", () => {
  mockAddress = undefined;
  mockWalletStatus = undefined;
  mockGetSignature.mockReturnValue({
    data: { url: "https://swapped.example/checkout" },
  });
  const ui = <Swapped assetKey="OSMO" isOpen onRequestClose={jest.fn()} />;
  const { container, rerender } = render(ui);

  expect(container.querySelector("iframe")).toBeNull();
  expect(mockGetSignature).toHaveBeenLastCalledWith(
    { walletAddress: "" },
    { enabled: false }
  );

  mockAddress = "osmo1firstaccount";
  mockWalletStatus = WalletStatus.Connected;
  rerender(<Swapped assetKey="OSMO" isOpen onRequestClose={jest.fn()} />);
  expect(container.querySelector("iframe")?.src).toBe(
    "https://swapped.example/checkout"
  );
  expect(mockGetSignature).toHaveBeenLastCalledWith(
    { walletAddress: mockAddress },
    { enabled: true }
  );

  mockAddress = "osmo1secondaccount";
  rerender(<Swapped assetKey="OSMO" isOpen onRequestClose={jest.fn()} />);
  expect(mockGetSignature).toHaveBeenLastCalledWith(
    { walletAddress: mockAddress },
    { enabled: true }
  );

  mockAddress = undefined;
  mockWalletStatus = WalletStatus.Disconnected;
  rerender(<Swapped assetKey="OSMO" isOpen onRequestClose={jest.fn()} />);
  expect(container.querySelector("iframe")).toBeNull();
  expect(mockGetSignature).toHaveBeenLastCalledWith(
    { walletAddress: "" },
    { enabled: false }
  );
});
