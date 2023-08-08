import { OS, Wallet } from "@cosmos-kit/core";

export const fireblocksMobileInfo: Wallet = {
  name: "fireblocks-mobile",
  prettyName: "Fireblocks",
  mode: "wallet-connect",
  mobileDisabled: false,
  rejectMessage: {
    source: "Request rejected",
  },
  downloads: [
    {
      link: "https://walletconnect.com/explorer/fireblocks",
    },
  ],
  walletconnect: {
    name: "Fireblocks",
    projectId:
      "5864e2ced7c293ed18ac35e0db085c09ed567d67346ccb6f58a0327a75137489",
    encoding: "base64",
    mobile: {
      native: {
        ios: "fireblocks:",
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
          return `${plainAppUrl}://wcV2?${encodedWcUrl}#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;`;
        default:
          return `${plainAppUrl}://wcV2?${encodedWcUrl}`;
      }
    },
  },
};
