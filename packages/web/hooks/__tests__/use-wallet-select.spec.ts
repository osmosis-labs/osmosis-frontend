import {
  CosmosKitAccountsLocalStorageKey,
  CosmosKitWalletLocalStorageKey,
} from "@osmosis-labs/stores";

import { installPrevSessionWallet } from "~/hooks/use-wallet-select";

const ACCOUNTS_KEY = CosmosKitAccountsLocalStorageKey;
const WALLET_KEY = CosmosKitWalletLocalStorageKey;

const FAKE_ACCOUNTS = JSON.stringify([{ address: "osmo1abc" }]);

function makeDeps(
  overrides: Partial<Parameters<typeof installPrevSessionWallet>[0]> = {}
) {
  return {
    walletRegistry: [],
    mainWallets: [],
    addWallet: jest.fn(),
    ...overrides,
  } as Parameters<typeof installPrevSessionWallet>[0];
}

beforeEach(() => {
  localStorage.clear();
});

describe("installPrevSessionWallet", () => {
  describe("when there is no persisted account data", () => {
    it("clears both localStorage keys when accounts key is absent", async () => {
      localStorage.setItem(WALLET_KEY, "some-wallet");

      await installPrevSessionWallet(makeDeps());

      expect(localStorage.getItem(WALLET_KEY)).toBeNull();
      expect(localStorage.getItem(ACCOUNTS_KEY)).toBeNull();
    });

    it("clears both localStorage keys when accounts is an empty array", async () => {
      localStorage.setItem(ACCOUNTS_KEY, "[]");
      localStorage.setItem(WALLET_KEY, "some-wallet");

      await installPrevSessionWallet(makeDeps());

      expect(localStorage.getItem(WALLET_KEY)).toBeNull();
      expect(localStorage.getItem(ACCOUNTS_KEY)).toBeNull();
    });
  });

  describe("when there is no persisted wallet name", () => {
    it("does nothing and does not call addWallet", async () => {
      localStorage.setItem(ACCOUNTS_KEY, FAKE_ACCOUNTS);

      const deps = makeDeps();
      await installPrevSessionWallet(deps);

      expect(deps.addWallet).not.toHaveBeenCalled();
      expect(localStorage.getItem(ACCOUNTS_KEY)).toBe(FAKE_ACCOUNTS);
    });
  });

  describe("when the persisted wallet is already installed", () => {
    it("returns early without calling addWallet", async () => {
      localStorage.setItem(ACCOUNTS_KEY, FAKE_ACCOUNTS);
      localStorage.setItem(WALLET_KEY, "keplr-extension");

      const deps = makeDeps({
        mainWallets: [{ walletInfo: { name: "keplr-extension" } } as any],
      });

      await installPrevSessionWallet(deps);

      expect(deps.addWallet).not.toHaveBeenCalled();
      expect(localStorage.getItem(WALLET_KEY)).toBe("keplr-extension");
      expect(localStorage.getItem(ACCOUNTS_KEY)).toBe(FAKE_ACCOUNTS);
    });
  });

  describe("when the persisted wallet is no longer in the registry (e.g. Leap sunset)", () => {
    it("clears both localStorage keys so the user starts fresh", async () => {
      localStorage.setItem(ACCOUNTS_KEY, FAKE_ACCOUNTS);
      localStorage.setItem(WALLET_KEY, "leap-extension");

      const deps = makeDeps({ walletRegistry: [] });
      await installPrevSessionWallet(deps);

      expect(localStorage.getItem(WALLET_KEY)).toBeNull();
      expect(localStorage.getItem(ACCOUNTS_KEY)).toBeNull();
      expect(deps.addWallet).not.toHaveBeenCalled();
    });

    it("does not throw even though the wallet class cannot be loaded", async () => {
      localStorage.setItem(ACCOUNTS_KEY, FAKE_ACCOUNTS);
      localStorage.setItem(WALLET_KEY, "leap-cosmos-mobile");

      await expect(
        installPrevSessionWallet(makeDeps({ walletRegistry: [] }))
      ).resolves.not.toThrow();
    });
  });

  describe("when the persisted wallet is in the registry", () => {
    it("lazy-installs and adds the wallet via addWallet", async () => {
      localStorage.setItem(ACCOUNTS_KEY, FAKE_ACCOUNTS);
      localStorage.setItem(WALLET_KEY, "keplr-extension");

      const FakeWalletClass = jest.fn();
      const fakeWalletInfo = {
        name: "keplr-extension",
        lazyInstall: jest.fn().mockResolvedValue(FakeWalletClass),
      };

      const deps = makeDeps({
        walletRegistry: [fakeWalletInfo as any],
      });

      await installPrevSessionWallet(deps);

      expect(fakeWalletInfo.lazyInstall).toHaveBeenCalled();
      expect(FakeWalletClass).toHaveBeenCalledWith(fakeWalletInfo);
      expect(deps.addWallet).toHaveBeenCalledWith(expect.any(FakeWalletClass));
      expect(localStorage.getItem(WALLET_KEY)).toBe("keplr-extension");
      expect(localStorage.getItem(ACCOUNTS_KEY)).toBe(FAKE_ACCOUNTS);
    });
  });
});
