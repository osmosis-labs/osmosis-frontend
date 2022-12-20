interface RedirectionRequestData {
  method: string;
  header: {};
  redirectUrl: string;
  body: {};
}

interface StatusHistory {
  status: string;
  /** Date string */
  createdAt: string;
  message: string;
  isEmailSentToUser: boolean;
  partnerEventId: string;
}

interface Status {
  id: string;
  walletAddress: string;
  /** Date string */
  createdAt: string;
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
  referenceCode?: number;
  paymentOptions?: any[];
  /** Date string */
  autoExpiresAt?: string;
  cardPaymentData: CardPaymentData;
  statusHistories: StatusHistory[];
  partnerFeeInLocalCurrency?: number;
}

interface CardPaymentData {
  orderId: string;
  paymentId: string;
  pgData: PGData;
  liquidityProvider: string;
  /** Date string */
  updatedAt?: string;
  status: string;
  processedOn?: string;
}

interface PGData {
  redirectionRequired: boolean;
  redirectionRequestData: RedirectionRequestData;
}

export interface TransakSuccessfulOrder {
  status: Status;
  eventName: string;
}

export interface TransakCreatedOrder {
  status: Status;
  eventName: string;
}
