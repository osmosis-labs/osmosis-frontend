/* eslint-disable import/no-extraneous-dependencies */
import { type Locator, type Page, expect } from '@playwright/test'

export class WalletPage {
  readonly page: Page
  readonly importWalletBtn: Locator
  readonly useRecoveryBtn: Locator
  readonly privateKeyBtn: Locator
  readonly privateKeyInput: Locator
  readonly importBtn: Locator
  readonly walletNameInput: Locator
  readonly walletPassInput: Locator
  readonly walletRePassInput: Locator
  readonly nextBtn: Locator
  readonly allCheckbox: Locator
  readonly saveBtn: Locator
  readonly finishBtn: Locator

  constructor(page: Page) {
    this.page = page
    this.importWalletBtn = page.getByText('Import an existing wallet')
    this.useRecoveryBtn = page.getByText('Use recovery phrase or private key')
    this.privateKeyBtn = page.getByRole('button', {
      name: 'Private key',
      exact: true,
    })
    this.privateKeyInput = page.locator('input[type="password"]')
    this.importBtn = page.getByRole('button', { name: 'Import', exact: true })
    this.walletNameInput = page.locator('input[name="name"]')
    this.walletPassInput = page.locator('input[name="password"]')
    this.walletRePassInput = page.locator("input[name='confirmPassword']")
    this.nextBtn = page.getByRole('button', { name: 'Next', exact: true })
    this.allCheckbox = page.locator('input[type="checkbox"]').first()
    this.saveBtn = page.getByRole('button', { name: 'Save', exact: true })
    this.finishBtn = page.getByRole('button', { name: 'Finish', exact: true })
  }

  async startImport() {
    await this.importWalletBtn.waitFor({ state: 'visible', timeout: 10_000 })
    await this.importWalletBtn.click({ timeout: 5_000 })
    await this.useRecoveryBtn.waitFor({ state: 'visible', timeout: 10_000 })
    await this.useRecoveryBtn.click({ timeout: 5_000 })
  }

  /**
   * Auto-detects whether `secret` is a BIP39 mnemonic phrase (contains
   * whitespace) or a hex private key and uses the appropriate Keplr
   * import flow. Accepts either format transparently.
   */
  async importWallet(secret: string) {
    const trimmed = secret.trim()
    if (/\s/.test(trimmed)) {
      await this.importWalletFromSeed(trimmed)
    } else {
      await this.importWalletWithPrivateKey(trimmed)
    }
  }

  async importWalletWithPrivateKey(privateKey: string) {
    await this.startImport()
    await this.privateKeyBtn.click()
    await this.privateKeyInput.fill(privateKey)
    await this.importBtn.click({ timeout: 4_000 })
    // Confirm the SPA navigated to the name/password step before proceeding
    await this.walletNameInput.waitFor({ state: 'visible', timeout: 10_000 })
    await this.setWalletNameAndPassword('Keplr')
    await this.selectChainsAndSave()
    await this.finish()
  }

  async importWalletFromSeed(seed: string) {
    await this.startImport()
    const words = seed.trim().split(/\s+/)
    const wordCount = words.length
    if (wordCount !== 12 && wordCount !== 24) {
      throw new Error(
        `Mnemonic must be 12 or 24 words, got ${wordCount}.`,
      )
    }
    console.log(`Import Wallet from a ${wordCount}-word seed.`)

    if (wordCount === 24) {
      await this.page
        .getByRole('button', { name: '24 words', exact: true })
        .click()
    }

    // Keplr renders word inputs as text/password and appends 3 number inputs
    // (derivation path). In 12-word mode word 1 is text; in 24-word mode all
    // start as password (flipping to text on fill). Target all non-number inputs.
    const wordInputs = this.page.locator('input:not([type="number"])')
    await wordInputs.nth(wordCount - 1).waitFor({ state: 'visible', timeout: 5000 })

    for (let i = 0; i < wordCount; i++) {
      await wordInputs.nth(i).fill(words[i])
      await this.page.waitForTimeout(200)
    }

    await this.importBtn.click()
    // Confirm the SPA navigated to the name/password step before proceeding
    await this.walletNameInput.waitFor({ state: 'visible', timeout: 10_000 })
    await this.setWalletNameAndPassword('Keplr')
    await this.selectChainsAndSave()
    await this.finish()
  }

  async setWalletNameAndPassword(
    name: string,
    password: string = 'TestPassword2024.',
  ) {
    console.log('Set name and password.')
    await this.walletNameInput.fill(name)
    await this.walletPassInput.fill(password)
    await this.walletRePassInput.fill(password)
    await this.nextBtn.click()
    // Keplr uses hash-based SPA routing so waitForLoadState resolves instantly.
    // Instead, confirm the name input disappears to verify actual page transition.
    await this.walletNameInput.waitFor({ state: 'hidden', timeout: 10_000 })
  }

  async selectChainsAndSave() {
    console.log('Select native chains and save.')

    // The "Select Chains" screen pre-selects the default native chains (incl.
    // Osmosis + Cosmos Hub) and enables Save. We deliberately do NOT depend on
    // the "All Native Chains" row: its text only toggles the accordion (it
    // never actually changed the selection), and it renders late -- or not at
    // all -- when the chain list fails to populate in CI, which was the
    // dominant flake. Gate on the Save button instead: it's the primary CTA and
    // the control we actually click.
    //
    // Crucially this is a SINGLE bounded wait, not a 3x20s loop. The old loop
    // burned ~60s before failing, which starved the outer setupWallet
    // relaunch-retry of the ~90s beforeAll budget so it could never finish.
    // Failing fast here lets that fresh-context retry actually run.
    const READY_TIMEOUT = 20_000

    try {
      await expect(this.saveBtn, 'Save CTA not enabled').toBeEnabled({ timeout: READY_TIMEOUT })
    } catch (err) {
      const screenshotPath = `test-results/keplr-chains-debug-${Date.now()}.png`
      await this.page
        .screenshot({ path: screenshotPath, fullPage: true })
        .catch(() => {})
      // Distinguish "screen never mounted" (blank register page) from "screen
      // mounted but chain list empty" (Keplr remote registry not populating),
      // so the failure points at the real cause rather than a dead locator.
      const screenMounted = await this.page
        .getByText('Select Chains')
        .isVisible()
        .catch(() => false)
      const reason = screenMounted
        ? 'the "Select Chains" screen mounted but no chains loaded (Keplr remote registry?)'
        : 'the Keplr register page appears blank / never rendered the "Select Chains" screen'
      throw new Error(
        `Keplr chain selection unavailable: ${reason}. Save button not visible ` +
        `within ${READY_TIMEOUT / 1000}s. URL: ${this.page.url()} | ` +
        `Screenshot: ${screenshotPath} | Cause: ${err}`,
      )
    }

    // Save the default-selected chains and confirm the account was created.
    // Some Keplr builds insert an intermediate Import/Save step, so click
    // whichever CTA is present until the success screen appears.
    const accountCreated = this.page.getByText('Account Created!')

    for (let i = 0; i < 15; i++) {
      if (await accountCreated.isVisible().catch(() => false)) break

      if (await this.saveBtn.isVisible().catch(() => false)) {
        console.log('Save chain selection.')
        await this.saveBtn.click({ timeout: 2_000 }).catch(() => {})
      } else if (await this.importBtn.isVisible().catch(() => false)) {
        console.log('Import available chains.')
        await this.importBtn.click({ timeout: 2_000 }).catch(() => {})
      }

      await this.page.waitForTimeout(1_000)
    }

    await expect(
      accountCreated,
      'Account is not created!',
    ).toBeVisible({ timeout: 20_000 })
  }

  async takeScreenshot() {
    await this.page.screenshot({
      path: 'screenshot-keplr-wallet-setup.png',
      fullPage: true,
    })
  }

  async finish() {
    console.log('Finish wallet setup!')
    await this.finishBtn.click({ timeout: 3000 })
  }
}
