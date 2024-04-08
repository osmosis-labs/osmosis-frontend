import { expect, Locator, Page } from "@playwright/test";

export class WalletPage {
  readonly page: Page;
  readonly importWalletBtn: Locator;
  readonly useRecoveryBtn: Locator;
  readonly privateKeyBtn: Locator;
  readonly privateKeyInput: Locator;
  readonly importBtn: Locator;
  readonly walletNameInput: Locator;
  readonly walletPassInput: Locator;
  readonly walletRePassInput: Locator;
  readonly nextBtn: Locator;
  readonly allCheckbox: Locator;
  readonly saveBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.importWalletBtn = page.getByText("Import an existing wallet");
    this.useRecoveryBtn = page.getByText("Use recovery phrase or private key");
    this.privateKeyBtn = page.getByRole("button", {
      name: "Private key",
      exact: true,
    });
    this.privateKeyInput = page.locator('input[type="password"]');
    this.importBtn = page.getByRole("button", { name: "Import", exact: true });
    this.walletNameInput = page.locator('input[name="name"]');
    this.walletPassInput = page.locator('input[name="password"]');
    this.walletRePassInput = page.locator("input[name='confirmPassword']");
    this.nextBtn = page.getByRole("button", { name: "Next", exact: true });
    this.allCheckbox = page.locator('input[type="checkbox"]').first();
    this.saveBtn = page.getByRole("button", { name: "Save", exact: true });
  }

  async goto(extensionId: string) {
    await this.page.goto(`chrome-extension://${extensionId}/register.html#`);
    // IMO, it is better to assert navigation is successful
    await expect(this.page.getByText("Your Interchain Gateway")).toBeVisible();
  }

  async importWalletWithPrivateKey(privateKey: string) {
    await this.importWalletBtn.click();
    await this.useRecoveryBtn.click();
    await this.privateKeyBtn.click();
    await this.privateKeyInput.fill(privateKey);
    await this.importBtn.click();
  }

  async setWalletNameAndPassword(name: string, password: string) {
    await this.walletNameInput.fill(name);
    await this.walletPassInput.fill(password);
    await this.walletRePassInput.fill(password);
    await this.nextBtn.click();
  }

  async selectChainsAndSave() {
    await this.allCheckbox.check();
    await this.saveBtn.click();
    // IMO, it is better to assert default action is successful. Unless a failure is possible.
    await expect(this.page.getByText("Account Created!")).toBeVisible();
  }

  async takeScreenshot() {
    await this.page.screenshot({
      path: "screenshot-wallet-setup.png",
      fullPage: true,
    });
  }

  async finish() {
    // Finish button will close the extension page
    // Just to show that not all locators must be in constructor.
    await this.page
      .getByRole("button", { name: "Finish", exact: true })
      .click();
  }
}
