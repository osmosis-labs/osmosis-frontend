/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, test } from "@playwright/test";
import process from "process";

import { TradePage } from "~/e2e/pages/trade-page";
import { TestConfig } from "~/e2e/test-config";
import { UnzipExtension } from "~/e2e/unzip-extension";

import { SwapPage } from "../pages/swap-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Swap Stables feature", () => {
  let context: BrowserContext;
  //const walletId = process.env.WALLET_ID_S ?? "osmo1dkmsds5j6q9l9lv4dkhas68767tlqfx8ls5j0c";
  const privateKey = process.env.PRIVATE_KEY_S ?? "private_key_s";
  const password = process.env.PASSWORD ?? "TestPassword2024.";
  const USE_TRADE: boolean = process.env.USE_TRADE === "use";
  let swapPage: SwapPage | TradePage;
  let USDC =
    "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
  let USDCa =
    "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858";
  let allUSDT =
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
    await walletPage.setWalletNameAndPassword("Test Stables", password);
    await walletPage.selectChainsAndSave();
    await walletPage.finish();
    page = context.pages()[0];
    // Switch to Application
    if (USE_TRADE) {
      swapPage = new TradePage(page);
    } else {
      swapPage = new SwapPage(page);
    }
    await swapPage.goto();
    await swapPage.connectWallet();
    expect(await swapPage.isError(), "Swap is not available!").toBeFalsy();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("User should be able to swap USDC to USDC.eth.axl", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDC", "USDC.eth.axl");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDC);
    //expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + USDCa);
    await swapPage.isTransactionSuccesful();
    await swapPage.getTransactionUrl();
  });

  test("User should be able to swap USDC.eth.axl to USDC", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDC.eth.axl", "USDC");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDCa);
    //expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + USDC);
    await swapPage.isTransactionSuccesful();
    await swapPage.getTransactionUrl();
  });

  test("User should be able to swap USDT to USDC", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDT", "USDC");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(USDC);
    //expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain(allUSDT);
    await swapPage.isTransactionSuccesful();
    await swapPage.getTransactionUrl();
  });

  test("User should be able to swap USDC to USDT", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDC", "USDT");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDC);
    //expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain(allUSDT);
    await swapPage.isTransactionSuccesful();
    await swapPage.getTransactionUrl();
  });
});
