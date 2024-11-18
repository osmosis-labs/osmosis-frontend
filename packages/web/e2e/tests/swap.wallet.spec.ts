/* eslint-disable import/no-extraneous-dependencies */
import { type BrowserContext, chromium, expect, test } from "@playwright/test";
import process from "process";

import { TradePage } from "~/e2e/pages/trade-page";
import { TestConfig } from "~/e2e/test-config";
import { UnzipExtension } from "~/e2e/unzip-extension";

import { WalletPage } from "../pages/wallet-page";

test.describe("Test Swap feature", () => {
  let context: BrowserContext;
  const walletId =
    process.env.WALLET_ID ?? "osmo1qyc8u7cn0zjxcu9dvrjz5zwfnn0ck92v62ak9l";
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  let tradePage: TradePage;
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
      new TestConfig().getBrowserExtensionConfig(true, pathToExtension)
    );
    // Get all new pages (including Extension) in the context and wait
    const emptyPage = context.pages()[0];
    await emptyPage.waitForTimeout(2000);
    const page = context.pages()[1];
    const walletPage = new WalletPage(page);
    // Import existing Wallet (could be aggregated in one function).
    await walletPage.importWalletWithPrivateKey(privateKey);
    await walletPage.setWalletNameAndPassword("Test Swaps");
    await walletPage.selectChainsAndSave();
    await walletPage.finish();
    // Switch to Application
    tradePage = new TradePage(context.pages()[0]);
    await tradePage.goto();
    await tradePage.connectWallet();
    expect(await tradePage.isError(), "Swap is not available!").toBeFalsy();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("User should be able to swap OSMO to ATOM", async () => {
    await tradePage.goto();
    await tradePage.selectPair("OSMO", "ATOM");
    await tradePage.enterAmount("0.2");
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`token_out_denom: ${ATOM}`);
    expect(msgContentAmount).toContain(`sender: ${walletId}`);
    expect(msgContentAmount).toContain("denom: uosmo");
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap ATOM to OSMO", async () => {
    await tradePage.goto();
    await tradePage.selectPair("ATOM", "OSMO");
    await tradePage.enterAmount("0.01");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`denom: ${ATOM}`);
    expect(msgContentAmount).toContain(`sender: ${walletId}`);
    expect(msgContentAmount).toContain("token_out_denom: uosmo");
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap OSMO to USDC", async () => {
    await tradePage.goto();
    await tradePage.selectPair("OSMO", "USDC");
    await tradePage.enterAmount("0.2");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`token_out_denom: ${USDC}`);
    expect(msgContentAmount).toContain(`sender: ${walletId}`);
    expect(msgContentAmount).toContain("denom: uosmo");
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap OSMO to WBTC", async () => {
    await tradePage.goto();
    await tradePage.selectPair("OSMO", "WBTC");
    await tradePage.enterAmount("0.9");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`sender: ${walletId}`);
    expect(msgContentAmount).toContain("denom: uosmo");
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap USDC to OSMO", async () => {
    await tradePage.goto();
    await tradePage.selectPair("USDC", "OSMO");
    await tradePage.enterAmount("0.1");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("token_out_denom: uosmo");
    expect(msgContentAmount).toContain(`sender: ${walletId}`);
    expect(msgContentAmount).toContain(`denom: ${USDC}`);
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap ATOM to USDC", async () => {
    await tradePage.goto();
    await tradePage.selectPair("ATOM", "USDC");
    await tradePage.enterAmount("0.015");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`denom: ${ATOM}`);
    expect(msgContentAmount).toContain(`sender: ${walletId}`);
    expect(msgContentAmount).toContain(`token_out_denom: ${USDC}`);
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap USDC to ATOM", async () => {
    await tradePage.goto();
    await tradePage.selectPair("USDC", "ATOM");
    await tradePage.enterAmount("0.1");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`denom: ${USDC}`);
    expect(msgContentAmount).toContain(`sender: ${walletId}`);
    expect(msgContentAmount).toContain(`token_out_denom: ${ATOM}`);
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap USDC to TIA", async () => {
    await tradePage.goto();
    await tradePage.selectPair("USDC", "TIA");
    await tradePage.enterAmount("0.1");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`denom: ${USDC}`);
    expect(msgContentAmount).toContain(`sender: ${walletId}`);
    expect(msgContentAmount).toContain(`token_out_denom: ${TIA}`);
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap TIA to USDC", async () => {
    await tradePage.goto();
    await tradePage.selectPair("TIA", "USDC");
    await tradePage.enterAmount("0.02");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`denom: ${TIA}`);
    expect(msgContentAmount).toContain(`sender: ${walletId}`);
    expect(msgContentAmount).toContain(`token_out_denom: ${USDC}`);
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap USDC to INJ", async () => {
    await tradePage.goto();
    await tradePage.selectPair("USDC", "INJ");
    await tradePage.enterAmount("0.2");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`denom: ${USDC}`);
    expect(msgContentAmount).toContain(`sender: ${walletId}`);
    expect(msgContentAmount).toContain(`token_out_denom: ${INJ}`);
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap INJ to USDC", async () => {
    await tradePage.goto();
    await tradePage.selectPair("INJ", "USDC");
    await tradePage.enterAmount("0.01");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`denom: ${INJ}`);
    expect(msgContentAmount).toContain(`sender: ${walletId}`);
    expect(msgContentAmount).toContain(`token_out_denom: ${USDC}`);
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap USDC to AKT", async () => {
    await tradePage.goto();
    await tradePage.selectPair("USDC", "AKT");
    await tradePage.enterAmount("0.1");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`denom: ${USDC}`);
    expect(msgContentAmount).toContain(`sender: ${walletId}`);
    expect(msgContentAmount).toContain(`token_out_denom: ${AKT}`);
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap AKT to USDC", async () => {
    await tradePage.goto();
    await tradePage.selectPair("AKT", "USDC");
    await tradePage.enterAmount("0.025");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`denom: ${AKT}`);
    expect(msgContentAmount).toContain(`sender: ${walletId}`);
    expect(msgContentAmount).toContain(`token_out_denom: ${USDC}`);
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });
});
