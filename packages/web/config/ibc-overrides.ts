import type { FiatRampKey } from "../integrations";
import { IS_TESTNET } from "./env";
import type {
  MainnetAssetSymbols,
  TestnetAssetSymbols,
} from "./generated/asset-lists";

type AdditionalDataValue = {
  /** URL if the asset requires a custom deposit external link. Must include `https://...`. */
  depositUrlOverride?: string;

  /** URL if the asset requires a custom withdrawal external link. Must include `https://...`. */
  withdrawUrlOverride?: string;

  /** Alternative chain name to display as the source chain */
  sourceChainNameOverride?: string;

  /** Keys for fiat on/off ramps. Ramp must accept asset's major denom (e.g. `ATOM`). */
  fiatRamps?: { rampKey: FiatRampKey; assetKey: string }[];
  sourceSymbolOverride?: string;
};

type AdditionalData = Partial<
  Record<MainnetAssetSymbols | TestnetAssetSymbols, AdditionalDataValue>
>;

const TestnetIBCAdditionalData: Partial<
  Record<TestnetAssetSymbols, AdditionalDataValue>
> = {
  "aUSDC.axl": {
    sourceChainNameOverride: "Goerli Ethereum",
  },
  ETH: {
    sourceChainNameOverride: "Goerli Ethereum",
  },
};

const MainnetIBCAdditionalData: Partial<
  Record<MainnetAssetSymbols, AdditionalDataValue>
> = {
  nBTC: {
    sourceChainNameOverride: "Bitcoin",
  },
  "WBTC.eth.axl": {
    sourceChainNameOverride: "Ethereum",
  },
  ETH: {
    sourceChainNameOverride: "Ethereum",
  },
  BNB: {
    sourceChainNameOverride: "Binance Smart Chain",
  },
  SOL: {
    depositUrlOverride: "/wormhole?from=solana&to=osmosis&token=SOL",
    withdrawUrlOverride: "/wormhole?from=osmosis&to=solana&token=SOL",
  },
  DOT: {
    depositUrlOverride: "https://app.picasso.network/?from=POLKADOT&to=OSMOSIS",
    withdrawUrlOverride:
      "https://app.picasso.network/?from=OSMOSIS&to=POLKADOT",
  },
  MATIC: {
    sourceChainNameOverride: "Polygon",
  },
  SHIB: {
    sourceChainNameOverride: "Ethereum",
  },
  DAI: {
    sourceChainNameOverride: "Ethereum",
  },
  AVAX: {
    sourceChainNameOverride: "Avalanche",
  },
  LINK: {
    sourceChainNameOverride: "Ethereum",
  },
  BUSD: {
    sourceChainNameOverride: "Ethereum",
  },
  FIL: {
    sourceChainNameOverride: "Filecoin",
  },
  APT: {
    depositUrlOverride: "/wormhole?from=aptos&to=osmosis&token=APT",
    withdrawUrlOverride: "/wormhole?from=osmosis&to=aptos&token=APT",
  },
  ARB: {
    sourceChainNameOverride: "Arbitrum",
  },
  MKR: {
    sourceChainNameOverride: "Ethereum",
  },
  rETH: {
    sourceChainNameOverride: "Ethereum",
  },
  AAVE: {
    sourceChainNameOverride: "Ethereum",
  },
  FRAX: {
    sourceChainNameOverride: "Ethereum",
  },
  INJ: {
    depositUrlOverride: "https://bridge.injective.network/",
    withdrawUrlOverride: "https://bridge.injective.network/",
  },
  FTM: {
    sourceChainNameOverride: "Fantom",
  },
  APE: {
    sourceChainNameOverride: "Ethereum",
  },
  SUI: {
    depositUrlOverride: "/wormhole?from=sui&to=osmosis&token=SUI",
    withdrawUrlOverride: "/wormhole?from=osmosis&to=sui&token=SUI",
  },
  cbETH: {
    sourceChainNameOverride: "Ethereum",
  },
  PEPE: {
    sourceChainNameOverride: "Ethereum",
  },
  sfrxETH: {
    sourceChainNameOverride: "Ethereum",
  },
  SEI: {
    depositUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=pacific-1&chainTo=osmosis-1&token0=usei&token1=ibc%2F71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D",
    withdrawUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=pacific-1&token0=ibc%2F71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D&token1=usei",
  },
  KSM: {
    depositUrlOverride: "https://app.picasso.network/?from=POLKADOT&to=OSMOSIS",
    withdrawUrlOverride:
      "https://app.picasso.network/?from=OSMOSIS&to=POLKADOT",
  },
  LUNC: {
    depositUrlOverride: "https://bridge.terra.money",
    withdrawUrlOverride: "https://bridge.terra.money",
  },
  "USDT.eth.axl": {
    sourceChainNameOverride: "Ethereum",
  },
  "USDC.eth.axl": {
    sourceChainNameOverride: "Ethereum",
  },
  "USDC.e.matic.axl": {
    sourceChainNameOverride: "Polygon",
  },
  "USDC.avax.axl": {
    sourceChainNameOverride: "Avalanche",
  },
  "DOT.glmr.axl": {
    sourceChainNameOverride: "Moonbeam",
  },
  GLMR: {
    sourceChainNameOverride: "Moonbeam",
  },
  KUJI: {
    depositUrlOverride:
      "https://blue.kujira.app/ibc?destination=osmosis-1&denom=ukuji",
  },
  EVMOS: {
    depositUrlOverride: "https://app.evmos.org/assets",
    withdrawUrlOverride: "https://app.evmos.org/assets",
  },
  BONK: {
    depositUrlOverride: "/wormhole?from=solana&to=osmosis&token=BONK",
    withdrawUrlOverride: "/wormhole?from=osmosis&to=solana&token=BONK",
  },
  SWTH: {
    depositUrlOverride:
      "https://app.dem.exchange/account/balance/withdraw/swth",
    withdrawUrlOverride:
      "https://app.dem.exchange/account/balance/deposit/swth",
  },
  RAI: {
    sourceChainNameOverride: "Ethereum",
  },
  SHD: {
    depositUrlOverride: "https://dash.scrt.network/ibc",
  },
  "SHD(old)": {
    depositUrlOverride: "https://wrap.scrt.network",
  },
  MNTA: {
    depositUrlOverride:
      "https://blue.kujira.app/ibc?destination=osmosis-1&source=kaiyo-1&denom=factory%2Fkujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7%2Fumnta",
  },
  USK: {
    depositUrlOverride:
      "https://blue.kujira.app/ibc?destination=osmosis-1&source=kaiyo-1&denom=factory%2Fkujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7%2Fuusk",
  },
  PLQ: {
    depositUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=planq_7070-2&chainTo=osmosis-1&token0=aplanq&token1=ibc%2FB1E0166EA0D759FDF4B207D1F5F12210D8BFE36F2345CEFC76948CE2B36DFBAF",
  },
  PICA: {
    depositUrlOverride:
      "https://app.picasso.network/?from=PicassoKusama&to=OSMOSIS",
    withdrawUrlOverride:
      "https://app.picasso.network/?from=OSMOSIS&to=PicassoKusama",
  },
  "WBTC.eth.grv": {
    depositUrlOverride:
      "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
    withdrawUrlOverride:
      "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
  },
  "ETH.grv": {
    depositUrlOverride:
      "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
    withdrawUrlOverride:
      "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
  },
  "USDC.eth.grv": {
    depositUrlOverride:
      "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
    withdrawUrlOverride:
      "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
  },
  "DAI.grv": {
    depositUrlOverride:
      "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
    withdrawUrlOverride:
      "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
  },
  "USDT.eth.grv": {
    depositUrlOverride:
      "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
    withdrawUrlOverride:
      "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
  },
  SILK: {
    depositUrlOverride: "https://dash.scrt.network/ibc",
  },
  SIENNA: {
    depositUrlOverride: "https://wrap.scrt.network",
  },
  ECH: {
    depositUrlOverride: "https://app.ech.network/ibc",
    withdrawUrlOverride: "https://app.ech.network/ibc",
  },
  ALTER: {
    depositUrlOverride: "https://wrap.scrt.network",
  },
  BUTT: {
    depositUrlOverride: "https://wrap.scrt.network",
  },
  "stkd-SCRT": {
    depositUrlOverride: "https://wrap.scrt.network",
  },
  AMBER: {
    depositUrlOverride: "https://wrap.scrt.network",
  },
  arUSD: {
    depositUrlOverride: "https://app.arable.finance/#/ibc",
    withdrawUrlOverride: "https://app.arable.finance/#/ibc",
  },
  CNTO: {
    depositUrlOverride: "https://app.arable.finance/#/ibc",
    withdrawUrlOverride: "https://app.arable.finance/#/ibc",
  },
  ROAR: {
    depositUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=phoenix-1&chainTo=osmosis-1&token0=terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv&token1=ibc%2F98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0",
    withdrawUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2F98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0&token1=terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
  },
  CUB: {
    depositUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=phoenix-1&chainTo=osmosis-1&token0=terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t&token1=ibc%2F6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3",
    withdrawUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2F6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3&token1=terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
  },
  BLUE: {
    depositUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=phoenix-1&chainTo=osmosis-1&token0=terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584&token1=ibc%2FDA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E",
    withdrawUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2FDA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E&token1=terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
  },
  MPWR: {
    depositUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=empowerchain-1&chainTo=osmosis-1&token0=umpwr&token1=ibc%2FDD3938D8131F41994C1F01F4EB5233DEE9A0A5B787545B9A07A321925655BF38",
  },
  "USDT.eth.wh": {
    depositUrlOverride: "https://portalbridge.com/cosmos/",
    withdrawUrlOverride: "https://portalbridge.com/cosmos/",
  },
  "USDC.eth.wh": {
    depositUrlOverride: "https://portalbridge.com/cosmos/",
    withdrawUrlOverride: "https://portalbridge.com/cosmos/",
  },
  "ETH.wh": {
    depositUrlOverride: "https://portalbridge.com/cosmos/",
    withdrawUrlOverride: "https://portalbridge.com/cosmos/",
  },
  PYTH: {
    depositUrlOverride: "/wormhole?from=solana&to=osmosis&token=PYTH",
    withdrawUrlOverride: "/wormhole?from=osmosis&to=solana&token=PYTH",
  },
  YieldETH: {
    sourceChainNameOverride: "Ethereum",
  },
  XPLA: {
    depositUrlOverride: "https://ibc.xpla.io/",
  },
  NEOK: {
    depositUrlOverride: "https://app.evmos.org/assets",
  },
  RIO: {
    depositUrlOverride: "https://app.realio.network/",
  },
  FX: {
    depositUrlOverride:
      "https://starscan.io/fxbridge?from=fxcore&to=osmosis&token=FX",
  },
  NINJA: {
    depositUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=injective-1&chainTo=osmosis-1&token0=factory%2Finj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w%2Fninja&token1=ibc%2F183C0BB962D2F57C957E0B134CFA0AC9D6F755C02DE9DC2A59089BA23009DEC3",
    withdrawUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=injective-1&token0=ibc%2F183C0BB962D2F57C957E0B134CFA0AC9D6F755C02DE9DC2A59089BA23009DEC3&token1=factory%2Finj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w%2Fninja",
  },
  DYM: {
    depositUrlOverride:
      "https://portal.dymension.xyz/ibc/transfer?sourceId=dymension_1100-1&destinationId=osmosis-1",
  },
  NIM: {
    depositUrlOverride:
      "https://portal.dymension.xyz/ibc/transfer?sourceId=dymension_1100-1&destinationId=osmosis-1",
    withdrawUrlOverride:
      "https://portal.dymension.xyz/ibc/transfer?sourceId=osmosis-1&destinationId=dymension_1100-1",
  },
  MAND: {
    depositUrlOverride:
      "https://portal.dymension.xyz/ibc/transfer?sourceId=dymension_1100-1&destinationId=osmosis-1",
    withdrawUrlOverride:
      "https://portal.dymension.xyz/ibc/transfer?sourceId=osmosis-1&destinationId=dymension_1100-1",
  },
  GLTO: {
    depositUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=injective-1&chainTo=osmosis-1&token0=peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2&token1=ibc%2F072E5B3D6F278B3E6A9C51D7EAD1A737148609512C5EBE8CBCB5663264A0DDB7",
    withdrawUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=injective-1&token0=ibc%2F072E5B3D6F278B3E6A9C51D7EAD1A737148609512C5EBE8CBCB5663264A0DDB7&token1=peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
  },
  ASTRO: {
    depositUrlOverride:
      "https://pro.osmosis.zone/ibc?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26&token1=ibc%2FC25A2303FE24B922DAFFDCE377AC5A42E5EF746806D32E2ED4B610DE85C203F7",
    withdrawUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2FC25A2303FE24B922DAFFDCE377AC5A42E5EF746806D32E2ED4B610DE85C203F7&token1=terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
  },
  "USDC.sol.wh": {
    depositUrlOverride: "https://portalbridge.com/cosmos/",
    withdrawUrlOverride: "https://portalbridge.com/cosmos/",
  },
  "BERLIN-legacy": {
    depositUrlOverride: "https://app.evmos.org/assets",
  },
  BMOS: {
    depositUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=phoenix-1&chainTo=osmosis-1&token0=terra1sxe8u2hjczlekwfkcq0rs28egt38pg3wqzfx4zcrese4fnvzzupsk9gjkq&token1=ibc%2F7D389F0ABF1E4D45BE6D7BBE36A2C50EA0559C01E076B02F8E381E685EC1F942",
    withdrawUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2F7D389F0ABF1E4D45BE6D7BBE36A2C50EA0559C01E076B02F8E381E685EC1F942&token1=terra1sxe8u2hjczlekwfkcq0rs28egt38pg3wqzfx4zcrese4fnvzzupsk9gjkq",
  },
  HEART: {
    depositUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=humans_1089-1&chainTo=osmosis-1&token0=aheart&token1=ibc%2F35CECC330D11DD00FACB555D07687631E0BC7D226260CC5F015F6D7980819533",
  },
  "XRP.core": {
    depositUrlOverride: "https://sologenic.org/coreum-bridge",
    withdrawUrlOverride: "https://sologenic.org/coreum-bridge",
  },
  AIOZ: {
    depositUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=aioz_168-1&chainTo=osmosis-1&token0=attoaioz&token1=ibc%2FBB0AFE2AFBD6E883690DAE4B9168EAC2B306BCC9C9292DACBB4152BBB08DB25F",
  },
  BSKT: {
    depositUrlOverride: "https://www.bskt.fi/wormhole",
    withdrawUrlOverride: "https://www.bskt.fi/wormhole",
  },
  BEAST: {
    depositUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=injective-1&chainTo=osmosis-1&token0=peggy0xA4426666addBE8c4985377d36683D17FB40c31Be&token1=ibc%2FB84F8CC583A54DA8173711C0B66B22FDC1954FEB1CA8DBC66C89919DAFE02000",
    withdrawUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=injective-1&token0=ibc%2FB84F8CC583A54DA8173711C0B66B22FDC1954FEB1CA8DBC66C89919DAFE02000&token1=peggy0xA4426666addBE8c4985377d36683D17FB40c31Be",
  },
  TNKR: {
    depositUrlOverride:
      "https://app.picasso.network/?from=PicassoKusama&to=OSMOSIS",
    withdrawUrlOverride:
      "https://app.picasso.network/?from=OSMOSIS&to=PicassoKusama",
  },
  SAYVE: {
    depositUrlOverride:
      "https://pro.osmosis.zone/ibc?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1xp9hrhthzddnl7j5du83gqqr4wmdjm5t0guzg9jp6jwrtpukwfjsjgy4f3&token1=ibc%2F06EF575844982382F4D1BC3830D294557A30EDB3CD223153AFC8DFEF06349C56",
    withdrawUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2F06EF575844982382F4D1BC3830D294557A30EDB3CD223153AFC8DFEF06349C56&token1=terra1xp9hrhthzddnl7j5du83gqqr4wmdjm5t0guzg9jp6jwrtpukwfjsjgy4f3",
  },
  W: {
    depositUrlOverride: "/wormhole?from=solana&to=osmosis&token=W",
    withdrawUrlOverride: "/wormhole?from=osmosis&to=solana&token=W",
  },
  HAVA: {
    depositUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=injective-1&chainTo=osmosis-1&token0=factory%2Finj1h0ypsdtjfcjynqu3m75z2zwwz5mmrj8rtk2g52%2Fuhava&token1=ibc%2F884EBC228DFCE8F1304D917A712AA9611427A6C1ECC3179B2E91D7468FB091A2",
    withdrawUrlOverride:
      "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=injective-1&token0=ibc%2F884EBC228DFCE8F1304D917A712AA9611427A6C1ECC3179B2E91D7468FB091A2&token1=factory%2Finj1h0ypsdtjfcjynqu3m75z2zwwz5mmrj8rtk2g52%2Fuhava",
  },
  CROWDP: {
    depositUrlOverride: "https://app.evmos.org/assets",
  },
  "ETH.pica": {
    depositUrlOverride: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
    withdrawUrlOverride:
      "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
  },
  "DAI.pica": {
    depositUrlOverride: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
    withdrawUrlOverride:
      "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
  },
  "FXS.pica": {
    depositUrlOverride: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
    withdrawUrlOverride:
      "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
  },
  "FRAX.pica": {
    depositUrlOverride: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
    withdrawUrlOverride:
      "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
  },
  "USDT.eth.pica": {
    depositUrlOverride: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
    withdrawUrlOverride:
      "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
  },
  "sFRAX.pica": {
    depositUrlOverride: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
    withdrawUrlOverride:
      "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
  },
  "frxETH.pica": {
    depositUrlOverride: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
    withdrawUrlOverride:
      "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
  },
  "sfrxETH.pica": {
    depositUrlOverride: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
    withdrawUrlOverride:
      "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
  },
  "USDT.sol.pica": {
    depositUrlOverride: "https://app.picasso.network/?from=SOLANA&to=OSMOSIS",
    withdrawUrlOverride: "https://app.picasso.network/?from=OSMOSIS&to=SOLANA",
  },
  "edgeSOL.pica": {
    depositUrlOverride: "https://app.picasso.network/?from=SOLANA&to=OSMOSIS",
    withdrawUrlOverride: "https://app.picasso.network/?from=OSMOSIS&to=SOLANA",
  },
  "LST.pica": {
    depositUrlOverride: "https://app.picasso.network/?from=SOLANA&to=OSMOSIS",
    withdrawUrlOverride: "https://app.picasso.network/?from=OSMOSIS&to=SOLANA",
  },
  "jitoSOL.pica": {
    depositUrlOverride: "https://app.picasso.network/?from=SOLANA&to=OSMOSIS",
    withdrawUrlOverride: "https://app.picasso.network/?from=OSMOSIS&to=SOLANA",
  },
  "SOL.pica": {
    depositUrlOverride: "https://app.picasso.network/?from=SOLANA&to=OSMOSIS",
    withdrawUrlOverride: "https://app.picasso.network/?from=OSMOSIS&to=SOLANA",
  },
  WHINE: {
    depositUrlOverride: "https://app.picasso.network/?from=SOLANA&to=OSMOSIS",
    withdrawUrlOverride: "https://app.picasso.network/?from=OSMOSIS&to=SOLANA",
  },
  "ETH.arb.axl": {
    depositUrlOverride:
      "https://satellite.money/?source=arbitrum&destination=osmosis&asset_denom=arbitrum-weth-wei",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=arbitrum&asset_denom=arbitrum-weth-wei",
  },
  "ETH.base.axl": {
    depositUrlOverride:
      "https://satellite.money/?source=base&destination=osmosis&asset_denom=base-weth-wei",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=base&asset_denom=base-weth-wei",
  },
  "ETH.matic.axl": {
    depositUrlOverride:
      "https://satellite.money/?source=polygon&destination=osmosis&asset_denom=polygon-weth-wei",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=polygon&asset_denom=polygon-weth-wei",
  },
  UM: {
    depositUrlOverride: "https://stake.with.starlingcyber.net/#/ibc",
    withdrawUrlOverride: "https://stake.with.starlingcyber.net/#/ibc",
  },
  "TRX.rt": {
    depositUrlOverride:
      "https://beta-mainnet.routernitro.com/swap?fromChain=728126428&toChain=osmosis-1&fromToken=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&toToken=factory%2Fosmo1myv2g72h8dan7n4hx7stt3mmust6ws03zh6gxc7vz4hpmgp5z3lq9aunm9%2FTRX.rt",
    withdrawUrlOverride:
      "https://beta-mainnet.routernitro.com/swap?fromChain=osmosis-1&toChain=728126428&fromToken=factory%2Fosmo1myv2g72h8dan7n4hx7stt3mmust6ws03zh6gxc7vz4hpmgp5z3lq9aunm9%2FTRX.rt&toToken=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  },
  "USDT.eth.rt": {
    depositUrlOverride:
      "https://beta-mainnet.routernitro.com/swap?fromChain=728126428&toChain=osmosis-1&fromToken=0xA614F803B6FD780986A42C78EC9C7F77E6DED13C&toToken=factory%2Fosmo1myv2g72h8dan7n4hx7stt3mmust6ws03zh6gxc7vz4hpmgp5z3lq9aunm9%2FUSDT.rt",
    withdrawUrlOverride:
      "https://beta-mainnet.routernitro.com/swap?fromChain=osmosis-1&toChain=728126428&fromToken=factory%2Fosmo1myv2g72h8dan7n4hx7stt3mmust6ws03zh6gxc7vz4hpmgp5z3lq9aunm9%2FUSDT.rt&toToken=0xA614F803B6FD780986A42C78EC9C7F77E6DED13C",
  },
};

export const IBCAdditionalData: AdditionalData = IS_TESTNET
  ? TestnetIBCAdditionalData
  : MainnetIBCAdditionalData;
