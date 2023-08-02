import { OS, Wallet } from "@cosmos-kit/core";

export const leapMobileInfo: Wallet = {
  name: "leap-cosmos-mobile",
  prettyName: "Leap Mobile",
  mode: "wallet-connect",
  mobileDisabled: () =>
    "leap" in window && /LeapCosmos/i.test(navigator.userAgent),
  rejectMessage: {
    source: "Request rejected",
  },
  downloads: [
    {
      device: "mobile",
      os: "android",
      link: "https://play.google.com/store/apps/details?id=io.leapwallet.cosmos",
    },
    {
      device: "mobile",
      os: "ios",
      link: "https://apps.apple.com/in/app/leap-cosmos/id1642465549",
    },
    {
      link: "https://chrome.google.com/webstore/detail/leap-cosmos-wallet/fcfcfllfndlomdhbehjjcoimbgofdncg",
    },
  ],
  connectEventNamesOnWindow: ["leap_keystorechange"],
  walletconnect: {
    name: "Leap Cosmos Wallet",
    projectId:
      "3ed8cc046c6211a798dc5ec70f1302b43e07db9639fd287de44a9aa115a21ed6",
    encoding: "base64",
    mobile: {
      native: {
        ios: "leapcosmos:",
        android: "intent:",
      },
    },
    formatNativeUrl: (
      appUrl: string,
      wcUri: string,
      os: OS | undefined,
      _name: string
    ): string => {
      const plainAppUrl = appUrl.replaceAll("/", "").replaceAll(":", "");
      const encodedWcUrl = encodeURIComponent(wcUri);
      switch (os) {
        case "ios":
          return `${plainAppUrl}://wcV2?${encodedWcUrl}`;
        case "android":
          return `${plainAppUrl}://wcV2?${encodedWcUrl}#Intent;package=io.leapwallet.cosmos;scheme=leapwallet;end;`;
        default:
          return `${plainAppUrl}://wcV2?${encodedWcUrl}`;
      }
    },
  },
};
