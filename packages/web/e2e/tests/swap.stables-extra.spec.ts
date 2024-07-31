/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, test } from "@playwright/test";
import process from "process";

import { SwapPage } from "../pages/swap-page";
import { WalletPage } from "../pages/wallet-page";
import { TestConfig } from "../test-config";
import { UnzipExtension } from "../unzip-extension";

test.describe("Test Swap Stables Extra feature", () => {
  let context: BrowserContext;
  const walletId =
    process.env.WALLET_ID_S ?? "osmo1dkmsds5j6q9l9lv4dkhas68767tlqfx8ls5j0c";
  const privateKey = process.env.PRIVATE_KEY_S ?? "private_key_s";
  const password = process.env.PASSWORD ?? "TestPassword2024.";
  let swapPage: SwapPage;
  let USDTa =
    "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4";
  let kavaUSDT =
    "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB";

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
    await walletPage.setWalletNameAndPassword("Test Stables", password);
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

  test("User should be able to swap USDT.eth.axl to USDT.kava", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDT.eth.axl", "USDT.kava");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDTa);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + kavaUSDT);
    expect(swapPage.isTransactionBroadcasted(10));
    expect(swapPage.isTransactionSuccesful(10));
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });

  test("User should be able to swap USDT.kava to USDT.eth.axl", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDT.kava", "USDT.eth.axl");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + kavaUSDT);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + USDTa);
    expect(swapPage.isTransactionBroadcasted(10));
    expect(swapPage.isTransactionSuccesful(10));
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });
});
