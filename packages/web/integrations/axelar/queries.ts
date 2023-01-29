export type TransferStep = {
  id: string;
  type:
    | "evm_transfer"
    | "ConfirmERC20Deposit"
    | "axelar"
    | "Vote"
    | "RouteIBCTransfersRequest"
    | string;
  status: "success" | string;
  created_at: {
    ms: number;
  };
  /** Min denom. i.e. "uusdc". Axelar defined. */
  denom: string;
};

/** Exclude `sign_batch` steps as we're only querying EVM->COSMOS transfers.
 *  `send asset => confirm deposit => vote confirm => ibc transfer`
 */
export type TransferStatus = Array<{
  id: string;
  /** Axelarscan: SEND ASSET */
  send?: TransferStep & {
    /** Decimal amount. Displayed by Axelarscan (doesn't sub fees). */
    amount: number;
    /** Decimal fee in `denom` denom. Displayed by Axelarscan. */
    fee: number;
    /** i.e. `"polygon"` */
    sender_chain: string;
    /** i.e. `"osmosis"` */
    recipient_chain: string;
    /** Transferring a balance at or below fee const.
     *  Calculate fee constants here: https://docs.axelar.dev/resources/mainnet#cross-chain-relayer-gas-fee
     */
    insufficient_fee?: true;
  };
  /** Axelarscan: VOTE CONFIRM */
  vote?: TransferStep;
  link?: Omit<TransferStep, "status" | "created_at"> & {
    /** Hash on Axelar chain. `/axelar.evm.v1beta1.LinkRequest` */
    txHash: string;
    price: number;
  };
  /** Axelarscan: CONFIRM DEPOSIT */
  confirm_deposit?: TransferStep & {
    /** Whole amount. */
    amount: string;
  };
  /** Missing if pending IBC transfer. */
  ibc_send?: TransferStep & {
    /** Decimal amount. */
    amount: number;
    /** i.e. `axelar...` */
    sender_address: string;
    /** i.e. `osmo...` */
    recipient_address: string;
  };
  status: "executed";
}>;

/** Fetch data about a deposit-address transfer.
 *  @param sendTxHash Tx hash from send-to-generated-deposit-address tx on source chain.
 *  @param origin API origin, default: "https://api.axelarscan.io"
 */
export async function getTransferStatus(
  sendTxHash: string,
  origin = "https://api.axelarscan.io"
): Promise<TransferStatus> {
  try {
    const response = await fetch(
      `${origin}/cross-chain/transfers-status?txHash=${sendTxHash}`
    );
    const data = await response.json();

    return data as TransferStatus;
  } catch {
    console.error("Failed to fetch transfer status for tx hash: ", sendTxHash);
    return [];
  }
}
