export class WalletConnectionInProgressError extends Error {
  constructor() {
    super("Wallet is already trying to connect");
    this.name = this.constructor.name;
  }
}
