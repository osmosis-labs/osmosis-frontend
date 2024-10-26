/* eslint-disable import/no-extraneous-dependencies */
import { type BrowserContext, chromium, expect, test } from "@playwright/test";
import process from "process";

import { TradePage } from "~/e2e/pages/trade-page";
import { TestConfig } from "~/e2e/test-config";
import { UnzipExtension } from "~/e2e/unzip-extension";

import { WalletPage } from "../pages/wallet-page";

test.describe("Test Swap Stables feature", () => {
  let context: BrowserContext;
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  let tradePage: TradePage;
  const USDC =
    "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
  const USDCa =
    "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858";
  const allUSDT =
    "factory/osmo1em6xs47hd82806f5cxgyufguxrrc7l0aqx7nzzptjuqgswczk8csavdxek/alloyed/allUSDT";

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
    let page = context.pages()[1];
    const walletPage = new WalletPage(page);
    // Import existing Wallet (could be aggregated in one function).
    await walletPage.importWalletWithPrivateKey(privateKey);
    await walletPage.setWalletNameAndPassword("Test Stables");
    await walletPage.selectChainsAndSave();
    await walletPage.finish();
    page = context.pages()[0];
    tradePage = new TradePage(page);

    await tradePage.goto();
    await tradePage.connectWallet();
    expect(await tradePage.isError(), "Swap is not available!").toBeFalsy();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("User should be able to swap USDC to USDC.eth.axl", async () => {
    await tradePage.goto();
    await tradePage.selectPair("USDC", "USDC.eth.axl");
    await tradePage.enterAmount("0.1");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`denom: ${USDC}`);
    expect(msgContentAmount).toContain(`token_out_denom: ${USDCa}`);
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap USDC.eth.axl to USDC", async () => {
    await tradePage.goto();
    await tradePage.selectPair("USDC.eth.axl", "USDC");
    await tradePage.enterAmount("0.1");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`denom: ${USDCa}`);
    expect(msgContentAmount).toContain(`token_out_denom: ${USDC}`);
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap USDT to USDC", async () => {
    await tradePage.goto();
    await tradePage.selectPair("USDT", "USDC");
    await tradePage.enterAmount("0.1");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(USDC);
    expect(msgContentAmount).toContain(allUSDT);
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap USDC to USDT", async () => {
    await tradePage.goto();
    await tradePage.selectPair("USDC", "USDT");
    await tradePage.enterAmount("0.1");
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`denom: ${USDC}`);
    expect(msgContentAmount).toContain(allUSDT);
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });
});
