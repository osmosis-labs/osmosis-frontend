/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, test } from "@playwright/test";
import path from "path";
import process from "process";

import { SwapPage } from "../pages/swap-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Swap Stables feature", () => {
  let context: BrowserContext;
  const walletId =
    process.env.WALLET_ID_S ?? "osmo1dkmsds5j6q9l9lv4dkhas68767tlqfx8ls5j0c";
  const privateKey = process.env.PRIVATE_KEY_S ?? "private_key_s";
  const password = process.env.PASSWORD ?? "TestPassword2024.";
  let swapPage: SwapPage;
  let USDC =
    "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
  let USDCa =
    "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858";
  let USDTa =
    "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4";
  let allUSDT =
    "factory/osmo1em6xs47hd82806f5cxgyufguxrrc7l0aqx7nzzptjuqgswczk8csavdxek/alloyed/allUSDT";
  let kavaUSDT =
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
      slowMo: 400,
    });
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

  test("User should be able to swap USDC to USDC.axl", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDC", "USDC.axl");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDC);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + USDCa);
    expect(swapPage.isTransactionBroadcasted(10));
    expect(swapPage.isTransactionSuccesful(10));
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });

  test("User should be able to swap USDC.axl to USDC", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDC.axl", "USDC");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDCa);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("token_out_denom: " + USDC);
    expect(swapPage.isTransactionBroadcasted(10));
    expect(swapPage.isTransactionSuccesful(10));
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });

  test("User should be able to swap USDT to USDT.axl", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDT", "USDT.axl");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(USDTa);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain(allUSDT);
    expect(swapPage.isTransactionBroadcasted(10));
    expect(swapPage.isTransactionSuccesful(10));
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });

  test("User should be able to swap USDT.axl to USDT", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDT.axl", "USDT");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("denom: " + USDTa);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain(allUSDT);
    expect(swapPage.isTransactionBroadcasted(10));
    expect(swapPage.isTransactionSuccesful(10));
    expect(swapPage.getTransactionUrl()).toBeTruthy();
  });

  test("User should be able to swap USDT.axl to kava.USDT", async () => {
    await swapPage.goto();
    await swapPage.selectPair("USDT.axl", "kava.USDT");
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

  test("User should be able to swap kava.USDT to USDT.axl", async () => {
    await swapPage.goto();
    await swapPage.selectPair("kava.USDT", "USDT.axl");
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
