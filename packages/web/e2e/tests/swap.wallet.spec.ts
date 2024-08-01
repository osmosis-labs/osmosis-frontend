/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, test } from "@playwright/test";
import process from "process";

import { TestConfig } from "~/e2e/test-config";
import { UnzipExtension } from "~/e2e/unzip-extension";

import { SwapPage } from "../pages/swap-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Swap feature", () => {
  let context: BrowserContext;
  const walletId =
    process.env.WALLET_ID ?? "osmo1ka7q9tykdundaanr07taz3zpt5k72c0ut5r4xa";
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  let swapPage: SwapPage;
  const USDC =
    "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
  const ATOM =
    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
  const TIA =
    "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877";
  const INJ =
    "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273";
  const AKT =
    "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4";

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

  test("User should be able to swap ATOM to USDC", async () => {
    await swapPage.goto();
    await swapPage.selectPair("ATOM", "USDC");
    await swapPage.enterAmount("0.015");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + ATOM);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + USDC);
    expect(swapPage.isTransactionBroadcasted());
    expect(swapPage.isTransactionSuccesful());
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });

  test("User should be able to swap USDC to ATOM", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDC", "ATOM");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDC);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + ATOM);
    expect(swapPage.isTransactionBroadcasted());
    expect(swapPage.isTransactionSuccesful());
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });

  test("User should be able to swap USDC to TIA", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDC", "TIA");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDC);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + TIA);
    expect(swapPage.isTransactionBroadcasted());
    expect(swapPage.isTransactionSuccesful());
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });

  test("User should be able to swap TIA to USDC", async () => {
    await swapPage.goto();
    await swapPage.selectPair("TIA", "USDC");
    await swapPage.enterAmount("0.02");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + TIA);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + USDC);
    expect(swapPage.isTransactionBroadcasted());
    expect(swapPage.isTransactionSuccesful());
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });

  test("User should be able to swap USDC to INJ", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDC", "INJ");
    await swapPage.enterAmount("0.2");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDC);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + INJ);
    expect(swapPage.isTransactionBroadcasted());
    expect(swapPage.isTransactionSuccesful());
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });

  test("User should be able to swap INJ to USDC", async () => {
    await swapPage.goto();
    await swapPage.selectPair("INJ", "USDC");
    await swapPage.enterAmount("0.01");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + INJ);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + USDC);
    expect(swapPage.isTransactionBroadcasted());
    expect(swapPage.isTransactionSuccesful());
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });

  test("User should be able to swap USDC to AKT", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDC", "AKT");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDC);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + AKT);
    expect(swapPage.isTransactionBroadcasted());
    expect(swapPage.isTransactionSuccesful());
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });

  test("User should be able to swap AKT to USDC", async () => {
    await swapPage.goto();
    await swapPage.selectPair("AKT", "USDC");
    await swapPage.enterAmount("0.025");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + AKT);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + USDC);
    expect(swapPage.isTransactionBroadcasted());
    expect(swapPage.isTransactionSuccesful());
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });
});
