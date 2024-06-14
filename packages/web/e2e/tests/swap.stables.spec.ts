/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, test } from "@playwright/test";
import path from "path";
import process from "process";

import { SwapPage } from "../pages/swap-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Swap Stables feature", () => {
  let context: BrowserContext;
  const walletId =
    process.env.WALLET_ID ?? "osmo1ka7q9tykdundaanr07taz3zpt5k72c0ut5r4xa";
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  const password = process.env.PASSWORD ?? "TestPassword2024.";
  let swapPage: SwapPage;
  let USDC =
    "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
  let USDCa =
    "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858";
  let USDTa =
    "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4";
  let USDT =
    "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB";

  test.beforeAll(async () => {
    console.log("Before test setup Wallet Extension.");
    // Launch Chrome with a Keplr wallet extension
    const pathToExtension = path.join(__dirname, "../keplr-extension");
    context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        "--headless=new",
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
      viewport: { width: 1280, height: 1024 },
      slowMo: 300,
    });
    // Get all new pages (including Extension) in the context and wait
    const emptyPage = context.pages()[0];
    await emptyPage.waitForTimeout(2000);
    const page = context.pages()[1];
    const walletPage = new WalletPage(page);
    // Import existing Wallet (could be aggregated in one function).
    await walletPage.importWalletWithPrivateKey(privateKey);
    await walletPage.setWalletNameAndPassword("Test", password);
    await walletPage.selectChainsAndSave();
    await walletPage.finish();
    // Switch to Application
    swapPage = new SwapPage(await context.newPage());
    await swapPage.goto();
    await swapPage.connectWallet();
    expect(await swapPage.isError(), "Swap is not available!").toBeFalsy();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("User should be able to swap USDC to USDC.axl", async () => {
    await swapPage.selectPair("USDC", "USDC.axl");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    await swapPage.swap();
    // Handle Pop-up page ->
    const pageApprove = context.waitForEvent("page");
    const { msgContentAmount } = await swapPage.getWalletMsg(pageApprove);
    // Handle Pop-up page <-
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDC);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + USDCa);
    expect(swapPage.isTransactionBroadcasted(10));
    expect(swapPage.isTransactionSuccesful(10));
  });

  test("User should be able to swap USDC.axl to USDC", async () => {
    await swapPage.selectPair("USDC.axl", "USDC");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    await swapPage.swap();
    // Handle Pop-up page ->
    const pageApprove = context.waitForEvent("page");
    const { msgContentAmount } = await swapPage.getWalletMsg(pageApprove);
    // Handle Pop-up page <-
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDCa);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + USDC);
    expect(swapPage.isTransactionBroadcasted(10));
    expect(swapPage.isTransactionSuccesful(10));
  });

  test("User should be able to swap USDT to USDT.axl", async () => {
    await swapPage.selectPair("USDT", "USDT.axl");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    await swapPage.swap();
    // Handle Pop-up page ->
    const pageApprove = context.waitForEvent("page");
    const { msgContentAmount } = await swapPage.getWalletMsg(pageApprove);
    // Handle Pop-up page <-
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDT);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + USDTa);
    expect(swapPage.isTransactionBroadcasted(10));
    expect(swapPage.isTransactionSuccesful(10));
  });

  test("User should be able to swap USDT.axl to USDT", async () => {
    await swapPage.selectPair("USDT.axl", "USDT");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    await swapPage.swap();
    // Handle Pop-up page ->
    const pageApprove = context.waitForEvent("page");
    const { msgContentAmount } = await swapPage.getWalletMsg(pageApprove);
    // Handle Pop-up page <-
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDTa);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + USDT);
    expect(swapPage.isTransactionBroadcasted(10));
    expect(swapPage.isTransactionSuccesful(10));
  });
});
