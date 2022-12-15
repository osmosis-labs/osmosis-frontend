export interface TransakSuccessfulOrder {
  status: {
    id: string;
    walletAddress: string;
    createdAt: Date;
    status: string;
    fiatCurrency: string;
    userId: string;
    cryptoCurrency: string;
    isBuyOrSell: string;
    fiatAmount: number;
    amountPaid: number;
    paymentOptionId: string;
    walletLink: boolean;
    orderProcessingType: string;
    addressAdditionalData: boolean;
    network: string;
    conversionPrice: number;
    cryptoAmount: number;
    totalFeeInFiat: number;
    fiatAmountInUsd: number;
    cardPaymentData: CardPaymentData;
    statusHistories: StatusHistory[];
    partnerFeeInLocalCurrency: number;
  };
  eventName: string;
}

export interface CardPaymentData {
  orderId: string;
  paymentId: string;
  pgData: PGData;
  liquidityProvider: string;
  updatedAt: Date;
  status: string;
  processedOn: Date;
}

export interface PGData {
  redirectionRequired: boolean;
  redirectionRequestData: RedirectionRequestData;
}

export interface RedirectionRequestData {
  method: string;
  header: {};
  redirectUrl: string;
  body: {};
}

export interface StatusHistory {
  status: string;
  createdAt: Date;
  message: string;
  isEmailSentToUser: boolean;
  partnerEventId: string;
}
