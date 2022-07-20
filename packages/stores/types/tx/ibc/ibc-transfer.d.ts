import type { IBCCurrency } from "@keplr-wallet/types";
import { AmountConfig } from "@keplr-wallet/hooks";
import { IBCTransferHistory, UncommitedHistory } from "../../ibc-history";
import { IbcTransferSender, IbcTransferCounterparty } from "./types";
/** Use to perform a standard IBC transfer from `sender` to `counterparty`. Supports CW20 transfers (deposits). */
export declare function basicIbcTransfer(
/** Where the tokens originate. */
sender: IbcTransferSender, 
/** Where the tokens should end up. */
counterparty: IbcTransferCounterparty, currency: IBCCurrency, amountConfig: AmountConfig, 
/** Handle when the IBC trasfer successfully broadcast to relayers. */
onBroadcasted?: (event: Omit<UncommitedHistory, "createdAt">) => void, 
/** Handle IBC transfer events containing `send_packet` event type. */
onFulfill?: (event: Omit<IBCTransferHistory, "status" | "createdAt">) => void): Promise<void>;
