import { type BrowserContext, type Page, test } from "@playwright/test";

import { PortfolioPage } from "../pages/portfolio-page";
import { TransactionsPage } from "../pages/transactions-page";
import { SetupKeplr } from "../setup-keplr";

test.describe("Test Transactions feature", () => {
  let context: BrowserContext;
  let page: Page;
  const privateKey = process.env.PRIVATE_KEY ?? "pk";
  let portfolioPage: PortfolioPage;
  let transactionsPage: TransactionsPage;

  test.beforeAll(async () => {
    context = await new SetupKeplr().setupWallet(privateKey);
    page = context.pages()[0];
    portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();
    await portfolioPage.connectWallet();
    transactionsPage = await new TransactionsPage(page).open();
  });

  test("User should be able to see old transactions", async () => {
    await transactionsPage.viewTransactionByNumber(10);
    await transactionsPage.viewOnExplorerIsVisible();
    await transactionsPage.closeTransaction();
    await transactionsPage.viewTransactionByNumber(20);
    await transactionsPage.viewOnExplorerIsVisible();
    await transactionsPage.closeTransaction();
    await transactionsPage.viewTransactionByNumber(35);
    await transactionsPage.viewOnExplorerIsVisible();
    await transactionsPage.closeTransaction();
  });
});
