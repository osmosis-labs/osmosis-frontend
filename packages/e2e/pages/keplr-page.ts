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
    console.log('Select all Native chains and save.')
    const allChains = this.page.getByText('All Native Chains')

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await allChains.waitFor({ state: 'visible', timeout: 20_000 })
        await allChains.click({ timeout: 5_000 })
        break
      } catch (err) {
        const screenshotPath = `test-results/keplr-chains-debug-attempt-${attempt}-${Date.now()}.png`
        await this.page.screenshot({ path: screenshotPath, fullPage: true })
        console.error(
          `'All Native Chains' not visible or not clickable (attempt ${attempt + 1}/3). ` +
          `Screenshot: ${screenshotPath} | URL: ${this.page.url()} | Error: ${err}`
        )
        if (attempt < 2) {
          // Don't reload -- Keplr is a hash-routed SPA so reload resets to the
          // welcome page, destroying all import progress. Just wait and retry.
          await this.page.waitForTimeout(5_000)
        } else {
          throw new Error(
            `'All Native Chains' never appeared/clickable after 3 attempts. ` +
            `Last error: ${err}`,
          )
        }
      }
    }

    const accountCreated = this.page.getByText('Account Created!')

    for (let i = 0; i < 10; i++) {
      if (await accountCreated.isVisible().catch(() => false)) break

      if (await this.importBtn.isVisible().catch(() => false)) {
        console.log('Import whatever is available.')
        await this.importBtn.click({ timeout: 2000 })
      } else if (await this.saveBtn.isVisible().catch(() => false)) {
        console.log('Save chain selection.')
        await this.saveBtn.click({ timeout: 2000 })
      }

      await this.page.waitForTimeout(1000)
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
