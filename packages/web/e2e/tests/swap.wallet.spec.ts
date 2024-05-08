/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, test } from "@playwright/test";
import path from "path";
import process from "process";

import { SwapPage } from "../pages/swap-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Swap feature", () => {
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
  let ATOM =
    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";

  test.beforeEach(async () => {
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
  });

  test.afterEach(async () => {
    await context.close();
  });

  test("User should be able to swap OSMO to ATOM", async () => {
    await swapPage.selectPair("OSMO", "ATOM");
    await swapPage.swap("0.01");
    // Handle Pop-up page ->
    const pageApprove = context.waitForEvent("page");
    const { msgContentAmount } = await swapPage.getWalletMsg(pageApprove);
    // Handle Pop-up page <-
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("token_out_denom: " + ATOM);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("denom: uosmo");
    expect(swapPage.isTransactionSuccesful()).toBeTruthy();
  });

  test("User should be able to swap ATOM to OSMO", async () => {
    await swapPage.selectPair("ATOM", "OSMO");
    await swapPage.swap("0.001");
    // Handle Pop-up page ->
    const pageApprove = context.waitForEvent("page");
    const { msgContentAmount } = await swapPage.getWalletMsg(pageApprove);
    // Handle Pop-up page <-
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + ATOM);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: uosmo");
    expect(swapPage.isTransactionSuccesful()).toBeTruthy();
  });

  test("User should be able to swap USDC to USDC.axl", async () => {
    await swapPage.selectPair("USDC", "USDC.axl");
    await swapPage.swap("0.1");
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
    await swapPage.swap("0.1");
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
    await swapPage.swap("0.1");
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
    await swapPage.swap("0.1");
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

  test("User should be able to swap OSMO to USDC", async () => {
    await swapPage.selectPair("OSMO", "USDC");
    await swapPage.swap("0.1");
    // Handle Pop-up page ->
    const pageApprove = context.waitForEvent("page");
    const { msgContentAmount } = await swapPage.getWalletMsg(pageApprove);
    // Handle Pop-up page <-
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("token_out_denom: " + USDC);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("denom: uosmo");
    expect(swapPage.isTransactionSuccesful()).toBeTruthy();
  });

  test("User should be able to swap USDC to OSMO", async () => {
    await swapPage.selectPair("USDC", "OSNO");
    await swapPage.swap("0.1");
    // Handle Pop-up page ->
    const pageApprove = context.waitForEvent("page");
    const { msgContentAmount } = await swapPage.getWalletMsg(pageApprove);
    // Handle Pop-up page <-
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("token_out_denom: uosmo");
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("denom: " + USDC);
    expect(swapPage.isTransactionSuccesful()).toBeTruthy();
  });

  test("User should be able to swap ATOM to USDC", async () => {
    await swapPage.selectPair("ATOM", "USDC");
    await swapPage.swap("0.01");
    // Handle Pop-up page ->
    const pageApprove = context.waitForEvent("page");
    const { msgContentAmount } = await swapPage.getWalletMsg(pageApprove);
    // Handle Pop-up page <-
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + ATOM);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + USDC);
    expect(swapPage.isTransactionSuccesful()).toBeTruthy();
  });

  test("User should be able to swap USDC to ATOM", async () => {
    await swapPage.selectPair("USDC", "ATOM");
    await swapPage.swap("0.1");
    // Handle Pop-up page ->
    const pageApprove = context.waitForEvent("page");
    const { msgContentAmount } = await swapPage.getWalletMsg(pageApprove);
    // Handle Pop-up page <-
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDC);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + ATOM);
    expect(swapPage.isTransactionSuccesful()).toBeTruthy();
  });
});
