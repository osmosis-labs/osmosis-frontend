import {
  type BrowserContext,
  type Page,
  type Response,
  chromium,
  expect,
  test,
} from "@playwright/test";

import { PortfolioPage } from "../pages/portfolio-page";
import { TradePage } from "../pages/trade-page";
import { TestConfig } from "../test-config";
import { TOKEN_DENOMS } from "../utils/balance-checker";
import { type AminoMsg, FakeWallet } from "../utils/fake-wallet";
import { fetchCanonicalOrderbooks } from "../utils/orderbook";
import { fetchTokenPrices } from "../utils/price-utils";

// The wallet flows with a fake wallet (see utils/fake-wallet.ts): real app,
// real quotes, real balances of a funded address, but nothing is signed with
// a real key or broadcast. Each test checks the message the app asked the
// wallet to sign against the quote the app received. The same flows run with
// real funds in the preview smoke test and in the full suite.

const { OSMO, ATOM, TIA, USDC } = TOKEN_DENOMS;

interface Quote {
  /** Set on exact-in quotes only, where the input is a coin. */
  inDenom?: string;
  inAmount?: string;
  outAmount?: string;
  poolIds: string[];
}

interface Swap {
  sender: string;
  inDenom: string;
  outDenom: string;
  /** Exact input, or the maximum input of an exact-out swap. */
  inAmount: bigint;
  /** Exact output, or the minimum output of an exact-in swap. */
  outAmount: bigint;
  exactIn: boolean;
  poolIds: string[];
}

/** One poolmanager swap message in its four amino shapes, normalised. */
function readSwap(msg: AminoMsg): Swap {
  const v = msg.value;
  switch (msg.type) {
    case "osmosis/poolmanager/swap-exact-amount-in":
      return {
        sender: v.sender,
        inDenom: v.token_in.denom,
        outDenom: v.routes[v.routes.length - 1].token_out_denom,
        inAmount: BigInt(v.token_in.amount),
        outAmount: BigInt(v.token_out_min_amount),
        exactIn: true,
        poolIds: v.routes.map((r: any) => String(r.pool_id)),
      };
    case "osmosis/poolmanager/split-amount-in":
      return {
        sender: v.sender,
        inDenom: v.token_in_denom,
        outDenom:
          v.routes[0].pools[v.routes[0].pools.length - 1].token_out_denom,
        inAmount: v.routes.reduce(
          (sum: bigint, r: any) => sum + BigInt(r.token_in_amount),
          BigInt(0)
        ),
        outAmount: BigInt(v.token_out_min_amount),
        exactIn: true,
        poolIds: v.routes.flatMap((r: any) =>
          r.pools.map((p: any) => String(p.pool_id))
        ),
      };
    case "osmosis/poolmanager/swap-exact-amount-out":
      return {
        sender: v.sender,
        inDenom: v.routes[0].token_in_denom,
        outDenom: v.token_out.denom,
        inAmount: BigInt(v.token_in_max_amount),
        outAmount: BigInt(v.token_out.amount),
        exactIn: false,
        poolIds: v.routes.map((r: any) => String(r.pool_id)),
      };
    case "osmosis/poolmanager/split-amount-out":
      return {
        sender: v.sender,
        inDenom: v.routes[0].pools[0].token_in_denom,
        outDenom: v.token_out_denom,
        inAmount: BigInt(v.token_in_max_amount),
        outAmount: v.routes.reduce(
          (sum: bigint, r: any) => sum + BigInt(r.token_out_amount),
          BigInt(0)
        ),
        exactIn: false,
        poolIds: v.routes.flatMap((r: any) =>
          r.pools.map((p: any) => String(p.pool_id))
        ),
      };
    default:
      throw new Error(`Not a swap message: ${msg.type}`);
  }
}

const units = (amount: bigint, decimals: number) =>
  Number(amount) / 10 ** decimals;

/**
 * SQS returns the fixed leg of a quote as a coin and the computed leg as a
 * bare integer: amount_in is a coin on exact-in quotes, amount_out on
 * exact-out ones.
 */
const quoteAmount = (a: any): string | undefined =>
  typeof a === "object" ? a?.amount : a;

/**
 * Checks the signed slippage bound against the quote for the traded amount:
 * min out is the quote less the 1% slippage on exact in, max in is the quote
 * plus 1% on exact out. Allows 0.5% either way for a quote refresh between the
 * last response seen here and the one the app signed.
 */
function expectSlippageBound(swap: Swap, quotesSeen: Quote[]) {
  // The page also quotes one unit for the rate label, so match the amount
  // actually traded and take the latest such quote.
  const quote = quotesSeen
    .filter((q) =>
      swap.exactIn
        ? q.inDenom === swap.inDenom && q.inAmount === String(swap.inAmount)
        : q.inDenom === undefined && q.outAmount === String(swap.outAmount)
    )
    .pop();
  expect(quote, "No quote for the traded amount was captured.").toBeDefined();
  expect(swap.poolIds).toEqual(quote!.poolIds);
  const [signed, bound] = swap.exactIn
    ? [swap.outAmount, Number(quote!.outAmount) * 0.99]
    : [swap.inAmount, Number(quote!.inAmount) * 1.01];
  expect(Number(signed)).toBeGreaterThanOrEqual(bound * 0.995);
  expect(Number(signed)).toBeLessThanOrEqual(bound * 1.005);
}

/**
 * Price at an orderbook or concentrated liquidity tick (exponent at price one
 * is -6): each 9,000,000 ticks the price moves a power of ten, in equal steps
 * between.
 */
function tickToPrice(tick: number): number {
  const ticksPerPower = 9_000_000;
  const powers = Math.trunc(tick / ticksPerPower);
  const step = 10 ** (-6 + powers - (tick < 0 ? 1 : 0));
  return 10 ** powers + (tick - powers * ticksPerPower) * step;
}

test.describe("Wallet flows with a fake wallet", () => {
  let context: BrowserContext;
  let page: Page;
  let wallet: FakeWallet;
  let tradePage: TradePage;
  let quotes: Quote[];
  let pageErrors: string[];

  test.beforeEach(async () => {
    pageErrors = [];
    context = await chromium.launchPersistentContext(
      "",
      new TestConfig().getBrowserConfig(true)
    );
    page = context.pages()[0];
    wallet = await FakeWallet.install(context);
    page.on("console", (m) => {
      if (m.type() === "error") pageErrors.push(m.text().slice(0, 500));
    });
    quotes = [];
    page.on("response", async (response: Response) => {
      if (
        !/\/router\/(quote|custom-direct-quote)$/.test(
          new URL(response.url()).pathname
        )
      )
        return;
      const body = await response.json().catch(() => undefined);
      if (!body?.route) return;
      const exactIn = typeof body.amount_in === "object";
      quotes.push({
        inDenom: exactIn ? body.amount_in?.denom : undefined,
        inAmount: quoteAmount(body.amount_in),
        outAmount: quoteAmount(body.amount_out),
        // Exact-out quotes list each route's pools from the output side; the
        // signed message lists them from the input side.
        poolIds: body.route.flatMap((r: any) => {
          const ids = r.pools.map((p: any) => String(p.id));
          return exactIn ? ids : ids.reverse();
        }),
      });
    });
    tradePage = new TradePage(page);
    await tradePage.goto();
    await tradePage.connectFakeWallet();
  });

  // biome-ignore lint/correctness/noEmptyPattern: Playwright fixture signature
  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus && pageErrors.length) {
      await testInfo.attach("page-console-errors", {
        body: pageErrors.join("\n"),
        contentType: "text/plain",
      });
      console.log(`Page console errors:\n${pageErrors.join("\n")}`);
    }
    await context.close();
  });

  /**
   * Reviews and confirms the trade behind `button`, waits for the app to
   * report success, and returns the signed messages plus the quotes received
   * up to the Confirm click. Limit orders have no slippage setting.
   */
  async function confirmTrade(
    button = tradePage.swapBtn,
    slippage: string | null = "1"
  ) {
    await expect(button).toBeEnabled({ timeout: 30_000 });
    await button.click();
    await tradePage.confirmSwapBtn.waitFor();
    await tradePage.disable1CTIfNeeded();
    if (slippage) await tradePage.setSlippageTolerance(slippage);
    await tradePage.acknowledgeLossIfNeeded();
    const quotesSoFar = [...quotes];
    await tradePage.confirmSwapBtn.click();
    await wallet.waitForTx();
    expect(wallet.broadcasts, "More than one tx was broadcast.").toHaveLength(
      1
    );
    // Market trades report success in a toast; limit orders do not.
    if (slippage) await expect(tradePage.trxSuccessful).toBeVisible();
    return { msgs: await wallet.lastSignedMsgs(page), quotes: quotesSoFar };
  }

  /** An exact-in swap signs the quoted route with min out = quote less slippage. */
  function expectExactInSwap(
    msgs: AminoMsg[],
    quotesSeen: Quote[],
    expected: { inDenom: string; outDenom: string; inAmount: string }
  ) {
    expect(msgs).toHaveLength(1);
    const swap = readSwap(msgs[0]);
    expect(swap.sender).toBe(wallet.address);
    expect(swap.exactIn).toBe(true);
    expect(swap.inDenom).toBe(expected.inDenom);
    expect(swap.outDenom).toBe(expected.outDenom);
    expect(swap.inAmount).toBe(BigInt(expected.inAmount));
    expectSlippageBound(swap, quotesSeen);
  }

  test("Swap OSMO to ATOM signs the quoted route", async () => {
    await tradePage.selectPair("OSMO", "ATOM");
    await tradePage.enterAmount("0.2");
    const { msgs, quotes: seen } = await confirmTrade();
    expectExactInSwap(msgs, seen, {
      inDenom: OSMO.denom,
      outDenom: ATOM.denom,
      inAmount: "200000",
    });
  });

  test("Swap USDC to TIA signs the quoted route", async () => {
    await tradePage.selectPair("USDC", "TIA");
    await tradePage.enterAmount("0.1");
    const { msgs, quotes: seen } = await confirmTrade();
    expectExactInSwap(msgs, seen, {
      inDenom: USDC.denom,
      outDenom: TIA.denom,
      inAmount: "100000",
    });
  });

  test("Buy ATOM spends the entered dollar amount of USDC", async () => {
    await tradePage.openBuyTab();
    await tradePage.selectAsset("ATOM");
    await tradePage.enterAmount("1.12");
    const { msgs, quotes: seen } = await confirmTrade(tradePage.buyBtn);
    expect(msgs).toHaveLength(1);
    const swap = readSwap(msgs[0]);
    expect(swap.sender).toBe(wallet.address);
    expect(swap.inDenom).toBe(USDC.denom);
    expect(swap.outDenom).toBe(ATOM.denom);
    expectSlippageBound(swap, seen);
    // USDC is the dollar here: exact in spends $1.12, exact out caps it at
    // $1.12 plus the 1% slippage.
    const usdcIn = units(swap.inAmount, USDC.decimals);
    expect(usdcIn).toBeGreaterThanOrEqual(1.12 * 0.99);
    expect(usdcIn).toBeLessThanOrEqual(1.12 * 1.015);
  });

  test("Sell ATOM receives the entered dollar amount of USDC", async () => {
    await tradePage.openSellTab();
    await tradePage.selectAsset("ATOM");
    await tradePage.enterAmount("1.11");
    const { msgs, quotes: seen } = await confirmTrade(tradePage.sellBtn);
    expect(msgs).toHaveLength(1);
    const swap = readSwap(msgs[0]);
    expect(swap.sender).toBe(wallet.address);
    expect(swap.inDenom).toBe(ATOM.denom);
    expect(swap.outDenom).toBe(USDC.denom);
    expectSlippageBound(swap, seen);
    // Exact out receives $1.11; exact in guarantees $1.11 less 1% slippage.
    const usdcOut = units(swap.outAmount, USDC.decimals);
    expect(usdcOut).toBeGreaterThanOrEqual(1.11 * 0.985);
    expect(usdcOut).toBeLessThanOrEqual(1.11 * 1.01);
  });

  test("Limit sell OSMO places an ask on the OSMO/USDC orderbook", async () => {
    await tradePage.openSellTab();
    await tradePage.openLimit();
    await tradePage.selectAsset("OSMO");
    await tradePage.enterAmount("1.01");
    await tradePage.setLimitPriceChange("10%");
    const limitPrice = Number(await tradePage.getLimitPrice());
    const { msgs } = await confirmTrade(tradePage.sellBtn, null);
    expect(msgs).toHaveLength(1);
    expect(msgs[0].type).toBe("wasm/MsgExecuteContract");
    const { sender, contract, msg, funds } = msgs[0].value;
    expect(sender).toBe(wallet.address);
    const books = await fetchCanonicalOrderbooks();
    const book = books.find(
      (b) => b.base === OSMO.denom && b.quote === USDC.denom
    );
    expect(contract).toBe(book?.contract_address);
    expect(msg.place_limit.order_direction).toBe("ask");
    // The tick is the dollar limit price over the USDC price; OSMO and USDC
    // both have 6 decimals, so no further scaling. Allow 1% for USDC's price.
    const tickPrice = tickToPrice(Number(msg.place_limit.tick_id));
    expect(Math.abs(tickPrice / limitPrice - 1)).toBeLessThan(0.01);
    expect(funds).toEqual([
      { denom: OSMO.denom, amount: msg.place_limit.quantity },
    ]);
    // The dollar amount entered is the value of the OSMO at the limit price.
    const usd = units(BigInt(funds[0].amount), OSMO.decimals) * limitPrice;
    expect(usd).toBeGreaterThan(1.01 * 0.99);
    expect(usd).toBeLessThan(1.01 * 1.01);
  });

  test("Portfolio lists every token the wallet holds", async () => {
    test.setTimeout(120_000);
    const res = await fetch(
      `${process.env.REST_ENDPOINT ?? "https://lcd.osmosis.zone"}/cosmos/bank/v1beta1/balances/${wallet.address}?pagination.limit=1000`
    );
    const { balances } = (await res.json()) as {
      balances: { denom: string; amount: string }[];
    };
    const prices = await fetchTokenPrices(balances.map((b) => b.denom));
    // Tokens worth a cent or more; dust and unpriced tokens may be hidden.
    const held = Object.entries(TOKEN_DENOMS).filter(
      ([, { denom, decimals }]) => {
        const amount = balances.find((b) => b.denom === denom)?.amount;
        return (
          amount &&
          units(BigInt(amount), decimals) * (prices[denom] ?? 0) >= 0.01
        );
      }
    );
    expect(held.length).toBeGreaterThan(3);

    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();
    await portfolioPage.hideZeroBalances();
    await portfolioPage.viewMoreBalances();
    // "View more" lists every row, so no search is needed.
    for (const [name, { denom }] of held) {
      const balance = await portfolioPage.getBalanceFor({
        name,
        minimalDenom: denom,
      });
      expect(balance).toMatch(/\d/);
    }
  });
});
