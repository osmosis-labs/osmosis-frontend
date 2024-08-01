/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, test } from "@playwright/test";
import process from "process";

import { TestConfig } from "~/e2e/test-config";
import { UnzipExtension } from "~/e2e/unzip-extension";

import { SwapPage } from "../pages/swap-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Swap Osmo feature", () => {
  let context: BrowserContext;
  const walletId =
    process.env.WALLET_ID ?? "osmo1ka7q9tykdundaanr07taz3zpt5k72c0ut5r4xa";
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  let swapPage: SwapPage;
  const USDC =
    "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
  const ATOM =
    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";

  test.beforeAll(async () => {
    const pathToExtension = new UnzipExtension().getPathToExtension();
    console.log("\nSetup Wallet Extension before tests.");
    // Launch Chrome with a Keplr wallet extension
    context = await chromium.launchPersistentContext(
      "",
      new TestConfig().getBrowserExtensionConfig(false, pathToExtension)
    );
    // Get all new pages (including Extension) in the context and wait
    const emptyPage = context.pages()[0];
    await emptyPage.waitForTimeout(2000);
    const page = context.pages()[1];
    const walletPage = new WalletPage(page);
    // Import existing Wallet (could be aggregated in one function).
    await walletPage.importWalletWithPrivateKey(privateKey);
    await walletPage.setWalletNameAndPassword(
      "Test Swaps",
      "TestPassword2024."
    );
    await walletPage.selectChainsAndSave();
    await walletPage.finish();
    // Switch to Application
    swapPage = new SwapPage(context.pages()[0]);
    await swapPage.goto();
    await swapPage.connectWallet();
    expect(await swapPage.isError(), "Swap is not available!").toBeFalsy();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("User should be able to swap OSMO to ATOM", async () => {
    await swapPage.goto();
    await swapPage.selectPair("OSMO", "ATOM");
    await swapPage.enterAmount("0.01");
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("token_out_denom: " + ATOM);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("denom: uosmo");
    expect(swapPage.isTransactionBroadcasted());
    expect(swapPage.isTransactionSuccesful());
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });

  test("User should be able to swap ATOM to OSMO", async () => {
    await swapPage.goto();
    await swapPage.selectPair("ATOM", "OSMO");
    await swapPage.enterAmount("0.001");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + ATOM);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: uosmo");
    expect(swapPage.isTransactionBroadcasted());
    expect(swapPage.isTransactionSuccesful());
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });

  test("User should be able to swap OSMO to USDC", async () => {
    await swapPage.goto();
    await swapPage.selectPair("OSMO", "USDC");
    await swapPage.enterAmount("0.2");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("token_out_denom: " + USDC);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("denom: uosmo");
    expect(swapPage.isTransactionBroadcasted());
    expect(swapPage.isTransactionSuccesful());
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });

  test("User should be able to swap USDC to OSMO", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDC", "OSMO");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("token_out_denom: uosmo");
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("denom: " + USDC);
    expect(swapPage.isTransactionBroadcasted());
    expect(swapPage.isTransactionSuccesful());
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });
});
