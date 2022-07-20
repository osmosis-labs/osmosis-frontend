import { AppCurrency } from "@keplr-wallet/types";
export interface UncommitedHistory {
    readonly txHash: string;
    readonly sourceChainId: string;
    readonly destChainId: string;
    readonly recipient: string;
    readonly amount: {
        currency: AppCurrency;
        amount: string;
    };
    readonly sender: string;
    readonly createdAt: string;
}
export declare type IBCTransferHistoryStatus = "pending" | "complete" | "timeout" | "refunded";
export interface IBCTransferHistory {
    readonly txHash: string;
    readonly sourceChainId: string;
    readonly sourceChannelId: string;
    readonly destChainId: string;
    readonly destChannelId: string;
    readonly sequence: string;
    readonly sender: string;
    readonly recipient: string;
    readonly amount: {
        currency: AppCurrency;
        amount: string;
    };
    status: IBCTransferHistoryStatus;
    readonly timeoutHeight?: string;
    readonly timeoutTimestamp?: string;
    readonly createdAt: string;
}
