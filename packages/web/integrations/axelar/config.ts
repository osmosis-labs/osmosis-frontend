import { SourceChain } from "../bridge-info";

const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

/** Maps Axelar chain id agruments => source chain ids.
 *  SourceChain (IDs) are used in ./source-chain-configs.ts::SourceChainConfigs{} as <asset>::<network>::id values.
 *  Axelar Chain IDs are accepted as arguments in Axelar's APIs.
 *  Mainnet Docs: https://docs.axelar.dev/dev/build/chain-names/mainnet
 *  Testnet Docs: https://docs.axelar.dev/dev/build/chain-names/testnet
 *  Testnet API: https://axelartest-lcd.quickapi.com/axelar/nexus/v1beta1/chains?status=1
 */
export const AxelarChainIds_SourceChainMap: {
  [axelarChainIds: string]: SourceChain;
} = IS_TESTNET
  ? {
      aurora: "Aurora Testnet",
      Avalanche: "Avalanche Fuji Testnet",
      binance: "BSC Testnet",
      "ethereum-2": "Goerli Testnet",
      Fantom: "Fantom Testnet",
      Moonbeam: "Moonbase Alpha",
      Polygon: "Mumbai",
    }
  : {
      Avalanche: "Avalanche",
      binance: "Binance Smart Chain",
      Ethereum: "Ethereum",
      Fantom: "Fantom",
      Moonbeam: "Moonbeam",
      Polygon: "Polygon",
    };

/** The gateway contract on each counterparty EVM chain.
 *  Maps `SourceChain` constants to their Axelar gateway contract.
 *
 *  Mainnet Docs: https://docs.axelar.dev/dev/build/contract-addresses/mainnet
 *  Testnet Docs: https://docs.axelar.dev/dev/build/contract-addresses/testnet
 */
export const GatewayContractAddresses: Partial<{
  [sourceChain in SourceChain]: string;
}> = IS_TESTNET
  ? {
      "Goerli Testnet": "0xe432150cce91c13a887f7D836923d5597adD8E31",
      "BSC Testnet": "0x4D147dCb984e6affEEC47e44293DA442580A3Ec0",
      Polygon: "0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B",
      "Avalanche Fuji Testnet": "0xC249632c2D40b9001FE907806902f63038B737Ab",
      "Fantom Testnet": "0x97837985Ec0494E7b9C71f5D3f9250188477ae14",
      "Moonbase Alpha": "0x5769D84DD62a6fD969856c75c7D321b84d455929",
    }
  : {
      Ethereum: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
      "Binance Smart Chain": "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
      Polygon: "0x6f015F16De9fC8791b234eF68D486d2bF203FBA8",
      Avalanche: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
      Fantom: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
      Moonbeam: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
    };
