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
    try {
      await this.page.waitForTimeout(1000)
      await this.importWalletBtn.click({
        timeout: 5000,
      })
      await this.useRecoveryBtn.click()
    } catch {
      expect(
        this.importWalletBtn,
        'Import Keplr wallet button is not visible!',
      ).toBeVisible({ timeout: 1000 })
    }
  }

  async importWalletWithPrivateKey(privateKey: string) {
    await this.startImport()
    await this.privateKeyBtn.click()
    await this.privateKeyInput.fill(privateKey)
    await this.importBtn.click({ timeout: 4000 })
  }

  async importWalletFromSeed(seed: string) {
    await this.startImport()
    console.log('Import Wallet from a Seed.')
    await this.page.waitForTimeout(7000)
    // enter 12 words seed
    const seedArray: string[] = seed.split(' ')
    expect(seedArray, 'Seed phrase is missing or incomplete!').toHaveLength(12)
    const locInputs = '//input[@type="password"]'
    await this.page.locator('//input[@type="text"]').first().fill(seedArray[0])
    // for loop does not work here, some magic..
    await this.page.locator(locInputs).nth(0).fill(seedArray[1])
    await this.page.waitForTimeout(200)
    await this.page.locator(locInputs).nth(1).fill(seedArray[2])
    await this.page.waitForTimeout(200)
    await this.page.locator(locInputs).nth(2).fill(seedArray[3])
    await this.page.waitForTimeout(200)
    await this.page.locator(locInputs).nth(3).fill(seedArray[4])
    await this.page.waitForTimeout(200)
    await this.page.locator(locInputs).nth(4).fill(seedArray[5])
    await this.page.waitForTimeout(200)
    await this.page.locator(locInputs).nth(5).fill(seedArray[6])
    await this.page.waitForTimeout(200)
    await this.page.locator(locInputs).nth(6).fill(seedArray[7])
    await this.page.waitForTimeout(200)
    await this.page.locator(locInputs).nth(7).fill(seedArray[8])
    await this.page.waitForTimeout(200)
    await this.page.locator(locInputs).nth(8).fill(seedArray[9])
    await this.page.waitForTimeout(200)
    await this.page.locator(locInputs).nth(9).fill(seedArray[10])
    await this.page.waitForTimeout(200)
    await this.page.locator(locInputs).nth(10).fill(seedArray[11])
    await this.importBtn.click()
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
  }

  async selectChainsAndSave() {
    console.log('Select all Native chains and save.')
    await this.page
      .getByText('All Native Chains')
      .click({ timeout: 9000, force: true })
    try {
      console.log('Import whatever is available.')
      await this.importBtn.click({ timeout: 2000 })
    } catch {
      console.log('No Import button, ignore.')
    }
    await this.page.waitForTimeout(2000)
    await this.saveBtn.click({ timeout: 3000 })
    await this.page.waitForTimeout(2000)
    await expect(
      this.page.getByText('Account Created!'),
      'Account is not created!',
    ).toBeVisible({ timeout: 9000 })
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
