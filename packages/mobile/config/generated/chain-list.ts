import type { Chain, ChainInfoWithExplorer } from "@osmosis-labs/types";
export const ChainList: (Omit<Chain, "chain_id"> & {
  chain_id: MainnetChainIds;
  keplrChain: ChainInfoWithExplorer;
})[] = [
  {
    chain_name: "osmosis",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Osmosis",
    chain_id: "osmosis-1",
    bech32_prefix: "osmo",
    bech32_config: {
      bech32PrefixAccAddr: "osmo",
      bech32PrefixAccPub: "osmopub",
      bech32PrefixValAddr: "osmovaloper",
      bech32PrefixValPub: "osmovaloperpub",
      bech32PrefixConsAddr: "osmovalcons",
      bech32PrefixConsPub: "osmovalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uosmo",
          fixed_min_gas_price: 0.0025,
          low_gas_price: 0.0025,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uosmo",
        },
      ],
      lock_duration: {
        time: "1209600s",
      },
    },
    description:
      "Osmosis (OSMO) is the premier DEX and cross-chain DeFi hub within the Cosmos ecosystem, a network of over 50 sovereign, interoperable blockchains seamlessly connected through the Inter-Blockchain Communication Protocol (IBC). Pioneering in its approach, Osmosis offers a dynamic trading and liquidity provision experience, integrating non-IBC assets from other ecosystems, including Ethereum, Solana, Avalanche, and Polkadot. Initially adopting Balancer-style pools, Osmosis now also features a concentrated liquidity model that is orders of magnitude more capital efficient, meaning that significantly less liquidity is required to handle the same amount of trading volume with minimal slippage.\n\nAs a true appchain, Osmosis has greater control over the full blockchain stack than traditional smart contract DEXs, which must follow the code of the parent chain that it is built on. This fine-grained control has enabled, for example, the development of Superfluid Staking, an extension of Proof of Stake that allows assets at the application layer to be staked to secure the chain. The customizability of appchains also allows implementing features like the Protocol Revenue module, which enables Osmosis to conduct on-chain arbitrage on behalf of OSMO stakers, balancing prices across pools while generating real yield revenue from this volume. Additionally, as a sovereign appchain, Osmosis governance can vote on upgrades to the protocol. One example of this was the introduction of a Taker Fee, which switched on the collection of exchange fees to generate diverse yield from Osmosis volume and distribute it to OSMO stakers.\n\nOsmosis is bringing the full centralized exchange experience to the decentralized world by building a cross-chain native DEX and trading suite that connects all chains over IBC, including Ethereum and Bitcoin. To reach this goal, Osmosis hosts an ever-expanding suite of DeFi applications aimed at providing a one-stop experience that includes lending, credit, margin, DeFi strategy vaults, power perps, fiat on-ramps, NFTs, stablecoins, and more — all of the functionalities that centralized exchange offer and more, in the trust-minimized environment of decentralized finance.",
    apis: {
      rpc: [
        {
          address: "https://rpc-osmosis.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-osmosis.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/osmosis/txs/{txHash}",
      },
    ],
    logoURIs: {
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg",
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png",
      theme: {
        primary_color_hex: "#760dbb",
      },
    },
    features: [
      "ibc-go",
      "ibc-transfer",
      "cosmwasm",
      "wasmd_0.24+",
      "osmosis-txfees",
    ],
    keplrChain: {
      rpc: "https://rpc-osmosis.keplr.app",
      rest: "https://lcd-osmosis.keplr.app",
      chainId: "osmosis-1",
      chainName: "osmosis",
      prettyChainName: "Osmosis",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "OSMO",
          coinMinimalDenom: "uosmo",
          coinDecimals: 6,
          coinGeckoId: "osmosis",
          coinImageUrl: "/tokens/generated/osmo.svg",
          base: "uosmo",
          gasPriceStep: {
            low: 0.0025,
            average: 0.025,
            high: 0.04,
          },
        },
        {
          coinDenom: "ION",
          coinMinimalDenom: "uion",
          coinDecimals: 6,
          coinGeckoId: "ion",
          coinImageUrl: "/tokens/generated/ion.svg",
          base: "uion",
        },
        {
          coinDenom: "IBCX",
          coinMinimalDenom:
            "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          coinDecimals: 6,
          coinGeckoId: "ibc-index",
          coinImageUrl: "/tokens/generated/ibcx.svg",
          base: "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
        },
        {
          coinDenom: "stIBCX",
          coinMinimalDenom:
            "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/stibcx.svg",
          base: "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
        },
        {
          coinDenom: "ampOSMO",
          coinMinimalDenom:
            "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/amposmo.png",
          base: "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
        },
        {
          coinDenom: "CDT",
          coinMinimalDenom:
            "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          coinDecimals: 6,
          coinGeckoId: "collateralized-debt-token",
          coinImageUrl: "/tokens/generated/cdt.svg",
          base: "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "MBRN",
          coinMinimalDenom:
            "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          coinDecimals: 6,
          coinGeckoId: "membrane",
          coinImageUrl: "/tokens/generated/mbrn.svg",
          base: "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
        },
        {
          coinDenom: "sqOSMO",
          coinMinimalDenom:
            "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sqosmo.svg",
          base: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
        },
        {
          coinDenom: "sqATOM",
          coinMinimalDenom:
            "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sqatom.svg",
          base: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
        },
        {
          coinDenom: "sqBTC",
          coinMinimalDenom:
            "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sqbtc.svg",
          base: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc",
        },
        {
          coinDenom: "LVN",
          coinMinimalDenom:
            "factory/osmo1mlng7pz4pnyxtpq0akfwall37czyk9lukaucsrn30ameplhhshtqdvfm5c/ulvn",
          coinDecimals: 6,
          coinGeckoId: "levana-protocol",
          coinImageUrl: "/tokens/generated/lvn.svg",
          base: "factory/osmo1mlng7pz4pnyxtpq0akfwall37czyk9lukaucsrn30ameplhhshtqdvfm5c/ulvn",
        },
        {
          coinDenom: "milkTIA",
          coinMinimalDenom:
            "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
          coinDecimals: 6,
          coinGeckoId: "milkyway-staked-tia",
          coinImageUrl: "/tokens/generated/milktia.svg",
          base: "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
        },
        {
          coinDenom: "WBTC",
          coinMinimalDenom:
            "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
          coinDecimals: 8,
          coinGeckoId: "wrapped-bitcoin",
          coinImageUrl: "/tokens/generated/wbtc.svg",
          base: "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
        },
        {
          coinDenom: "WOSMO",
          coinMinimalDenom:
            "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/wosmo.png",
          base: "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
        },
        {
          coinDenom: "sqTIA",
          coinMinimalDenom:
            "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqtia",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sqtia.svg",
          base: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqtia",
        },
        {
          coinDenom: "RAPTR",
          coinMinimalDenom:
            "factory/osmo1279xudevmf5cw83vkhglct7jededp86k90k2le/RAPTR",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/raptr.png",
          base: "factory/osmo1279xudevmf5cw83vkhglct7jededp86k90k2le/RAPTR",
        },
        {
          coinDenom: "BADKID",
          coinMinimalDenom:
            "factory/osmo10n8rv8npx870l69248hnp6djy6pll2yuzzn9x8/BADKID",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/badkid.png",
          base: "factory/osmo10n8rv8npx870l69248hnp6djy6pll2yuzzn9x8/BADKID",
        },
        {
          coinDenom: "SAIL",
          coinMinimalDenom:
            "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sail.png",
          base: "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
        },
        {
          coinDenom: "TORO",
          coinMinimalDenom:
            "factory/osmo1nr8zfakf6jauye3uqa9lrmr5xumee5n42lv92z/toro",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/toro.svg",
          base: "factory/osmo1nr8zfakf6jauye3uqa9lrmr5xumee5n42lv92z/toro",
        },
        {
          coinDenom: "LAB",
          coinMinimalDenom:
            "factory/osmo17fel472lgzs87ekt9dvk0zqyh5gl80sqp4sk4n/LAB",
          coinDecimals: 6,
          coinGeckoId: "mad-scientists",
          coinImageUrl: "/tokens/generated/lab.png",
          base: "factory/osmo17fel472lgzs87ekt9dvk0zqyh5gl80sqp4sk4n/LAB",
        },
        {
          coinDenom: "bOSMO",
          coinMinimalDenom:
            "factory/osmo1s3l0lcqc7tu0vpj6wdjz9wqpxv8nk6eraevje4fuwkyjnwuy82qsx3lduv/boneOsmo",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/bosmo.png",
          base: "factory/osmo1s3l0lcqc7tu0vpj6wdjz9wqpxv8nk6eraevje4fuwkyjnwuy82qsx3lduv/boneOsmo",
        },
        {
          coinDenom: "IBC",
          coinMinimalDenom:
            "factory/osmo1kqdw6pvn0xww6tyfv2sqvkkencdz0qw406x54r/IBC",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/ibc.png",
          base: "factory/osmo1kqdw6pvn0xww6tyfv2sqvkkencdz0qw406x54r/IBC",
        },
        {
          coinDenom: "BERNESE",
          coinMinimalDenom:
            "factory/osmo1s6ht8qrm8x0eg8xag5x3ckx9mse9g4se248yss/BERNESE",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/bernese.png",
          base: "factory/osmo1s6ht8qrm8x0eg8xag5x3ckx9mse9g4se248yss/BERNESE",
        },
        {
          coinDenom: "wLIBRA",
          coinMinimalDenom:
            "factory/osmo19hdqma2mj0vnmgcxag6ytswjnr8a3y07q7e70p/wLIBRA",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/wlibra.svg",
          base: "factory/osmo19hdqma2mj0vnmgcxag6ytswjnr8a3y07q7e70p/wLIBRA",
        },
        {
          coinDenom: "CAC",
          coinMinimalDenom:
            "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/cac",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/cac.png",
          base: "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/cac",
        },
        {
          coinDenom: "PBB",
          coinMinimalDenom:
            "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/pbb",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/pbb.png",
          base: "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/pbb",
        },
        {
          coinDenom: "BWH",
          coinMinimalDenom:
            "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/bwh",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/bwh.png",
          base: "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/bwh",
        },
        {
          coinDenom: "SHITMOS",
          coinMinimalDenom:
            "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/shitmos",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/shitmos.svg",
          base: "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/shitmos",
        },
        {
          coinDenom: "WIHA",
          coinMinimalDenom:
            "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/wiha",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/wiha.png",
          base: "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/wiha",
        },
        {
          coinDenom: "CRAZYHORSE",
          coinMinimalDenom:
            "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/crazyhorse",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/crazyhorse.png",
          base: "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/crazyhorse",
        },
        {
          coinDenom: "COCA",
          coinMinimalDenom:
            "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/coca",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/coca.png",
          base: "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/coca",
        },
        {
          coinDenom: "USDT",
          coinMinimalDenom:
            "factory/osmo1em6xs47hd82806f5cxgyufguxrrc7l0aqx7nzzptjuqgswczk8csavdxek/alloyed/allUSDT",
          coinDecimals: 6,
          coinGeckoId: "tether",
          coinImageUrl: "/tokens/generated/usdt.svg",
          base: "factory/osmo1em6xs47hd82806f5cxgyufguxrrc7l0aqx7nzzptjuqgswczk8csavdxek/alloyed/allUSDT",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "BAG",
          coinMinimalDenom:
            "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/bag",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/bag.png",
          base: "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/bag",
        },
        {
          coinDenom: "BTC",
          coinMinimalDenom:
            "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC",
          coinDecimals: 8,
          coinGeckoId: "bitcoin",
          coinImageUrl: "/tokens/generated/btc.svg",
          base: "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC",
        },
        {
          coinDenom: "TURD",
          coinMinimalDenom:
            "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/turd",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/turd.png",
          base: "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/turd",
        },
        {
          coinDenom: "ETH",
          coinMinimalDenom:
            "factory/osmo1k6c8jln7ejuqwtqmay3yvzrg3kueaczl96pk067ldg8u835w0yhsw27twm/alloyed/allETH",
          coinDecimals: 18,
          coinGeckoId: "ethereum",
          coinImageUrl: "/tokens/generated/eth.svg",
          base: "factory/osmo1k6c8jln7ejuqwtqmay3yvzrg3kueaczl96pk067ldg8u835w0yhsw27twm/alloyed/allETH",
        },
        {
          coinDenom: "SOL",
          coinMinimalDenom:
            "factory/osmo1n3n75av8awcnw4jl62n3l48e6e4sxqmaf97w5ua6ddu4s475q5qq9udvx4/alloyed/allSOL",
          coinDecimals: 9,
          coinGeckoId: "solana",
          coinImageUrl: "/tokens/generated/sol.svg",
          base: "factory/osmo1n3n75av8awcnw4jl62n3l48e6e4sxqmaf97w5ua6ddu4s475q5qq9udvx4/alloyed/allSOL",
        },
        {
          coinDenom: "UM",
          coinMinimalDenom:
            "ibc/0FA9232B262B89E77D1335D54FB1E1F506A92A7E4B51524B400DC69C68D28372",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/um.svg",
          base: "ibc/0FA9232B262B89E77D1335D54FB1E1F506A92A7E4B51524B400DC69C68D28372",
        },
        {
          coinDenom: "TRX.rt",
          coinMinimalDenom:
            "factory/osmo1myv2g72h8dan7n4hx7stt3mmust6ws03zh6gxc7vz4hpmgp5z3lq9aunm9/TRX.rt",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/trx.rt.svg",
          base: "factory/osmo1myv2g72h8dan7n4hx7stt3mmust6ws03zh6gxc7vz4hpmgp5z3lq9aunm9/TRX.rt",
        },
        {
          coinDenom: "USDT.eth.rt",
          coinMinimalDenom:
            "factory/osmo1myv2g72h8dan7n4hx7stt3mmust6ws03zh6gxc7vz4hpmgp5z3lq9aunm9/USDT.rt",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdt.eth.rt.svg",
          base: "factory/osmo1myv2g72h8dan7n4hx7stt3mmust6ws03zh6gxc7vz4hpmgp5z3lq9aunm9/USDT.rt",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "COOK",
          coinMinimalDenom:
            "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/COOK",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/cook.png",
          base: "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/COOK",
        },
        {
          coinDenom: "TRX",
          coinMinimalDenom:
            "factory/osmo14mafhhp337yjj2aujplawz0tks6jd2lel4hkwz4agyzhvvztzaqsqzjq8x/alloyed/allTRX",
          coinDecimals: 6,
          coinGeckoId: "tron",
          coinImageUrl: "/tokens/generated/trx.svg",
          base: "factory/osmo14mafhhp337yjj2aujplawz0tks6jd2lel4hkwz4agyzhvvztzaqsqzjq8x/alloyed/allTRX",
        },
        {
          coinDenom: "OP",
          coinMinimalDenom:
            "factory/osmo1nufyzqlm8qhu2w7lm0l4rrax0ec8rsk69mga4tel8eare7c7ljaqpk2lyg/alloyed/allOP",
          coinDecimals: 12,
          coinGeckoId: "optimism",
          coinImageUrl: "/tokens/generated/op.svg",
          base: "factory/osmo1nufyzqlm8qhu2w7lm0l4rrax0ec8rsk69mga4tel8eare7c7ljaqpk2lyg/alloyed/allOP",
        },
        {
          coinDenom: "SHIB",
          coinMinimalDenom:
            "factory/osmo1f588gk9dazpsueevdl2w6wfkmfmhg5gdvg2uerdlzl0atkasqhsq59qc6a/alloyed/allSHIB",
          coinDecimals: 12,
          coinGeckoId: "shiba-inu",
          coinImageUrl: "/tokens/generated/shib.svg",
          base: "factory/osmo1f588gk9dazpsueevdl2w6wfkmfmhg5gdvg2uerdlzl0atkasqhsq59qc6a/alloyed/allSHIB",
        },
        {
          coinDenom: "ARB",
          coinMinimalDenom:
            "factory/osmo1p7x454ex08s4f9ztmm7wfv7lvtgdkfztj2u7v7fezfcauy85q35qmqrdpk/alloyed/allARB",
          coinDecimals: 12,
          coinGeckoId: "arbitrum",
          coinImageUrl: "/tokens/generated/arb.svg",
          base: "factory/osmo1p7x454ex08s4f9ztmm7wfv7lvtgdkfztj2u7v7fezfcauy85q35qmqrdpk/alloyed/allARB",
        },
        {
          coinDenom: "LINK",
          coinMinimalDenom:
            "factory/osmo18zdw5yvs6gfp95rp74qqwug9yduw2fyr8kplk2xgs726s9axc5usa2vpgw/alloyed/allLINK",
          coinDecimals: 12,
          coinGeckoId: "chainlink",
          coinImageUrl: "/tokens/generated/link.svg",
          base: "factory/osmo18zdw5yvs6gfp95rp74qqwug9yduw2fyr8kplk2xgs726s9axc5usa2vpgw/alloyed/allLINK",
        },
        {
          coinDenom: "PEPE",
          coinMinimalDenom:
            "factory/osmo1nnlxegt0scm9qkzys9c874t0ntapv4epfjy2w49c0xdrp3dr0v4ssmelzx/alloyed/allPEPE",
          coinDecimals: 12,
          coinGeckoId: "pepe",
          coinImageUrl: "/tokens/generated/pepe.svg",
          base: "factory/osmo1nnlxegt0scm9qkzys9c874t0ntapv4epfjy2w49c0xdrp3dr0v4ssmelzx/alloyed/allPEPE",
        },
        {
          coinDenom: "DOT",
          coinMinimalDenom:
            "factory/osmo1r53fx9fvcdzncrs7zkn4gw5vfelx5gk8k5wc6wqha2jpkh992rusr5tk02/alloyed/allDOT",
          coinDecimals: 10,
          coinGeckoId: "polkadot",
          coinImageUrl: "/tokens/generated/dot.svg",
          base: "factory/osmo1r53fx9fvcdzncrs7zkn4gw5vfelx5gk8k5wc6wqha2jpkh992rusr5tk02/alloyed/allDOT",
        },
        {
          coinDenom: "COSMOUSD",
          coinMinimalDenom:
            "factory/osmo104jtrwcljnxfljhml8mxrw7qetcsdmqvy3sprw/ucosmousd",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/cosmousd.png",
          base: "factory/osmo104jtrwcljnxfljhml8mxrw7qetcsdmqvy3sprw/ucosmousd",
        },
        {
          coinDenom: "XTRUMP",
          coinMinimalDenom:
            "factory/osmo1hg0zf0c9can4tvtulh5gmmxe4jpflre3yewxjl/XTRUMP",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/xtrump.png",
          base: "factory/osmo1hg0zf0c9can4tvtulh5gmmxe4jpflre3yewxjl/XTRUMP",
        },
        {
          coinDenom: "fBAD",
          coinMinimalDenom:
            "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fBAD",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/fbad.png",
          base: "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fBAD",
        },
        {
          coinDenom: "fMAD",
          coinMinimalDenom:
            "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fMAD",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/fmad.png",
          base: "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fMAD",
        },
        {
          coinDenom: "fSLOTH",
          coinMinimalDenom:
            "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fSLOTH",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/fsloth.png",
          base: "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fSLOTH",
        },
        {
          coinDenom: "fNUT",
          coinMinimalDenom:
            "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fNUT",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/fnut.png",
          base: "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fNUT",
        },
        {
          coinDenom: "TON",
          coinMinimalDenom:
            "factory/osmo12lnwf54yd30p6amzaged2atln8k0l32n7ncxf04ctg7u7ymnsy7qkqgsw4/alloyed/allTON",
          coinDecimals: 9,
          coinGeckoId: "the-open-network",
          coinImageUrl: "/tokens/generated/ton.svg",
          base: "factory/osmo12lnwf54yd30p6amzaged2atln8k0l32n7ncxf04ctg7u7ymnsy7qkqgsw4/alloyed/allTON",
        },
        {
          coinDenom: "BVT0",
          coinMinimalDenom:
            "factory/osmo1xu0gk9aggv79597xwazyfzaggv2pze9z7cq3p9p72tkkux9a7xaqufa792/BVT",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/bvt0.png",
          base: "factory/osmo1xu0gk9aggv79597xwazyfzaggv2pze9z7cq3p9p72tkkux9a7xaqufa792/BVT",
        },
        {
          coinDenom: "BVT1",
          coinMinimalDenom:
            "factory/osmo16nxtnrnl7lctvnhhpcxqmmpv63n93zgg0ukaveyc0jl4dtad79cs53c3an/BVT",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/bvt1.png",
          base: "factory/osmo16nxtnrnl7lctvnhhpcxqmmpv63n93zgg0ukaveyc0jl4dtad79cs53c3an/BVT",
        },
        {
          coinDenom: "AVAIL.eth.rt",
          coinMinimalDenom:
            "factory/osmo1myv2g72h8dan7n4hx7stt3mmust6ws03zh6gxc7vz4hpmgp5z3lq9aunm9/AVAIL.rt",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/avail.eth.rt.svg",
          base: "factory/osmo1myv2g72h8dan7n4hx7stt3mmust6ws03zh6gxc7vz4hpmgp5z3lq9aunm9/AVAIL.rt",
        },
        {
          coinDenom: "ckBTC",
          coinMinimalDenom:
            "factory/osmo10c4y9csfs8q7mtvfg4p9gd8d0acx0hpc2mte9xqzthd7rd3348tsfhaesm/sICP-icrc-ckBTC",
          coinDecimals: 8,
          coinGeckoId: "chain-key-bitcoin",
          coinImageUrl: "/tokens/generated/ckbtc.svg",
          base: "factory/osmo10c4y9csfs8q7mtvfg4p9gd8d0acx0hpc2mte9xqzthd7rd3348tsfhaesm/sICP-icrc-ckBTC",
        },
        {
          coinDenom: "fWIZ",
          coinMinimalDenom:
            "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fWIZ",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/fwiz.png",
          base: "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fWIZ",
        },
        {
          coinDenom: "fWITCH",
          coinMinimalDenom:
            "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fWITCH",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/fwitch.png",
          base: "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fWITCH",
        },
        {
          coinDenom: "fCRYPTONIUM",
          coinMinimalDenom:
            "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fCRYPTONIUM",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/fcryptonium.png",
          base: "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fCRYPTONIUM",
        },
        {
          coinDenom: "fATLAS",
          coinMinimalDenom:
            "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fATLAS",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/fatlas.png",
          base: "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fATLAS",
        },
        {
          coinDenom: "fGECK",
          coinMinimalDenom:
            "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fGECK",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/fgeck.png",
          base: "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fGECK",
        },
        {
          coinDenom: "fBULLS",
          coinMinimalDenom:
            "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fBULLS",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/fbulls.png",
          base: "factory/osmo1dywfmhyc8y0wga7qpzej0x0mgwqg25fj4eccp494w8yafzdpgamsx9ryyv/fBULLS",
        },
        {
          coinDenom: "UNI",
          coinMinimalDenom:
            "factory/osmo1eqjda4pc6e09jtxzxggf6jl3jye2yn453ja58we5gxwzmf5ah28qvlnaz8/alloyed/allUNI",
          coinDecimals: 12,
          coinGeckoId: "uniswap",
          coinImageUrl: "/tokens/generated/uni.svg",
          base: "factory/osmo1eqjda4pc6e09jtxzxggf6jl3jye2yn453ja58we5gxwzmf5ah28qvlnaz8/alloyed/allUNI",
        },
        {
          coinDenom: "RBTC.rt",
          coinMinimalDenom:
            "factory/osmo1myv2g72h8dan7n4hx7stt3mmust6ws03zh6gxc7vz4hpmgp5z3lq9aunm9/BTC.rt",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/rbtc.rt.svg",
          base: "factory/osmo1myv2g72h8dan7n4hx7stt3mmust6ws03zh6gxc7vz4hpmgp5z3lq9aunm9/BTC.rt",
        },
        {
          coinDenom: "DOGE",
          coinMinimalDenom:
            "factory/osmo10pk4crey8fpdyqd62rsau0y02e3rk055w5u005ah6ly7k849k5tsf72x40/alloyed/allDOGE",
          coinDecimals: 8,
          coinGeckoId: "dogecoin",
          coinImageUrl: "/tokens/generated/doge.png",
          base: "factory/osmo10pk4crey8fpdyqd62rsau0y02e3rk055w5u005ah6ly7k849k5tsf72x40/alloyed/allDOGE",
        },
        {
          coinDenom: "LTC",
          coinMinimalDenom:
            "factory/osmo1csp8fk353hnq2tmulklecxpex43qmjvrkxjcsh4c3eqcw2vjcslq5jls9v/alloyed/allLTC",
          coinDecimals: 8,
          coinGeckoId: "litecoin",
          coinImageUrl: "/tokens/generated/ltc.svg",
          base: "factory/osmo1csp8fk353hnq2tmulklecxpex43qmjvrkxjcsh4c3eqcw2vjcslq5jls9v/alloyed/allLTC",
        },
        {
          coinDenom: "BCH",
          coinMinimalDenom:
            "factory/osmo1cranx3twqxfrgeqvgsu262gy54vafpc9xap6scye99v244zl970s7kw2sz/alloyed/allBCH",
          coinDecimals: 8,
          coinGeckoId: "bitcoin-cash",
          coinImageUrl: "/tokens/generated/bch.svg",
          base: "factory/osmo1cranx3twqxfrgeqvgsu262gy54vafpc9xap6scye99v244zl970s7kw2sz/alloyed/allBCH",
        },
        {
          coinDenom: "SPICE",
          coinMinimalDenom:
            "factory/osmo1n6asrjy9754q8y9jsxqf557zmsv3s3xa5m9eg5/uspice",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/spice.png",
          base: "factory/osmo1n6asrjy9754q8y9jsxqf557zmsv3s3xa5m9eg5/uspice",
        },
        {
          coinDenom: "BOMU",
          coinMinimalDenom:
            "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/bomu",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/bomu.png",
          base: "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/bomu",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinGeckoId: "osmosis",
        coinImageUrl: "/tokens/generated/osmo.svg",
        base: "uosmo",
      },
      feeCurrencies: [
        {
          coinDenom: "OSMO",
          coinMinimalDenom: "uosmo",
          coinDecimals: 6,
          coinGeckoId: "osmosis",
          coinImageUrl: "/tokens/generated/osmo.svg",
          base: "uosmo",
          gasPriceStep: {
            low: 0.0025,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "osmo",
        bech32PrefixAccPub: "osmopub",
        bech32PrefixValAddr: "osmovaloper",
        bech32PrefixValPub: "osmovaloperpub",
        bech32PrefixConsAddr: "osmovalcons",
        bech32PrefixConsPub: "osmovalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/osmosis/txs/{txHash}",
      features: [
        "ibc-go",
        "ibc-transfer",
        "cosmwasm",
        "wasmd_0.24+",
        "osmosis-txfees",
      ],
    },
  },
  {
    chain_name: "cosmoshub",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Cosmos Hub",
    chain_id: "cosmoshub-4",
    bech32_prefix: "cosmos",
    bech32_config: {
      bech32PrefixAccAddr: "cosmos",
      bech32PrefixAccPub: "cosmospub",
      bech32PrefixValAddr: "cosmosvaloper",
      bech32PrefixValPub: "cosmosvaloperpub",
      bech32PrefixConsAddr: "cosmosvalcons",
      bech32PrefixConsPub: "cosmosvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uatom",
          fixed_min_gas_price: 0.005,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.03,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uatom",
        },
      ],
    },
    description:
      "In a nutshell, Cosmos Hub bills itself as a project that solves some of the hardest problems facing the blockchain industry. It aims to offer an antidote to slow, expensive, unscalable and environmentally harmful proof-of-work protocols, like those used by Bitcoin, by offering an ecosystem of connected blockchains.\n\nThe project’s other goals include making blockchain technology less complex and difficult for developers thanks to a modular framework that demystifies decentralized apps. Last but not least, an Inter-blockchain Communication protocol makes it easier for blockchain networks to communicate with each other — preventing fragmentation in the industry.\n\nCosmos Hub's origins can be dated back to 2014, when Tendermint, a core contributor to the network, was founded. In 2016, a white paper for Cosmos was published — and a token sale was held the following year. ATOM tokens are earned through a hybrid proof-of-stake algorithm, and they help to keep the Cosmos Hub, the project’s flagship blockchain, secure. This cryptocurrency also has a role in the network’s governance.",
    apis: {
      rpc: [
        {
          address: "https://rpc-cosmoshub.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-cosmoshub.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/cosmos/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg",
      theme: {
        primary_color_hex: "#b7b9c8",
      },
    },
    features: ["ibc-go", "ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc-cosmoshub.keplr.app",
      rest: "https://lcd-cosmoshub.keplr.app",
      chainId: "cosmoshub-4",
      chainName: "cosmoshub",
      prettyChainName: "Cosmos Hub",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
          coinGeckoId: "cosmos",
          coinImageUrl: "/tokens/generated/atom.svg",
          base: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinGeckoId: "cosmos",
        coinImageUrl: "/tokens/generated/atom.svg",
        base: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      },
      feeCurrencies: [
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
          coinGeckoId: "cosmos",
          coinImageUrl: "/tokens/generated/atom.svg",
          base: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "cosmos",
        bech32PrefixAccPub: "cosmospub",
        bech32PrefixValAddr: "cosmosvaloper",
        bech32PrefixValPub: "cosmosvaloperpub",
        bech32PrefixConsAddr: "cosmosvalcons",
        bech32PrefixConsPub: "cosmosvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/cosmos/txs/{txHash}",
      features: ["ibc-go", "ibc-transfer"],
    },
  },
  {
    chain_name: "terra",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Terra Classic",
    chain_id: "columbus-5",
    bech32_prefix: "terra",
    bech32_config: {
      bech32PrefixAccAddr: "terra",
      bech32PrefixAccPub: "terrapub",
      bech32PrefixValAddr: "terravaloper",
      bech32PrefixValPub: "terravaloperpub",
      bech32PrefixConsAddr: "terravalcons",
      bech32PrefixConsPub: "terravalconspub",
    },
    slip44: 330,
    fees: {
      fee_tokens: [
        {
          denom: "uluna",
          low_gas_price: 28.325,
          average_gas_price: 28.325,
          high_gas_price: 50,
        },
        {
          denom: "usdr",
          low_gas_price: 0.52469,
          average_gas_price: 0.52469,
          high_gas_price: 0.52469,
        },
        {
          denom: "uusd",
          low_gas_price: 0.75,
          average_gas_price: 0.75,
          high_gas_price: 0.75,
        },
        {
          denom: "ukrw",
          low_gas_price: 850,
          average_gas_price: 850,
          high_gas_price: 850,
        },
        {
          denom: "umnt",
          low_gas_price: 2142.855,
          average_gas_price: 2142.855,
          high_gas_price: 2142.855,
        },
        {
          denom: "ueur",
          low_gas_price: 0.625,
          average_gas_price: 0.625,
          high_gas_price: 0.625,
        },
        {
          denom: "ucny",
          low_gas_price: 4.9,
          average_gas_price: 4.9,
          high_gas_price: 4.9,
        },
        {
          denom: "ujpy",
          low_gas_price: 81.85,
          average_gas_price: 81.85,
          high_gas_price: 81.85,
        },
        {
          denom: "ugbp",
          low_gas_price: 0.55,
          average_gas_price: 0.55,
          high_gas_price: 0.55,
        },
        {
          denom: "uinr",
          low_gas_price: 54.4,
          average_gas_price: 54.4,
          high_gas_price: 54.4,
        },
        {
          denom: "ucad",
          low_gas_price: 0.95,
          average_gas_price: 0.95,
          high_gas_price: 0.95,
        },
        {
          denom: "uchf",
          low_gas_price: 0.7,
          average_gas_price: 0.7,
          high_gas_price: 0.7,
        },
        {
          denom: "uaud",
          low_gas_price: 0.95,
          average_gas_price: 0.95,
          high_gas_price: 0.95,
        },
        {
          denom: "usgd",
          low_gas_price: 1,
          average_gas_price: 1,
          high_gas_price: 1,
        },
        {
          denom: "uthb",
          low_gas_price: 23.1,
          average_gas_price: 23.1,
          high_gas_price: 23.1,
        },
        {
          denom: "usek",
          low_gas_price: 6.25,
          average_gas_price: 6.25,
          high_gas_price: 6.25,
        },
        {
          denom: "unok",
          low_gas_price: 6.25,
          average_gas_price: 6.25,
          high_gas_price: 6.25,
        },
        {
          denom: "udkk",
          low_gas_price: 4.5,
          average_gas_price: 4.5,
          high_gas_price: 4.5,
        },
        {
          denom: "uidr",
          low_gas_price: 10900,
          average_gas_price: 10900,
          high_gas_price: 10900,
        },
        {
          denom: "uphp",
          low_gas_price: 38,
          average_gas_price: 38,
          high_gas_price: 38,
        },
        {
          denom: "uhkd",
          low_gas_price: 5.85,
          average_gas_price: 5.85,
          high_gas_price: 5.85,
        },
        {
          denom: "umyr",
          low_gas_price: 3,
          average_gas_price: 3,
          high_gas_price: 3,
        },
        {
          denom: "utwd",
          low_gas_price: 20,
          average_gas_price: 20,
          high_gas_price: 20,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uluna",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc-terra-ia.cosmosia.notional.ventures/",
        },
      ],
      rest: [
        {
          address: "https://api-terra-ia.cosmosia.notional.ventures/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://finder.terra.money/columbus-5/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/luna.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/luna.svg",
      theme: {
        primary_color_hex: "#fcdb5b",
      },
    },
    features: ["ibc-transfer", "terra-classic-fee"],
    keplrChain: {
      rpc: "https://rpc-terra-ia.cosmosia.notional.ventures/",
      rest: "https://api-terra-ia.cosmosia.notional.ventures/",
      chainId: "columbus-5",
      chainName: "terra",
      prettyChainName: "Terra Classic",
      bip44: {
        coinType: 330,
      },
      currencies: [
        {
          coinDenom: "LUNC",
          coinMinimalDenom: "uluna",
          coinDecimals: 6,
          coinGeckoId: "terra-luna",
          coinImageUrl: "/tokens/generated/lunc.svg",
          base: "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
          gasPriceStep: {
            low: 28.325,
            average: 28.325,
            high: 50,
          },
        },
        {
          coinDenom: "USTC",
          coinMinimalDenom: "uusd",
          coinDecimals: 6,
          coinGeckoId: "terrausd",
          coinImageUrl: "/tokens/generated/ustc.svg",
          base: "ibc/BE1BB42D4BE3C30D50B68D7C41DB4DFCE9678E8EF8C539F6E6A9345048894FCC",
          pegMechanism: "algorithmic",
          gasPriceStep: {
            low: 0.75,
            average: 0.75,
            high: 0.75,
          },
        },
        {
          coinDenom: "KRTC",
          coinMinimalDenom: "ukrw",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/krtc.svg",
          base: "ibc/204A582244FC241613DBB50B04D1D454116C58C4AF7866C186AA0D6EEAD42780",
          pegMechanism: "algorithmic",
          gasPriceStep: {
            low: 850,
            average: 850,
            high: 850,
          },
        },
        {
          type: "cw20",
          coinDenom: "JURIS",
          coinMinimalDenom:
            "cw20:terra1vhgq25vwuhdhn9xjll0rhl2s67jzw78a4g2t78y5kz89q9lsdskq2pxcj2:JURIS",
          contractAddress:
            "terra1vhgq25vwuhdhn9xjll0rhl2s67jzw78a4g2t78y5kz89q9lsdskq2pxcj2",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/juris.png",
          base: "ibc/46579C587A0B8CF8B0A1FF6B0EFA2082F11876578E47FC81A9CAAD31F424AF98",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "LUNC",
        coinMinimalDenom: "uluna",
        coinGeckoId: "terra-luna",
        coinImageUrl: "/tokens/generated/lunc.svg",
        base: "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
      },
      feeCurrencies: [
        {
          coinDenom: "LUNC",
          coinMinimalDenom: "uluna",
          coinDecimals: 6,
          coinGeckoId: "terra-luna",
          coinImageUrl: "/tokens/generated/lunc.svg",
          base: "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
          gasPriceStep: {
            low: 28.325,
            average: 28.325,
            high: 50,
          },
        },
        {
          coinDenom: "USTC",
          coinMinimalDenom: "uusd",
          coinDecimals: 6,
          coinGeckoId: "terrausd",
          coinImageUrl: "/tokens/generated/ustc.svg",
          base: "ibc/BE1BB42D4BE3C30D50B68D7C41DB4DFCE9678E8EF8C539F6E6A9345048894FCC",
          gasPriceStep: {
            low: 0.75,
            average: 0.75,
            high: 0.75,
          },
        },
        {
          coinDenom: "KRTC",
          coinMinimalDenom: "ukrw",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/krtc.svg",
          base: "ibc/204A582244FC241613DBB50B04D1D454116C58C4AF7866C186AA0D6EEAD42780",
          gasPriceStep: {
            low: 850,
            average: 850,
            high: 850,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "terra",
        bech32PrefixAccPub: "terrapub",
        bech32PrefixValAddr: "terravaloper",
        bech32PrefixValPub: "terravaloperpub",
        bech32PrefixConsAddr: "terravalcons",
        bech32PrefixConsPub: "terravalconspub",
      },
      explorerUrlToTx: "https://finder.terra.money/columbus-5/tx/{txHash}",
      features: ["ibc-transfer", "terra-classic-fee"],
    },
  },
  {
    chain_name: "secretnetwork",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Secret Network",
    chain_id: "secret-4",
    bech32_prefix: "secret",
    bech32_config: {
      bech32PrefixAccAddr: "secret",
      bech32PrefixAccPub: "secretpub",
      bech32PrefixValAddr: "secretvaloper",
      bech32PrefixValPub: "secretvaloperpub",
      bech32PrefixConsAddr: "secretvalcons",
      bech32PrefixConsPub: "secretvalconspub",
    },
    slip44: 529,
    alternative_slip44s: [118],
    fees: {
      fee_tokens: [
        {
          denom: "uscrt",
          fixed_min_gas_price: 0.05,
          low_gas_price: 0.05,
          average_gas_price: 0.1,
          high_gas_price: 0.25,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uscrt",
        },
      ],
    },
    description:
      "Secret Network is the first blockchain with customizable privacy. You get to choose what you share, with whom, and how. This protects users, and empowers developers to build a better Web3.",
    apis: {
      rpc: [
        {
          address: "https://rpc-secret.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-secret.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page:
          "https://secretnodes.com/secret/chains/secret-4/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.svg",
      theme: {
        primary_color_hex: "#040404",
      },
    },
    features: [
      "ibc-transfer",
      "ibc-go",
      "secretwasm",
      "cosmwasm",
      "wasmd_0.24+",
    ],
    keplrChain: {
      rpc: "https://rpc-secret.keplr.app",
      rest: "https://lcd-secret.keplr.app",
      chainId: "secret-4",
      chainName: "secretnetwork",
      prettyChainName: "Secret Network",
      bip44: {
        coinType: 529,
      },
      currencies: [
        {
          coinDenom: "SCRT",
          coinMinimalDenom: "uscrt",
          coinDecimals: 6,
          coinGeckoId: "secret",
          coinImageUrl: "/tokens/generated/scrt.svg",
          base: "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
          gasPriceStep: {
            low: 0.05,
            average: 0.1,
            high: 0.25,
          },
        },
        {
          type: "secret20",
          coinDenom: "ALTER",
          coinMinimalDenom:
            "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej:ALTER",
          contractAddress: "secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
          coinDecimals: 6,
          coinGeckoId: "alter",
          coinImageUrl: "/tokens/generated/alter.svg",
          base: "ibc/A6383B6CF5EA23E067666C06BC34E2A96869927BD9744DC0C1643E589C710AA3",
        },
        {
          type: "secret20",
          coinDenom: "BUTT",
          coinMinimalDenom:
            "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt:BUTT",
          contractAddress: "secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/butt.svg",
          base: "ibc/1FBA9E763B8679BEF7BAAAF2D16BCA78C3B297D226C3F31312C769D7B8F992D8",
        },
        {
          type: "secret20",
          coinDenom: "SHD(old)",
          coinMinimalDenom:
            "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d:SHD(old)",
          contractAddress: "secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
          coinDecimals: 8,
          coinImageUrl: "/tokens/generated/shd(old).svg",
          base: "ibc/71055835C7639739EAE03AACD1324FE162DBA41D09F197CB72D966D014225B1C",
        },
        {
          type: "secret20",
          coinDenom: "SIENNA",
          coinMinimalDenom:
            "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4:SIENNA",
          contractAddress: "secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
          coinDecimals: 18,
          coinGeckoId: "sienna",
          coinImageUrl: "/tokens/generated/sienna.svg",
          base: "ibc/9A8A93D04917A149C8AC7C16D3DA8F470D59E8D867499C4DA97450E1D7363213",
        },
        {
          type: "secret20",
          coinDenom: "stkd-SCRT",
          coinMinimalDenom:
            "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4:stkd-SCRT",
          contractAddress: "secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
          coinDecimals: 6,
          coinGeckoId: "stkd-scrt",
          coinImageUrl: "/tokens/generated/stkd-scrt.svg",
          base: "ibc/D0E5BF2940FB58D9B283A339032DE88111407AAD7D94A7F1F3EB78874F8616D4",
        },
        {
          type: "secret20",
          coinDenom: "AMBER",
          coinMinimalDenom:
            "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852:AMBER",
          contractAddress: "secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/amber.svg",
          base: "ibc/18A1B70E3205A48DE8590C0D11030E7146CDBF1048789261D53FFFD7527F8B55",
        },
        {
          type: "secret20",
          coinDenom: "SILK",
          coinMinimalDenom:
            "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd:SILK",
          contractAddress: "secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
          coinDecimals: 6,
          coinGeckoId: "silk-bcec1136-561c-4706-a42c-8b67d0d7f7d2",
          coinImageUrl: "/tokens/generated/silk.svg",
          base: "ibc/8A025A1E70101E39DE0C0F153E582A30806D3DA16795F6D868A3AA247D2DEDF7",
        },
        {
          type: "secret20",
          coinDenom: "SHD",
          coinMinimalDenom:
            "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm:SHD",
          contractAddress: "secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
          coinDecimals: 8,
          coinGeckoId: "shade-protocol",
          coinImageUrl: "/tokens/generated/shd.svg",
          base: "ibc/0B3D528E74E3DEAADF8A68F393887AC7E06028904D02173561B0D27F6E751D0A",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "SCRT",
        coinMinimalDenom: "uscrt",
        coinGeckoId: "secret",
        coinImageUrl: "/tokens/generated/scrt.svg",
        base: "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
      },
      feeCurrencies: [
        {
          coinDenom: "SCRT",
          coinMinimalDenom: "uscrt",
          coinDecimals: 6,
          coinGeckoId: "secret",
          coinImageUrl: "/tokens/generated/scrt.svg",
          base: "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
          gasPriceStep: {
            low: 0.05,
            average: 0.1,
            high: 0.25,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "secret",
        bech32PrefixAccPub: "secretpub",
        bech32PrefixValAddr: "secretvaloper",
        bech32PrefixValPub: "secretvaloperpub",
        bech32PrefixConsAddr: "secretvalcons",
        bech32PrefixConsPub: "secretvalconspub",
      },
      explorerUrlToTx:
        "https://secretnodes.com/secret/chains/secret-4/transactions/{txHash}",
      features: [
        "ibc-transfer",
        "ibc-go",
        "secretwasm",
        "cosmwasm",
        "wasmd_0.24+",
      ],
    },
  },
  {
    chain_name: "akash",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Akash",
    chain_id: "akashnet-2",
    bech32_prefix: "akash",
    bech32_config: {
      bech32PrefixAccAddr: "akash",
      bech32PrefixAccPub: "akashpub",
      bech32PrefixValAddr: "akashvaloper",
      bech32PrefixValPub: "akashvaloperpub",
      bech32PrefixConsAddr: "akashvalcons",
      bech32PrefixConsPub: "akashvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uakt",
          fixed_min_gas_price: 0.00025,
          low_gas_price: 0.00025,
          average_gas_price: 0.0025,
          high_gas_price: 0.025,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uakt",
        },
      ],
    },
    description:
      "Akash is open-source Supercloud that lets users buy and sell computing resources securely and efficiently. Purpose-built for public utility.",
    apis: {
      rpc: [
        {
          address: "https://rpc-akash.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-akash.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/akash/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.svg",
      theme: {
        primary_color_hex: "#bc342c",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-akash.keplr.app",
      rest: "https://lcd-akash.keplr.app",
      chainId: "akashnet-2",
      chainName: "akash",
      prettyChainName: "Akash",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "AKT",
          coinMinimalDenom: "uakt",
          coinDecimals: 6,
          coinGeckoId: "akash-network",
          coinImageUrl: "/tokens/generated/akt.svg",
          base: "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
          gasPriceStep: {
            low: 0.00025,
            average: 0.0025,
            high: 0.025,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "AKT",
        coinMinimalDenom: "uakt",
        coinGeckoId: "akash-network",
        coinImageUrl: "/tokens/generated/akt.svg",
        base: "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
      },
      feeCurrencies: [
        {
          coinDenom: "AKT",
          coinMinimalDenom: "uakt",
          coinDecimals: 6,
          coinGeckoId: "akash-network",
          coinImageUrl: "/tokens/generated/akt.svg",
          base: "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
          gasPriceStep: {
            low: 0.00025,
            average: 0.0025,
            high: 0.025,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "akash",
        bech32PrefixAccPub: "akashpub",
        bech32PrefixValAddr: "akashvaloper",
        bech32PrefixValPub: "akashvaloperpub",
        bech32PrefixConsAddr: "akashvalcons",
        bech32PrefixConsPub: "akashvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/akash/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "regen",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Regen",
    chain_id: "regen-1",
    bech32_prefix: "regen",
    bech32_config: {
      bech32PrefixAccAddr: "regen",
      bech32PrefixAccPub: "regenpub",
      bech32PrefixValAddr: "regenvaloper",
      bech32PrefixValPub: "regenvaloperpub",
      bech32PrefixConsAddr: "regenvalcons",
      bech32PrefixConsPub: "regenvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uregen",
          low_gas_price: 0.015,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uregen",
        },
      ],
    },
    description:
      "Regen Network, a platform to originate and invest in high-integrity carbon and biodiversity credits from ecological regeneration projects.",
    apis: {
      rpc: [
        {
          address: "https://rpc-regen.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-regen.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://regen.aneka.io/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.svg",
      theme: {
        primary_color_hex: "#56b790",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc-regen.keplr.app",
      rest: "https://lcd-regen.keplr.app",
      chainId: "regen-1",
      chainName: "regen",
      prettyChainName: "Regen",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "REGEN",
          coinMinimalDenom: "uregen",
          coinDecimals: 6,
          coinGeckoId: "regen",
          coinImageUrl: "/tokens/generated/regen.svg",
          base: "ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076",
          gasPriceStep: {
            low: 0.015,
            average: 0.025,
            high: 0.04,
          },
        },
        {
          coinDenom: "NCT",
          coinMinimalDenom: "eco.uC.NCT",
          coinDecimals: 6,
          coinGeckoId: "toucan-protocol-nature-carbon-tonne",
          coinImageUrl: "/tokens/generated/nct.svg",
          base: "ibc/A76EB6ECF4E3E2D4A23C526FD1B48FDD42F171B206C9D2758EF778A7826ADD68",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "REGEN",
        coinMinimalDenom: "uregen",
        coinGeckoId: "regen",
        coinImageUrl: "/tokens/generated/regen.svg",
        base: "ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076",
      },
      feeCurrencies: [
        {
          coinDenom: "REGEN",
          coinMinimalDenom: "uregen",
          coinDecimals: 6,
          coinGeckoId: "regen",
          coinImageUrl: "/tokens/generated/regen.svg",
          base: "ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076",
          gasPriceStep: {
            low: 0.015,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "regen",
        bech32PrefixAccPub: "regenpub",
        bech32PrefixValAddr: "regenvaloper",
        bech32PrefixValPub: "regenvaloperpub",
        bech32PrefixConsAddr: "regenvalcons",
        bech32PrefixConsPub: "regenvalconspub",
      },
      explorerUrlToTx: "https://regen.aneka.io/txs/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "sentinel",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Sentinel",
    chain_id: "sentinelhub-2",
    bech32_prefix: "sent",
    bech32_config: {
      bech32PrefixAccAddr: "sent",
      bech32PrefixAccPub: "sentpub",
      bech32PrefixValAddr: "sentvaloper",
      bech32PrefixValPub: "sentvaloperpub",
      bech32PrefixConsAddr: "sentvalcons",
      bech32PrefixConsPub: "sentvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "udvpn",
          low_gas_price: 0.1,
          average_gas_price: 0.25,
          high_gas_price: 0.4,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "udvpn",
        },
      ],
    },
    description:
      "The Sentinel ecosystem is a global network of autonomous dVPN applications that enable private and censorship resistant internet access.",
    apis: {
      rpc: [
        {
          address: "https://rpc-sentinel.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-sentinel.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/sentinel/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sentinel/images/dvpn.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sentinel/images/dvpn.svg",
      theme: {
        primary_color_hex: "#10a7ef",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-sentinel.keplr.app",
      rest: "https://lcd-sentinel.keplr.app",
      chainId: "sentinelhub-2",
      chainName: "sentinel",
      prettyChainName: "Sentinel",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "DVPN",
          coinMinimalDenom: "udvpn",
          coinDecimals: 6,
          coinGeckoId: "sentinel",
          coinImageUrl: "/tokens/generated/dvpn.svg",
          base: "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
          gasPriceStep: {
            low: 0.1,
            average: 0.25,
            high: 0.4,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "DVPN",
        coinMinimalDenom: "udvpn",
        coinGeckoId: "sentinel",
        coinImageUrl: "/tokens/generated/dvpn.svg",
        base: "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
      },
      feeCurrencies: [
        {
          coinDenom: "DVPN",
          coinMinimalDenom: "udvpn",
          coinDecimals: 6,
          coinGeckoId: "sentinel",
          coinImageUrl: "/tokens/generated/dvpn.svg",
          base: "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
          gasPriceStep: {
            low: 0.1,
            average: 0.25,
            high: 0.4,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "sent",
        bech32PrefixAccPub: "sentpub",
        bech32PrefixValAddr: "sentvaloper",
        bech32PrefixValPub: "sentvaloperpub",
        bech32PrefixConsAddr: "sentvalcons",
        bech32PrefixConsPub: "sentvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/sentinel/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "persistence",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Persistence",
    chain_id: "core-1",
    bech32_prefix: "persistence",
    bech32_config: {
      bech32PrefixAccAddr: "persistence",
      bech32PrefixAccPub: "persistencepub",
      bech32PrefixValAddr: "persistencevaloper",
      bech32PrefixValPub: "persistencevaloperpub",
      bech32PrefixConsAddr: "persistencevalcons",
      bech32PrefixConsPub: "persistencevalconspub",
    },
    slip44: 118,
    alternative_slip44s: [750],
    fees: {
      fee_tokens: [
        {
          denom: "uxprt",
          fixed_min_gas_price: 0,
          low_gas_price: 0,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uxprt",
        },
      ],
      lock_duration: {
        time: "1814400s",
      },
    },
    description:
      "Persistence is an app chain for Liquid Staking powering an ecosystem of DeFi applications focused on unlocking the liquidity of staked assets.",
    apis: {
      rpc: [
        {
          address: "https://rpc-persistence.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-persistence.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/persistence/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.svg",
      theme: {
        primary_color_hex: "#f95d64",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-persistence.keplr.app",
      rest: "https://lcd-persistence.keplr.app",
      chainId: "core-1",
      chainName: "persistence",
      prettyChainName: "Persistence",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "XPRT",
          coinMinimalDenom: "uxprt",
          coinDecimals: 6,
          coinGeckoId: "persistence",
          coinImageUrl: "/tokens/generated/xprt.svg",
          base: "ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293",
        },
        {
          coinDenom: "PSTAKE",
          coinMinimalDenom:
            "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
          coinDecimals: 18,
          coinGeckoId: "pstake-finance",
          coinImageUrl: "/tokens/generated/pstake.svg",
          base: "ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961",
        },
        {
          coinDenom: "stkATOM",
          coinMinimalDenom: "stk/uatom",
          coinDecimals: 6,
          coinGeckoId: "stkatom",
          coinImageUrl: "/tokens/generated/stkatom.svg",
          base: "ibc/CAA179E40F0266B0B29FB5EAA288FB9212E628822265D4141EBD1C47C3CBFCBC",
        },
        {
          coinDenom: "stkOSMO",
          coinMinimalDenom: "stk/uosmo",
          coinDecimals: 6,
          coinGeckoId: "pstake-staked-osmo",
          coinImageUrl: "/tokens/generated/stkosmo.svg",
          base: "ibc/ECBE78BF7677320A93E7BA1761D144BCBF0CBC247C290C049655E106FE5DC68E",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "XPRT",
        coinMinimalDenom: "uxprt",
        coinGeckoId: "persistence",
        coinImageUrl: "/tokens/generated/xprt.svg",
        base: "ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293",
      },
      feeCurrencies: [
        {
          coinDenom: "XPRT",
          coinMinimalDenom: "uxprt",
          coinDecimals: 6,
          coinGeckoId: "persistence",
          coinImageUrl: "/tokens/generated/xprt.svg",
          base: "ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293",
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "persistence",
        bech32PrefixAccPub: "persistencepub",
        bech32PrefixValAddr: "persistencevaloper",
        bech32PrefixValPub: "persistencevaloperpub",
        bech32PrefixConsAddr: "persistencevalcons",
        bech32PrefixConsPub: "persistencevalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/persistence/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "irisnet",
    status: "live",
    network_type: "mainnet",
    pretty_name: "IRISnet",
    chain_id: "irishub-1",
    bech32_prefix: "iaa",
    bech32_config: {
      bech32PrefixAccAddr: "iaa",
      bech32PrefixAccPub: "iaapub",
      bech32PrefixValAddr: "iaavaloper",
      bech32PrefixValPub: "iaavaloperpub",
      bech32PrefixConsAddr: "iaavalcons",
      bech32PrefixConsPub: "iaavalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uiris",
          low_gas_price: 0.2,
          average_gas_price: 0.3,
          high_gas_price: 0.4,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uiris",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc-iris.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-iris.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/iris/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/irisnet/images/iris.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/irisnet/images/iris.svg",
      theme: {
        primary_color_hex: "#5664ad",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc-iris.keplr.app",
      rest: "https://lcd-iris.keplr.app",
      chainId: "irishub-1",
      chainName: "irisnet",
      prettyChainName: "IRISnet",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "IRIS",
          coinMinimalDenom: "uiris",
          coinDecimals: 6,
          coinGeckoId: "iris-network",
          coinImageUrl: "/tokens/generated/iris.svg",
          base: "ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0",
          gasPriceStep: {
            low: 0.2,
            average: 0.3,
            high: 0.4,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "IRIS",
        coinMinimalDenom: "uiris",
        coinGeckoId: "iris-network",
        coinImageUrl: "/tokens/generated/iris.svg",
        base: "ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0",
      },
      feeCurrencies: [
        {
          coinDenom: "IRIS",
          coinMinimalDenom: "uiris",
          coinDecimals: 6,
          coinGeckoId: "iris-network",
          coinImageUrl: "/tokens/generated/iris.svg",
          base: "ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0",
          gasPriceStep: {
            low: 0.2,
            average: 0.3,
            high: 0.4,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "iaa",
        bech32PrefixAccPub: "iaapub",
        bech32PrefixValAddr: "iaavaloper",
        bech32PrefixValPub: "iaavaloperpub",
        bech32PrefixConsAddr: "iaavalcons",
        bech32PrefixConsPub: "iaavalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/iris/txs/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "cryptoorgchain",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Cronos POS Chain",
    chain_id: "crypto-org-chain-mainnet-1",
    bech32_prefix: "cro",
    bech32_config: {
      bech32PrefixAccAddr: "cro",
      bech32PrefixAccPub: "cropub",
      bech32PrefixValAddr: "crovaloper",
      bech32PrefixValPub: "crovaloperpub",
      bech32PrefixConsAddr: "crovalcons",
      bech32PrefixConsPub: "crovalconspub",
    },
    slip44: 394,
    alternative_slip44s: [118],
    fees: {
      fee_tokens: [
        {
          denom: "basecro",
          low_gas_price: 0.025,
          average_gas_price: 0.03,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "basecro",
        },
      ],
    },
    description:
      "Cronos PoS Chain is a public, open-source and permissionless blockchain - a fully decentralized network with high speed and low fees, designed to be a public good that helps drive mass adoption of blockchain technology through use cases like Payments, DeFi and NFTs.",
    apis: {
      rpc: [
        {
          address: "https://rpc-crypto-org.keplr.app/",
        },
      ],
      rest: [
        {
          address: "https://lcd-crypto-org.keplr.app/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/crypto-org/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cryptoorgchain/images/cronos.png",
      theme: {
        primary_color_hex: "#0c2c71",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc-crypto-org.keplr.app/",
      rest: "https://lcd-crypto-org.keplr.app/",
      chainId: "crypto-org-chain-mainnet-1",
      chainName: "cryptoorgchain",
      prettyChainName: "Cronos POS Chain",
      bip44: {
        coinType: 394,
      },
      currencies: [
        {
          coinDenom: "CRO",
          coinMinimalDenom: "basecro",
          coinDecimals: 8,
          coinGeckoId: "crypto-com-chain",
          coinImageUrl: "/tokens/generated/cro.svg",
          base: "ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1",
          gasPriceStep: {
            low: 0.025,
            average: 0.03,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 8,
        coinDenom: "CRO",
        coinMinimalDenom: "basecro",
        coinGeckoId: "crypto-com-chain",
        coinImageUrl: "/tokens/generated/cro.svg",
        base: "ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1",
      },
      feeCurrencies: [
        {
          coinDenom: "CRO",
          coinMinimalDenom: "basecro",
          coinDecimals: 8,
          coinGeckoId: "crypto-com-chain",
          coinImageUrl: "/tokens/generated/cro.svg",
          base: "ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1",
          gasPriceStep: {
            low: 0.025,
            average: 0.03,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "cro",
        bech32PrefixAccPub: "cropub",
        bech32PrefixValAddr: "crovaloper",
        bech32PrefixValPub: "crovaloperpub",
        bech32PrefixConsAddr: "crovalcons",
        bech32PrefixConsPub: "crovalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/crypto-org/txs/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "starname",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Starname",
    chain_id: "iov-mainnet-ibc",
    bech32_prefix: "star",
    bech32_config: {
      bech32PrefixAccAddr: "star",
      bech32PrefixAccPub: "starpub",
      bech32PrefixValAddr: "starvaloper",
      bech32PrefixValPub: "starvaloperpub",
      bech32PrefixConsAddr: "starvalcons",
      bech32PrefixConsPub: "starvalconspub",
    },
    slip44: 234,
    alternative_slip44s: [118],
    fees: {
      fee_tokens: [
        {
          denom: "uiov",
          low_gas_price: 1,
          average_gas_price: 2,
          high_gas_price: 3,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uiov",
        },
      ],
    },
    description:
      "Starname is the best way to claim your part of the blockchain. You can use it for decentralized identification, payments, ownership and applications. Starname can be integrated into digital wallets, dapps and exchanges.",
    apis: {
      rpc: [
        {
          address: "https://rpc-iov.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-iov.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/starname/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/starname/images/iov.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/starname/images/iov.svg",
      theme: {
        primary_color_hex: "#5c64b4",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc-iov.keplr.app",
      rest: "https://lcd-iov.keplr.app",
      chainId: "iov-mainnet-ibc",
      chainName: "starname",
      prettyChainName: "Starname",
      bip44: {
        coinType: 234,
      },
      currencies: [
        {
          coinDenom: "IOV",
          coinMinimalDenom: "uiov",
          coinDecimals: 6,
          coinGeckoId: "starname",
          coinImageUrl: "/tokens/generated/iov.svg",
          base: "ibc/52B1AA623B34EB78FD767CEA69E8D7FA6C9CFE1FBF49C5406268FD325E2CC2AC",
          gasPriceStep: {
            low: 1,
            average: 2,
            high: 3,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "IOV",
        coinMinimalDenom: "uiov",
        coinGeckoId: "starname",
        coinImageUrl: "/tokens/generated/iov.svg",
        base: "ibc/52B1AA623B34EB78FD767CEA69E8D7FA6C9CFE1FBF49C5406268FD325E2CC2AC",
      },
      feeCurrencies: [
        {
          coinDenom: "IOV",
          coinMinimalDenom: "uiov",
          coinDecimals: 6,
          coinGeckoId: "starname",
          coinImageUrl: "/tokens/generated/iov.svg",
          base: "ibc/52B1AA623B34EB78FD767CEA69E8D7FA6C9CFE1FBF49C5406268FD325E2CC2AC",
          gasPriceStep: {
            low: 1,
            average: 2,
            high: 3,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "star",
        bech32PrefixAccPub: "starpub",
        bech32PrefixValAddr: "starvaloper",
        bech32PrefixValPub: "starvaloperpub",
        bech32PrefixConsAddr: "starvalcons",
        bech32PrefixConsPub: "starvalconspub",
      },
      explorerUrlToTx: "https://ping.pub/starname/tx/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "emoney",
    status: "live",
    network_type: "mainnet",
    pretty_name: "e-Money",
    chain_id: "emoney-3",
    bech32_prefix: "emoney",
    bech32_config: {
      bech32PrefixAccAddr: "emoney",
      bech32PrefixAccPub: "emoneypub",
      bech32PrefixValAddr: "emoneyvaloper",
      bech32PrefixValPub: "emoneyvaloperpub",
      bech32PrefixConsAddr: "emoneyvalcons",
      bech32PrefixConsPub: "emoneyvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ungm",
          low_gas_price: 1,
          average_gas_price: 1,
          high_gas_price: 1,
        },
        {
          denom: "eeur",
          low_gas_price: 1,
          average_gas_price: 1,
          high_gas_price: 1,
        },
        {
          denom: "echf",
          low_gas_price: 1,
          average_gas_price: 1,
          high_gas_price: 1,
        },
        {
          denom: "enok",
          low_gas_price: 1,
          average_gas_price: 1,
          high_gas_price: 1,
        },
        {
          denom: "esek",
          low_gas_price: 1,
          average_gas_price: 1,
          high_gas_price: 1,
        },
        {
          denom: "edkk",
          low_gas_price: 1,
          average_gas_price: 1,
          high_gas_price: 1,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ungm",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://emoney.validator.network",
        },
      ],
      rest: [
        {
          address: "https://emoney.validator.network/api",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/emoney/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/ngm.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/ngm.svg",
      theme: {
        primary_color_hex: "#caf2ea",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://emoney.validator.network",
      rest: "https://emoney.validator.network/api",
      chainId: "emoney-3",
      chainName: "emoney",
      prettyChainName: "e-Money",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "NGM",
          coinMinimalDenom: "ungm",
          coinDecimals: 6,
          coinGeckoId: "e-money",
          coinImageUrl: "/tokens/generated/ngm.svg",
          base: "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
          gasPriceStep: {
            low: 1,
            average: 1,
            high: 1,
          },
        },
        {
          coinDenom: "EEUR",
          coinMinimalDenom: "eeur",
          coinDecimals: 6,
          coinGeckoId: "e-money-eur",
          coinImageUrl: "/tokens/generated/eeur.svg",
          base: "ibc/5973C068568365FFF40DEDCF1A1CB7582B6116B731CD31A12231AE25E20B871F",
          gasPriceStep: {
            low: 1,
            average: 1,
            high: 1,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "NGM",
        coinMinimalDenom: "ungm",
        coinGeckoId: "e-money",
        coinImageUrl: "/tokens/generated/ngm.svg",
        base: "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
      },
      feeCurrencies: [
        {
          coinDenom: "NGM",
          coinMinimalDenom: "ungm",
          coinDecimals: 6,
          coinGeckoId: "e-money",
          coinImageUrl: "/tokens/generated/ngm.svg",
          base: "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
          gasPriceStep: {
            low: 1,
            average: 1,
            high: 1,
          },
        },
        {
          coinDenom: "EEUR",
          coinMinimalDenom: "eeur",
          coinDecimals: 6,
          coinGeckoId: "e-money-eur",
          coinImageUrl: "/tokens/generated/eeur.svg",
          base: "ibc/5973C068568365FFF40DEDCF1A1CB7582B6116B731CD31A12231AE25E20B871F",
          gasPriceStep: {
            low: 1,
            average: 1,
            high: 1,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "emoney",
        bech32PrefixAccPub: "emoneypub",
        bech32PrefixValAddr: "emoneyvaloper",
        bech32PrefixValPub: "emoneyvaloperpub",
        bech32PrefixConsAddr: "emoneyvalcons",
        bech32PrefixConsPub: "emoneyvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/emoney/tx/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "juno",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Juno",
    chain_id: "juno-1",
    bech32_prefix: "juno",
    bech32_config: {
      bech32PrefixAccAddr: "juno",
      bech32PrefixAccPub: "junopub",
      bech32PrefixValAddr: "junovaloper",
      bech32PrefixValPub: "junovaloperpub",
      bech32PrefixConsAddr: "junovalcons",
      bech32PrefixConsPub: "junovalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ujuno",
          fixed_min_gas_price: 0.075,
          low_gas_price: 0.075,
          average_gas_price: 0.1,
          high_gas_price: 0.125,
        },
        {
          denom:
            "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
          fixed_min_gas_price: 0.003,
          low_gas_price: 0.003,
          average_gas_price: 0.0035,
          high_gas_price: 0.004,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ujuno",
        },
      ],
    },
    description:
      "Juno is a completely community owned and operated smart contract platform.",
    apis: {
      rpc: [
        {
          address: "https://rpc-juno.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-juno.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/juno/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.svg",
      theme: {
        primary_color_hex: "#fa7b7b",
      },
    },
    features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
    keplrChain: {
      rpc: "https://rpc-juno.keplr.app",
      rest: "https://lcd-juno.keplr.app",
      chainId: "juno-1",
      chainName: "juno",
      prettyChainName: "Juno",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "JUNO",
          coinMinimalDenom: "ujuno",
          coinDecimals: 6,
          coinGeckoId: "juno-network",
          coinImageUrl: "/tokens/generated/juno.svg",
          base: "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
          gasPriceStep: {
            low: 0.075,
            average: 0.1,
            high: 0.125,
          },
        },
        {
          type: "cw20",
          coinDenom: "MARBLE",
          coinMinimalDenom:
            "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl:MARBLE",
          contractAddress:
            "juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          coinDecimals: 3,
          coinImageUrl: "/tokens/generated/marble.svg",
          base: "ibc/F6B691D5F7126579DDC87357B09D653B47FDCE0A3383FF33C8D8B544FE29A8A6",
        },
        {
          type: "cw20",
          coinDenom: "NETA",
          coinMinimalDenom:
            "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr:NETA",
          contractAddress:
            "juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          coinDecimals: 6,
          coinGeckoId: "neta",
          coinImageUrl: "/tokens/generated/neta.svg",
          base: "ibc/297C64CC42B5A8D8F82FE2EBE208A6FE8F94B86037FA28C4529A23701C228F7A",
        },
        {
          type: "cw20",
          coinDenom: "HOPE",
          coinMinimalDenom:
            "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z:HOPE",
          contractAddress:
            "juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/hope.svg",
          base: "ibc/C2A2E9CA95DDD4828B75124B5E27B8401C7D8493BC48353D418CBFC04565899B",
        },
        {
          type: "cw20",
          coinDenom: "RAC.juno",
          coinMinimalDenom:
            "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa:RAC.juno",
          contractAddress:
            "juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          coinDecimals: 6,
          coinGeckoId: "racoon",
          coinImageUrl: "/tokens/generated/rac.juno.svg",
          base: "ibc/6BDB4C8CCD45033F9604E4B93ED395008A753E01EECD6992E7D1EA23D9D3B788",
        },
        {
          type: "cw20",
          coinDenom: "BLOCK",
          coinMinimalDenom:
            "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq:BLOCK",
          contractAddress:
            "juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/block.svg",
          base: "ibc/DB9755CB6FE55192948AE074D18FA815E1429D3D374D5BDA8D89623C6CF235C3",
        },
        {
          type: "cw20",
          coinDenom: "DHK",
          coinMinimalDenom:
            "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49:DHK",
          contractAddress:
            "juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          coinDecimals: 0,
          coinImageUrl: "/tokens/generated/dhk.svg",
          base: "ibc/52E12CF5CA2BB903D84F5298B4BFD725D66CAB95E09AA4FC75B2904CA5485FEB",
        },
        {
          type: "cw20",
          coinDenom: "RAW",
          coinMinimalDenom:
            "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g:RAW",
          contractAddress:
            "juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/raw.svg",
          base: "ibc/00B6E60AD3D65CBEF5579AC8AF609527C0B57535B6E32D96C80A735344FD9DCC",
        },
        {
          type: "cw20",
          coinDenom: "ASVT",
          coinMinimalDenom:
            "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w:ASVT",
          contractAddress:
            "juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/asvt.png",
          base: "ibc/AA1C80225BCA7B32ED1FC6ABF8B8E899BEB48ECDB4B417FD69873C6D715F97E7",
        },
        {
          type: "cw20",
          coinDenom: "JOE",
          coinMinimalDenom:
            "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3:JOE",
          contractAddress:
            "juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/joe.png",
          base: "ibc/0CB9DB3441D0D50F35699DEE22B9C965487E83FB2D9F483D1CC5CA34E856C484",
        },
        {
          type: "cw20",
          coinDenom: "GLTO.juno",
          coinMinimalDenom:
            "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se:GLTO.juno",
          contractAddress:
            "juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/glto.juno.svg",
          base: "ibc/52C57FCA7D6854AA178E7A183DDBE4EF322B904B1D719FC485F6FFBC1F72A19E",
        },
        {
          type: "cw20",
          coinDenom: "GKEY",
          coinMinimalDenom:
            "cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh:GKEY",
          contractAddress:
            "juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/gkey.svg",
          base: "ibc/7C781B4C2082CD62129A972D47486D78EC17155C299270E3C89348EA026BEAF8",
        },
        {
          type: "cw20",
          coinDenom: "SEJUNO",
          coinMinimalDenom:
            "cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv:SEJUNO",
          contractAddress:
            "juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sejuno.svg",
          base: "ibc/C6B6BFCB6EE49A7CAB1A7E7B021DE35B99D525AC660844952F0F6C78DCB2A57B",
        },
        {
          type: "cw20",
          coinDenom: "BJUNO",
          coinMinimalDenom:
            "cw20:juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3:BJUNO",
          contractAddress:
            "juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/bjuno.svg",
          base: "ibc/C2DF5C3949CA835B221C575625991F09BAB4E48FB9C11A4EE357194F736111E3",
        },
        {
          type: "cw20",
          coinDenom: "SOLAR",
          coinMinimalDenom:
            "cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse:SOLAR",
          contractAddress:
            "juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/solar.svg",
          base: "ibc/C3FC4DED273E7D1DD2E7BAA3317EC9A53CD3252B577AA33DC00D9DF2BDF3ED5C",
        },
        {
          type: "cw20",
          coinDenom: "SEASY",
          coinMinimalDenom:
            "cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf:SEASY",
          contractAddress:
            "juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/seasy.svg",
          base: "ibc/18A676A074F73B9B42DA4F9DFC8E5AEF334C9A6636DDEC8D34682F52F1DECDF6",
        },
        {
          type: "cw20",
          coinDenom: "MUSE",
          coinMinimalDenom:
            "cw20:juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3:MUSE",
          contractAddress:
            "juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/muse.png",
          base: "ibc/6B982170CE024689E8DD0E7555B129B488005130D4EDA426733D552D10B36D8F",
        },
        {
          type: "cw20",
          coinDenom: "FURY.juno",
          coinMinimalDenom:
            "cw20:juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz:FURY.juno",
          contractAddress:
            "juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/fury.juno.png",
          base: "ibc/7CE5F388D661D82A0774E47B5129DA51CC7129BD1A70B5FA6BCEBB5B0A2FAEAF",
        },
        {
          type: "cw20",
          coinDenom: "PHMN",
          coinMinimalDenom:
            "cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l:PHMN",
          contractAddress:
            "juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l",
          coinDecimals: 6,
          coinGeckoId: "posthuman",
          coinImageUrl: "/tokens/generated/phmn.svg",
          base: "ibc/D3B574938631B0A1BA704879020C696E514CFADAA7643CDE4BD5EB010BDE327B",
        },
        {
          type: "cw20",
          coinDenom: "HOPERS",
          coinMinimalDenom:
            "cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n:HOPERS",
          contractAddress:
            "juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/hopers.svg",
          base: "ibc/D3ADAF73F84CDF205BCB72C142FDAEEA2C612AB853CEE6D6C06F184FA38B1099",
        },
        {
          type: "cw20",
          coinDenom: "WYND",
          coinMinimalDenom:
            "cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9:WYND",
          contractAddress:
            "juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/wynd.svg",
          base: "ibc/2FBAC4BF296D7844796844B35978E5899984BA5A6314B2DD8F83C215550010B3",
        },
        {
          type: "cw20",
          coinDenom: "NRIDE",
          coinMinimalDenom:
            "cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq:NRIDE",
          contractAddress:
            "juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/nride.svg",
          base: "ibc/E750D31033DC1CF4A044C3AA0A8117401316DC918FBEBC4E3D34F91B09D5F54C",
        },
        {
          type: "cw20",
          coinDenom: "FOX",
          coinMinimalDenom:
            "cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x:FOX",
          contractAddress:
            "juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/fox.png",
          base: "ibc/4F24D904BAB5FFBD3524F2DE3EC3C7A9E687A2408D9A985E57B356D9FA9201C6",
        },
        {
          type: "cw20",
          coinDenom: "GRDN",
          coinMinimalDenom:
            "cw20:juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma:GRDN",
          contractAddress:
            "juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/grdn.png",
          base: "ibc/BAC9C6998F1F5C316D3353622EAEDAF8BD00FAABEB374FECDF8C9BC475172CFA",
        },
        {
          type: "cw20",
          coinDenom: "MNPU",
          coinMinimalDenom:
            "cw20:juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my:MNPU",
          contractAddress:
            "juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/mnpu.svg",
          base: "ibc/DC0D3303BBE739E073224D0314385B88B247F56D71D726A91414CCA244FFFE7E",
        },
        {
          type: "cw20",
          coinDenom: "SHIBAC",
          coinMinimalDenom:
            "cw20:juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z:SHIBAC",
          contractAddress:
            "juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/shibac.png",
          base: "ibc/447A0DCE83691056289503DDAB8EB08E52E167A73629F2ACC59F056B92F51CE8",
        },
        {
          type: "cw20",
          coinDenom: "SKOJ",
          coinMinimalDenom:
            "cw20:juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp:SKOJ",
          contractAddress:
            "juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/skoj.svg",
          base: "ibc/71066B030D8FC6479E638580E1BA9C44925E8C1F6E45036669D22017CFDC8C5E",
        },
        {
          type: "cw20",
          coinDenom: "CLST",
          coinMinimalDenom:
            "cw20:juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg:CLST",
          contractAddress:
            "juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/clst.png",
          base: "ibc/0E4FA664327BD40B32803EE84A77F145834C0281B7F82B65521333B3669FA0BA",
        },
        {
          type: "cw20",
          coinDenom: "OSDOGE",
          coinMinimalDenom:
            "cw20:juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je:OSDOGE",
          contractAddress:
            "juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/osdoge.png",
          base: "ibc/8AEEA9B9304392070F72611076C0E328CE3F2DECA1E18557E36F9DB4F09C0156",
        },
        {
          type: "cw20",
          coinDenom: "APEMOS",
          coinMinimalDenom:
            "cw20:juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06:APEMOS",
          contractAddress:
            "juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/apemos.png",
          base: "ibc/1EB03F13F29FEA73444586FC4E88A8C14ACE9291501E9658E3BEF951EA4AC85D",
        },
        {
          type: "cw20",
          coinDenom: "INVDRS",
          coinMinimalDenom:
            "cw20:juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8:INVDRS",
          contractAddress:
            "juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/invdrs.png",
          base: "ibc/3DB1721541C94AD19D7735FECED74C227E13F925BDB814392980B40A19C1ED54",
        },
        {
          type: "cw20",
          coinDenom: "DOGA",
          coinMinimalDenom:
            "cw20:juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d:DOGA",
          contractAddress:
            "juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/doga.png",
          base: "ibc/04BE4E9C825ED781F9684A1226114BB49607500CAD855F1E3FEEC18532297250",
        },
        {
          type: "cw20",
          coinDenom: "CATMOS",
          coinMinimalDenom:
            "cw20:juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488:CATMOS",
          contractAddress:
            "juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/catmos.png",
          base: "ibc/F4A07138CAEF0BFB4889E03C44C57956A48631061F1C8AB80421C1F229C1B835",
        },
        {
          type: "cw20",
          coinDenom: "SUMMIT",
          coinMinimalDenom:
            "cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm:SUMMIT",
          contractAddress:
            "juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/summit.png",
          base: "ibc/56B988C4D934FB7503F5EA9B440C75D489C8AD5D193715B477BEC4F84B8BBA2A",
        },
        {
          type: "cw20",
          coinDenom: "SPACER",
          coinMinimalDenom:
            "cw20:juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg:SPACER",
          contractAddress:
            "juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/spacer.png",
          base: "ibc/7A496DB7C2277D4B74EC4428DDB5AC8A62816FBD0DEBE1CFE094935D746BE19C",
        },
        {
          type: "cw20",
          coinDenom: "LIGHT",
          coinMinimalDenom:
            "cw20:juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l:LIGHT",
          contractAddress:
            "juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/light.png",
          base: "ibc/3DC08BDF2689978DBCEE28C7ADC2932AA658B2F64B372760FBC5A0058669AD29",
        },
        {
          type: "cw20",
          coinDenom: "MILE",
          coinMinimalDenom:
            "cw20:juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d:MILE",
          contractAddress:
            "juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/mile.png",
          base: "ibc/912275A63A565BFD80734AEDFFB540132C51E446EAC41483B26EDE8A557C71CF",
        },
        {
          type: "cw20",
          coinDenom: "MANNA",
          coinMinimalDenom:
            "cw20:juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq:MANNA",
          contractAddress:
            "juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/manna.png",
          base: "ibc/980A2748F37C938AD129B92A51E2ABA8CFFC6862ADD61EC1B291125535DBE30B",
        },
        {
          type: "cw20",
          coinDenom: "VOID",
          coinMinimalDenom:
            "cw20:juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8:VOID",
          contractAddress:
            "juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/void.png",
          base: "ibc/593F820ECE676A3E0890C734EC4F3A8DE16EC10A54EEDFA8BDFEB40EEA903960",
        },
        {
          type: "cw20",
          coinDenom: "SLCA",
          coinMinimalDenom:
            "cw20:juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux:SLCA",
          contractAddress:
            "juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/slca.png",
          base: "ibc/5164ECF584AD7DC27DA9E6A89E75DAB0F7C4FCB0A624B69215B8BC6A2C40CD07",
        },
        {
          type: "cw20",
          coinDenom: "PEPEC",
          coinMinimalDenom:
            "cw20:juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k:PEPEC",
          contractAddress:
            "juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/pepec.png",
          base: "ibc/C00B17F74C94449A62935B4C886E6F0F643249A270DEF269D53CE6741ECCDB93",
        },
        {
          type: "cw20",
          coinDenom: "CASA",
          coinMinimalDenom:
            "cw20:juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss:CASA",
          contractAddress:
            "juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/casa.png",
          base: "ibc/2F5C084037D951B24D100F15CC013A131DF786DCE1B1DBDC48F018A9B9A138DE",
        },
        {
          type: "cw20",
          coinDenom: "WATR",
          coinMinimalDenom:
            "cw20:juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw:WATR",
          contractAddress:
            "juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/watr.png",
          base: "ibc/AABCB14ACAFD53A5C455BAC01EA0CA5AE18714895846681A52BFF1E3B960B44E",
        },
        {
          coinDenom: "DGL",
          coinMinimalDenom:
            "factory/juno1u805lv20qc6jy7c3ttre7nct6uyl20pfky5r7e/DGL",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/dgl.png",
          base: "ibc/D69F6D787EC649F4E998161A9F0646F4C2DCC64748A2AB982F14CAFBA7CC0EC9",
        },
        {
          type: "cw20",
          coinDenom: "KLEO",
          coinMinimalDenom:
            "cw20:juno10gthz5ufgrpuk5cscve2f0hjp56wgp90psqxcrqlg4m9mcu9dh8q4864xy:KLEO",
          contractAddress:
            "juno10gthz5ufgrpuk5cscve2f0hjp56wgp90psqxcrqlg4m9mcu9dh8q4864xy",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/kleo.png",
          base: "ibc/5F5B7DA5ECC80F6C7A8702D525BB0B74279B1F7B8EFAE36E423D68788F7F39FF",
        },
        {
          type: "cw20",
          coinDenom: "JAPE",
          coinMinimalDenom:
            "cw20:juno1zkwveux7y6fmsr88atf3cyffx96p0c96qr8tgcsj7vfnhx7sal3s3zu3ps:JAPE",
          contractAddress:
            "juno1zkwveux7y6fmsr88atf3cyffx96p0c96qr8tgcsj7vfnhx7sal3s3zu3ps",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/jape.png",
          base: "ibc/176DD560277BB0BD676260BE02EBAB697725CA85144D8A2BF286C6B5323DB5FE",
        },
        {
          type: "cw20",
          coinDenom: "SGNL",
          coinMinimalDenom:
            "cw20:juno14lycavan8gvpjn97aapzvwmsj8kyrvf644p05r0hu79namyj3ens87650k:SGNL",
          contractAddress:
            "juno14lycavan8gvpjn97aapzvwmsj8kyrvf644p05r0hu79namyj3ens87650k",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sgnl.png",
          base: "ibc/4BDADBEDA31899036AB286E9901116496A9D85FB87B35A408C9D67C0DCAC660A",
        },
        {
          type: "cw20",
          coinDenom: "AFA",
          coinMinimalDenom:
            "cw20:juno1spjes0smg5yp40dl7gqyw0h8rn03tnmve06dd2m5acwgh6tlx86swha3xg:AFA",
          contractAddress:
            "juno1spjes0smg5yp40dl7gqyw0h8rn03tnmve06dd2m5acwgh6tlx86swha3xg",
          coinDecimals: 0,
          coinImageUrl: "/tokens/generated/afa.png",
          base: "ibc/0D62E47FDEBBC199D4E1853C0708F0F9337AC62D95B719585C9700E466060995",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "JUNO",
        coinMinimalDenom: "ujuno",
        coinGeckoId: "juno-network",
        coinImageUrl: "/tokens/generated/juno.svg",
        base: "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
      },
      feeCurrencies: [
        {
          coinDenom: "JUNO",
          coinMinimalDenom: "ujuno",
          coinDecimals: 6,
          coinGeckoId: "juno-network",
          coinImageUrl: "/tokens/generated/juno.svg",
          base: "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
          gasPriceStep: {
            low: 0.075,
            average: 0.1,
            high: 0.125,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "juno",
        bech32PrefixAccPub: "junopub",
        bech32PrefixValAddr: "junovaloper",
        bech32PrefixValPub: "junovaloperpub",
        bech32PrefixConsAddr: "junovalcons",
        bech32PrefixConsPub: "junovalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/juno/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
    },
  },
  {
    chain_name: "microtick",
    status: "killed",
    network_type: "mainnet",
    pretty_name: "Microtick",
    chain_id: "microtick-1",
    bech32_prefix: "micro",
    bech32_config: {
      bech32PrefixAccAddr: "micro",
      bech32PrefixAccPub: "micropub",
      bech32PrefixValAddr: "microvaloper",
      bech32PrefixValPub: "microvaloperpub",
      bech32PrefixConsAddr: "microvalcons",
      bech32PrefixConsPub: "microvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "utick",
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "utick",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc-microtick.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-microtick.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.microtick.zone/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/microtick/images/tick.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/microtick/images/tick.svg",
      theme: {
        primary_color_hex: "#6bab14",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc-microtick.keplr.app",
      rest: "https://lcd-microtick.keplr.app",
      chainId: "microtick-1",
      chainName: "microtick",
      prettyChainName: "Microtick",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "TICK",
          coinMinimalDenom: "utick",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/tick.svg",
          base: "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "TICK",
        coinMinimalDenom: "utick",
        coinImageUrl: "/tokens/generated/tick.svg",
        base: "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8",
      },
      feeCurrencies: [
        {
          coinDenom: "TICK",
          coinMinimalDenom: "utick",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/tick.svg",
          base: "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "micro",
        bech32PrefixAccPub: "micropub",
        bech32PrefixValAddr: "microvaloper",
        bech32PrefixValPub: "microvaloperpub",
        bech32PrefixConsAddr: "microvalcons",
        bech32PrefixConsPub: "microvalconspub",
      },
      explorerUrlToTx: "https://explorer.microtick.zone/transactions/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "likecoin",
    status: "live",
    network_type: "mainnet",
    pretty_name: "LikeCoin",
    chain_id: "likecoin-mainnet-2",
    bech32_prefix: "like",
    bech32_config: {
      bech32PrefixAccAddr: "like",
      bech32PrefixAccPub: "likepub",
      bech32PrefixValAddr: "likevaloper",
      bech32PrefixValPub: "likevaloperpub",
      bech32PrefixConsAddr: "likevalcons",
      bech32PrefixConsPub: "likevalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "nanolike",
          fixed_min_gas_price: 1000,
          low_gas_price: 1000,
          average_gas_price: 10000,
          high_gas_price: 1000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "nanolike",
        },
      ],
      lock_duration: {
        time: "1814400s",
      },
    },
    apis: {
      rpc: [
        {
          address: "https://mainnet-node.like.co/rpc",
        },
      ],
      rest: [
        {
          address: "https://mainnet-node.like.co",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://likecoin.bigdipper.live/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/likecoin/images/likecoin-chain-logo.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/likecoin/images/likecoin-chain-logo.svg",
      theme: {
        primary_color_hex: "#2e656d",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://mainnet-node.like.co/rpc",
      rest: "https://mainnet-node.like.co",
      chainId: "likecoin-mainnet-2",
      chainName: "likecoin",
      prettyChainName: "LikeCoin",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "LIKE",
          coinMinimalDenom: "nanolike",
          coinDecimals: 9,
          coinGeckoId: "likecoin",
          coinImageUrl: "/tokens/generated/like.svg",
          base: "ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525",
          gasPriceStep: {
            low: 1000,
            average: 10000,
            high: 1000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 9,
        coinDenom: "LIKE",
        coinMinimalDenom: "nanolike",
        coinGeckoId: "likecoin",
        coinImageUrl: "/tokens/generated/like.svg",
        base: "ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525",
      },
      feeCurrencies: [
        {
          coinDenom: "LIKE",
          coinMinimalDenom: "nanolike",
          coinDecimals: 9,
          coinGeckoId: "likecoin",
          coinImageUrl: "/tokens/generated/like.svg",
          base: "ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525",
          gasPriceStep: {
            low: 1000,
            average: 10000,
            high: 1000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "like",
        bech32PrefixAccPub: "likepub",
        bech32PrefixValAddr: "likevaloper",
        bech32PrefixValPub: "likevaloperpub",
        bech32PrefixConsAddr: "likevalcons",
        bech32PrefixConsPub: "likevalconspub",
      },
      explorerUrlToTx: "https://likecoin.bigdipper.live/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "impacthub",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Impact Hub",
    chain_id: "ixo-5",
    bech32_prefix: "ixo",
    bech32_config: {
      bech32PrefixAccAddr: "ixo",
      bech32PrefixAccPub: "ixopub",
      bech32PrefixValAddr: "ixovaloper",
      bech32PrefixValPub: "ixovaloperpub",
      bech32PrefixConsAddr: "ixovalcons",
      bech32PrefixConsPub: "ixovalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uixo",
          fixed_min_gas_price: 0.025,
          low_gas_price: 0.025,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uixo",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://ixo-rpc.ibs.team",
        },
      ],
      rest: [
        {
          address: "https://ixo-api.ibs.team",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://blockscan.ixo.world/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/impacthub/images/ixo.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/impacthub/images/ixo.svg",
      theme: {
        primary_color_hex: "#2c4484",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://ixo-rpc.ibs.team",
      rest: "https://ixo-api.ibs.team",
      chainId: "ixo-5",
      chainName: "impacthub",
      prettyChainName: "Impact Hub",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "IXO",
          coinMinimalDenom: "uixo",
          coinDecimals: 6,
          coinGeckoId: "ixo",
          coinImageUrl: "/tokens/generated/ixo.svg",
          base: "ibc/F3FF7A84A73B62921538642F9797C423D2B4C4ACB3C7FCFFCE7F12AA69909C4B",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "IXO",
        coinMinimalDenom: "uixo",
        coinGeckoId: "ixo",
        coinImageUrl: "/tokens/generated/ixo.svg",
        base: "ibc/F3FF7A84A73B62921538642F9797C423D2B4C4ACB3C7FCFFCE7F12AA69909C4B",
      },
      feeCurrencies: [
        {
          coinDenom: "IXO",
          coinMinimalDenom: "uixo",
          coinDecimals: 6,
          coinGeckoId: "ixo",
          coinImageUrl: "/tokens/generated/ixo.svg",
          base: "ibc/F3FF7A84A73B62921538642F9797C423D2B4C4ACB3C7FCFFCE7F12AA69909C4B",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "ixo",
        bech32PrefixAccPub: "ixopub",
        bech32PrefixValAddr: "ixovaloper",
        bech32PrefixValPub: "ixovaloperpub",
        bech32PrefixConsAddr: "ixovalcons",
        bech32PrefixConsPub: "ixovalconspub",
      },
      explorerUrlToTx: "https://blockscan.ixo.world/txs/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "bitcanna",
    status: "live",
    network_type: "mainnet",
    pretty_name: "BitCanna",
    chain_id: "bitcanna-1",
    bech32_prefix: "bcna",
    bech32_config: {
      bech32PrefixAccAddr: "bcna",
      bech32PrefixAccPub: "bcnapub",
      bech32PrefixValAddr: "bcnavaloper",
      bech32PrefixValPub: "bcnavaloperpub",
      bech32PrefixConsAddr: "bcnavalcons",
      bech32PrefixConsPub: "bcnavalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ubcna",
          fixed_min_gas_price: 0.001,
          low_gas_price: 0.001,
          average_gas_price: 0.0025,
          high_gas_price: 0.01,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ubcna",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.bitcanna.io",
        },
      ],
      rest: [
        {
          address: "https://lcd.bitcanna.io",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/bitcanna/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.svg",
      theme: {
        primary_color_hex: "#3cc494",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.bitcanna.io",
      rest: "https://lcd.bitcanna.io",
      chainId: "bitcanna-1",
      chainName: "bitcanna",
      prettyChainName: "BitCanna",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "BCNA",
          coinMinimalDenom: "ubcna",
          coinDecimals: 6,
          coinGeckoId: "bitcanna",
          coinImageUrl: "/tokens/generated/bcna.svg",
          base: "ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5",
          gasPriceStep: {
            low: 0.001,
            average: 0.0025,
            high: 0.01,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "BCNA",
        coinMinimalDenom: "ubcna",
        coinGeckoId: "bitcanna",
        coinImageUrl: "/tokens/generated/bcna.svg",
        base: "ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5",
      },
      feeCurrencies: [
        {
          coinDenom: "BCNA",
          coinMinimalDenom: "ubcna",
          coinDecimals: 6,
          coinGeckoId: "bitcanna",
          coinImageUrl: "/tokens/generated/bcna.svg",
          base: "ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5",
          gasPriceStep: {
            low: 0.001,
            average: 0.0025,
            high: 0.01,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "bcna",
        bech32PrefixAccPub: "bcnapub",
        bech32PrefixValAddr: "bcnavaloper",
        bech32PrefixValPub: "bcnavaloperpub",
        bech32PrefixConsAddr: "bcnavalcons",
        bech32PrefixConsPub: "bcnavalconspub",
      },
      explorerUrlToTx: "https://ping.pub/bitcanna/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "bitsong",
    status: "live",
    network_type: "mainnet",
    pretty_name: "BitSong",
    chain_id: "bitsong-2b",
    bech32_prefix: "bitsong",
    bech32_config: {
      bech32PrefixAccAddr: "bitsong",
      bech32PrefixAccPub: "bitsongpub",
      bech32PrefixValAddr: "bitsongvaloper",
      bech32PrefixValPub: "bitsongvaloperpub",
      bech32PrefixConsAddr: "bitsongvalcons",
      bech32PrefixConsPub: "bitsongvalconspub",
    },
    slip44: 639,
    fees: {
      fee_tokens: [
        {
          denom: "ubtsg",
          fixed_min_gas_price: 0,
          low_gas_price: 3,
          average_gas_price: 10,
          high_gas_price: 20,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ubtsg",
        },
      ],
    },
    description:
      "Artists, Fans, Managers and Labels in One Single Holistic Ecosystem: $BTSG. Earn real-time royalties, discover exclusive content, mint and trade Fantokens, buy & sell NFTs.",
    apis: {
      rpc: [
        {
          address: "https://rpc.explorebitsong.com",
        },
      ],
      rest: [
        {
          address: "https://lcd.explorebitsong.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/bitsong/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/btsg.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/btsg.svg",
      theme: {
        primary_color_hex: "#c8307f",
      },
    },
    features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
    keplrChain: {
      rpc: "https://rpc.explorebitsong.com",
      rest: "https://lcd.explorebitsong.com",
      chainId: "bitsong-2b",
      chainName: "bitsong",
      prettyChainName: "BitSong",
      bip44: {
        coinType: 639,
      },
      currencies: [
        {
          coinDenom: "BTSG",
          coinMinimalDenom: "ubtsg",
          coinDecimals: 6,
          coinGeckoId: "bitsong",
          coinImageUrl: "/tokens/generated/btsg.svg",
          base: "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
          gasPriceStep: {
            low: 3,
            average: 10,
            high: 20,
          },
        },
        {
          coinDenom: "CLAY",
          coinMinimalDenom: "ft2D8E7041556CE93E1EFD66C07C45D551A6AAAE09",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/clay.png",
          base: "ibc/7ABF696369EFB3387DF22B6A24204459FE5EFD010220E8E5618DC49DB877047B",
        },
        {
          coinDenom: "404DR",
          coinMinimalDenom: "ft99091610CCC66F4277C66D14AF2BC4C5EE52E27A",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/404dr.png",
          base: "ibc/B797E4F42CD33C50511B341E50C5CC0E8EF0D93B1E1247ABAA071583B8619202",
        },
        {
          coinDenom: "N43",
          coinMinimalDenom: "ft387C1C279D962ED80C09C1D592A92C4275FD7C5D",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/n43.png",
          base: "ibc/E4FFAACCDB7D55CE2D257DF637C00158CB841F11D0013B2D03E31FF7800A2C58",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "BTSG",
        coinMinimalDenom: "ubtsg",
        coinGeckoId: "bitsong",
        coinImageUrl: "/tokens/generated/btsg.svg",
        base: "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
      },
      feeCurrencies: [
        {
          coinDenom: "BTSG",
          coinMinimalDenom: "ubtsg",
          coinDecimals: 6,
          coinGeckoId: "bitsong",
          coinImageUrl: "/tokens/generated/btsg.svg",
          base: "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
          gasPriceStep: {
            low: 3,
            average: 10,
            high: 20,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "bitsong",
        bech32PrefixAccPub: "bitsongpub",
        bech32PrefixValAddr: "bitsongvaloper",
        bech32PrefixValPub: "bitsongvaloperpub",
        bech32PrefixConsAddr: "bitsongvalcons",
        bech32PrefixConsPub: "bitsongvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/bitsong/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
    },
  },
  {
    chain_name: "kichain",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Ki",
    chain_id: "kichain-2",
    bech32_prefix: "ki",
    bech32_config: {
      bech32PrefixAccAddr: "ki",
      bech32PrefixAccPub: "kipub",
      bech32PrefixValAddr: "kivaloper",
      bech32PrefixValPub: "kivaloperpub",
      bech32PrefixConsAddr: "kivalcons",
      bech32PrefixConsPub: "kivalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uxki",
          fixed_min_gas_price: 0.025,
          low_gas_price: 0.025,
          average_gas_price: 0.03,
          high_gas_price: 0.05,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uxki",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc-mainnet.blockchain.ki",
        },
      ],
      rest: [
        {
          address: "https://api-mainnet.blockchain.ki",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/ki-chain/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/xki.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/xki.svg",
      theme: {
        primary_color_hex: "#1c04fc",
      },
    },
    features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
    keplrChain: {
      rpc: "https://rpc-mainnet.blockchain.ki",
      rest: "https://api-mainnet.blockchain.ki",
      chainId: "kichain-2",
      chainName: "kichain",
      prettyChainName: "Ki",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "XKI",
          coinMinimalDenom: "uxki",
          coinDecimals: 6,
          coinGeckoId: "ki",
          coinImageUrl: "/tokens/generated/xki.svg",
          base: "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
          gasPriceStep: {
            low: 0.025,
            average: 0.03,
            high: 0.05,
          },
        },
        {
          type: "cw20",
          coinDenom: "LVN.ki",
          coinMinimalDenom:
            "cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy:LVN.ki",
          contractAddress:
            "ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/lvn.ki.png",
          base: "ibc/AD185F62399F770CCCE8A36A180A77879FF6C26A0398BD3D2A74E087B0BFA121",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "XKI",
        coinMinimalDenom: "uxki",
        coinGeckoId: "ki",
        coinImageUrl: "/tokens/generated/xki.svg",
        base: "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
      },
      feeCurrencies: [
        {
          coinDenom: "XKI",
          coinMinimalDenom: "uxki",
          coinDecimals: 6,
          coinGeckoId: "ki",
          coinImageUrl: "/tokens/generated/xki.svg",
          base: "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
          gasPriceStep: {
            low: 0.025,
            average: 0.03,
            high: 0.05,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "ki",
        bech32PrefixAccPub: "kipub",
        bech32PrefixValAddr: "kivaloper",
        bech32PrefixValPub: "kivaloperpub",
        bech32PrefixConsAddr: "kivalcons",
        bech32PrefixConsPub: "kivalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/ki-chain/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
    },
  },
  {
    chain_name: "panacea",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Medibloc",
    chain_id: "panacea-3",
    bech32_prefix: "panacea",
    bech32_config: {
      bech32PrefixAccAddr: "panacea",
      bech32PrefixAccPub: "panaceapub",
      bech32PrefixValAddr: "panaceavaloper",
      bech32PrefixValPub: "panaceavaloperpub",
      bech32PrefixConsAddr: "panaceavalcons",
      bech32PrefixConsPub: "panaceavalconspub",
    },
    slip44: 371,
    fees: {
      fee_tokens: [
        {
          denom: "umed",
          fixed_min_gas_price: 5,
          low_gas_price: 5,
          average_gas_price: 7,
          high_gas_price: 9,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "umed",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.gopanacea.org",
        },
      ],
      rest: [
        {
          address: "https://api.gopanacea.org",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/medibloc/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/panacea/images/med.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/panacea/images/med.svg",
      theme: {
        primary_color_hex: "#2474ec",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc.gopanacea.org",
      rest: "https://api.gopanacea.org",
      chainId: "panacea-3",
      chainName: "panacea",
      prettyChainName: "Medibloc",
      bip44: {
        coinType: 371,
      },
      currencies: [
        {
          coinDenom: "MED",
          coinMinimalDenom: "umed",
          coinDecimals: 6,
          coinGeckoId: "medibloc",
          coinImageUrl: "/tokens/generated/med.svg",
          base: "ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB",
          gasPriceStep: {
            low: 5,
            average: 7,
            high: 9,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "MED",
        coinMinimalDenom: "umed",
        coinGeckoId: "medibloc",
        coinImageUrl: "/tokens/generated/med.svg",
        base: "ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB",
      },
      feeCurrencies: [
        {
          coinDenom: "MED",
          coinMinimalDenom: "umed",
          coinDecimals: 6,
          coinGeckoId: "medibloc",
          coinImageUrl: "/tokens/generated/med.svg",
          base: "ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB",
          gasPriceStep: {
            low: 5,
            average: 7,
            high: 9,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "panacea",
        bech32PrefixAccPub: "panaceapub",
        bech32PrefixValAddr: "panaceavaloper",
        bech32PrefixValPub: "panaceavaloperpub",
        bech32PrefixConsAddr: "panaceavalcons",
        bech32PrefixConsPub: "panaceavalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/medibloc/txs/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "bostrom",
    status: "live",
    network_type: "mainnet",
    pretty_name: "bostrom",
    chain_id: "bostrom",
    bech32_prefix: "bostrom",
    bech32_config: {
      bech32PrefixAccAddr: "bostrom",
      bech32PrefixAccPub: "bostrompub",
      bech32PrefixValAddr: "bostromvaloper",
      bech32PrefixValPub: "bostromvaloperpub",
      bech32PrefixConsAddr: "bostromvalcons",
      bech32PrefixConsPub: "bostromvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "boot",
          low_gas_price: 0,
          average_gas_price: 0,
          high_gas_price: 0.01,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "boot",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.bostrom.cybernode.ai",
        },
      ],
      rest: [
        {
          address: "https://lcd.bostrom.cybernode.ai",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://cyb.ai/network/bostrom/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/boot.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/boot.svg",
      theme: {
        primary_color_hex: "#4cea4e",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc.bostrom.cybernode.ai",
      rest: "https://lcd.bostrom.cybernode.ai",
      chainId: "bostrom",
      chainName: "bostrom",
      prettyChainName: "bostrom",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "BOOT",
          coinMinimalDenom: "boot",
          coinDecimals: 0,
          coinGeckoId: "bostrom",
          coinImageUrl: "/tokens/generated/boot.svg",
          base: "ibc/FE2CD1E6828EC0FAB8AF39BAC45BC25B965BA67CCBC50C13A14BD610B0D1E2C4",
        },
        {
          coinDenom: "HYDROGEN",
          coinMinimalDenom: "hydrogen",
          coinDecimals: 0,
          coinImageUrl: "/tokens/generated/hydrogen.svg",
          base: "ibc/4F3B0EC2FE2D370D10C3671A1B7B06D2A964C721470C305CBB846ED60E6CAA20",
        },
        {
          coinDenom: "TOCYB",
          coinMinimalDenom: "tocyb",
          coinDecimals: 0,
          coinImageUrl: "/tokens/generated/tocyb.svg",
          base: "ibc/BCDB35B7390806F35E716D275E1E017999F8281A81B6F128F087EF34D1DFA761",
        },
        {
          coinDenom: "V",
          coinMinimalDenom: "millivolt",
          coinDecimals: 3,
          coinImageUrl: "/tokens/generated/v.svg",
          base: "ibc/D3A1900B2B520E45608B5671ADA461E1109628E89B4289099557C6D3996F7DAA",
        },
        {
          coinDenom: "A",
          coinMinimalDenom: "milliampere",
          coinDecimals: 3,
          coinImageUrl: "/tokens/generated/a.svg",
          base: "ibc/020F5162B7BC40656FC5432622647091F00D53E82EE8D21757B43D3282F25424",
        },
      ],
      stakeCurrency: {
        coinDecimals: 0,
        coinDenom: "STAKE",
        coinMinimalDenom: "tempStakePlaceholder",
      },
      feeCurrencies: [
        {
          coinDenom: "BOOT",
          coinMinimalDenom: "boot",
          coinDecimals: 0,
          coinGeckoId: "bostrom",
          coinImageUrl: "/tokens/generated/boot.svg",
          base: "ibc/FE2CD1E6828EC0FAB8AF39BAC45BC25B965BA67CCBC50C13A14BD610B0D1E2C4",
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "bostrom",
        bech32PrefixAccPub: "bostrompub",
        bech32PrefixValAddr: "bostromvaloper",
        bech32PrefixValPub: "bostromvaloperpub",
        bech32PrefixConsAddr: "bostromvalcons",
        bech32PrefixConsPub: "bostromvalconspub",
      },
      explorerUrlToTx: "https://cyb.ai/network/bostrom/tx/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "comdex",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Comdex",
    chain_id: "comdex-1",
    bech32_prefix: "comdex",
    bech32_config: {
      bech32PrefixAccAddr: "comdex",
      bech32PrefixAccPub: "comdexpub",
      bech32PrefixValAddr: "comdexvaloper",
      bech32PrefixValPub: "comdexvaloperpub",
      bech32PrefixConsAddr: "comdexvalcons",
      bech32PrefixConsPub: "comdexvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ucmdx",
          fixed_min_gas_price: 0,
          low_gas_price: 0,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ucmdx",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.comdex.one",
        },
      ],
      rest: [
        {
          address: "https://rest.comdex.one",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/comdex/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.svg",
      theme: {
        primary_color_hex: "#fc4454",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc.comdex.one",
      rest: "https://rest.comdex.one",
      chainId: "comdex-1",
      chainName: "comdex",
      prettyChainName: "Comdex",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "CMDX",
          coinMinimalDenom: "ucmdx",
          coinDecimals: 6,
          coinGeckoId: "comdex",
          coinImageUrl: "/tokens/generated/cmdx.svg",
          base: "ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0",
        },
        {
          coinDenom: "CMST",
          coinMinimalDenom: "ucmst",
          coinDecimals: 6,
          coinGeckoId: "composite",
          coinImageUrl: "/tokens/generated/cmst.svg",
          base: "ibc/23CA6C8D1AB2145DD13EB1E089A2E3F960DC298B468CCE034E19E5A78B61136E",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "HARBOR",
          coinMinimalDenom: "uharbor",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/harbor.svg",
          base: "ibc/AD4DEA52408EA07C0C9E19444EC8DA84A274A70AD2687A710EFDDEB28BB2986A",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "CMDX",
        coinMinimalDenom: "ucmdx",
        coinGeckoId: "comdex",
        coinImageUrl: "/tokens/generated/cmdx.svg",
        base: "ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0",
      },
      feeCurrencies: [
        {
          coinDenom: "CMDX",
          coinMinimalDenom: "ucmdx",
          coinDecimals: 6,
          coinGeckoId: "comdex",
          coinImageUrl: "/tokens/generated/cmdx.svg",
          base: "ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0",
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "comdex",
        bech32PrefixAccPub: "comdexpub",
        bech32PrefixValAddr: "comdexvaloper",
        bech32PrefixValPub: "comdexvaloperpub",
        bech32PrefixConsAddr: "comdexvalcons",
        bech32PrefixConsPub: "comdexvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/comdex/txs/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "cheqd",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Cheqd",
    chain_id: "cheqd-mainnet-1",
    bech32_prefix: "cheqd",
    bech32_config: {
      bech32PrefixAccAddr: "cheqd",
      bech32PrefixAccPub: "cheqdpub",
      bech32PrefixValAddr: "cheqdvaloper",
      bech32PrefixValPub: "cheqdvaloperpub",
      bech32PrefixConsAddr: "cheqdvalcons",
      bech32PrefixConsPub: "cheqdvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ncheq",
          fixed_min_gas_price: 25,
          low_gas_price: 50,
          average_gas_price: 75,
          high_gas_price: 100,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ncheq",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.cheqd.net",
        },
      ],
      rest: [
        {
          address: "https://api.cheqd.net",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.cheqd.io/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cheqd/images/cheq.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cheqd/images/cheq.svg",
      theme: {
        primary_color_hex: "#fc5f04",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc.cheqd.net",
      rest: "https://api.cheqd.net",
      chainId: "cheqd-mainnet-1",
      chainName: "cheqd",
      prettyChainName: "Cheqd",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "CHEQ",
          coinMinimalDenom: "ncheq",
          coinDecimals: 9,
          coinGeckoId: "cheqd-network",
          coinImageUrl: "/tokens/generated/cheq.svg",
          base: "ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA",
          gasPriceStep: {
            low: 50,
            average: 75,
            high: 100,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 9,
        coinDenom: "CHEQ",
        coinMinimalDenom: "ncheq",
        coinGeckoId: "cheqd-network",
        coinImageUrl: "/tokens/generated/cheq.svg",
        base: "ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA",
      },
      feeCurrencies: [
        {
          coinDenom: "CHEQ",
          coinMinimalDenom: "ncheq",
          coinDecimals: 9,
          coinGeckoId: "cheqd-network",
          coinImageUrl: "/tokens/generated/cheq.svg",
          base: "ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA",
          gasPriceStep: {
            low: 50,
            average: 75,
            high: 100,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "cheqd",
        bech32PrefixAccPub: "cheqdpub",
        bech32PrefixValAddr: "cheqdvaloper",
        bech32PrefixValPub: "cheqdvaloperpub",
        bech32PrefixConsAddr: "cheqdvalcons",
        bech32PrefixConsPub: "cheqdvalconspub",
      },
      explorerUrlToTx: "https://explorer.cheqd.io/transactions/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "stargaze",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Stargaze",
    chain_id: "stargaze-1",
    bech32_prefix: "stars",
    bech32_config: {
      bech32PrefixAccAddr: "stars",
      bech32PrefixAccPub: "starspub",
      bech32PrefixValAddr: "starsvaloper",
      bech32PrefixValPub: "starsvaloperpub",
      bech32PrefixConsAddr: "starsvalcons",
      bech32PrefixConsPub: "starsvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ustars",
          fixed_min_gas_price: 1,
          low_gas_price: 1,
          average_gas_price: 1.1,
          high_gas_price: 1.2,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ustars",
        },
      ],
    },
    description:
      "The premier community-focused blockchain for NFTs. Stargaze empowers creators, developers, collectors, and traders to participate on the platform. The Stargaze chain consists of various NFT-related apps such as a Launchpad, and a Marketplace with offers and auctions.",
    apis: {
      rpc: [
        {
          address: "https://rpc.stargaze-apis.com",
        },
      ],
      rest: [
        {
          address: "https://rest.stargaze-apis.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/stargaze/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.svg",
      theme: {
        primary_color_hex: "#db2777",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc.stargaze-apis.com",
      rest: "https://rest.stargaze-apis.com",
      chainId: "stargaze-1",
      chainName: "stargaze",
      prettyChainName: "Stargaze",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "STARS",
          coinMinimalDenom: "ustars",
          coinDecimals: 6,
          coinGeckoId: "stargaze",
          coinImageUrl: "/tokens/generated/stars.svg",
          base: "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
          gasPriceStep: {
            low: 1,
            average: 1.1,
            high: 1.2,
          },
        },
        {
          coinDenom: "STRDST",
          coinMinimalDenom:
            "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/strdst.svg",
          base: "ibc/CFF40564FDA3E958D9904B8B479124987901168494655D9CC6B7C0EC0416020B",
        },
        {
          coinDenom: "BRNCH",
          coinMinimalDenom:
            "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/brnch.svg",
          base: "ibc/71DAA4CAFA4FE2F9803ABA0696BA5FC0EFC14305A2EA8B4E01880DB851B1EC02",
        },
        {
          coinDenom: "SNEAKY",
          coinMinimalDenom:
            "factory/stars1xx5976njvxpl9n4v8huvff6cudhx7yuu8e7rt4/usneaky",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sneaky.svg",
          base: "ibc/94ED1F172BC633DFC56D7E26551D8B101ADCCC69052AC44FED89F97FF658138F",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "STARS",
        coinMinimalDenom: "ustars",
        coinGeckoId: "stargaze",
        coinImageUrl: "/tokens/generated/stars.svg",
        base: "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
      },
      feeCurrencies: [
        {
          coinDenom: "STARS",
          coinMinimalDenom: "ustars",
          coinDecimals: 6,
          coinGeckoId: "stargaze",
          coinImageUrl: "/tokens/generated/stars.svg",
          base: "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
          gasPriceStep: {
            low: 1,
            average: 1.1,
            high: 1.2,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "stars",
        bech32PrefixAccPub: "starspub",
        bech32PrefixValAddr: "starsvaloper",
        bech32PrefixValPub: "starsvaloperpub",
        bech32PrefixConsAddr: "starsvalcons",
        bech32PrefixConsPub: "starsvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/stargaze/txs/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "chihuahua",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Chihuahua",
    chain_id: "chihuahua-1",
    bech32_prefix: "chihuahua",
    bech32_config: {
      bech32PrefixAccAddr: "chihuahua",
      bech32PrefixAccPub: "chihuahuapub",
      bech32PrefixValAddr: "chihuahuavaloper",
      bech32PrefixValPub: "chihuahuavaloperpub",
      bech32PrefixConsAddr: "chihuahuavalcons",
      bech32PrefixConsPub: "chihuahuavalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uhuahua",
          fixed_min_gas_price: 0,
          low_gas_price: 500,
          average_gas_price: 1250,
          high_gas_price: 2000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uhuahua",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.chihuahua.wtf",
        },
      ],
      rest: [
        {
          address: "https://api.chihuahua.wtf",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/chihuahua/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/huahua.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/huahua.svg",
      theme: {
        primary_color_hex: "#343434",
      },
    },
    features: ["ibc-transfer", "ibc-go", "wasmd_0.24+"],
    keplrChain: {
      rpc: "https://rpc.chihuahua.wtf",
      rest: "https://api.chihuahua.wtf",
      chainId: "chihuahua-1",
      chainName: "chihuahua",
      prettyChainName: "Chihuahua",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "HUAHUA",
          coinMinimalDenom: "uhuahua",
          coinDecimals: 6,
          coinGeckoId: "chihuahua-token",
          coinImageUrl: "/tokens/generated/huahua.svg",
          base: "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
          gasPriceStep: {
            low: 500,
            average: 1250,
            high: 2000,
          },
        },
        {
          type: "cw20",
          coinDenom: "PUPPY",
          coinMinimalDenom:
            "cw20:chihuahua1yl8z39ugle8s02fpwkhh293509q5xcpalmdzc4amvchz8nkexrmsy95gef:PUPPY",
          contractAddress:
            "chihuahua1yl8z39ugle8s02fpwkhh293509q5xcpalmdzc4amvchz8nkexrmsy95gef",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/puppy.png",
          base: "ibc/46AC07DBFF1352EC94AF5BD4D23740D92D9803A6B41F6E213E77F3A1143FB963",
        },
        {
          coinDenom: "BADDOG",
          coinMinimalDenom:
            "factory/chihuahua1x4q2vkrz4dfgd9hcw0p5m2f2nuv2uqmt9xr8k2/achihuahuawifhat",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/baddog.png",
          base: "ibc/2FFE07C4B4EFC0DDA099A16C6AF3C9CCA653CC56077E87217A585D48794B0BC7",
        },
        {
          coinDenom: "WOOF",
          coinMinimalDenom:
            "factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/uwoof",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/woof.png",
          base: "ibc/9B8EC667B6DF55387DC0F3ACC4F187DA6921B0806ED35DE6B04DE96F5AB81F53",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "HUAHUA",
        coinMinimalDenom: "uhuahua",
        coinGeckoId: "chihuahua-token",
        coinImageUrl: "/tokens/generated/huahua.svg",
        base: "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
      },
      feeCurrencies: [
        {
          coinDenom: "HUAHUA",
          coinMinimalDenom: "uhuahua",
          coinDecimals: 6,
          coinGeckoId: "chihuahua-token",
          coinImageUrl: "/tokens/generated/huahua.svg",
          base: "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
          gasPriceStep: {
            low: 500,
            average: 1250,
            high: 2000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "chihuahua",
        bech32PrefixAccPub: "chihuahuapub",
        bech32PrefixValAddr: "chihuahuavaloper",
        bech32PrefixValPub: "chihuahuavaloperpub",
        bech32PrefixConsAddr: "chihuahuavalcons",
        bech32PrefixConsPub: "chihuahuavalconspub",
      },
      explorerUrlToTx: "https://ping.pub/chihuahua/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "wasmd_0.24+"],
    },
  },
  {
    chain_name: "lumnetwork",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Lum Network",
    chain_id: "lum-network-1",
    bech32_prefix: "lum",
    bech32_config: {
      bech32PrefixAccAddr: "lum",
      bech32PrefixAccPub: "lumpub",
      bech32PrefixValAddr: "lumvaloper",
      bech32PrefixValPub: "lumvaloperpub",
      bech32PrefixConsAddr: "lumvalcons",
      bech32PrefixConsPub: "lumvalconspub",
    },
    slip44: 880,
    fees: {
      fee_tokens: [
        {
          denom: "ulum",
          fixed_min_gas_price: 0.001,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ulum",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://node0.mainnet.lum.network/rpc",
        },
      ],
      rest: [
        {
          address: "https://node0.mainnet.lum.network/rest",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/lum/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumnetwork/images/lum.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumnetwork/images/lum.svg",
      theme: {
        primary_color_hex: "#080808",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://node0.mainnet.lum.network/rpc",
      rest: "https://node0.mainnet.lum.network/rest",
      chainId: "lum-network-1",
      chainName: "lumnetwork",
      prettyChainName: "Lum Network",
      bip44: {
        coinType: 880,
      },
      currencies: [
        {
          coinDenom: "LUM",
          coinMinimalDenom: "ulum",
          coinDecimals: 6,
          coinGeckoId: "lum-network",
          coinImageUrl: "/tokens/generated/lum.svg",
          base: "ibc/8A34AF0C1943FD0DFCDE9ADBF0B2C9959C45E87E6088EA2FC6ADACD59261B8A2",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "LUM",
        coinMinimalDenom: "ulum",
        coinGeckoId: "lum-network",
        coinImageUrl: "/tokens/generated/lum.svg",
        base: "ibc/8A34AF0C1943FD0DFCDE9ADBF0B2C9959C45E87E6088EA2FC6ADACD59261B8A2",
      },
      feeCurrencies: [
        {
          coinDenom: "LUM",
          coinMinimalDenom: "ulum",
          coinDecimals: 6,
          coinGeckoId: "lum-network",
          coinImageUrl: "/tokens/generated/lum.svg",
          base: "ibc/8A34AF0C1943FD0DFCDE9ADBF0B2C9959C45E87E6088EA2FC6ADACD59261B8A2",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "lum",
        bech32PrefixAccPub: "lumpub",
        bech32PrefixValAddr: "lumvaloper",
        bech32PrefixValPub: "lumvaloperpub",
        bech32PrefixConsAddr: "lumvalcons",
        bech32PrefixConsPub: "lumvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/lum/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "vidulum",
    status: "killed",
    network_type: "mainnet",
    pretty_name: "Vidulum",
    chain_id: "vidulum-1",
    bech32_prefix: "vdl",
    bech32_config: {
      bech32PrefixAccAddr: "vdl",
      bech32PrefixAccPub: "vdlpub",
      bech32PrefixValAddr: "vdlvaloper",
      bech32PrefixValPub: "vdlvaloperpub",
      bech32PrefixConsAddr: "vdlvalcons",
      bech32PrefixConsPub: "vdlvalconspub",
    },
    slip44: 370,
    fees: {
      fee_tokens: [
        {
          denom: "uvdl",
          fixed_min_gas_price: 0.0002,
          low_gas_price: 0.002,
          average_gas_price: 0.005,
          high_gas_price: 0.007,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uvdl",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://mainnet-rpc.vidulum.app",
        },
      ],
      rest: [
        {
          address: "https://mainnet-lcd.vidulum.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorers.vidulum.app/vidulum/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/vidulum/images/vdl.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/vidulum/images/vdl.svg",
      theme: {
        primary_color_hex: "#3454bc",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://mainnet-rpc.vidulum.app",
      rest: "https://mainnet-lcd.vidulum.app",
      chainId: "vidulum-1",
      chainName: "vidulum",
      prettyChainName: "Vidulum",
      bip44: {
        coinType: 370,
      },
      currencies: [
        {
          coinDenom: "VDL.vdl",
          coinMinimalDenom: "uvdl",
          coinDecimals: 6,
          coinGeckoId: "vidulum",
          coinImageUrl: "/tokens/generated/vdl.vdl.svg",
          base: "ibc/E7B35499CFBEB0FF5778127ABA4FB2C4B79A6B8D3D831D4379C4048C238796BD",
          gasPriceStep: {
            low: 0.002,
            average: 0.005,
            high: 0.007,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "VDL.vdl",
        coinMinimalDenom: "uvdl",
        coinGeckoId: "vidulum",
        coinImageUrl: "/tokens/generated/vdl.vdl.svg",
        base: "ibc/E7B35499CFBEB0FF5778127ABA4FB2C4B79A6B8D3D831D4379C4048C238796BD",
      },
      feeCurrencies: [
        {
          coinDenom: "VDL.vdl",
          coinMinimalDenom: "uvdl",
          coinDecimals: 6,
          coinGeckoId: "vidulum",
          coinImageUrl: "/tokens/generated/vdl.vdl.svg",
          base: "ibc/E7B35499CFBEB0FF5778127ABA4FB2C4B79A6B8D3D831D4379C4048C238796BD",
          gasPriceStep: {
            low: 0.002,
            average: 0.005,
            high: 0.007,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "vdl",
        bech32PrefixAccPub: "vdlpub",
        bech32PrefixValAddr: "vdlvaloper",
        bech32PrefixValPub: "vdlvaloperpub",
        bech32PrefixConsAddr: "vdlvalcons",
        bech32PrefixConsPub: "vdlvalconspub",
      },
      explorerUrlToTx: "https://explorers.vidulum.app/vidulum/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "desmos",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Desmos",
    chain_id: "desmos-mainnet",
    bech32_prefix: "desmos",
    bech32_config: {
      bech32PrefixAccAddr: "desmos",
      bech32PrefixAccPub: "desmospub",
      bech32PrefixValAddr: "desmosvaloper",
      bech32PrefixValPub: "desmosvaloperpub",
      bech32PrefixConsAddr: "desmosvalcons",
      bech32PrefixConsPub: "desmosvalconspub",
    },
    slip44: 852,
    fees: {
      fee_tokens: [
        {
          denom: "udsm",
          fixed_min_gas_price: 0.001,
          low_gas_price: 0.01,
          average_gas_price: 0.03,
          high_gas_price: 0.05,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "udsm",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.mainnet.desmos.network",
        },
      ],
      rest: [
        {
          address: "https://api.mainnet.desmos.network",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.desmos.network/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.svg",
      theme: {
        primary_color_hex: "#fb804e",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.mainnet.desmos.network",
      rest: "https://api.mainnet.desmos.network",
      chainId: "desmos-mainnet",
      chainName: "desmos",
      prettyChainName: "Desmos",
      bip44: {
        coinType: 852,
      },
      currencies: [
        {
          coinDenom: "DSM",
          coinMinimalDenom: "udsm",
          coinDecimals: 6,
          coinGeckoId: "desmos",
          coinImageUrl: "/tokens/generated/dsm.svg",
          base: "ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C",
          gasPriceStep: {
            low: 0.01,
            average: 0.03,
            high: 0.05,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "DSM",
        coinMinimalDenom: "udsm",
        coinGeckoId: "desmos",
        coinImageUrl: "/tokens/generated/dsm.svg",
        base: "ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C",
      },
      feeCurrencies: [
        {
          coinDenom: "DSM",
          coinMinimalDenom: "udsm",
          coinDecimals: 6,
          coinGeckoId: "desmos",
          coinImageUrl: "/tokens/generated/dsm.svg",
          base: "ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C",
          gasPriceStep: {
            low: 0.01,
            average: 0.03,
            high: 0.05,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "desmos",
        bech32PrefixAccPub: "desmospub",
        bech32PrefixValAddr: "desmosvaloper",
        bech32PrefixValPub: "desmosvaloperpub",
        bech32PrefixConsAddr: "desmosvalcons",
        bech32PrefixConsPub: "desmosvalconspub",
      },
      explorerUrlToTx: "https://explorer.desmos.network/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "dig",
    status: "killed",
    network_type: "mainnet",
    pretty_name: "Dig Chain",
    chain_id: "dig-1",
    bech32_prefix: "dig",
    bech32_config: {
      bech32PrefixAccAddr: "dig",
      bech32PrefixAccPub: "digpub",
      bech32PrefixValAddr: "digvaloper",
      bech32PrefixValPub: "digvaloperpub",
      bech32PrefixConsAddr: "digvalcons",
      bech32PrefixConsPub: "digvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "udig",
          low_gas_price: 0.025,
          average_gas_price: 0.03,
          high_gas_price: 0.035,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "udig",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc-1-dig.notional.ventures",
        },
      ],
      rest: [
        {
          address: "https://api-1-dig.notional.ventures",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/dig/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dig/images/dig.png",
      theme: {
        primary_color_hex: "#1b1433",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-1-dig.notional.ventures",
      rest: "https://api-1-dig.notional.ventures",
      chainId: "dig-1",
      chainName: "dig",
      prettyChainName: "Dig Chain",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "DIG",
          coinMinimalDenom: "udig",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/dig.png",
          base: "ibc/307E5C96C8F60D1CBEE269A9A86C0834E1DB06F2B3788AE4F716EDB97A48B97D",
          gasPriceStep: {
            low: 0.025,
            average: 0.03,
            high: 0.035,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "DIG",
        coinMinimalDenom: "udig",
        coinImageUrl: "/tokens/generated/dig.png",
        base: "ibc/307E5C96C8F60D1CBEE269A9A86C0834E1DB06F2B3788AE4F716EDB97A48B97D",
      },
      feeCurrencies: [
        {
          coinDenom: "DIG",
          coinMinimalDenom: "udig",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/dig.png",
          base: "ibc/307E5C96C8F60D1CBEE269A9A86C0834E1DB06F2B3788AE4F716EDB97A48B97D",
          gasPriceStep: {
            low: 0.025,
            average: 0.03,
            high: 0.035,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "dig",
        bech32PrefixAccPub: "digpub",
        bech32PrefixValAddr: "digvaloper",
        bech32PrefixValPub: "digvaloperpub",
        bech32PrefixConsAddr: "digvalcons",
        bech32PrefixConsPub: "digvalconspub",
      },
      explorerUrlToTx: "https://ping.pub/dig/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "sommelier",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Sommelier",
    chain_id: "sommelier-3",
    bech32_prefix: "somm",
    bech32_config: {
      bech32PrefixAccAddr: "somm",
      bech32PrefixAccPub: "sommpub",
      bech32PrefixValAddr: "sommvaloper",
      bech32PrefixValPub: "sommvaloperpub",
      bech32PrefixConsAddr: "sommvalcons",
      bech32PrefixConsPub: "sommvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "usomm",
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "usomm",
        },
      ],
    },
    description:
      "Automated vaults find best-in-class yields while mitigating risk.",
    apis: {
      rpc: [
        {
          address: "https://rpc-sommelier.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-sommelier.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/sommelier/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.svg",
      theme: {
        primary_color_hex: "#f36353",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-sommelier.keplr.app",
      rest: "https://lcd-sommelier.keplr.app",
      chainId: "sommelier-3",
      chainName: "sommelier",
      prettyChainName: "Sommelier",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "SOMM",
          coinMinimalDenom: "usomm",
          coinDecimals: 6,
          coinGeckoId: "sommelier",
          coinImageUrl: "/tokens/generated/somm.svg",
          base: "ibc/9BBA9A1C257E971E38C1422780CE6F0B0686F0A3085E2D61118D904BFE0F5F5E",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "SOMM",
        coinMinimalDenom: "usomm",
        coinGeckoId: "sommelier",
        coinImageUrl: "/tokens/generated/somm.svg",
        base: "ibc/9BBA9A1C257E971E38C1422780CE6F0B0686F0A3085E2D61118D904BFE0F5F5E",
      },
      feeCurrencies: [
        {
          coinDenom: "SOMM",
          coinMinimalDenom: "usomm",
          coinDecimals: 6,
          coinGeckoId: "sommelier",
          coinImageUrl: "/tokens/generated/somm.svg",
          base: "ibc/9BBA9A1C257E971E38C1422780CE6F0B0686F0A3085E2D61118D904BFE0F5F5E",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "somm",
        bech32PrefixAccPub: "sommpub",
        bech32PrefixValAddr: "sommvaloper",
        bech32PrefixValPub: "sommvaloperpub",
        bech32PrefixConsAddr: "sommvalcons",
        bech32PrefixConsPub: "sommvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/sommelier/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "sifchain",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Sifchain",
    chain_id: "sifchain-1",
    bech32_prefix: "sif",
    bech32_config: {
      bech32PrefixAccAddr: "sif",
      bech32PrefixAccPub: "sifpub",
      bech32PrefixValAddr: "sifvaloper",
      bech32PrefixValPub: "sifvaloperpub",
      bech32PrefixConsAddr: "sifvalcons",
      bech32PrefixConsPub: "sifvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "rowan",
          low_gas_price: 1000000000000,
          average_gas_price: 1500000000000,
          high_gas_price: 2000000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "rowan",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://sifchain-rpc.publicnode.com",
        },
      ],
      rest: [
        {
          address: "https://sifchain-rest.publicnode.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/sifchain/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.svg",
      theme: {
        primary_color_hex: "#be9926",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://sifchain-rpc.publicnode.com",
      rest: "https://sifchain-rest.publicnode.com",
      chainId: "sifchain-1",
      chainName: "sifchain",
      prettyChainName: "Sifchain",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "ROWAN",
          coinMinimalDenom: "rowan",
          coinDecimals: 18,
          coinGeckoId: "sifchain",
          coinImageUrl: "/tokens/generated/rowan.svg",
          base: "ibc/8318FD63C42203D16DDCAF49FE10E8590669B3219A3E87676AC9DA50722687FB",
          gasPriceStep: {
            low: 1000000000000,
            average: 1500000000000,
            high: 2000000000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "ROWAN",
        coinMinimalDenom: "rowan",
        coinGeckoId: "sifchain",
        coinImageUrl: "/tokens/generated/rowan.svg",
        base: "ibc/8318FD63C42203D16DDCAF49FE10E8590669B3219A3E87676AC9DA50722687FB",
      },
      feeCurrencies: [
        {
          coinDenom: "ROWAN",
          coinMinimalDenom: "rowan",
          coinDecimals: 18,
          coinGeckoId: "sifchain",
          coinImageUrl: "/tokens/generated/rowan.svg",
          base: "ibc/8318FD63C42203D16DDCAF49FE10E8590669B3219A3E87676AC9DA50722687FB",
          gasPriceStep: {
            low: 1000000000000,
            average: 1500000000000,
            high: 2000000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "sif",
        bech32PrefixAccPub: "sifpub",
        bech32PrefixValAddr: "sifvaloper",
        bech32PrefixValPub: "sifvaloperpub",
        bech32PrefixConsAddr: "sifvalcons",
        bech32PrefixConsPub: "sifvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/sifchain/txs/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "bandchain",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Band Protocol",
    chain_id: "laozi-mainnet",
    bech32_prefix: "band",
    bech32_config: {
      bech32PrefixAccAddr: "band",
      bech32PrefixAccPub: "bandpub",
      bech32PrefixValAddr: "bandvaloper",
      bech32PrefixValPub: "bandvaloperpub",
      bech32PrefixConsAddr: "bandvalcons",
      bech32PrefixConsPub: "bandvalconspub",
    },
    slip44: 494,
    fees: {
      fee_tokens: [
        {
          denom: "uband",
          fixed_min_gas_price: 0.0025,
          low_gas_price: 0.0025,
          average_gas_price: 0.003,
          high_gas_price: 0.005,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uband",
        },
      ],
      lock_duration: {
        time: "1814400s",
      },
    },
    description:
      "Band Protocol is a cross-chain data oracle platform that aggregates and connects real-world data and APIs to smart contracts.",
    apis: {
      rpc: [
        {
          address: "https://rpc.laozi3.bandchain.org",
        },
      ],
      rest: [
        {
          address: "https://api-band.cosmos-spaces.cloud",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://cosmoscan.io/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bandchain/images/band.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bandchain/images/band.svg",
      theme: {
        primary_color_hex: "#4424e4",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc.laozi3.bandchain.org",
      rest: "https://api-band.cosmos-spaces.cloud",
      chainId: "laozi-mainnet",
      chainName: "bandchain",
      prettyChainName: "Band Protocol",
      bip44: {
        coinType: 494,
      },
      currencies: [
        {
          coinDenom: "BAND",
          coinMinimalDenom: "uband",
          coinDecimals: 6,
          coinGeckoId: "band-protocol",
          coinImageUrl: "/tokens/generated/band.svg",
          base: "ibc/F867AE2112EFE646EC71A25CD2DFABB8927126AC1E19F1BBF0FF693A4ECA05DE",
          gasPriceStep: {
            low: 0.0025,
            average: 0.003,
            high: 0.005,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "BAND",
        coinMinimalDenom: "uband",
        coinGeckoId: "band-protocol",
        coinImageUrl: "/tokens/generated/band.svg",
        base: "ibc/F867AE2112EFE646EC71A25CD2DFABB8927126AC1E19F1BBF0FF693A4ECA05DE",
      },
      feeCurrencies: [
        {
          coinDenom: "BAND",
          coinMinimalDenom: "uband",
          coinDecimals: 6,
          coinGeckoId: "band-protocol",
          coinImageUrl: "/tokens/generated/band.svg",
          base: "ibc/F867AE2112EFE646EC71A25CD2DFABB8927126AC1E19F1BBF0FF693A4ECA05DE",
          gasPriceStep: {
            low: 0.0025,
            average: 0.003,
            high: 0.005,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "band",
        bech32PrefixAccPub: "bandpub",
        bech32PrefixValAddr: "bandvaloper",
        bech32PrefixValPub: "bandvaloperpub",
        bech32PrefixConsAddr: "bandvalcons",
        bech32PrefixConsPub: "bandvalconspub",
      },
      explorerUrlToTx: "https://cosmoscan.io/tx/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "konstellation",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Konstellation",
    chain_id: "darchub",
    bech32_prefix: "darc",
    bech32_config: {
      bech32PrefixAccAddr: "darc",
      bech32PrefixAccPub: "darcpub",
      bech32PrefixValAddr: "darcvaloper",
      bech32PrefixValPub: "darcvaloperpub",
      bech32PrefixConsAddr: "darcvalcons",
      bech32PrefixConsPub: "darcvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "udarc",
          fixed_min_gas_price: 0,
          low_gas_price: 0.0001,
          average_gas_price: 0.001,
          high_gas_price: 0.01,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "udarc",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://node1.konstellation.tech:26657",
        },
      ],
      rest: [
        {
          address: "https://node1.konstellation.tech:1318",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/konstellation/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/konstellation/images/Konstellation-dark.png",
      theme: {
        primary_color_hex: "#a3d3fb",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://node1.konstellation.tech:26657",
      rest: "https://node1.konstellation.tech:1318",
      chainId: "darchub",
      chainName: "konstellation",
      prettyChainName: "Konstellation",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "DARC",
          coinMinimalDenom: "udarc",
          coinDecimals: 6,
          coinGeckoId: "darcmatter-coin",
          coinImageUrl: "/tokens/generated/darc.svg",
          base: "ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593",
          gasPriceStep: {
            low: 0.0001,
            average: 0.001,
            high: 0.01,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "DARC",
        coinMinimalDenom: "udarc",
        coinGeckoId: "darcmatter-coin",
        coinImageUrl: "/tokens/generated/darc.svg",
        base: "ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593",
      },
      feeCurrencies: [
        {
          coinDenom: "DARC",
          coinMinimalDenom: "udarc",
          coinDecimals: 6,
          coinGeckoId: "darcmatter-coin",
          coinImageUrl: "/tokens/generated/darc.svg",
          base: "ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593",
          gasPriceStep: {
            low: 0.0001,
            average: 0.001,
            high: 0.01,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "darc",
        bech32PrefixAccPub: "darcpub",
        bech32PrefixValAddr: "darcvaloper",
        bech32PrefixValPub: "darcvaloperpub",
        bech32PrefixConsAddr: "darcvalcons",
        bech32PrefixConsPub: "darcvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/konstellation/txs/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "umee",
    status: "live",
    network_type: "mainnet",
    pretty_name: "UX Chain",
    chain_id: "umee-1",
    bech32_prefix: "umee",
    bech32_config: {
      bech32PrefixAccAddr: "umee",
      bech32PrefixAccPub: "umeepub",
      bech32PrefixValAddr: "umeevaloper",
      bech32PrefixValPub: "umeevaloperpub",
      bech32PrefixConsAddr: "umeevalcons",
      bech32PrefixConsPub: "umeevalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uumee",
          fixed_min_gas_price: 0.1,
          low_gas_price: 0.1,
          average_gas_price: 0.12,
          high_gas_price: 0.2,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uumee",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc-umee.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-umee.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/umee/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/umee/images/umee.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/umee/images/umee.svg",
      theme: {
        primary_color_hex: "#22f2e9",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc-umee.keplr.app",
      rest: "https://lcd-umee.keplr.app",
      chainId: "umee-1",
      chainName: "umee",
      prettyChainName: "UX Chain",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "UMEE",
          coinMinimalDenom: "uumee",
          coinDecimals: 6,
          coinGeckoId: "umee",
          coinImageUrl: "/tokens/generated/umee.svg",
          base: "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
          gasPriceStep: {
            low: 0.1,
            average: 0.12,
            high: 0.2,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "UMEE",
        coinMinimalDenom: "uumee",
        coinGeckoId: "umee",
        coinImageUrl: "/tokens/generated/umee.svg",
        base: "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
      },
      feeCurrencies: [
        {
          coinDenom: "UMEE",
          coinMinimalDenom: "uumee",
          coinDecimals: 6,
          coinGeckoId: "umee",
          coinImageUrl: "/tokens/generated/umee.svg",
          base: "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
          gasPriceStep: {
            low: 0.1,
            average: 0.12,
            high: 0.2,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "umee",
        bech32PrefixAccPub: "umeepub",
        bech32PrefixValAddr: "umeevaloper",
        bech32PrefixValPub: "umeevaloperpub",
        bech32PrefixConsAddr: "umeevalcons",
        bech32PrefixConsPub: "umeevalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/umee/txs/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "gravitybridge",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Gravity Bridge",
    chain_id: "gravity-bridge-3",
    bech32_prefix: "gravity",
    bech32_config: {
      bech32PrefixAccAddr: "gravity",
      bech32PrefixAccPub: "gravitypub",
      bech32PrefixValAddr: "gravityvaloper",
      bech32PrefixValPub: "gravityvaloperpub",
      bech32PrefixConsAddr: "gravityvalcons",
      bech32PrefixConsPub: "gravityvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ugraviton",
          fixed_min_gas_price: 0,
          low_gas_price: 0,
          average_gas_price: 0,
          high_gas_price: 0.035,
        },
        {
          denom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          low_gas_price: 0.0002,
          average_gas_price: 0.0005,
          high_gas_price: 0.0008,
        },
        {
          denom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          low_gas_price: 0.0002,
          average_gas_price: 0.0005,
          high_gas_price: 0.0008,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ugraviton",
        },
      ],
    },
    description:
      "An open, decentralized bridge that unlocks the power of interoperability & liquidity between blockchain ecosystems.",
    apis: {
      rpc: [
        {
          address: "https://gravitychain.io:26657",
        },
      ],
      rest: [
        {
          address: "https://gravitychain.io:1317",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/gravity-bridge/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.svg",
      theme: {
        primary_color_hex: "#042ca4",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://gravitychain.io:26657",
      rest: "https://gravitychain.io:1317",
      chainId: "gravity-bridge-3",
      chainName: "gravitybridge",
      prettyChainName: "Gravity Bridge",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "GRAV",
          coinMinimalDenom: "ugraviton",
          coinDecimals: 6,
          coinGeckoId: "graviton",
          coinImageUrl: "/tokens/generated/grav.svg",
          base: "ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44",
        },
        {
          coinDenom: "WBTC.eth.grv",
          coinMinimalDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          coinDecimals: 8,
          coinImageUrl: "/tokens/generated/wbtc.eth.grv.svg",
          base: "ibc/C9B0D48FD2C5B91135F118FF2484551888966590D7BDC20F6A87308DBA670796",
        },
        {
          coinDenom: "ETH.grv",
          coinMinimalDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/eth.grv.svg",
          base: "ibc/65381C5F3FD21442283D56925E62EA524DED8B6927F0FF94E21E0020954C40B5",
        },
        {
          coinDenom: "USDC.eth.grv",
          coinMinimalDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdc.eth.grv.svg",
          base: "ibc/9F9B07EF9AD291167CF5700628145DE1DEB777C2CFC7907553B24446515F6D0E",
          pegMechanism: "collateralized",
          gasPriceStep: {
            low: 0.0002,
            average: 0.0005,
            high: 0.0008,
          },
        },
        {
          coinDenom: "DAI.grv",
          coinMinimalDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/dai.grv.svg",
          base: "ibc/F292A17CF920E3462C816CBE6B042E779F676CAB59096904C4C1C966413E3DF5",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "USDT.eth.grv",
          coinMinimalDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdt.eth.grv.svg",
          base: "ibc/71B441E27F1BBB44DD0891BCD370C2794D404D60A4FFE5AECCD9B1E28BC89805",
          pegMechanism: "collateralized",
          gasPriceStep: {
            low: 0.0002,
            average: 0.0005,
            high: 0.0008,
          },
        },
        {
          coinDenom: "PAGE",
          coinMinimalDenom: "gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
          coinDecimals: 8,
          coinGeckoId: "page",
          coinImageUrl: "/tokens/generated/page.svg",
          base: "ibc/23A62409E4AD8133116C249B1FA38EED30E500A115D7B153109462CD82C1CD99",
        },
        {
          coinDenom: "PAXG.grv",
          coinMinimalDenom: "gravity0x45804880De22913dAFE09f4980848ECE6EcbAf78",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/paxg.grv.svg",
          base: "ibc/A5CCD24BA902843B1003A7EEE5F937C632808B9CF4925601241B15C5A0A51A53",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "GRAV",
        coinMinimalDenom: "ugraviton",
        coinGeckoId: "graviton",
        coinImageUrl: "/tokens/generated/grav.svg",
        base: "ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44",
      },
      feeCurrencies: [
        {
          coinDenom: "GRAV",
          coinMinimalDenom: "ugraviton",
          coinDecimals: 6,
          coinGeckoId: "graviton",
          coinImageUrl: "/tokens/generated/grav.svg",
          base: "ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44",
        },
        {
          coinDenom: "USDC.eth.grv",
          coinMinimalDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdc.eth.grv.svg",
          base: "ibc/9F9B07EF9AD291167CF5700628145DE1DEB777C2CFC7907553B24446515F6D0E",
          gasPriceStep: {
            low: 0.0002,
            average: 0.0005,
            high: 0.0008,
          },
        },
        {
          coinDenom: "USDT.eth.grv",
          coinMinimalDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdt.eth.grv.svg",
          base: "ibc/71B441E27F1BBB44DD0891BCD370C2794D404D60A4FFE5AECCD9B1E28BC89805",
          gasPriceStep: {
            low: 0.0002,
            average: 0.0005,
            high: 0.0008,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "gravity",
        bech32PrefixAccPub: "gravitypub",
        bech32PrefixValAddr: "gravityvaloper",
        bech32PrefixValPub: "gravityvaloperpub",
        bech32PrefixConsAddr: "gravityvalcons",
        bech32PrefixConsPub: "gravityvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/gravity-bridge/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "decentr",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Decentr",
    chain_id: "mainnet-3",
    bech32_prefix: "decentr",
    bech32_config: {
      bech32PrefixAccAddr: "decentr",
      bech32PrefixAccPub: "decentrpub",
      bech32PrefixValAddr: "decentrvaloper",
      bech32PrefixValPub: "decentrvaloperpub",
      bech32PrefixConsAddr: "decentrvalcons",
      bech32PrefixConsPub: "decentrvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "udec",
          fixed_min_gas_price: 0.025,
          low_gas_price: 0.025,
          average_gas_price: 0.025,
          high_gas_price: 0.025,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "udec",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://poseidon.mainnet.decentr.xyz",
        },
      ],
      rest: [
        {
          address: "https://rest.mainnet.decentr.xyz",
        },
      ],
    },
    explorers: [
      {
        tx_page:
          "https://explorer.decentr.net/transactions/{txHash}?networkId=mainnet",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/decentr/images/dec.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/decentr/images/dec.svg",
      theme: {
        primary_color_hex: "#4678e9",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://poseidon.mainnet.decentr.xyz",
      rest: "https://rest.mainnet.decentr.xyz",
      chainId: "mainnet-3",
      chainName: "decentr",
      prettyChainName: "Decentr",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "DEC",
          coinMinimalDenom: "udec",
          coinDecimals: 6,
          coinGeckoId: "decentr",
          coinImageUrl: "/tokens/generated/dec.svg",
          base: "ibc/9BCB27203424535B6230D594553F1659C77EC173E36D9CF4759E7186EE747E84",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.025,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "DEC",
        coinMinimalDenom: "udec",
        coinGeckoId: "decentr",
        coinImageUrl: "/tokens/generated/dec.svg",
        base: "ibc/9BCB27203424535B6230D594553F1659C77EC173E36D9CF4759E7186EE747E84",
      },
      feeCurrencies: [
        {
          coinDenom: "DEC",
          coinMinimalDenom: "udec",
          coinDecimals: 6,
          coinGeckoId: "decentr",
          coinImageUrl: "/tokens/generated/dec.svg",
          base: "ibc/9BCB27203424535B6230D594553F1659C77EC173E36D9CF4759E7186EE747E84",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.025,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "decentr",
        bech32PrefixAccPub: "decentrpub",
        bech32PrefixValAddr: "decentrvaloper",
        bech32PrefixValPub: "decentrvaloperpub",
        bech32PrefixConsAddr: "decentrvalcons",
        bech32PrefixConsPub: "decentrvalconspub",
      },
      explorerUrlToTx:
        "https://explorer.decentr.net/transactions/{txHash}?networkId=mainnet",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "shentu",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Shentu",
    chain_id: "shentu-2.2",
    bech32_prefix: "shentu",
    bech32_config: {
      bech32PrefixAccAddr: "shentu",
      bech32PrefixAccPub: "shentupub",
      bech32PrefixValAddr: "shentuvaloper",
      bech32PrefixValPub: "shentuvaloperpub",
      bech32PrefixConsAddr: "shentuvalcons",
      bech32PrefixConsPub: "shentuvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uctk",
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uctk",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://shenturpc.noopsbycertik.com/",
        },
      ],
      rest: [
        {
          address: "https://rest.noopsbycertik.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/shentu/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shentu/images/ctk.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shentu/images/ctk.svg",
      theme: {
        primary_color_hex: "#e4ac4c",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://shenturpc.noopsbycertik.com/",
      rest: "https://rest.noopsbycertik.com",
      chainId: "shentu-2.2",
      chainName: "shentu",
      prettyChainName: "Shentu",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "CTK",
          coinMinimalDenom: "uctk",
          coinDecimals: 6,
          coinGeckoId: "certik",
          coinImageUrl: "/tokens/generated/ctk.svg",
          base: "ibc/7ED954CFFFC06EE8419387F3FC688837FF64EF264DE14219935F724EEEDBF8D3",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "CTK",
        coinMinimalDenom: "uctk",
        coinGeckoId: "certik",
        coinImageUrl: "/tokens/generated/ctk.svg",
        base: "ibc/7ED954CFFFC06EE8419387F3FC688837FF64EF264DE14219935F724EEEDBF8D3",
      },
      feeCurrencies: [
        {
          coinDenom: "CTK",
          coinMinimalDenom: "uctk",
          coinDecimals: 6,
          coinGeckoId: "certik",
          coinImageUrl: "/tokens/generated/ctk.svg",
          base: "ibc/7ED954CFFFC06EE8419387F3FC688837FF64EF264DE14219935F724EEEDBF8D3",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "shentu",
        bech32PrefixAccPub: "shentupub",
        bech32PrefixValAddr: "shentuvaloper",
        bech32PrefixValPub: "shentuvaloperpub",
        bech32PrefixConsAddr: "shentuvalcons",
        bech32PrefixConsPub: "shentuvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/shentu/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "carbon",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Carbon",
    chain_id: "carbon-1",
    bech32_prefix: "swth",
    bech32_config: {
      bech32PrefixAccAddr: "swth",
      bech32PrefixAccPub: "swthpub",
      bech32PrefixValAddr: "swthvaloper",
      bech32PrefixValPub: "swthvaloperpub",
      bech32PrefixConsAddr: "swthvalcons",
      bech32PrefixConsPub: "swthvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "swth",
          fixed_min_gas_price: 1,
          low_gas_price: 1,
          average_gas_price: 1,
          high_gas_price: 1,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom: "usc",
          fixed_min_gas_price: 0,
          low_gas_price: 0.0001,
          average_gas_price: 0.0001,
          high_gas_price: 0.0001,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom: "bnb.1.6.773edb",
          fixed_min_gas_price: 0,
          low_gas_price: 1000000,
          average_gas_price: 1000000,
          high_gas_price: 1000000,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom: "bneo.1.14.e2e5f6",
          fixed_min_gas_price: 0,
          low_gas_price: 0.0015,
          average_gas_price: 0.0015,
          high_gas_price: 0.0015,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom: "busd.1.6.754a80",
          fixed_min_gas_price: 0,
          low_gas_price: 100000000,
          average_gas_price: 100000000,
          high_gas_price: 100000000,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom: "cglp.1.19.1698d3",
          fixed_min_gas_price: 0,
          low_gas_price: 100000000,
          average_gas_price: 100000000,
          high_gas_price: 100000000,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom: "cgt/1",
          fixed_min_gas_price: 0,
          low_gas_price: 100000000,
          average_gas_price: 100000000,
          high_gas_price: 100000000,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom: "eth.1.19.c3b805",
          fixed_min_gas_price: 0,
          low_gas_price: 100000,
          average_gas_price: 100000,
          high_gas_price: 100000,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom: "eth.1.2.942d87",
          fixed_min_gas_price: 0,
          low_gas_price: 100000,
          average_gas_price: 100000,
          high_gas_price: 100000,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom:
            "ibc/07FA7831E1920D0C87C9388F86B0108677F6ED0C9DE7E4063F05ED675192405C",
          fixed_min_gas_price: 0,
          low_gas_price: 0.0035,
          average_gas_price: 0.0035,
          high_gas_price: 0.0035,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom:
            "ibc/16065EE5282C5217685C8F084FC44864C25C706AC37356B0D62811D50B96920F",
          fixed_min_gas_price: 0,
          low_gas_price: 0.0000075,
          average_gas_price: 0.0000075,
          high_gas_price: 0.0000075,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom:
            "ibc/2B58B8C147E8718EECCB3713271DF46DEE8A3A00A27242628604E31C2F370EF5",
          fixed_min_gas_price: 0,
          low_gas_price: 0.00005,
          average_gas_price: 0.00005,
          high_gas_price: 0.00005,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom:
            "ibc/3552CECB7BCE1891DB6070D37EC6E954C972B1400141308FCD85FD148BD06DE5",
          fixed_min_gas_price: 0,
          low_gas_price: 0.00032,
          average_gas_price: 0.00032,
          high_gas_price: 0.00032,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom:
            "ibc/35E771B8682D828173F4B795F6C307780F96DC64D6F914FAE4CC9B4666F66364",
          fixed_min_gas_price: 0,
          low_gas_price: 300000000,
          average_gas_price: 300000000,
          high_gas_price: 300000000,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom:
            "ibc/4E06CF24FEBFB3F5AF645377DCC0B70AA6183BAF6B918B8B6243FCDEB7D38118",
          fixed_min_gas_price: 0,
          low_gas_price: 0.0006,
          average_gas_price: 0.0006,
          high_gas_price: 0.0006,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom:
            "ibc/662914D0C1CEBCB070C68F061D035E8B10A07C79AB286E7342C85F3BE74612C5",
          fixed_min_gas_price: 0,
          low_gas_price: 0.00015,
          average_gas_price: 0.00015,
          high_gas_price: 0.00015,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom:
            "ibc/6C349F0EB135C5FA99301758F35B87DB88403D690E5E314AB080401FEE4066E5",
          fixed_min_gas_price: 0,
          low_gas_price: 0.0000075,
          average_gas_price: 0.0000075,
          high_gas_price: 0.0000075,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom:
            "ibc/75249A18DEFBEFE55F83B1C70CAD234DF164F174C6BC51682EE92C2C81C18C93",
          fixed_min_gas_price: 0,
          low_gas_price: 0.00015,
          average_gas_price: 0.00015,
          high_gas_price: 0.00015,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom:
            "ibc/92E974290AF9E2BC3AEEEC35305C8FD76AC5A22A74CF8D91270FDF5A1C41E861",
          fixed_min_gas_price: 0,
          low_gas_price: 200000000,
          average_gas_price: 200000000,
          high_gas_price: 200000000,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom:
            "ibc/A4DB47A9D3CF9A068D454513891B526702455D3EF08FB9EB558C561F9DC2B701",
          fixed_min_gas_price: 0,
          low_gas_price: 0.00001,
          average_gas_price: 0.00001,
          high_gas_price: 0.00001,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom:
            "ibc/B7864B03E1B9FD4F049243E92ABD691586F682137037A9F3FCA5222815620B3C",
          fixed_min_gas_price: 0,
          low_gas_price: 0.00001,
          average_gas_price: 0.00001,
          high_gas_price: 0.00001,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom:
            "ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518",
          fixed_min_gas_price: 0,
          low_gas_price: 0.00015,
          average_gas_price: 0.00015,
          high_gas_price: 0.00015,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom: "usdc.1.2.343151",
          fixed_min_gas_price: 0,
          low_gas_price: 0.0001,
          average_gas_price: 0.0001,
          high_gas_price: 0.0001,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom: "usdc.1.6.53ff75",
          fixed_min_gas_price: 0,
          low_gas_price: 100000000,
          average_gas_price: 100000000,
          high_gas_price: 100000000,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
        {
          denom: "zil.1.18.1a4a06",
          fixed_min_gas_price: 0,
          low_gas_price: 6000,
          average_gas_price: 6000,
          high_gas_price: 6000,
          gas_costs: {
            cosmos_send: 10000000,
            ibc_transfer: 10000000,
          },
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "swth",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://tm-api.carbon.network",
        },
      ],
      rest: [
        {
          address: "https://api.carbon.network",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://scan.carbon.network/transaction/{txHash}?net=main",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/carbon/images/swth.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/carbon/images/swth.svg",
      theme: {
        primary_color_hex: "#a5edf2",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://tm-api.carbon.network",
      rest: "https://api.carbon.network",
      chainId: "carbon-1",
      chainName: "carbon",
      prettyChainName: "Carbon",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "SWTH",
          coinMinimalDenom: "swth",
          coinDecimals: 8,
          coinGeckoId: "switcheo",
          coinImageUrl: "/tokens/generated/swth.svg",
          base: "ibc/8FEFAE6AECF6E2A255585617F781F35A8D5709A545A804482A261C0C9548A9D3",
          gasPriceStep: {
            low: 1,
            average: 1,
            high: 1,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 8,
        coinDenom: "SWTH",
        coinMinimalDenom: "swth",
        coinGeckoId: "switcheo",
        coinImageUrl: "/tokens/generated/swth.svg",
        base: "ibc/8FEFAE6AECF6E2A255585617F781F35A8D5709A545A804482A261C0C9548A9D3",
      },
      feeCurrencies: [
        {
          coinDenom: "SWTH",
          coinMinimalDenom: "swth",
          coinDecimals: 8,
          coinGeckoId: "switcheo",
          coinImageUrl: "/tokens/generated/swth.svg",
          base: "ibc/8FEFAE6AECF6E2A255585617F781F35A8D5709A545A804482A261C0C9548A9D3",
          gasPriceStep: {
            low: 1,
            average: 1,
            high: 1,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "swth",
        bech32PrefixAccPub: "swthpub",
        bech32PrefixValAddr: "swthvaloper",
        bech32PrefixValPub: "swthvaloperpub",
        bech32PrefixConsAddr: "swthvalcons",
        bech32PrefixConsPub: "swthvalconspub",
      },
      explorerUrlToTx:
        "https://scan.carbon.network/transaction/{txHash}?net=main",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "injective",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Injective",
    chain_id: "injective-1",
    bech32_prefix: "inj",
    bech32_config: {
      bech32PrefixAccAddr: "inj",
      bech32PrefixAccPub: "injpub",
      bech32PrefixValAddr: "injvaloper",
      bech32PrefixValPub: "injvaloperpub",
      bech32PrefixConsAddr: "injvalcons",
      bech32PrefixConsPub: "injvalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "inj",
          fixed_min_gas_price: 160000000,
          low_gas_price: 500000000,
          average_gas_price: 700000000,
          high_gas_price: 900000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "inj",
        },
      ],
    },
    description:
      "Injective’s mission is to create a truly free and inclusive financial system through decentralization.",
    apis: {
      rpc: [
        {
          address: "https://injective-rpc.polkachu.com",
        },
      ],
      rest: [
        {
          address: "https://injective-api.polkachu.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.injective.network/transaction/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.svg",
      theme: {
        primary_color_hex: "#04a2fc",
      },
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://injective-rpc.polkachu.com",
      rest: "https://injective-api.polkachu.com",
      chainId: "injective-1",
      chainName: "injective",
      prettyChainName: "Injective",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "INJ",
          coinMinimalDenom: "inj",
          coinDecimals: 18,
          coinGeckoId: "injective-protocol",
          coinImageUrl: "/tokens/generated/inj.svg",
          base: "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273",
          gasPriceStep: {
            low: 500000000,
            average: 700000000,
            high: 900000000,
          },
        },
        {
          coinDenom: "AUTISM",
          coinMinimalDenom:
            "factory/inj14lf8xm6fcvlggpa7guxzjqwjmtr24gnvf56hvz/autism",
          coinDecimals: 6,
          coinGeckoId: "autism",
          coinImageUrl: "/tokens/generated/autism.png",
          base: "ibc/9DDF52A334F92BC57A9E0D59DFF9984EAC61D2A14E5162605DF601AA58FDFC6D",
        },
        {
          coinDenom: "NINJA",
          coinMinimalDenom:
            "factory/inj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w/ninja",
          coinDecimals: 6,
          coinGeckoId: "dog-wif-nuchucks",
          coinImageUrl: "/tokens/generated/ninja.png",
          base: "ibc/183C0BB962D2F57C957E0B134CFA0AC9D6F755C02DE9DC2A59089BA23009DEC3",
        },
        {
          coinDenom: "GLTO",
          coinMinimalDenom: "peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/glto.svg",
          base: "ibc/072E5B3D6F278B3E6A9C51D7EAD1A737148609512C5EBE8CBCB5663264A0DDB7",
        },
        {
          coinDenom: "BEAST",
          coinMinimalDenom: "peggy0xA4426666addBE8c4985377d36683D17FB40c31Be",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/beast.png",
          base: "ibc/B84F8CC583A54DA8173711C0B66B22FDC1954FEB1CA8DBC66C89919DAFE02000",
        },
        {
          coinDenom: "HAVA",
          coinMinimalDenom:
            "factory/inj1h0ypsdtjfcjynqu3m75z2zwwz5mmrj8rtk2g52/uhava",
          coinDecimals: 6,
          coinGeckoId: "hava-coin",
          coinImageUrl: "/tokens/generated/hava.png",
          base: "ibc/884EBC228DFCE8F1304D917A712AA9611427A6C1ECC3179B2E91D7468FB091A2",
        },
        {
          coinDenom: "COSMO",
          coinMinimalDenom:
            "factory/inj1je6n5sr4qtx2lhpldfxndntmgls9hf38ncmcez/COSMO",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/cosmo.png",
          base: "ibc/4925733868E7999F5822C961ADE9470A7FC5FA4A560BAE1DE102783C3F64C201",
        },
        {
          coinDenom: "USDT.inj",
          coinMinimalDenom: "peggy0xdAC17F958D2ee523a2206206994597C13D831ec7",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdt.inj.svg",
          base: "ibc/2AD3C64D19ADFBB522CD738B58F421102143F827C1CAFF574A8BF0B81017D53D",
          pegMechanism: "collateralized",
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "INJ",
        coinMinimalDenom: "inj",
        coinGeckoId: "injective-protocol",
        coinImageUrl: "/tokens/generated/inj.svg",
        base: "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273",
      },
      feeCurrencies: [
        {
          coinDenom: "INJ",
          coinMinimalDenom: "inj",
          coinDecimals: 18,
          coinGeckoId: "injective-protocol",
          coinImageUrl: "/tokens/generated/inj.svg",
          base: "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273",
          gasPriceStep: {
            low: 500000000,
            average: 700000000,
            high: 900000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "inj",
        bech32PrefixAccPub: "injpub",
        bech32PrefixValAddr: "injvaloper",
        bech32PrefixValPub: "injvaloperpub",
        bech32PrefixConsAddr: "injvalcons",
        bech32PrefixConsPub: "injvalconspub",
      },
      explorerUrlToTx:
        "https://explorer.injective.network/transaction/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "cerberus",
    status: "killed",
    network_type: "mainnet",
    pretty_name: "Cerberus",
    chain_id: "cerberus-chain-1",
    bech32_prefix: "cerberus",
    bech32_config: {
      bech32PrefixAccAddr: "cerberus",
      bech32PrefixAccPub: "cerberuspub",
      bech32PrefixValAddr: "cerberusvaloper",
      bech32PrefixValPub: "cerberusvaloperpub",
      bech32PrefixConsAddr: "cerberusvalcons",
      bech32PrefixConsPub: "cerberusvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ucrbrus",
          fixed_min_gas_price: 0,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ucrbrus",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.cerberus.zone:26657",
        },
      ],
      rest: [
        {
          address: "https://api.cerberus.zone:1317",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://skynetexplorers.com/Cerberus/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cerberus/images/crbrus.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cerberus/images/crbrus.svg",
      theme: {
        primary_color_hex: "#c6c6c9",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.cerberus.zone:26657",
      rest: "https://api.cerberus.zone:1317",
      chainId: "cerberus-chain-1",
      chainName: "cerberus",
      prettyChainName: "Cerberus",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "CRBRUS",
          coinMinimalDenom: "ucrbrus",
          coinDecimals: 6,
          coinGeckoId: "cerberus-2",
          coinImageUrl: "/tokens/generated/crbrus.svg",
          base: "ibc/41999DF04D9441DAC0DF5D8291DF4333FBCBA810FFD63FDCE34FDF41EF37B6F7",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "CRBRUS",
        coinMinimalDenom: "ucrbrus",
        coinGeckoId: "cerberus-2",
        coinImageUrl: "/tokens/generated/crbrus.svg",
        base: "ibc/41999DF04D9441DAC0DF5D8291DF4333FBCBA810FFD63FDCE34FDF41EF37B6F7",
      },
      feeCurrencies: [
        {
          coinDenom: "CRBRUS",
          coinMinimalDenom: "ucrbrus",
          coinDecimals: 6,
          coinGeckoId: "cerberus-2",
          coinImageUrl: "/tokens/generated/crbrus.svg",
          base: "ibc/41999DF04D9441DAC0DF5D8291DF4333FBCBA810FFD63FDCE34FDF41EF37B6F7",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "cerberus",
        bech32PrefixAccPub: "cerberuspub",
        bech32PrefixValAddr: "cerberusvaloper",
        bech32PrefixValPub: "cerberusvaloperpub",
        bech32PrefixConsAddr: "cerberusvalcons",
        bech32PrefixConsPub: "cerberusvalconspub",
      },
      explorerUrlToTx: "https://skynetexplorers.com/Cerberus/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "fetchhub",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Fetch.ai",
    chain_id: "fetchhub-4",
    bech32_prefix: "fetch",
    bech32_config: {
      bech32PrefixAccAddr: "fetch",
      bech32PrefixAccPub: "fetchpub",
      bech32PrefixValAddr: "fetchvaloper",
      bech32PrefixValPub: "fetchvaloperpub",
      bech32PrefixConsAddr: "fetchvalcons",
      bech32PrefixConsPub: "fetchvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "afet",
          low_gas_price: 0.025,
          average_gas_price: 0.025,
          high_gas_price: 0.035,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "afet",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc-fetchhub.fetch.ai:443",
        },
      ],
      rest: [
        {
          address: "https://rest-fetchhub.fetch.ai",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/fetchai/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.svg",
      theme: {
        primary_color_hex: "#2f3e74",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-fetchhub.fetch.ai:443",
      rest: "https://rest-fetchhub.fetch.ai",
      chainId: "fetchhub-4",
      chainName: "fetchhub",
      prettyChainName: "Fetch.ai",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "FET",
          coinMinimalDenom: "afet",
          coinDecimals: 18,
          coinGeckoId: "fetch-ai",
          coinImageUrl: "/tokens/generated/fet.svg",
          base: "ibc/5D1F516200EE8C6B2354102143B78A2DEDA25EDE771AC0F8DC3C1837C8FD4447",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.035,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "FET",
        coinMinimalDenom: "afet",
        coinGeckoId: "fetch-ai",
        coinImageUrl: "/tokens/generated/fet.svg",
        base: "ibc/5D1F516200EE8C6B2354102143B78A2DEDA25EDE771AC0F8DC3C1837C8FD4447",
      },
      feeCurrencies: [
        {
          coinDenom: "FET",
          coinMinimalDenom: "afet",
          coinDecimals: 18,
          coinGeckoId: "fetch-ai",
          coinImageUrl: "/tokens/generated/fet.svg",
          base: "ibc/5D1F516200EE8C6B2354102143B78A2DEDA25EDE771AC0F8DC3C1837C8FD4447",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.035,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "fetch",
        bech32PrefixAccPub: "fetchpub",
        bech32PrefixValAddr: "fetchvaloper",
        bech32PrefixValPub: "fetchvaloperpub",
        bech32PrefixConsAddr: "fetchvalcons",
        bech32PrefixConsPub: "fetchvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/fetchai/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "assetmantle",
    status: "live",
    network_type: "mainnet",
    pretty_name: "AssetMantle",
    chain_id: "mantle-1",
    bech32_prefix: "mantle",
    bech32_config: {
      bech32PrefixAccAddr: "mantle",
      bech32PrefixAccPub: "mantlepub",
      bech32PrefixValAddr: "mantlevaloper",
      bech32PrefixValPub: "mantlevaloperpub",
      bech32PrefixConsAddr: "mantlevalcons",
      bech32PrefixConsPub: "mantlevalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "umntl",
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "umntl",
        },
      ],
    },
    description:
      "AssetMantle’s suite of products is focused on the NFT ecosystem, helping you up your game with digital asset ownership.",
    apis: {
      rpc: [
        {
          address: "https://rpc.assetmantle.one/",
        },
      ],
      rest: [
        {
          address: "https://rest.assetmantle.one/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/asset-mantle/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/assetmantle/images/AM_Logo.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/assetmantle/images/AM_Logo_Dark.svg",
      theme: {
        primary_color_hex: "#f6b620",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.assetmantle.one/",
      rest: "https://rest.assetmantle.one/",
      chainId: "mantle-1",
      chainName: "assetmantle",
      prettyChainName: "AssetMantle",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "MNTL",
          coinMinimalDenom: "umntl",
          coinDecimals: 6,
          coinGeckoId: "assetmantle",
          coinImageUrl: "/tokens/generated/mntl.svg",
          base: "ibc/CBA34207E969623D95D057D9B11B0C8B32B89A71F170577D982FDDE623813FFC",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "MNTL",
        coinMinimalDenom: "umntl",
        coinGeckoId: "assetmantle",
        coinImageUrl: "/tokens/generated/mntl.svg",
        base: "ibc/CBA34207E969623D95D057D9B11B0C8B32B89A71F170577D982FDDE623813FFC",
      },
      feeCurrencies: [
        {
          coinDenom: "MNTL",
          coinMinimalDenom: "umntl",
          coinDecimals: 6,
          coinGeckoId: "assetmantle",
          coinImageUrl: "/tokens/generated/mntl.svg",
          base: "ibc/CBA34207E969623D95D057D9B11B0C8B32B89A71F170577D982FDDE623813FFC",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "mantle",
        bech32PrefixAccPub: "mantlepub",
        bech32PrefixValAddr: "mantlevaloper",
        bech32PrefixValPub: "mantlevaloperpub",
        bech32PrefixConsAddr: "mantlevalcons",
        bech32PrefixConsPub: "mantlevalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/asset-mantle/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "provenance",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Provenance",
    chain_id: "pio-mainnet-1",
    bech32_prefix: "pb",
    bech32_config: {
      bech32PrefixAccAddr: "pb",
      bech32PrefixAccPub: "pbpub",
      bech32PrefixValAddr: "pbvaloper",
      bech32PrefixValPub: "pbvaloperpub",
      bech32PrefixConsAddr: "pbvalcons",
      bech32PrefixConsPub: "pbvalconspub",
    },
    slip44: 505,
    fees: {
      fee_tokens: [
        {
          denom: "nhash",
          fixed_min_gas_price: 1905,
          low_gas_price: 1905,
          average_gas_price: 2100,
          high_gas_price: 2500,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "nhash",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.provenance.io/",
        },
      ],
      rest: [
        {
          address: "https://api.provenance.io",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/provenance/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/provenance/images/prov.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/provenance/images/prov.svg",
      theme: {
        primary_color_hex: "#4c7cdc",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.provenance.io/",
      rest: "https://api.provenance.io",
      chainId: "pio-mainnet-1",
      chainName: "provenance",
      prettyChainName: "Provenance",
      bip44: {
        coinType: 505,
      },
      currencies: [
        {
          coinDenom: "HASH",
          coinMinimalDenom: "nhash",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/hash.svg",
          base: "ibc/CE5BFF1D9BADA03BB5CCA5F56939392A761B53A10FBD03B37506669C3218D3B2",
          gasPriceStep: {
            low: 1905,
            average: 2100,
            high: 2500,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 9,
        coinDenom: "HASH",
        coinMinimalDenom: "nhash",
        coinImageUrl: "/tokens/generated/hash.svg",
        base: "ibc/CE5BFF1D9BADA03BB5CCA5F56939392A761B53A10FBD03B37506669C3218D3B2",
      },
      feeCurrencies: [
        {
          coinDenom: "HASH",
          coinMinimalDenom: "nhash",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/hash.svg",
          base: "ibc/CE5BFF1D9BADA03BB5CCA5F56939392A761B53A10FBD03B37506669C3218D3B2",
          gasPriceStep: {
            low: 1905,
            average: 2100,
            high: 2500,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "pb",
        bech32PrefixAccPub: "pbpub",
        bech32PrefixValAddr: "pbvaloper",
        bech32PrefixValPub: "pbvaloperpub",
        bech32PrefixConsAddr: "pbvalcons",
        bech32PrefixConsPub: "pbvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/provenance/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "galaxy",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Galaxy",
    chain_id: "galaxy-1",
    bech32_prefix: "galaxy",
    bech32_config: {
      bech32PrefixAccAddr: "galaxy",
      bech32PrefixAccPub: "galaxypub",
      bech32PrefixValAddr: "galaxyvaloper",
      bech32PrefixValPub: "galaxyvaloperpub",
      bech32PrefixConsAddr: "galaxyvalcons",
      bech32PrefixConsPub: "galaxyvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uglx",
          low_gas_price: 0.025,
          average_gas_price: 0.025,
          high_gas_price: 0.035,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uglx",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://galaxy-rpc.brocha.in",
        },
      ],
      rest: [
        {
          address: "https://galaxy-rest.brocha.in",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.postcapitalist.io/galaxy/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/galaxy/images/glx.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/galaxy/images/glx.svg",
      theme: {
        primary_color_hex: "#5e3be6",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://galaxy-rpc.brocha.in",
      rest: "https://galaxy-rest.brocha.in",
      chainId: "galaxy-1",
      chainName: "galaxy",
      prettyChainName: "Galaxy",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "GLX",
          coinMinimalDenom: "uglx",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/glx.svg",
          base: "ibc/F49DE040EBA5AB2FAD5F660C2A1DDF98A68470FAE82229818BE775EBF3EE79F2",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.035,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "GLX",
        coinMinimalDenom: "uglx",
        coinImageUrl: "/tokens/generated/glx.svg",
        base: "ibc/F49DE040EBA5AB2FAD5F660C2A1DDF98A68470FAE82229818BE775EBF3EE79F2",
      },
      feeCurrencies: [
        {
          coinDenom: "GLX",
          coinMinimalDenom: "uglx",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/glx.svg",
          base: "ibc/F49DE040EBA5AB2FAD5F660C2A1DDF98A68470FAE82229818BE775EBF3EE79F2",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.035,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "galaxy",
        bech32PrefixAccPub: "galaxypub",
        bech32PrefixValAddr: "galaxyvaloper",
        bech32PrefixValPub: "galaxyvaloperpub",
        bech32PrefixConsAddr: "galaxyvalcons",
        bech32PrefixConsPub: "galaxyvalconspub",
      },
      explorerUrlToTx: "https://explorer.postcapitalist.io/galaxy/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "meme",
    status: "live",
    network_type: "mainnet",
    pretty_name: "MEME",
    chain_id: "meme-1",
    bech32_prefix: "meme",
    bech32_config: {
      bech32PrefixAccAddr: "meme",
      bech32PrefixAccPub: "memepub",
      bech32PrefixValAddr: "memevaloper",
      bech32PrefixValPub: "memevaloperpub",
      bech32PrefixConsAddr: "memevalcons",
      bech32PrefixConsPub: "memevalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "umeme",
          fixed_min_gas_price: 0.025,
          low_gas_price: 0.025,
          average_gas_price: 0.035,
          high_gas_price: 0.045,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "umeme",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc-meme-1.meme.sx:443",
        },
      ],
      rest: [
        {
          address: "https://api-meme-1.meme.sx:443",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.meme.sx/meme/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/meme/images/meme.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/meme/images/meme.svg",
      theme: {
        primary_color_hex: "#b7dcd8",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-meme-1.meme.sx:443",
      rest: "https://api-meme-1.meme.sx:443",
      chainId: "meme-1",
      chainName: "meme",
      prettyChainName: "MEME",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "MEME",
          coinMinimalDenom: "umeme",
          coinDecimals: 6,
          coinGeckoId: "meme-network",
          coinImageUrl: "/tokens/generated/meme.svg",
          base: "ibc/67C89B8B0A70C08F093C909A4DD996DD10E0494C87E28FD9A551697BF173D4CA",
          gasPriceStep: {
            low: 0.025,
            average: 0.035,
            high: 0.045,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "MEME",
        coinMinimalDenom: "umeme",
        coinGeckoId: "meme-network",
        coinImageUrl: "/tokens/generated/meme.svg",
        base: "ibc/67C89B8B0A70C08F093C909A4DD996DD10E0494C87E28FD9A551697BF173D4CA",
      },
      feeCurrencies: [
        {
          coinDenom: "MEME",
          coinMinimalDenom: "umeme",
          coinDecimals: 6,
          coinGeckoId: "meme-network",
          coinImageUrl: "/tokens/generated/meme.svg",
          base: "ibc/67C89B8B0A70C08F093C909A4DD996DD10E0494C87E28FD9A551697BF173D4CA",
          gasPriceStep: {
            low: 0.025,
            average: 0.035,
            high: 0.045,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "meme",
        bech32PrefixAccPub: "memepub",
        bech32PrefixValAddr: "memevaloper",
        bech32PrefixValPub: "memevaloperpub",
        bech32PrefixConsAddr: "memevalcons",
        bech32PrefixConsPub: "memevalconspub",
      },
      explorerUrlToTx: "https://explorer.meme.sx/meme/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "evmos",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Evmos",
    chain_id: "evmos_9001-2",
    bech32_prefix: "evmos",
    bech32_config: {
      bech32PrefixAccAddr: "evmos",
      bech32PrefixAccPub: "evmospub",
      bech32PrefixValAddr: "evmosvaloper",
      bech32PrefixValPub: "evmosvaloperpub",
      bech32PrefixConsAddr: "evmosvalcons",
      bech32PrefixConsPub: "evmosvalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "aevmos",
          fixed_min_gas_price: 250000000,
          low_gas_price: 20000000000,
          average_gas_price: 25000000000,
          high_gas_price: 40000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "aevmos",
        },
      ],
    },
    description:
      "Developers use Evmos as the Ethereum Canary Chain to deploy applications of the future. Get all the functionalities of Ethereum with the power of IBC and Interchain composability.",
    apis: {
      rpc: [
        {
          address: "https://rpc-evmos.keplr.app/",
        },
      ],
      rest: [
        {
          address: "https://lcd-evmos.keplr.app/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/evmos/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.svg",
      theme: {
        primary_color_hex: "#ec4c34",
      },
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://rpc-evmos.keplr.app/",
      rest: "https://lcd-evmos.keplr.app/",
      chainId: "evmos_9001-2",
      chainName: "evmos",
      prettyChainName: "Evmos",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "EVMOS",
          coinMinimalDenom: "aevmos",
          coinDecimals: 18,
          coinGeckoId: "evmos",
          coinImageUrl: "/tokens/generated/evmos.svg",
          base: "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A",
          gasPriceStep: {
            low: 20000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
        {
          coinDenom: "NEOK",
          coinMinimalDenom: "erc20/0x655ecB57432CC1370f65e5dc2309588b71b473A9",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/neok.svg",
          base: "ibc/DEE262653B9DE39BCEF0493D47E0DFC4FE62F7F046CF38B9FDEFEBE98D149A71",
        },
        {
          coinDenom: "BERLIN-legacy",
          coinMinimalDenom: "erc20/0x1cFc8f1FE8D5668BAFF2724547EcDbd6f013a280",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/berlin-legacy.svg",
          base: "ibc/2BF9656CAB0384A31167DB9B0254F0FB1CB4346A229BD7E5CBDCBB911C3740F7",
        },
        {
          coinDenom: "CROWDP",
          coinMinimalDenom: "erc20/0xfbF4318d24a93753F11d365A6dcF8b830e98Ab0F",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/crowdp.svg",
          base: "ibc/5EC896BED3EBCB2CB6F1C167582E4EFA3F6FA3385F28BA5EA92D4A489DA010C5",
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "EVMOS",
        coinMinimalDenom: "aevmos",
        coinGeckoId: "evmos",
        coinImageUrl: "/tokens/generated/evmos.svg",
        base: "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A",
      },
      feeCurrencies: [
        {
          coinDenom: "EVMOS",
          coinMinimalDenom: "aevmos",
          coinDecimals: 18,
          coinGeckoId: "evmos",
          coinImageUrl: "/tokens/generated/evmos.svg",
          base: "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A",
          gasPriceStep: {
            low: 20000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "evmos",
        bech32PrefixAccPub: "evmospub",
        bech32PrefixValAddr: "evmosvaloper",
        bech32PrefixValPub: "evmosvaloperpub",
        bech32PrefixConsAddr: "evmosvalcons",
        bech32PrefixConsPub: "evmosvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/evmos/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "terra2",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Terra",
    chain_id: "phoenix-1",
    bech32_prefix: "terra",
    bech32_config: {
      bech32PrefixAccAddr: "terra",
      bech32PrefixAccPub: "terrapub",
      bech32PrefixValAddr: "terravaloper",
      bech32PrefixValPub: "terravaloperpub",
      bech32PrefixConsAddr: "terravalcons",
      bech32PrefixConsPub: "terravalconspub",
    },
    slip44: 330,
    fees: {
      fee_tokens: [
        {
          denom: "uluna",
          fixed_min_gas_price: 0.015,
          low_gas_price: 0.015,
          average_gas_price: 0.015,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uluna",
        },
      ],
    },
    description:
      "Fueled by a passionate community and deep developer talent pool, the Terra blockchain is built to enable the next generation of Web3 products and services.",
    apis: {
      rpc: [
        {
          address: "https://terra2-rpc.lavenderfive.com:443",
        },
      ],
      rest: [
        {
          address: "https://terra-rest.publicnode.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://finder.terra.money/phoenix-1/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/luna.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/luna.svg",
      theme: {
        primary_color_hex: "#f4de6f",
      },
    },
    features: ["ibc-transfer", "cosmwasm", "wasmd_0.24+"],
    keplrChain: {
      rpc: "https://terra2-rpc.lavenderfive.com:443",
      rest: "https://terra-rest.publicnode.com",
      chainId: "phoenix-1",
      chainName: "terra2",
      prettyChainName: "Terra",
      bip44: {
        coinType: 330,
      },
      currencies: [
        {
          coinDenom: "LUNA",
          coinMinimalDenom: "uluna",
          coinDecimals: 6,
          coinGeckoId: "terra-luna-2",
          coinImageUrl: "/tokens/generated/luna.svg",
          base: "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
          gasPriceStep: {
            low: 0.015,
            average: 0.015,
            high: 0.04,
          },
        },
        {
          type: "cw20",
          coinDenom: "ROAR",
          coinMinimalDenom:
            "cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv:ROAR",
          contractAddress:
            "terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
          coinDecimals: 6,
          coinGeckoId: "lion-dao",
          coinImageUrl: "/tokens/generated/roar.png",
          base: "ibc/98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0",
        },
        {
          type: "cw20",
          coinDenom: "CUB",
          coinMinimalDenom:
            "cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t:CUB",
          contractAddress:
            "terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/cub.png",
          base: "ibc/6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3",
        },
        {
          type: "cw20",
          coinDenom: "BLUE",
          coinMinimalDenom:
            "cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584:BLUE",
          contractAddress:
            "terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/blue.png",
          base: "ibc/DA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E",
        },
        {
          type: "cw20",
          coinDenom: "ASTRO.terra",
          coinMinimalDenom:
            "cw20:terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26:ASTRO.terra",
          contractAddress:
            "terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/astro.terra.svg",
          base: "ibc/C25A2303FE24B922DAFFDCE377AC5A42E5EF746806D32E2ED4B610DE85C203F7",
        },
        {
          type: "cw20",
          coinDenom: "BMOS",
          coinMinimalDenom:
            "cw20:terra1sxe8u2hjczlekwfkcq0rs28egt38pg3wqzfx4zcrese4fnvzzupsk9gjkq:BMOS",
          contractAddress:
            "terra1sxe8u2hjczlekwfkcq0rs28egt38pg3wqzfx4zcrese4fnvzzupsk9gjkq",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/bmos.png",
          base: "ibc/7D389F0ABF1E4D45BE6D7BBE36A2C50EA0559C01E076B02F8E381E685EC1F942",
        },
        {
          type: "cw20",
          coinDenom: "SAYVE",
          coinMinimalDenom:
            "cw20:terra1xp9hrhthzddnl7j5du83gqqr4wmdjm5t0guzg9jp6jwrtpukwfjsjgy4f3:SAYVE",
          contractAddress:
            "terra1xp9hrhthzddnl7j5du83gqqr4wmdjm5t0guzg9jp6jwrtpukwfjsjgy4f3",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sayve.svg",
          base: "ibc/06EF575844982382F4D1BC3830D294557A30EDB3CD223153AFC8DFEF06349C56",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "LUNA",
        coinMinimalDenom: "uluna",
        coinGeckoId: "terra-luna-2",
        coinImageUrl: "/tokens/generated/luna.svg",
        base: "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
      },
      feeCurrencies: [
        {
          coinDenom: "LUNA",
          coinMinimalDenom: "uluna",
          coinDecimals: 6,
          coinGeckoId: "terra-luna-2",
          coinImageUrl: "/tokens/generated/luna.svg",
          base: "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
          gasPriceStep: {
            low: 0.015,
            average: 0.015,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "terra",
        bech32PrefixAccPub: "terrapub",
        bech32PrefixValAddr: "terravaloper",
        bech32PrefixValPub: "terravaloperpub",
        bech32PrefixConsAddr: "terravalcons",
        bech32PrefixConsPub: "terravalconspub",
      },
      explorerUrlToTx: "https://finder.terra.money/phoenix-1/tx/{txHash}",
      features: ["ibc-transfer", "cosmwasm", "wasmd_0.24+"],
    },
  },
  {
    chain_name: "rizon",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Rizon",
    chain_id: "titan-1",
    bech32_prefix: "rizon",
    bech32_config: {
      bech32PrefixAccAddr: "rizon",
      bech32PrefixAccPub: "rizonpub",
      bech32PrefixValAddr: "rizonvaloper",
      bech32PrefixValPub: "rizonvaloperpub",
      bech32PrefixConsAddr: "rizonvalcons",
      bech32PrefixConsPub: "rizonvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uatolo",
          low_gas_price: 0.025,
          average_gas_price: 0.025,
          high_gas_price: 0.035,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uatolo",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpcapi.rizon.world/",
        },
      ],
      rest: [
        {
          address: "https://restapi.rizon.world/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/rizon/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rizon/images/atolo.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rizon/images/atolo.svg",
      theme: {
        primary_color_hex: "#2b1c54",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpcapi.rizon.world/",
      rest: "https://restapi.rizon.world/",
      chainId: "titan-1",
      chainName: "rizon",
      prettyChainName: "Rizon",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "ATOLO",
          coinMinimalDenom: "uatolo",
          coinDecimals: 6,
          coinGeckoId: "rizon",
          coinImageUrl: "/tokens/generated/atolo.svg",
          base: "ibc/2716E3F2E146664BEFA9217F1A03BFCEDBCD5178B3C71CACB1A0D7584451D219",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.035,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "ATOLO",
        coinMinimalDenom: "uatolo",
        coinGeckoId: "rizon",
        coinImageUrl: "/tokens/generated/atolo.svg",
        base: "ibc/2716E3F2E146664BEFA9217F1A03BFCEDBCD5178B3C71CACB1A0D7584451D219",
      },
      feeCurrencies: [
        {
          coinDenom: "ATOLO",
          coinMinimalDenom: "uatolo",
          coinDecimals: 6,
          coinGeckoId: "rizon",
          coinImageUrl: "/tokens/generated/atolo.svg",
          base: "ibc/2716E3F2E146664BEFA9217F1A03BFCEDBCD5178B3C71CACB1A0D7584451D219",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.035,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "rizon",
        bech32PrefixAccPub: "rizonpub",
        bech32PrefixValAddr: "rizonvaloper",
        bech32PrefixValPub: "rizonvaloperpub",
        bech32PrefixConsAddr: "rizonvalcons",
        bech32PrefixConsPub: "rizonvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/rizon/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "kava",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Kava",
    chain_id: "kava_2222-10",
    bech32_prefix: "kava",
    bech32_config: {
      bech32PrefixAccAddr: "kava",
      bech32PrefixAccPub: "kavapub",
      bech32PrefixValAddr: "kavavaloper",
      bech32PrefixValPub: "kavavaloperpub",
      bech32PrefixConsAddr: "kavavalcons",
      bech32PrefixConsPub: "kavavalconspub",
    },
    slip44: 459,
    alternative_slip44s: [118],
    fees: {
      fee_tokens: [
        {
          denom: "ukava",
          low_gas_price: 0.05,
          average_gas_price: 0.1,
          high_gas_price: 0.25,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ukava",
        },
      ],
    },
    description:
      "Kava is a decentralized blockchain that combines the speed and interoperability of Cosmos with the developer power of Ethereum.",
    apis: {
      rpc: [
        {
          address: "https://rpc-kava.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-kava.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/kava/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/kava.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/kava.svg",
      theme: {
        primary_color_hex: "#e64942",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-kava.keplr.app",
      rest: "https://lcd-kava.keplr.app",
      chainId: "kava_2222-10",
      chainName: "kava",
      prettyChainName: "Kava",
      bip44: {
        coinType: 459,
      },
      currencies: [
        {
          coinDenom: "KAVA",
          coinMinimalDenom: "ukava",
          coinDecimals: 6,
          coinGeckoId: "kava",
          coinImageUrl: "/tokens/generated/kava.svg",
          base: "ibc/57AA1A70A4BC9769C525EBF6386F7A21536E04A79D62E1981EFCEF9428EBB205",
          gasPriceStep: {
            low: 0.05,
            average: 0.1,
            high: 0.25,
          },
        },
        {
          coinDenom: "HARD",
          coinMinimalDenom: "hard",
          coinDecimals: 6,
          coinGeckoId: "kava-lend",
          coinImageUrl: "/tokens/generated/hard.svg",
          base: "ibc/D6C28E07F7343360AC41E15DDD44D79701DDCA2E0C2C41279739C8D4AE5264BC",
        },
        {
          coinDenom: "SWP",
          coinMinimalDenom: "swp",
          coinDecimals: 6,
          coinGeckoId: "kava-swap",
          coinImageUrl: "/tokens/generated/swp.svg",
          base: "ibc/70CF1A54E23EA4E480DEDA9E12082D3FD5684C3483CBDCE190C5C807227688C5",
        },
        {
          coinDenom: "USDX",
          coinMinimalDenom: "usdx",
          coinDecimals: 6,
          coinGeckoId: "usdx",
          coinImageUrl: "/tokens/generated/usdx.svg",
          base: "ibc/C78F65E1648A3DFE0BAEB6C4CDA69CC2A75437F1793C0E6386DFDA26393790AE",
        },
        {
          coinDenom: "USDT.kava",
          coinMinimalDenom: "erc20/tether/usdt",
          coinDecimals: 6,
          coinGeckoId: "tether",
          coinImageUrl: "/tokens/generated/usdt.kava.svg",
          base: "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
          pegMechanism: "collateralized",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "KAVA",
        coinMinimalDenom: "ukava",
        coinGeckoId: "kava",
        coinImageUrl: "/tokens/generated/kava.svg",
        base: "ibc/57AA1A70A4BC9769C525EBF6386F7A21536E04A79D62E1981EFCEF9428EBB205",
      },
      feeCurrencies: [
        {
          coinDenom: "KAVA",
          coinMinimalDenom: "ukava",
          coinDecimals: 6,
          coinGeckoId: "kava",
          coinImageUrl: "/tokens/generated/kava.svg",
          base: "ibc/57AA1A70A4BC9769C525EBF6386F7A21536E04A79D62E1981EFCEF9428EBB205",
          gasPriceStep: {
            low: 0.05,
            average: 0.1,
            high: 0.25,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "kava",
        bech32PrefixAccPub: "kavapub",
        bech32PrefixValAddr: "kavavaloper",
        bech32PrefixValPub: "kavavaloperpub",
        bech32PrefixConsAddr: "kavavalcons",
        bech32PrefixConsPub: "kavavalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/kava/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "genesisl1",
    status: "live",
    network_type: "mainnet",
    pretty_name: "GenesisL1",
    chain_id: "genesis_29-2",
    bech32_prefix: "genesis",
    bech32_config: {
      bech32PrefixAccAddr: "genesis",
      bech32PrefixAccPub: "genesispub",
      bech32PrefixValAddr: "genesisvaloper",
      bech32PrefixValPub: "genesisvaloperpub",
      bech32PrefixConsAddr: "genesisvalcons",
      bech32PrefixConsPub: "genesisvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "el1",
          low_gas_price: 51000000000,
          average_gas_price: 52000000000,
          high_gas_price: 53000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "el1",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://26657.genesisl1.org",
        },
      ],
      rest: [
        {
          address: "https://api.genesisl1.org",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/genesisL1/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/genesisl1/images/l1.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/genesisl1/images/l1.svg",
      theme: {
        primary_color_hex: "#040404",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://26657.genesisl1.org",
      rest: "https://api.genesisl1.org",
      chainId: "genesis_29-2",
      chainName: "genesisl1",
      prettyChainName: "GenesisL1",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "L1",
          coinMinimalDenom: "el1",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/l1.svg",
          base: "ibc/F16FDC11A7662B86BC0B9CE61871CBACF7C20606F95E86260FD38915184B75B4",
          gasPriceStep: {
            low: 51000000000,
            average: 52000000000,
            high: 53000000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "L1",
        coinMinimalDenom: "el1",
        coinImageUrl: "/tokens/generated/l1.svg",
        base: "ibc/F16FDC11A7662B86BC0B9CE61871CBACF7C20606F95E86260FD38915184B75B4",
      },
      feeCurrencies: [
        {
          coinDenom: "L1",
          coinMinimalDenom: "el1",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/l1.svg",
          base: "ibc/F16FDC11A7662B86BC0B9CE61871CBACF7C20606F95E86260FD38915184B75B4",
          gasPriceStep: {
            low: 51000000000,
            average: 52000000000,
            high: 53000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "genesis",
        bech32PrefixAccPub: "genesispub",
        bech32PrefixValAddr: "genesisvaloper",
        bech32PrefixValPub: "genesisvaloperpub",
        bech32PrefixConsAddr: "genesisvalcons",
        bech32PrefixConsPub: "genesisvalconspub",
      },
      explorerUrlToTx: "https://ping.pub/genesisL1/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "kujira",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Kujira",
    chain_id: "kaiyo-1",
    bech32_prefix: "kujira",
    bech32_config: {
      bech32PrefixAccAddr: "kujira",
      bech32PrefixAccPub: "kujirapub",
      bech32PrefixValAddr: "kujiravaloper",
      bech32PrefixValPub: "kujiravaloperpub",
      bech32PrefixConsAddr: "kujiravalcons",
      bech32PrefixConsPub: "kujiravalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ukuji",
          fixed_min_gas_price: 0.0034,
          low_gas_price: 0.0034,
          average_gas_price: 0.0051,
          high_gas_price: 0.00681,
        },
        {
          denom:
            "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
          fixed_min_gas_price: 0.01186,
          low_gas_price: 0.01186,
          average_gas_price: 0.01779,
          high_gas_price: 0.02372,
        },
        {
          denom:
            "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
          fixed_min_gas_price: 0.0119,
          low_gas_price: 0.0119,
          average_gas_price: 0.01785,
          high_gas_price: 0.02379,
        },
        {
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          fixed_min_gas_price: 0.00129,
          low_gas_price: 0.00129,
          average_gas_price: 0.00193,
          high_gas_price: 0.00258,
        },
        {
          denom:
            "ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23",
          fixed_min_gas_price: 0.01795,
          low_gas_price: 0.01795,
          average_gas_price: 0.02692,
          high_gas_price: 0.0359,
        },
        {
          denom:
            "ibc/3607EB5B5E64DD1C0E12E07F077FF470D5BC4706AFCBC98FE1BA960E5AE4CE07",
          fixed_min_gas_price: 0.65943,
          low_gas_price: 0.65943,
          average_gas_price: 0.98915,
          high_gas_price: 1.31887,
        },
        {
          denom:
            "ibc/F3AA7EF362EC5E791FE78A0F4CCC69FEE1F9A7485EB1A8CAB3F6601C00522F10",
          fixed_min_gas_price: 160416396197,
          low_gas_price: 160416396197,
          average_gas_price: 240624594296,
          high_gas_price: 320832792394,
        },
        {
          denom:
            "ibc/EFF323CC632EC4F747C61BCE238A758EFDB7699C3226565F7C20DA06509D59A5",
          fixed_min_gas_price: 0.02689,
          low_gas_price: 0.02689,
          average_gas_price: 0.04034,
          high_gas_price: 0.05379,
        },
        {
          denom:
            "ibc/DA59C009A0B3B95E0549E6BF7B075C8239285989FF457A8EDDBB56F10B2A6986",
          fixed_min_gas_price: 0.01495,
          low_gas_price: 0.01495,
          average_gas_price: 0.02243,
          high_gas_price: 0.02991,
        },
        {
          denom:
            "ibc/A358D7F19237777AF6D8AD0E0F53268F8B18AE8A53ED318095C14D6D7F3B2DB5",
          fixed_min_gas_price: 0.03139,
          low_gas_price: 0.03139,
          average_gas_price: 0.04709,
          high_gas_price: 0.06278,
        },
        {
          denom:
            "ibc/4F393C3FCA4190C0A6756CE7F6D897D5D1BE57D6CCB80D0BC87393566A7B6602",
          fixed_min_gas_price: 0.90403,
          low_gas_price: 0.90403,
          average_gas_price: 1.35605,
          high_gas_price: 1.80806,
        },
        {
          denom:
            "ibc/004EBF085BBED1029326D56BE8A2E67C08CECE670A94AC1947DF413EF5130EB2",
          fixed_min_gas_price: 559196837,
          low_gas_price: 559196837,
          average_gas_price: 838795256,
          high_gas_price: 1118393675,
        },
        {
          denom:
            "ibc/1B38805B1C75352B28169284F96DF56BDEBD9E8FAC005BDCC8CF0378C82AA8E7",
          fixed_min_gas_price: 5772801,
          low_gas_price: 5772801,
          average_gas_price: 8659201,
          high_gas_price: 11545602,
        },
        {
          denom: "factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta",
          fixed_min_gas_price: 0.01807,
          low_gas_price: 0.01807,
          average_gas_price: 0.02711,
          high_gas_price: 0.03615,
        },
        {
          denom:
            "ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9",
          fixed_min_gas_price: 0.01194,
          low_gas_price: 0.01194,
          average_gas_price: 0.01792,
          high_gas_price: 0.02389,
        },
        {
          denom:
            "ibc/E5CA126979E2FFB4C70C072F8094D07ECF27773B37623AD2BF7582AD0726F0F3",
          fixed_min_gas_price: 0.00019,
          low_gas_price: 0.00019,
          average_gas_price: 0.00029,
          high_gas_price: 0.00039,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ukuji",
        },
      ],
    },
    description:
      "A decentralized ecosystem for protocols, builders and web3 users seeking sustainable FinTech.",
    apis: {
      rpc: [
        {
          address: "https://kujira-rpc.polkachu.com",
        },
      ],
      rest: [
        {
          address: "https://kujira-api.polkachu.com/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://finder.kujira.app/kaiyo-1/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kujira-chain-logo.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.svg",
      theme: {
        primary_color_hex: "#e33b34",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://kujira-rpc.polkachu.com",
      rest: "https://kujira-api.polkachu.com/",
      chainId: "kaiyo-1",
      chainName: "kujira",
      prettyChainName: "Kujira",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "KUJI",
          coinMinimalDenom: "ukuji",
          coinDecimals: 6,
          coinGeckoId: "kujira",
          coinImageUrl: "/tokens/generated/kuji.svg",
          base: "ibc/BB6BCDB515050BAE97516111873CCD7BCF1FD0CCB723CC12F3C4F704D6C646CE",
          gasPriceStep: {
            low: 0.0034,
            average: 0.0051,
            high: 0.00681,
          },
        },
        {
          coinDenom: "USK",
          coinMinimalDenom:
            "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
          coinDecimals: 6,
          coinGeckoId: "usk",
          coinImageUrl: "/tokens/generated/usk.svg",
          base: "ibc/44492EAB24B72E3FB59B9FA619A22337FB74F95D8808FE6BC78CC0E6C18DC2EC",
          gasPriceStep: {
            low: 0.01186,
            average: 0.01779,
            high: 0.02372,
          },
        },
        {
          coinDenom: "MNTA",
          coinMinimalDenom:
            "factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta",
          coinDecimals: 6,
          coinGeckoId: "mantadao",
          coinImageUrl: "/tokens/generated/mnta.svg",
          base: "ibc/51D893F870B7675E507E91DA8DB0B22EA66333207E4F5C0708757F08EE059B0B",
          gasPriceStep: {
            low: 0.01807,
            average: 0.02711,
            high: 0.03615,
          },
        },
        {
          coinDenom: "NSTK",
          coinMinimalDenom:
            "factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk",
          coinDecimals: 6,
          coinGeckoId: "unstake-fi",
          coinImageUrl: "/tokens/generated/nstk.svg",
          base: "ibc/F74225B0AFD2F675AF56E9BE3F235486BCDE5C5E09AA88A97AFD2E052ABFE04C",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "KUJI",
        coinMinimalDenom: "ukuji",
        coinGeckoId: "kujira",
        coinImageUrl: "/tokens/generated/kuji.svg",
        base: "ibc/BB6BCDB515050BAE97516111873CCD7BCF1FD0CCB723CC12F3C4F704D6C646CE",
      },
      feeCurrencies: [
        {
          coinDenom: "KUJI",
          coinMinimalDenom: "ukuji",
          coinDecimals: 6,
          coinGeckoId: "kujira",
          coinImageUrl: "/tokens/generated/kuji.svg",
          base: "ibc/BB6BCDB515050BAE97516111873CCD7BCF1FD0CCB723CC12F3C4F704D6C646CE",
          gasPriceStep: {
            low: 0.0034,
            average: 0.0051,
            high: 0.00681,
          },
        },
        {
          coinDenom: "USK",
          coinMinimalDenom:
            "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
          coinDecimals: 6,
          coinGeckoId: "usk",
          coinImageUrl: "/tokens/generated/usk.svg",
          base: "ibc/44492EAB24B72E3FB59B9FA619A22337FB74F95D8808FE6BC78CC0E6C18DC2EC",
          gasPriceStep: {
            low: 0.01186,
            average: 0.01779,
            high: 0.02372,
          },
        },
        {
          coinDenom: "MNTA",
          coinMinimalDenom:
            "factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta",
          coinDecimals: 6,
          coinGeckoId: "mantadao",
          coinImageUrl: "/tokens/generated/mnta.svg",
          base: "ibc/51D893F870B7675E507E91DA8DB0B22EA66333207E4F5C0708757F08EE059B0B",
          gasPriceStep: {
            low: 0.01807,
            average: 0.02711,
            high: 0.03615,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "kujira",
        bech32PrefixAccPub: "kujirapub",
        bech32PrefixValAddr: "kujiravaloper",
        bech32PrefixValPub: "kujiravaloperpub",
        bech32PrefixConsAddr: "kujiravalcons",
        bech32PrefixConsPub: "kujiravalconspub",
      },
      explorerUrlToTx: "https://finder.kujira.app/kaiyo-1/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "tgrade",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Tgrade",
    chain_id: "tgrade-mainnet-1",
    bech32_prefix: "tgrade",
    bech32_config: {
      bech32PrefixAccAddr: "tgrade",
      bech32PrefixAccPub: "tgradepub",
      bech32PrefixValAddr: "tgradevaloper",
      bech32PrefixValPub: "tgradevaloperpub",
      bech32PrefixConsAddr: "tgradevalcons",
      bech32PrefixConsPub: "tgradevalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "utgd",
          fixed_min_gas_price: 0.05,
          low_gas_price: 0.05,
          average_gas_price: 0.075,
          high_gas_price: 0.1,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "utgd",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.mainnet-1.tgrade.confio.run",
        },
      ],
      rest: [
        {
          address: "https://api.mainnet-1.tgrade.confio.run",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://tgrade.aneka.io/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/tgrade/images/tgrade-logo-gradient_h.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/tgrade/images/tgrade-symbol-gradient.svg",
      theme: {
        primary_color_hex: "#c9167b",
      },
    },
    features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
    keplrChain: {
      rpc: "https://rpc.mainnet-1.tgrade.confio.run",
      rest: "https://api.mainnet-1.tgrade.confio.run",
      chainId: "tgrade-mainnet-1",
      chainName: "tgrade",
      prettyChainName: "Tgrade",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "TGD",
          coinMinimalDenom: "utgd",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/tgd.svg",
          base: "ibc/1E09CB0F506ACF12FDE4683FB6B34DA62FB4BE122641E0D93AAF98A87675676C",
          gasPriceStep: {
            low: 0.05,
            average: 0.075,
            high: 0.1,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "TGD",
        coinMinimalDenom: "utgd",
        coinImageUrl: "/tokens/generated/tgd.svg",
        base: "ibc/1E09CB0F506ACF12FDE4683FB6B34DA62FB4BE122641E0D93AAF98A87675676C",
      },
      feeCurrencies: [
        {
          coinDenom: "TGD",
          coinMinimalDenom: "utgd",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/tgd.svg",
          base: "ibc/1E09CB0F506ACF12FDE4683FB6B34DA62FB4BE122641E0D93AAF98A87675676C",
          gasPriceStep: {
            low: 0.05,
            average: 0.075,
            high: 0.1,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "tgrade",
        bech32PrefixAccPub: "tgradepub",
        bech32PrefixValAddr: "tgradevaloper",
        bech32PrefixValPub: "tgradevaloperpub",
        bech32PrefixConsAddr: "tgradevalcons",
        bech32PrefixConsPub: "tgradevalconspub",
      },
      explorerUrlToTx: "https://tgrade.aneka.io/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
    },
  },
  {
    chain_name: "echelon",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Echelon",
    chain_id: "echelon_3000-3",
    bech32_prefix: "echelon",
    bech32_config: {
      bech32PrefixAccAddr: "echelon",
      bech32PrefixAccPub: "echelonpub",
      bech32PrefixValAddr: "echelonvaloper",
      bech32PrefixValPub: "echelonvaloperpub",
      bech32PrefixConsAddr: "echelonvalcons",
      bech32PrefixConsPub: "echelonvalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "aechelon",
          low_gas_price: 10000000000,
          average_gas_price: 25000000000,
          high_gas_price: 40000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "aechelon",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc-echelon.whispernode.com/",
        },
      ],
      rest: [
        {
          address: "https://lcd-echelon.whispernode.com/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/echelon/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/echelon/images/logo.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/echelon/images/echelon.svg",
      theme: {
        primary_color_hex: "#b1f49a",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-echelon.whispernode.com/",
      rest: "https://lcd-echelon.whispernode.com/",
      chainId: "echelon_3000-3",
      chainName: "echelon",
      prettyChainName: "Echelon",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "ECH",
          coinMinimalDenom: "aechelon",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/ech.svg",
          base: "ibc/47EE224A9B33CF0ABEAC82106E52F0F6E8D8CEC5BA80B9D9A6F55172CBB0177D",
          gasPriceStep: {
            low: 10000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "ECH",
        coinMinimalDenom: "aechelon",
        coinImageUrl: "/tokens/generated/ech.svg",
        base: "ibc/47EE224A9B33CF0ABEAC82106E52F0F6E8D8CEC5BA80B9D9A6F55172CBB0177D",
      },
      feeCurrencies: [
        {
          coinDenom: "ECH",
          coinMinimalDenom: "aechelon",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/ech.svg",
          base: "ibc/47EE224A9B33CF0ABEAC82106E52F0F6E8D8CEC5BA80B9D9A6F55172CBB0177D",
          gasPriceStep: {
            low: 10000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "echelon",
        bech32PrefixAccPub: "echelonpub",
        bech32PrefixValAddr: "echelonvaloper",
        bech32PrefixValPub: "echelonvaloperpub",
        bech32PrefixConsAddr: "echelonvalcons",
        bech32PrefixConsPub: "echelonvalconspub",
      },
      explorerUrlToTx: "https://ping.pub/echelon/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "odin",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Odin Protocol",
    chain_id: "odin-mainnet-freya",
    bech32_prefix: "odin",
    bech32_config: {
      bech32PrefixAccAddr: "odin",
      bech32PrefixAccPub: "odinpub",
      bech32PrefixValAddr: "odinvaloper",
      bech32PrefixValPub: "odinvaloperpub",
      bech32PrefixConsAddr: "odinvalcons",
      bech32PrefixConsPub: "odinvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "loki",
          fixed_min_gas_price: 0.0125,
          low_gas_price: 0.025,
          average_gas_price: 0.05,
          high_gas_price: 0.06,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "loki",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.odinprotocol.io/",
        },
      ],
      rest: [
        {
          address: "https://api.odinprotocol.io/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://runa.odinprotocol.io/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/odin.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/odin.svg",
    },
    features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
    keplrChain: {
      rpc: "https://rpc.odinprotocol.io/",
      rest: "https://api.odinprotocol.io/",
      chainId: "odin-mainnet-freya",
      chainName: "odin",
      prettyChainName: "Odin Protocol",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "ODIN",
          coinMinimalDenom: "loki",
          coinDecimals: 6,
          coinGeckoId: "odin-protocol",
          coinImageUrl: "/tokens/generated/odin.svg",
          base: "ibc/C360EF34A86D334F625E4CBB7DA3223AEA97174B61F35BB3758081A8160F7D9B",
          gasPriceStep: {
            low: 0.025,
            average: 0.05,
            high: 0.06,
          },
        },
        {
          coinDenom: "GEO",
          coinMinimalDenom: "mGeo",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/geo.svg",
          base: "ibc/9B6FBABA36BB4A3BF127AE5E96B572A5197FD9F3111D895D8919B07BC290764A",
        },
        {
          coinDenom: "O9W",
          coinMinimalDenom: "mO9W",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/o9w.svg",
          base: "ibc/0CD46223FEABD2AEAAAF1F057D01E63BCA79B7D4BD6B68F1EB973A987344695D",
        },
        {
          coinDenom: "DOKI",
          coinMinimalDenom: "udoki",
          coinDecimals: 6,
          coinGeckoId: "doki",
          coinImageUrl: "/tokens/generated/doki.png",
          base: "ibc/C12C353A83CD1005FC38943410B894DBEC5F2ABC97FC12908F0FB03B970E8E1B",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "ODIN",
        coinMinimalDenom: "loki",
        coinGeckoId: "odin-protocol",
        coinImageUrl: "/tokens/generated/odin.svg",
        base: "ibc/C360EF34A86D334F625E4CBB7DA3223AEA97174B61F35BB3758081A8160F7D9B",
      },
      feeCurrencies: [
        {
          coinDenom: "ODIN",
          coinMinimalDenom: "loki",
          coinDecimals: 6,
          coinGeckoId: "odin-protocol",
          coinImageUrl: "/tokens/generated/odin.svg",
          base: "ibc/C360EF34A86D334F625E4CBB7DA3223AEA97174B61F35BB3758081A8160F7D9B",
          gasPriceStep: {
            low: 0.025,
            average: 0.05,
            high: 0.06,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "odin",
        bech32PrefixAccPub: "odinpub",
        bech32PrefixValAddr: "odinvaloper",
        bech32PrefixValPub: "odinvaloperpub",
        bech32PrefixConsAddr: "odinvalcons",
        bech32PrefixConsPub: "odinvalconspub",
      },
      explorerUrlToTx: "https://runa.odinprotocol.io/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
    },
  },
  {
    chain_name: "crescent",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Crescent",
    chain_id: "crescent-1",
    bech32_prefix: "cre",
    bech32_config: {
      bech32PrefixAccAddr: "cre",
      bech32PrefixAccPub: "crepub",
      bech32PrefixValAddr: "crevaloper",
      bech32PrefixValPub: "crevaloperpub",
      bech32PrefixConsAddr: "crevalcons",
      bech32PrefixConsPub: "crevalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ucre",
          fixed_min_gas_price: 0,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.03,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ucre",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://mainnet.crescent.network:26657",
        },
      ],
      rest: [
        {
          address: "https://mainnet.crescent.network:1317",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/crescent/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/crescent/images/cre.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/crescent/images/cre.svg",
      theme: {
        primary_color_hex: "#3c2832",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://mainnet.crescent.network:26657",
      rest: "https://mainnet.crescent.network:1317",
      chainId: "crescent-1",
      chainName: "crescent",
      prettyChainName: "Crescent",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "CRE",
          coinMinimalDenom: "ucre",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/cre.svg",
          base: "ibc/5A7C219BA5F7582B99629BA3B2A01A61BFDA0F6FD1FE95B5366F7334C4BC0580",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "CRE",
        coinMinimalDenom: "ucre",
        coinImageUrl: "/tokens/generated/cre.svg",
        base: "ibc/5A7C219BA5F7582B99629BA3B2A01A61BFDA0F6FD1FE95B5366F7334C4BC0580",
      },
      feeCurrencies: [
        {
          coinDenom: "CRE",
          coinMinimalDenom: "ucre",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/cre.svg",
          base: "ibc/5A7C219BA5F7582B99629BA3B2A01A61BFDA0F6FD1FE95B5366F7334C4BC0580",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "cre",
        bech32PrefixAccPub: "crepub",
        bech32PrefixValAddr: "crevaloper",
        bech32PrefixValPub: "crevaloperpub",
        bech32PrefixConsAddr: "crevalcons",
        bech32PrefixConsPub: "crevalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/crescent/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "lumenx",
    status: "killed",
    network_type: "mainnet",
    pretty_name: "LumenX",
    chain_id: "LumenX",
    bech32_prefix: "lumen",
    bech32_config: {
      bech32PrefixAccAddr: "lumen",
      bech32PrefixAccPub: "lumenpub",
      bech32PrefixValAddr: "lumenvaloper",
      bech32PrefixValPub: "lumenvaloperpub",
      bech32PrefixConsAddr: "lumenvalcons",
      bech32PrefixConsPub: "lumenvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ulumen",
          fixed_min_gas_price: 0.0025,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.03,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ulumen",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc-lumenx.cryptonet.pl/",
        },
      ],
      rest: [
        {
          address: "https://api-lumenx.cryptonet.pl/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/lumenx/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumenx/images/lumen.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumenx/images/lumen.svg",
      theme: {
        primary_color_hex: "#cb8b40",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-lumenx.cryptonet.pl/",
      rest: "https://api-lumenx.cryptonet.pl/",
      chainId: "LumenX",
      chainName: "lumenx",
      prettyChainName: "LumenX",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "LUMEN",
          coinMinimalDenom: "ulumen",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/lumen.svg",
          base: "ibc/FFA652599C77E853F017193E36B5AB2D4D9AFC4B54721A74904F80C9236BF3B7",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "LUMEN",
        coinMinimalDenom: "ulumen",
        coinImageUrl: "/tokens/generated/lumen.svg",
        base: "ibc/FFA652599C77E853F017193E36B5AB2D4D9AFC4B54721A74904F80C9236BF3B7",
      },
      feeCurrencies: [
        {
          coinDenom: "LUMEN",
          coinMinimalDenom: "ulumen",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/lumen.svg",
          base: "ibc/FFA652599C77E853F017193E36B5AB2D4D9AFC4B54721A74904F80C9236BF3B7",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "lumen",
        bech32PrefixAccPub: "lumenpub",
        bech32PrefixValAddr: "lumenvaloper",
        bech32PrefixValPub: "lumenvaloperpub",
        bech32PrefixConsAddr: "lumenvalcons",
        bech32PrefixConsPub: "lumenvalconspub",
      },
      explorerUrlToTx: "https://ping.pub/lumenx/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "oraichain",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Oraichain",
    chain_id: "Oraichain",
    bech32_prefix: "orai",
    bech32_config: {
      bech32PrefixAccAddr: "orai",
      bech32PrefixAccPub: "oraipub",
      bech32PrefixValAddr: "oraivaloper",
      bech32PrefixValPub: "oraivaloperpub",
      bech32PrefixConsAddr: "oraivalcons",
      bech32PrefixConsPub: "oraivalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "orai",
          fixed_min_gas_price: 0,
          low_gas_price: 0.003,
          average_gas_price: 0.005,
          high_gas_price: 0.007,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "orai",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.orai.io",
        },
      ],
      rest: [
        {
          address: "https://lcd.orai.io",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://scan.orai.io/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai.svg",
      theme: {
        circle: false,
        dark_mode: false,
        primary_color_hex: "#000000",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.orai.io",
      rest: "https://lcd.orai.io",
      chainId: "Oraichain",
      chainName: "oraichain",
      prettyChainName: "Oraichain",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "ORAI",
          coinMinimalDenom: "orai",
          coinDecimals: 6,
          coinGeckoId: "oraichain-token",
          coinImageUrl: "/tokens/generated/orai.svg",
          base: "ibc/161D7D62BAB3B9C39003334F1671208F43C06B643CC9EDBBE82B64793C857F1D",
          gasPriceStep: {
            low: 0.003,
            average: 0.005,
            high: 0.007,
          },
        },
        {
          coinDenom: "TON.orai",
          coinMinimalDenom:
            "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/ton",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/ton.orai.svg",
          base: "ibc/905889A7F0B94F1CE1506D9BADF13AE9141E4CBDBCD565E1DFC7AE418B3E3E98",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "ORAI",
        coinMinimalDenom: "orai",
        coinGeckoId: "oraichain-token",
        coinImageUrl: "/tokens/generated/orai.svg",
        base: "ibc/161D7D62BAB3B9C39003334F1671208F43C06B643CC9EDBBE82B64793C857F1D",
      },
      feeCurrencies: [
        {
          coinDenom: "ORAI",
          coinMinimalDenom: "orai",
          coinDecimals: 6,
          coinGeckoId: "oraichain-token",
          coinImageUrl: "/tokens/generated/orai.svg",
          base: "ibc/161D7D62BAB3B9C39003334F1671208F43C06B643CC9EDBBE82B64793C857F1D",
          gasPriceStep: {
            low: 0.003,
            average: 0.005,
            high: 0.007,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "orai",
        bech32PrefixAccPub: "oraipub",
        bech32PrefixValAddr: "oraivaloper",
        bech32PrefixValPub: "oraivaloperpub",
        bech32PrefixConsAddr: "oraivalcons",
        bech32PrefixConsPub: "oraivalconspub",
      },
      explorerUrlToTx: "https://scan.orai.io/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "cudos",
    status: "killed",
    network_type: "mainnet",
    pretty_name: "Cudos",
    chain_id: "cudos-1",
    bech32_prefix: "cudos",
    bech32_config: {
      bech32PrefixAccAddr: "cudos",
      bech32PrefixAccPub: "cudospub",
      bech32PrefixValAddr: "cudosvaloper",
      bech32PrefixValPub: "cudosvaloperpub",
      bech32PrefixConsAddr: "cudosvalcons",
      bech32PrefixConsPub: "cudosvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "acudos",
          low_gas_price: 5000000000000,
          average_gas_price: 10000000000000,
          high_gas_price: 20000000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "acudos",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.cudos.org",
        },
      ],
      rest: [
        {
          address: "https://rest.cudos.org",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.cudos.org/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cudos/images/cudos.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cudos/images/cudos.svg",
      theme: {
        primary_color_hex: "#5d95ec",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.cudos.org",
      rest: "https://rest.cudos.org",
      chainId: "cudos-1",
      chainName: "cudos",
      prettyChainName: "Cudos",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "CUDOS",
          coinMinimalDenom: "acudos",
          coinDecimals: 18,
          coinGeckoId: "cudos",
          coinImageUrl: "/tokens/generated/cudos.svg",
          base: "ibc/E09ED39F390EC51FA9F3F69BEA08B5BBE6A48B3057B2B1C3467FAAE9E58B021B",
          gasPriceStep: {
            low: 5000000000000,
            average: 10000000000000,
            high: 20000000000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "CUDOS",
        coinMinimalDenom: "acudos",
        coinGeckoId: "cudos",
        coinImageUrl: "/tokens/generated/cudos.svg",
        base: "ibc/E09ED39F390EC51FA9F3F69BEA08B5BBE6A48B3057B2B1C3467FAAE9E58B021B",
      },
      feeCurrencies: [
        {
          coinDenom: "CUDOS",
          coinMinimalDenom: "acudos",
          coinDecimals: 18,
          coinGeckoId: "cudos",
          coinImageUrl: "/tokens/generated/cudos.svg",
          base: "ibc/E09ED39F390EC51FA9F3F69BEA08B5BBE6A48B3057B2B1C3467FAAE9E58B021B",
          gasPriceStep: {
            low: 5000000000000,
            average: 10000000000000,
            high: 20000000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "cudos",
        bech32PrefixAccPub: "cudospub",
        bech32PrefixValAddr: "cudosvaloper",
        bech32PrefixValPub: "cudosvaloperpub",
        bech32PrefixConsAddr: "cudosvalcons",
        bech32PrefixConsPub: "cudosvalconspub",
      },
      explorerUrlToTx: "https://explorer.cudos.org/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "agoric",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Agoric",
    chain_id: "agoric-3",
    bech32_prefix: "agoric",
    bech32_config: {
      bech32PrefixAccAddr: "agoric",
      bech32PrefixAccPub: "agoricpub",
      bech32PrefixValAddr: "agoricvaloper",
      bech32PrefixValPub: "agoricvaloperpub",
      bech32PrefixConsAddr: "agoricvalcons",
      bech32PrefixConsPub: "agoricvalconspub",
    },
    slip44: 564,
    alternative_slip44s: [118],
    fees: {
      fee_tokens: [
        {
          denom: "ubld",
          low_gas_price: 0.03,
          average_gas_price: 0.05,
          high_gas_price: 0.07,
        },
        {
          denom: "uist",
          low_gas_price: 0.0034,
          average_gas_price: 0.007,
          high_gas_price: 0.02,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ubld",
        },
      ],
    },
    description:
      "The Agoric platform makes it safe and seamless to build decentralized apps using your existing JavaScript knowledge.",
    apis: {
      rpc: [
        {
          address: "https://main.rpc.agoric.net",
        },
      ],
      rest: [
        {
          address: "https://main.api.agoric.net",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://agoric.bigdipper.live/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/Agoric-logo-color.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/Agoric-logo-color.svg",
      theme: {
        primary_color_hex: "#bc2c44",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://main.rpc.agoric.net",
      rest: "https://main.api.agoric.net",
      chainId: "agoric-3",
      chainName: "agoric",
      prettyChainName: "Agoric",
      bip44: {
        coinType: 564,
      },
      currencies: [
        {
          coinDenom: "BLD",
          coinMinimalDenom: "ubld",
          coinDecimals: 6,
          coinGeckoId: "agoric",
          coinImageUrl: "/tokens/generated/bld.svg",
          base: "ibc/2DA9C149E9AD2BD27FEFA635458FB37093C256C1A940392634A16BEA45262604",
          gasPriceStep: {
            low: 0.03,
            average: 0.05,
            high: 0.07,
          },
        },
        {
          coinDenom: "IST",
          coinMinimalDenom: "uist",
          coinDecimals: 6,
          coinGeckoId: "inter-stable-token",
          coinImageUrl: "/tokens/generated/ist.svg",
          base: "ibc/92BE0717F4678905E53F4E45B2DED18BC0CB97BF1F8B6A25AFEDF3D5A879B4D5",
          gasPriceStep: {
            low: 0.0034,
            average: 0.007,
            high: 0.02,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "BLD",
        coinMinimalDenom: "ubld",
        coinGeckoId: "agoric",
        coinImageUrl: "/tokens/generated/bld.svg",
        base: "ibc/2DA9C149E9AD2BD27FEFA635458FB37093C256C1A940392634A16BEA45262604",
      },
      feeCurrencies: [
        {
          coinDenom: "BLD",
          coinMinimalDenom: "ubld",
          coinDecimals: 6,
          coinGeckoId: "agoric",
          coinImageUrl: "/tokens/generated/bld.svg",
          base: "ibc/2DA9C149E9AD2BD27FEFA635458FB37093C256C1A940392634A16BEA45262604",
          gasPriceStep: {
            low: 0.03,
            average: 0.05,
            high: 0.07,
          },
        },
        {
          coinDenom: "IST",
          coinMinimalDenom: "uist",
          coinDecimals: 6,
          coinGeckoId: "inter-stable-token",
          coinImageUrl: "/tokens/generated/ist.svg",
          base: "ibc/92BE0717F4678905E53F4E45B2DED18BC0CB97BF1F8B6A25AFEDF3D5A879B4D5",
          gasPriceStep: {
            low: 0.0034,
            average: 0.007,
            high: 0.02,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "agoric",
        bech32PrefixAccPub: "agoricpub",
        bech32PrefixValAddr: "agoricvaloper",
        bech32PrefixValPub: "agoricvaloperpub",
        bech32PrefixConsAddr: "agoricvalcons",
        bech32PrefixConsPub: "agoricvalconspub",
      },
      explorerUrlToTx: "https://agoric.bigdipper.live/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "stride",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Stride",
    chain_id: "stride-1",
    bech32_prefix: "stride",
    bech32_config: {
      bech32PrefixAccAddr: "stride",
      bech32PrefixAccPub: "stridepub",
      bech32PrefixValAddr: "stridevaloper",
      bech32PrefixValPub: "stridevaloperpub",
      bech32PrefixConsAddr: "stridevalcons",
      bech32PrefixConsPub: "stridevalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ustrd",
          fixed_min_gas_price: 0.0005,
          low_gas_price: 0.005,
          average_gas_price: 0.005,
          high_gas_price: 0.05,
        },
        {
          denom: "stuatom",
          fixed_min_gas_price: 0.0001,
          low_gas_price: 0.0001,
          average_gas_price: 0.0002,
          high_gas_price: 0.0005,
        },
        {
          denom: "stuosmo",
          fixed_min_gas_price: 0.001,
          low_gas_price: 0.001,
          average_gas_price: 0.002,
          high_gas_price: 0.004,
        },
        {
          denom: "stustars",
          fixed_min_gas_price: 1,
          low_gas_price: 1,
          average_gas_price: 1.1,
          high_gas_price: 1.2,
        },
        {
          denom: "stujuno",
          fixed_min_gas_price: 0.075,
          low_gas_price: 0.075,
          average_gas_price: 0.1,
          high_gas_price: 0.125,
        },
        {
          denom: "stuluna",
          fixed_min_gas_price: 0.0125,
          low_gas_price: 0.0125,
          average_gas_price: 0.015,
          high_gas_price: 0.04,
        },
        {
          denom: "staevmos",
          fixed_min_gas_price: 250000000,
          low_gas_price: 20000000000,
          average_gas_price: 25000000000,
          high_gas_price: 40000000000,
        },
        {
          denom: "stinj",
          fixed_min_gas_price: 500000000,
          low_gas_price: 500000000,
          average_gas_price: 700000000,
          high_gas_price: 900000000,
        },
        {
          denom: "stucmdx",
          fixed_min_gas_price: 0.02,
          low_gas_price: 0.02,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
        {
          denom: "stuumee",
          fixed_min_gas_price: 0.1,
          low_gas_price: 0.1,
          average_gas_price: 0.12,
          high_gas_price: 0.2,
        },
        {
          denom: "stutia",
          fixed_min_gas_price: 0.002,
          low_gas_price: 0.01,
          average_gas_price: 0.02,
          high_gas_price: 0.1,
        },
        {
          denom: "stadydx",
          fixed_min_gas_price: 15000000000,
          low_gas_price: 15000000000,
          average_gas_price: 15000000000,
          high_gas_price: 20000000000,
        },
        {
          denom: "stadym",
          fixed_min_gas_price: 15000000000,
          low_gas_price: 15000000000,
          average_gas_price: 15000000000,
          high_gas_price: 20000000000,
        },
        {
          denom: "stusaga",
          fixed_min_gas_price: 0.01,
          low_gas_price: 0.01,
          average_gas_price: 0.015,
          high_gas_price: 0.03,
        },
        {
          denom:
            "ibc/BF3B4F53F3694B66E13C23107C84B6485BD2B96296BB7EC680EA77BBA75B4801",
          fixed_min_gas_price: 0.002,
          low_gas_price: 0.01,
          average_gas_price: 0.02,
          high_gas_price: 0.1,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ustrd",
        },
      ],
    },
    description:
      "Stride is a blockchain that provides liquidity for staked tokens. Using Stride, you can earn both taking and DeFi yields across the Cosmos IBC ecosystem.",
    apis: {
      rpc: [
        {
          address: "https://stride-rpc.polkachu.com/",
        },
      ],
      rest: [
        {
          address: "https://stride-api.polkachu.com/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.stride.zone/stride/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.svg",
      theme: {
        primary_color_hex: "#e4047c",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://stride-rpc.polkachu.com/",
      rest: "https://stride-api.polkachu.com/",
      chainId: "stride-1",
      chainName: "stride",
      prettyChainName: "Stride",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "STRD",
          coinMinimalDenom: "ustrd",
          coinDecimals: 6,
          coinGeckoId: "stride",
          coinImageUrl: "/tokens/generated/strd.svg",
          base: "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
          gasPriceStep: {
            low: 0.005,
            average: 0.005,
            high: 0.05,
          },
        },
        {
          coinDenom: "stATOM",
          coinMinimalDenom: "stuatom",
          coinDecimals: 6,
          coinGeckoId: "stride-staked-atom",
          coinImageUrl: "/tokens/generated/statom.svg",
          base: "ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901",
          gasPriceStep: {
            low: 0.0001,
            average: 0.0002,
            high: 0.0005,
          },
        },
        {
          coinDenom: "stSTARS",
          coinMinimalDenom: "stustars",
          coinDecimals: 6,
          coinGeckoId: "stride-staked-stars",
          coinImageUrl: "/tokens/generated/ststars.svg",
          base: "ibc/5DD1F95ED336014D00CE2520977EC71566D282F9749170ADC83A392E0EA7426A",
          gasPriceStep: {
            low: 1,
            average: 1.1,
            high: 1.2,
          },
        },
        {
          coinDenom: "stJUNO",
          coinMinimalDenom: "stujuno",
          coinDecimals: 6,
          coinGeckoId: "stride-staked-juno",
          coinImageUrl: "/tokens/generated/stjuno.svg",
          base: "ibc/84502A75BCA4A5F68D464C00B3F610CE2585847D59B52E5FFB7C3C9D2DDCD3FE",
          gasPriceStep: {
            low: 0.075,
            average: 0.1,
            high: 0.125,
          },
        },
        {
          coinDenom: "stOSMO",
          coinMinimalDenom: "stuosmo",
          coinDecimals: 6,
          coinGeckoId: "stride-staked-osmo",
          coinImageUrl: "/tokens/generated/stosmo.svg",
          base: "ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC",
          gasPriceStep: {
            low: 0.001,
            average: 0.002,
            high: 0.004,
          },
        },
        {
          coinDenom: "stLUNA",
          coinMinimalDenom: "stuluna",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/stluna.svg",
          base: "ibc/C491E7582E94AE921F6A029790083CDE1106C28F3F6C4AD7F1340544C13EC372",
          gasPriceStep: {
            low: 0.0125,
            average: 0.015,
            high: 0.04,
          },
        },
        {
          coinDenom: "stEVMOS",
          coinMinimalDenom: "staevmos",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/stevmos.svg",
          base: "ibc/C5579A9595790017C600DD726276D978B9BF314CF82406CE342720A9C7911A01",
          gasPriceStep: {
            low: 20000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
        {
          coinDenom: "stUMEE",
          coinMinimalDenom: "stuumee",
          coinDecimals: 6,
          coinGeckoId: "stride-staked-umee",
          coinImageUrl: "/tokens/generated/stumee.svg",
          base: "ibc/02F196DA6FD0917DD5FEA249EE61880F4D941EE9059E7964C5C9B50AF103800F",
          gasPriceStep: {
            low: 0.1,
            average: 0.12,
            high: 0.2,
          },
        },
        {
          coinDenom: "stSOMM",
          coinMinimalDenom: "stusomm",
          coinDecimals: 6,
          coinGeckoId: "stride-staked-sommelier",
          coinImageUrl: "/tokens/generated/stsomm.svg",
          base: "ibc/5A0060579D24FBE5268BEA74C3281E7FE533D361C41A99307B4998FEC611E46B",
        },
        {
          coinDenom: "stDYDX",
          coinMinimalDenom: "stadydx",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/stdydx.svg",
          base: "ibc/980E82A9F8E7CA8CD480F4577E73682A6D3855A267D1831485D7EBEF0E7A6C2C",
          gasPriceStep: {
            low: 15000000000,
            average: 15000000000,
            high: 20000000000,
          },
        },
        {
          coinDenom: "stTIA",
          coinMinimalDenom: "stutia",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sttia.svg",
          base: "ibc/698350B8A61D575025F3ED13E9AC9C0F45C89DEFE92F76D5838F1D3C1A7FF7C9",
          gasPriceStep: {
            low: 0.01,
            average: 0.02,
            high: 0.1,
          },
        },
        {
          coinDenom: "stSAGA",
          coinMinimalDenom: "stusaga",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/stsaga.svg",
          base: "ibc/2CD9F8161C3FC332E78EF0C25F6E684D09379FB2F56EF9267E7EC139642EC57B",
          gasPriceStep: {
            low: 0.01,
            average: 0.015,
            high: 0.03,
          },
        },
        {
          coinDenom: "stINJ",
          coinMinimalDenom: "stinj",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/stinj.svg",
          base: "ibc/C04DFC9BCD893E57F2BEFE40F63EFD18D2768514DBD5F63ABD2FF7F48FC01D36",
          gasPriceStep: {
            low: 500000000,
            average: 700000000,
            high: 900000000,
          },
        },
        {
          coinDenom: "stDYM",
          coinMinimalDenom: "stadym",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/stdym.svg",
          base: "ibc/D53E785DC9C5C2CA50CADB1EFE4DE5D0C30418BE0E9C6F2AF9F092A247E8BC22",
          gasPriceStep: {
            low: 15000000000,
            average: 15000000000,
            high: 20000000000,
          },
        },
        {
          coinDenom: "stISLM",
          coinMinimalDenom: "staISLM",
          coinDecimals: 18,
          coinGeckoId: "stride-staked-islm",
          coinImageUrl: "/tokens/generated/stislm.svg",
          base: "ibc/245C3CA604AAB4BB9EEA5E86F23F52D59253D8722C8FC9C4E3E69F77C5CD3D2F",
        },
        {
          coinDenom: "stBAND",
          coinMinimalDenom: "stuband",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/stband.svg",
          base: "ibc/603140E681973C7A3A33B06B1D377AAD0F6AC376119735CECC04C9184A1AB080",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "STRD",
        coinMinimalDenom: "ustrd",
        coinGeckoId: "stride",
        coinImageUrl: "/tokens/generated/strd.svg",
        base: "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
      },
      feeCurrencies: [
        {
          coinDenom: "STRD",
          coinMinimalDenom: "ustrd",
          coinDecimals: 6,
          coinGeckoId: "stride",
          coinImageUrl: "/tokens/generated/strd.svg",
          base: "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
          gasPriceStep: {
            low: 0.005,
            average: 0.005,
            high: 0.05,
          },
        },
        {
          coinDenom: "stATOM",
          coinMinimalDenom: "stuatom",
          coinDecimals: 6,
          coinGeckoId: "stride-staked-atom",
          coinImageUrl: "/tokens/generated/statom.svg",
          base: "ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901",
          gasPriceStep: {
            low: 0.0001,
            average: 0.0002,
            high: 0.0005,
          },
        },
        {
          coinDenom: "stOSMO",
          coinMinimalDenom: "stuosmo",
          coinDecimals: 6,
          coinGeckoId: "stride-staked-osmo",
          coinImageUrl: "/tokens/generated/stosmo.svg",
          base: "ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC",
          gasPriceStep: {
            low: 0.001,
            average: 0.002,
            high: 0.004,
          },
        },
        {
          coinDenom: "stSTARS",
          coinMinimalDenom: "stustars",
          coinDecimals: 6,
          coinGeckoId: "stride-staked-stars",
          coinImageUrl: "/tokens/generated/ststars.svg",
          base: "ibc/5DD1F95ED336014D00CE2520977EC71566D282F9749170ADC83A392E0EA7426A",
          gasPriceStep: {
            low: 1,
            average: 1.1,
            high: 1.2,
          },
        },
        {
          coinDenom: "stJUNO",
          coinMinimalDenom: "stujuno",
          coinDecimals: 6,
          coinGeckoId: "stride-staked-juno",
          coinImageUrl: "/tokens/generated/stjuno.svg",
          base: "ibc/84502A75BCA4A5F68D464C00B3F610CE2585847D59B52E5FFB7C3C9D2DDCD3FE",
          gasPriceStep: {
            low: 0.075,
            average: 0.1,
            high: 0.125,
          },
        },
        {
          coinDenom: "stLUNA",
          coinMinimalDenom: "stuluna",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/stluna.svg",
          base: "ibc/C491E7582E94AE921F6A029790083CDE1106C28F3F6C4AD7F1340544C13EC372",
          gasPriceStep: {
            low: 0.0125,
            average: 0.015,
            high: 0.04,
          },
        },
        {
          coinDenom: "stEVMOS",
          coinMinimalDenom: "staevmos",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/stevmos.svg",
          base: "ibc/C5579A9595790017C600DD726276D978B9BF314CF82406CE342720A9C7911A01",
          gasPriceStep: {
            low: 20000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
        {
          coinDenom: "stINJ",
          coinMinimalDenom: "stinj",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/stinj.svg",
          base: "ibc/C04DFC9BCD893E57F2BEFE40F63EFD18D2768514DBD5F63ABD2FF7F48FC01D36",
          gasPriceStep: {
            low: 500000000,
            average: 700000000,
            high: 900000000,
          },
        },
        {
          coinDenom: "stUMEE",
          coinMinimalDenom: "stuumee",
          coinDecimals: 6,
          coinGeckoId: "stride-staked-umee",
          coinImageUrl: "/tokens/generated/stumee.svg",
          base: "ibc/02F196DA6FD0917DD5FEA249EE61880F4D941EE9059E7964C5C9B50AF103800F",
          gasPriceStep: {
            low: 0.1,
            average: 0.12,
            high: 0.2,
          },
        },
        {
          coinDenom: "stTIA",
          coinMinimalDenom: "stutia",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sttia.svg",
          base: "ibc/698350B8A61D575025F3ED13E9AC9C0F45C89DEFE92F76D5838F1D3C1A7FF7C9",
          gasPriceStep: {
            low: 0.01,
            average: 0.02,
            high: 0.1,
          },
        },
        {
          coinDenom: "stDYDX",
          coinMinimalDenom: "stadydx",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/stdydx.svg",
          base: "ibc/980E82A9F8E7CA8CD480F4577E73682A6D3855A267D1831485D7EBEF0E7A6C2C",
          gasPriceStep: {
            low: 15000000000,
            average: 15000000000,
            high: 20000000000,
          },
        },
        {
          coinDenom: "stDYM",
          coinMinimalDenom: "stadym",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/stdym.svg",
          base: "ibc/D53E785DC9C5C2CA50CADB1EFE4DE5D0C30418BE0E9C6F2AF9F092A247E8BC22",
          gasPriceStep: {
            low: 15000000000,
            average: 15000000000,
            high: 20000000000,
          },
        },
        {
          coinDenom: "stSAGA",
          coinMinimalDenom: "stusaga",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/stsaga.svg",
          base: "ibc/2CD9F8161C3FC332E78EF0C25F6E684D09379FB2F56EF9267E7EC139642EC57B",
          gasPriceStep: {
            low: 0.01,
            average: 0.015,
            high: 0.03,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "stride",
        bech32PrefixAccPub: "stridepub",
        bech32PrefixValAddr: "stridevaloper",
        bech32PrefixValPub: "stridevaloperpub",
        bech32PrefixConsAddr: "stridevalcons",
        bech32PrefixConsPub: "stridevalconspub",
      },
      explorerUrlToTx: "https://explorer.stride.zone/stride/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "rebus",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Rebus",
    chain_id: "reb_1111-1",
    bech32_prefix: "rebus",
    bech32_config: {
      bech32PrefixAccAddr: "rebus",
      bech32PrefixAccPub: "rebuspub",
      bech32PrefixValAddr: "rebusvaloper",
      bech32PrefixValPub: "rebusvaloperpub",
      bech32PrefixConsAddr: "rebusvalcons",
      bech32PrefixConsPub: "rebusvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "arebus",
          fixed_min_gas_price: 0,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "arebus",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://api.mainnet.rebus.money:26657",
        },
      ],
      rest: [
        {
          address: "https://api.mainnet.rebus.money:1317",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://rebus.explorers.guru/transaction/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rebus/images/rebus.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rebus/images/rebus.svg",
      theme: {
        primary_color_hex: "#e75486",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://api.mainnet.rebus.money:26657",
      rest: "https://api.mainnet.rebus.money:1317",
      chainId: "reb_1111-1",
      chainName: "rebus",
      prettyChainName: "Rebus",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "REBUS",
          coinMinimalDenom: "arebus",
          coinDecimals: 18,
          coinGeckoId: "rebus",
          coinImageUrl: "/tokens/generated/rebus.svg",
          base: "ibc/A1AC7F9EE2F643A68E3A35BCEB22040120BEA4059773BB56985C76BDFEBC71D9",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "REBUS",
        coinMinimalDenom: "arebus",
        coinGeckoId: "rebus",
        coinImageUrl: "/tokens/generated/rebus.svg",
        base: "ibc/A1AC7F9EE2F643A68E3A35BCEB22040120BEA4059773BB56985C76BDFEBC71D9",
      },
      feeCurrencies: [
        {
          coinDenom: "REBUS",
          coinMinimalDenom: "arebus",
          coinDecimals: 18,
          coinGeckoId: "rebus",
          coinImageUrl: "/tokens/generated/rebus.svg",
          base: "ibc/A1AC7F9EE2F643A68E3A35BCEB22040120BEA4059773BB56985C76BDFEBC71D9",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "rebus",
        bech32PrefixAccPub: "rebuspub",
        bech32PrefixValAddr: "rebusvaloper",
        bech32PrefixValPub: "rebusvaloperpub",
        bech32PrefixConsAddr: "rebusvalcons",
        bech32PrefixConsPub: "rebusvalconspub",
      },
      explorerUrlToTx: "https://rebus.explorers.guru/transaction/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "teritori",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Teritori",
    chain_id: "teritori-1",
    bech32_prefix: "tori",
    bech32_config: {
      bech32PrefixAccAddr: "tori",
      bech32PrefixAccPub: "toripub",
      bech32PrefixValAddr: "torivaloper",
      bech32PrefixValPub: "torivaloperpub",
      bech32PrefixConsAddr: "torivalcons",
      bech32PrefixConsPub: "torivalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "utori",
          low_gas_price: 0,
          average_gas_price: 0.25,
          high_gas_price: 0.5,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "utori",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.mainnet.teritori.com/",
        },
      ],
      rest: [
        {
          address: "https://rest.mainnet.teritori.com/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.teritori.com/teritori/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/teritori/images/chain.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/teritori/images/chain.svg",
      theme: {
        primary_color_hex: "#44c5f1",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.mainnet.teritori.com/",
      rest: "https://rest.mainnet.teritori.com/",
      chainId: "teritori-1",
      chainName: "teritori",
      prettyChainName: "Teritori",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "TORI",
          coinMinimalDenom: "utori",
          coinDecimals: 6,
          coinGeckoId: "teritori",
          coinImageUrl: "/tokens/generated/tori.svg",
          base: "ibc/EB7FB9C8B425F289B63703413327C2051030E848CE4EAAEA2E51199D6D39D3EC",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "TORI",
        coinMinimalDenom: "utori",
        coinGeckoId: "teritori",
        coinImageUrl: "/tokens/generated/tori.svg",
        base: "ibc/EB7FB9C8B425F289B63703413327C2051030E848CE4EAAEA2E51199D6D39D3EC",
      },
      feeCurrencies: [
        {
          coinDenom: "TORI",
          coinMinimalDenom: "utori",
          coinDecimals: 6,
          coinGeckoId: "teritori",
          coinImageUrl: "/tokens/generated/tori.svg",
          base: "ibc/EB7FB9C8B425F289B63703413327C2051030E848CE4EAAEA2E51199D6D39D3EC",
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "tori",
        bech32PrefixAccPub: "toripub",
        bech32PrefixValAddr: "torivaloper",
        bech32PrefixValPub: "torivaloperpub",
        bech32PrefixConsAddr: "torivalcons",
        bech32PrefixConsPub: "torivalconspub",
      },
      explorerUrlToTx: "https://explorer.teritori.com/teritori/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "lambda",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Lambda",
    chain_id: "lambda_92000-1",
    bech32_prefix: "lamb",
    bech32_config: {
      bech32PrefixAccAddr: "lamb",
      bech32PrefixAccPub: "lambpub",
      bech32PrefixValAddr: "lambvaloper",
      bech32PrefixValPub: "lambvaloperpub",
      bech32PrefixConsAddr: "lambvalcons",
      bech32PrefixConsPub: "lambvalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "ulamb",
          low_gas_price: 10000000000,
          average_gas_price: 25000000000,
          high_gas_price: 40000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ulamb",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.lambda.im",
        },
      ],
      rest: [
        {
          address: "https://rest.lambda.im",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.nodestake.top/lambda/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lambda/images/lambda.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lambda/images/lambda.svg",
      theme: {
        primary_color_hex: "#e41c54",
      },
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://rpc.lambda.im",
      rest: "https://rest.lambda.im",
      chainId: "lambda_92000-1",
      chainName: "lambda",
      prettyChainName: "Lambda",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "LAMB",
          coinMinimalDenom: "ulamb",
          coinDecimals: 18,
          coinGeckoId: "lambda",
          coinImageUrl: "/tokens/generated/lamb.svg",
          base: "ibc/80825E8F04B12D914ABEADB1F4D39C04755B12C8402F6876EE3168450C0A90BB",
          gasPriceStep: {
            low: 10000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "LAMB",
        coinMinimalDenom: "ulamb",
        coinGeckoId: "lambda",
        coinImageUrl: "/tokens/generated/lamb.svg",
        base: "ibc/80825E8F04B12D914ABEADB1F4D39C04755B12C8402F6876EE3168450C0A90BB",
      },
      feeCurrencies: [
        {
          coinDenom: "LAMB",
          coinMinimalDenom: "ulamb",
          coinDecimals: 18,
          coinGeckoId: "lambda",
          coinImageUrl: "/tokens/generated/lamb.svg",
          base: "ibc/80825E8F04B12D914ABEADB1F4D39C04755B12C8402F6876EE3168450C0A90BB",
          gasPriceStep: {
            low: 10000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "lamb",
        bech32PrefixAccPub: "lambpub",
        bech32PrefixValAddr: "lambvaloper",
        bech32PrefixValPub: "lambvaloperpub",
        bech32PrefixConsAddr: "lambvalcons",
        bech32PrefixConsPub: "lambvalconspub",
      },
      explorerUrlToTx: "https://explorer.nodestake.top/lambda/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "unification",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Unification",
    chain_id: "FUND-MainNet-2",
    bech32_prefix: "und",
    bech32_config: {
      bech32PrefixAccAddr: "und",
      bech32PrefixAccPub: "undpub",
      bech32PrefixValAddr: "undvaloper",
      bech32PrefixValPub: "undvaloperpub",
      bech32PrefixConsAddr: "undvalcons",
      bech32PrefixConsPub: "undvalconspub",
    },
    slip44: 5555,
    fees: {
      fee_tokens: [
        {
          denom: "nund",
          fixed_min_gas_price: 25,
          low_gas_price: 100,
          average_gas_price: 200,
          high_gas_price: 300,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "nund",
        },
      ],
      lock_duration: {
        time: "1814400s",
      },
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.unification.chainmasters.ninja",
        },
      ],
      rest: [
        {
          address: "https://rest.unification.chainmasters.ninja",
        },
      ],
    },
    explorers: [
      {
        tx_page:
          "https://explorer.unification.chainmasters.ninja/unification/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/unification/images/fund.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/unification/images/fund.svg",
      theme: {
        primary_color_hex: "#2279c0",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.unification.chainmasters.ninja",
      rest: "https://rest.unification.chainmasters.ninja",
      chainId: "FUND-MainNet-2",
      chainName: "unification",
      prettyChainName: "Unification",
      bip44: {
        coinType: 5555,
      },
      currencies: [
        {
          coinDenom: "FUND",
          coinMinimalDenom: "nund",
          coinDecimals: 9,
          coinGeckoId: "unification",
          coinImageUrl: "/tokens/generated/fund.svg",
          base: "ibc/608EF5C0CE64FEA097500DB39657BDD36CA708CC5DCC2E250A024B6981DD36BC",
          gasPriceStep: {
            low: 100,
            average: 200,
            high: 300,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 9,
        coinDenom: "FUND",
        coinMinimalDenom: "nund",
        coinGeckoId: "unification",
        coinImageUrl: "/tokens/generated/fund.svg",
        base: "ibc/608EF5C0CE64FEA097500DB39657BDD36CA708CC5DCC2E250A024B6981DD36BC",
      },
      feeCurrencies: [
        {
          coinDenom: "FUND",
          coinMinimalDenom: "nund",
          coinDecimals: 9,
          coinGeckoId: "unification",
          coinImageUrl: "/tokens/generated/fund.svg",
          base: "ibc/608EF5C0CE64FEA097500DB39657BDD36CA708CC5DCC2E250A024B6981DD36BC",
          gasPriceStep: {
            low: 100,
            average: 200,
            high: 300,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "und",
        bech32PrefixAccPub: "undpub",
        bech32PrefixValAddr: "undvaloper",
        bech32PrefixValPub: "undvaloperpub",
        bech32PrefixConsAddr: "undvalcons",
        bech32PrefixConsPub: "undvalconspub",
      },
      explorerUrlToTx:
        "https://explorer.unification.chainmasters.ninja/unification/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "jackal",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Jackal",
    chain_id: "jackal-1",
    bech32_prefix: "jkl",
    bech32_config: {
      bech32PrefixAccAddr: "jkl",
      bech32PrefixAccPub: "jklpub",
      bech32PrefixValAddr: "jklvaloper",
      bech32PrefixValPub: "jklvaloperpub",
      bech32PrefixConsAddr: "jklvalcons",
      bech32PrefixConsPub: "jklvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ujkl",
          fixed_min_gas_price: 0,
          low_gas_price: 0.002,
          average_gas_price: 0.002,
          high_gas_price: 0.02,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ujkl",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.jackalprotocol.com",
        },
      ],
      rest: [
        {
          address: "https://api.jackalprotocol.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/jackal/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/jackal/images/jkl.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/jackal/images/jkl.svg",
      theme: {
        primary_color_hex: "#dbdbcb",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.jackalprotocol.com",
      rest: "https://api.jackalprotocol.com",
      chainId: "jackal-1",
      chainName: "jackal",
      prettyChainName: "Jackal",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "JKL",
          coinMinimalDenom: "ujkl",
          coinDecimals: 6,
          coinGeckoId: "jackal-protocol",
          coinImageUrl: "/tokens/generated/jkl.svg",
          base: "ibc/8E697BDABE97ACE8773C6DF7402B2D1D5104DD1EEABE12608E3469B7F64C15BA",
          gasPriceStep: {
            low: 0.002,
            average: 0.002,
            high: 0.02,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "JKL",
        coinMinimalDenom: "ujkl",
        coinGeckoId: "jackal-protocol",
        coinImageUrl: "/tokens/generated/jkl.svg",
        base: "ibc/8E697BDABE97ACE8773C6DF7402B2D1D5104DD1EEABE12608E3469B7F64C15BA",
      },
      feeCurrencies: [
        {
          coinDenom: "JKL",
          coinMinimalDenom: "ujkl",
          coinDecimals: 6,
          coinGeckoId: "jackal-protocol",
          coinImageUrl: "/tokens/generated/jkl.svg",
          base: "ibc/8E697BDABE97ACE8773C6DF7402B2D1D5104DD1EEABE12608E3469B7F64C15BA",
          gasPriceStep: {
            low: 0.002,
            average: 0.002,
            high: 0.02,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "jkl",
        bech32PrefixAccPub: "jklpub",
        bech32PrefixValAddr: "jklvaloper",
        bech32PrefixValPub: "jklvaloperpub",
        bech32PrefixConsAddr: "jklvalcons",
        bech32PrefixConsPub: "jklvalconspub",
      },
      explorerUrlToTx: "https://ping.pub/jackal/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "beezee",
    status: "live",
    network_type: "mainnet",
    pretty_name: "BeeZee",
    chain_id: "beezee-1",
    bech32_prefix: "bze",
    bech32_config: {
      bech32PrefixAccAddr: "bze",
      bech32PrefixAccPub: "bzepub",
      bech32PrefixValAddr: "bzevaloper",
      bech32PrefixValPub: "bzevaloperpub",
      bech32PrefixConsAddr: "bzevalcons",
      bech32PrefixConsPub: "bzevalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ubze",
          fixed_min_gas_price: 0.01,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ubze",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.getbze.com",
        },
      ],
      rest: [
        {
          address: "https://rest.getbze.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/beezee/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/beezee/images/bze.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/beezee/images/bze.svg",
      theme: {
        primary_color_hex: "#079fd7",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.getbze.com",
      rest: "https://rest.getbze.com",
      chainId: "beezee-1",
      chainName: "beezee",
      prettyChainName: "BeeZee",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "BZE",
          coinMinimalDenom: "ubze",
          coinDecimals: 6,
          coinGeckoId: "bzedge",
          coinImageUrl: "/tokens/generated/bze.svg",
          base: "ibc/C822645522FC3EECF817609AA38C24B64D04F5C267A23BCCF8F2E3BC5755FA88",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "BZE",
        coinMinimalDenom: "ubze",
        coinGeckoId: "bzedge",
        coinImageUrl: "/tokens/generated/bze.svg",
        base: "ibc/C822645522FC3EECF817609AA38C24B64D04F5C267A23BCCF8F2E3BC5755FA88",
      },
      feeCurrencies: [
        {
          coinDenom: "BZE",
          coinMinimalDenom: "ubze",
          coinDecimals: 6,
          coinGeckoId: "bzedge",
          coinImageUrl: "/tokens/generated/bze.svg",
          base: "ibc/C822645522FC3EECF817609AA38C24B64D04F5C267A23BCCF8F2E3BC5755FA88",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "bze",
        bech32PrefixAccPub: "bzepub",
        bech32PrefixValAddr: "bzevaloper",
        bech32PrefixValPub: "bzevaloperpub",
        bech32PrefixConsAddr: "bzevalcons",
        bech32PrefixConsPub: "bzevalconspub",
      },
      explorerUrlToTx: "https://ping.pub/beezee/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "acrechain",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Acrechain",
    chain_id: "acre_9052-1",
    bech32_prefix: "acre",
    bech32_config: {
      bech32PrefixAccAddr: "acre",
      bech32PrefixAccPub: "acrepub",
      bech32PrefixValAddr: "acrevaloper",
      bech32PrefixValPub: "acrevaloperpub",
      bech32PrefixConsAddr: "acrevalcons",
      bech32PrefixConsPub: "acrevalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "aacre",
          fixed_min_gas_price: 250000000,
          low_gas_price: 20000000000,
          average_gas_price: 25000000000,
          high_gas_price: 40000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "aacre",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc-acre.synergynodes.com/",
        },
      ],
      rest: [
        {
          address: "https://lcd-acre.synergynodes.com/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://cosmosrun.info/acre-mainnet/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/acre.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/acre.svg",
      theme: {
        primary_color_hex: "#4aa29e",
      },
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://rpc-acre.synergynodes.com/",
      rest: "https://lcd-acre.synergynodes.com/",
      chainId: "acre_9052-1",
      chainName: "acrechain",
      prettyChainName: "Acrechain",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "ACRE",
          coinMinimalDenom: "aacre",
          coinDecimals: 18,
          coinGeckoId: "arable-protocol",
          coinImageUrl: "/tokens/generated/acre.svg",
          base: "ibc/BB936517F7E5D77A63E0ADB05217A6608B0C4CF8FBA7EA2F4BAE4107A7238F06",
          gasPriceStep: {
            low: 20000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
        {
          coinDenom: "arUSD",
          coinMinimalDenom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/arusd.svg",
          base: "ibc/5D270A584B1078FBE07D14570ED5E88EC1FEDA8518B76C322606291E6FD8286F",
        },
        {
          coinDenom: "CNTO",
          coinMinimalDenom: "erc20/0xAE6D3334989a22A65228732446731438672418F2",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/cnto.svg",
          base: "ibc/D38BB3DD46864694F009AF01DA5A815B3A875F8CC52FF5679BFFCC35DC7451D5",
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "ACRE",
        coinMinimalDenom: "aacre",
        coinGeckoId: "arable-protocol",
        coinImageUrl: "/tokens/generated/acre.svg",
        base: "ibc/BB936517F7E5D77A63E0ADB05217A6608B0C4CF8FBA7EA2F4BAE4107A7238F06",
      },
      feeCurrencies: [
        {
          coinDenom: "ACRE",
          coinMinimalDenom: "aacre",
          coinDecimals: 18,
          coinGeckoId: "arable-protocol",
          coinImageUrl: "/tokens/generated/acre.svg",
          base: "ibc/BB936517F7E5D77A63E0ADB05217A6608B0C4CF8FBA7EA2F4BAE4107A7238F06",
          gasPriceStep: {
            low: 20000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "acre",
        bech32PrefixAccPub: "acrepub",
        bech32PrefixValAddr: "acrevaloper",
        bech32PrefixValPub: "acrevaloperpub",
        bech32PrefixConsAddr: "acrevalcons",
        bech32PrefixConsPub: "acrevalconspub",
      },
      explorerUrlToTx: "https://cosmosrun.info/acre-mainnet/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "imversed",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Imversed",
    chain_id: "imversed_5555555-1",
    bech32_prefix: "imv",
    bech32_config: {
      bech32PrefixAccAddr: "imv",
      bech32PrefixAccPub: "imvpub",
      bech32PrefixValAddr: "imvvaloper",
      bech32PrefixValPub: "imvvaloperpub",
      bech32PrefixConsAddr: "imvvalcons",
      bech32PrefixConsPub: "imvvalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "aimv",
          fixed_min_gas_price: 250000000,
          low_gas_price: 20000000000,
          average_gas_price: 25000000000,
          high_gas_price: 40000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "aimv",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.imversed.network:443",
        },
      ],
      rest: [
        {
          address: "https://rest.imversed.network:443",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://txe.imversed.network/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/imversed/images/imversed.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/imversed/images/imversed.svg",
      theme: {
        primary_color_hex: "#4c54e4",
      },
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://rpc.imversed.network:443",
      rest: "https://rest.imversed.network:443",
      chainId: "imversed_5555555-1",
      chainName: "imversed",
      prettyChainName: "Imversed",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "IMV",
          coinMinimalDenom: "aimv",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/imv.svg",
          base: "ibc/92B223EBFA74DB99BEA92B23DEAA6050734FEEAABB84689CB8E1AE8F9C9F9AF4",
          gasPriceStep: {
            low: 20000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "IMV",
        coinMinimalDenom: "aimv",
        coinImageUrl: "/tokens/generated/imv.svg",
        base: "ibc/92B223EBFA74DB99BEA92B23DEAA6050734FEEAABB84689CB8E1AE8F9C9F9AF4",
      },
      feeCurrencies: [
        {
          coinDenom: "IMV",
          coinMinimalDenom: "aimv",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/imv.svg",
          base: "ibc/92B223EBFA74DB99BEA92B23DEAA6050734FEEAABB84689CB8E1AE8F9C9F9AF4",
          gasPriceStep: {
            low: 20000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "imv",
        bech32PrefixAccPub: "imvpub",
        bech32PrefixValAddr: "imvvaloper",
        bech32PrefixValPub: "imvvaloperpub",
        bech32PrefixConsAddr: "imvvalcons",
        bech32PrefixConsPub: "imvvalconspub",
      },
      explorerUrlToTx: "https://txe.imversed.network/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "medasdigital",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Medas Digital Network",
    chain_id: "medasdigital-2",
    bech32_prefix: "medas",
    bech32_config: {
      bech32PrefixAccAddr: "medas",
      bech32PrefixAccPub: "medaspub",
      bech32PrefixValAddr: "medasvaloper",
      bech32PrefixValPub: "medasvaloperpub",
      bech32PrefixConsAddr: "medasvalcons",
      bech32PrefixConsPub: "medasvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "umedas",
          low_gas_price: 0.1,
          average_gas_price: 0.25,
          high_gas_price: 0.4,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "umedas",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.medas-digital.io:26657",
        },
      ],
      rest: [
        {
          address: "https://lcd.medas-digital.io:1317",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/medasdigital/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/medasdigital/images/medas.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/medasdigital/images/medas.svg",
      theme: {
        primary_color_hex: "#147ccc",
      },
    },
    features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
    keplrChain: {
      rpc: "https://rpc.medas-digital.io:26657",
      rest: "https://lcd.medas-digital.io:1317",
      chainId: "medasdigital-2",
      chainName: "medasdigital",
      prettyChainName: "Medas Digital Network",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "MEDAS",
          coinMinimalDenom: "umedas",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/medas.svg",
          base: "ibc/FBBC35295AA037DC0A77796B08DC3003EC918E18E75D61D675A0EEAC0643F36C",
          gasPriceStep: {
            low: 0.1,
            average: 0.25,
            high: 0.4,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "MEDAS",
        coinMinimalDenom: "umedas",
        coinImageUrl: "/tokens/generated/medas.svg",
        base: "ibc/FBBC35295AA037DC0A77796B08DC3003EC918E18E75D61D675A0EEAC0643F36C",
      },
      feeCurrencies: [
        {
          coinDenom: "MEDAS",
          coinMinimalDenom: "umedas",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/medas.svg",
          base: "ibc/FBBC35295AA037DC0A77796B08DC3003EC918E18E75D61D675A0EEAC0643F36C",
          gasPriceStep: {
            low: 0.1,
            average: 0.25,
            high: 0.4,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "medas",
        bech32PrefixAccPub: "medaspub",
        bech32PrefixValAddr: "medasvaloper",
        bech32PrefixValPub: "medasvaloperpub",
        bech32PrefixConsAddr: "medasvalcons",
        bech32PrefixConsPub: "medasvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/medasdigital/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
    },
  },
  {
    chain_name: "onomy",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Onomy",
    chain_id: "onomy-mainnet-1",
    bech32_prefix: "onomy",
    bech32_config: {
      bech32PrefixAccAddr: "onomy",
      bech32PrefixAccPub: "onomypub",
      bech32PrefixValAddr: "onomyvaloper",
      bech32PrefixValPub: "onomyvaloperpub",
      bech32PrefixConsAddr: "onomyvalcons",
      bech32PrefixConsPub: "onomyvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "anom",
          low_gas_price: 0,
          average_gas_price: 0.03,
          high_gas_price: 0.06,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "anom",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc-mainnet.onomy.io",
        },
      ],
      rest: [
        {
          address: "https://rest-mainnet.onomy.io",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/onomy-protocol/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/onomy/images/nom.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/onomy/images/nom.svg",
      theme: {
        primary_color_hex: "#1c1c28",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-mainnet.onomy.io",
      rest: "https://rest-mainnet.onomy.io",
      chainId: "onomy-mainnet-1",
      chainName: "onomy",
      prettyChainName: "Onomy",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "NOM",
          coinMinimalDenom: "anom",
          coinDecimals: 18,
          coinGeckoId: "onomy-protocol",
          coinImageUrl: "/tokens/generated/nom.svg",
          base: "ibc/B9606D347599F0F2FDF82BA3EE339000673B7D274EA50F59494DC51EFCD42163",
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "NOM",
        coinMinimalDenom: "anom",
        coinGeckoId: "onomy-protocol",
        coinImageUrl: "/tokens/generated/nom.svg",
        base: "ibc/B9606D347599F0F2FDF82BA3EE339000673B7D274EA50F59494DC51EFCD42163",
      },
      feeCurrencies: [
        {
          coinDenom: "NOM",
          coinMinimalDenom: "anom",
          coinDecimals: 18,
          coinGeckoId: "onomy-protocol",
          coinImageUrl: "/tokens/generated/nom.svg",
          base: "ibc/B9606D347599F0F2FDF82BA3EE339000673B7D274EA50F59494DC51EFCD42163",
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "onomy",
        bech32PrefixAccPub: "onomypub",
        bech32PrefixValAddr: "onomyvaloper",
        bech32PrefixValPub: "onomyvaloperpub",
        bech32PrefixConsAddr: "onomyvalcons",
        bech32PrefixConsPub: "onomyvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/onomy-protocol/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "planq",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Planq",
    chain_id: "planq_7070-2",
    bech32_prefix: "plq",
    bech32_config: {
      bech32PrefixAccAddr: "plq",
      bech32PrefixAccPub: "plqpub",
      bech32PrefixValAddr: "plqvaloper",
      bech32PrefixValPub: "plqvaloperpub",
      bech32PrefixConsAddr: "plqvalcons",
      bech32PrefixConsPub: "plqvalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "aplanq",
          fixed_min_gas_price: 20000000000,
          low_gas_price: 30000000000,
          average_gas_price: 35000000000,
          high_gas_price: 40000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "aplanq",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.planq.network/",
        },
      ],
      rest: [
        {
          address: "https://rest.planq.network/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/planq/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/planq/images/planq.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/planq/images/planq.svg",
      theme: {
        primary_color_hex: "#d4f3fb",
      },
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://rpc.planq.network/",
      rest: "https://rest.planq.network/",
      chainId: "planq_7070-2",
      chainName: "planq",
      prettyChainName: "Planq",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "PLQ",
          coinMinimalDenom: "aplanq",
          coinDecimals: 18,
          coinGeckoId: "planq",
          coinImageUrl: "/tokens/generated/plq.svg",
          base: "ibc/B1E0166EA0D759FDF4B207D1F5F12210D8BFE36F2345CEFC76948CE2B36DFBAF",
          gasPriceStep: {
            low: 30000000000,
            average: 35000000000,
            high: 40000000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "PLQ",
        coinMinimalDenom: "aplanq",
        coinGeckoId: "planq",
        coinImageUrl: "/tokens/generated/plq.svg",
        base: "ibc/B1E0166EA0D759FDF4B207D1F5F12210D8BFE36F2345CEFC76948CE2B36DFBAF",
      },
      feeCurrencies: [
        {
          coinDenom: "PLQ",
          coinMinimalDenom: "aplanq",
          coinDecimals: 18,
          coinGeckoId: "planq",
          coinImageUrl: "/tokens/generated/plq.svg",
          base: "ibc/B1E0166EA0D759FDF4B207D1F5F12210D8BFE36F2345CEFC76948CE2B36DFBAF",
          gasPriceStep: {
            low: 30000000000,
            average: 35000000000,
            high: 40000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "plq",
        bech32PrefixAccPub: "plqpub",
        bech32PrefixValAddr: "plqvaloper",
        bech32PrefixValPub: "plqvaloperpub",
        bech32PrefixConsAddr: "plqvalcons",
        bech32PrefixConsPub: "plqvalconspub",
      },
      explorerUrlToTx: "https://ping.pub/planq/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "dyson",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Dyson Protocol",
    chain_id: "dyson-mainnet-01",
    bech32_prefix: "dys",
    bech32_config: {
      bech32PrefixAccAddr: "dys",
      bech32PrefixAccPub: "dyspub",
      bech32PrefixValAddr: "dysvaloper",
      bech32PrefixValPub: "dysvaloperpub",
      bech32PrefixConsAddr: "dysvalcons",
      bech32PrefixConsPub: "dysvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "dys",
          low_gas_price: 0.0001,
          average_gas_price: 0.0002,
          high_gas_price: 0.0003,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "dys",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://dys-tm.dysonprotocol.com:443",
        },
      ],
      rest: [
        {
          address: "https://dys-api.dysonprotocol.com:443",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.dys.dysonprotocol.com/dyson/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dyson/images/dyson.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dyson/images/dyson.svg",
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://dys-tm.dysonprotocol.com:443",
      rest: "https://dys-api.dysonprotocol.com:443",
      chainId: "dyson-mainnet-01",
      chainName: "dyson",
      prettyChainName: "Dyson Protocol",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "DYS",
          coinMinimalDenom: "dys",
          coinDecimals: 0,
          coinImageUrl: "/tokens/generated/dys.svg",
          base: "ibc/E27CD305D33F150369AB526AEB6646A76EC3FFB1A6CA58A663B5DE657A89D55D",
          gasPriceStep: {
            low: 0.0001,
            average: 0.0002,
            high: 0.0003,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 0,
        coinDenom: "STAKE",
        coinMinimalDenom: "tempStakePlaceholder",
      },
      feeCurrencies: [
        {
          coinDenom: "DYS",
          coinMinimalDenom: "dys",
          coinDecimals: 0,
          coinImageUrl: "/tokens/generated/dys.svg",
          base: "ibc/E27CD305D33F150369AB526AEB6646A76EC3FFB1A6CA58A663B5DE657A89D55D",
          gasPriceStep: {
            low: 0.0001,
            average: 0.0002,
            high: 0.0003,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "dys",
        bech32PrefixAccPub: "dyspub",
        bech32PrefixValAddr: "dysvaloper",
        bech32PrefixValPub: "dysvaloperpub",
        bech32PrefixConsAddr: "dysvalcons",
        bech32PrefixConsPub: "dysvalconspub",
      },
      explorerUrlToTx:
        "https://explorer.dys.dysonprotocol.com/dyson/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "mars",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Mars Hub",
    chain_id: "mars-1",
    bech32_prefix: "mars",
    bech32_config: {
      bech32PrefixAccAddr: "mars",
      bech32PrefixAccPub: "marspub",
      bech32PrefixValAddr: "marsvaloper",
      bech32PrefixValPub: "marsvaloperpub",
      bech32PrefixConsAddr: "marsvalcons",
      bech32PrefixConsPub: "marsvalconspub",
    },
    slip44: 118,
    alternative_slip44s: [330],
    fees: {
      fee_tokens: [
        {
          denom: "umars",
          fixed_min_gas_price: 0,
          low_gas_price: 0,
          average_gas_price: 0,
          high_gas_price: 0.01,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "umars",
        },
      ],
    },
    description:
      "Lend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none.",
    apis: {
      rpc: [
        {
          address: "https://rpc.marsprotocol.io/",
        },
      ],
      rest: [
        {
          address: "https://rest.marsprotocol.io/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.marsprotocol.io/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/mars/images/mars-protocol.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/mars/images/mars-protocol.svg",
      theme: {
        primary_color_hex: "#040404",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.marsprotocol.io/",
      rest: "https://rest.marsprotocol.io/",
      chainId: "mars-1",
      chainName: "mars",
      prettyChainName: "Mars Hub",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "MARS.mars",
          coinMinimalDenom: "umars",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/mars.mars.svg",
          base: "ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "MARS.mars",
        coinMinimalDenom: "umars",
        coinImageUrl: "/tokens/generated/mars.mars.svg",
        base: "ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580",
      },
      feeCurrencies: [
        {
          coinDenom: "MARS.mars",
          coinMinimalDenom: "umars",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/mars.mars.svg",
          base: "ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580",
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "mars",
        bech32PrefixAccPub: "marspub",
        bech32PrefixValAddr: "marsvaloper",
        bech32PrefixValPub: "marsvaloperpub",
        bech32PrefixConsAddr: "marsvalcons",
        bech32PrefixConsPub: "marsvalconspub",
      },
      explorerUrlToTx: "https://explorer.marsprotocol.io/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "canto",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Canto",
    chain_id: "canto_7700-1",
    bech32_prefix: "canto",
    bech32_config: {
      bech32PrefixAccAddr: "canto",
      bech32PrefixAccPub: "cantopub",
      bech32PrefixValAddr: "cantovaloper",
      bech32PrefixValPub: "cantovaloperpub",
      bech32PrefixConsAddr: "cantovalcons",
      bech32PrefixConsPub: "cantovalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "acanto",
          fixed_min_gas_price: 1000000000000,
          low_gas_price: 1000000000000,
          average_gas_price: 2000000000000,
          high_gas_price: 3000000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "acanto",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.canto.nodestake.top",
        },
      ],
      rest: [
        {
          address: "https://api.canto.nodestake.top",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://cosmos-explorers.neobase.one/canto/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.svg",
      theme: {
        primary_color_hex: "#1c1f1f",
      },
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://rpc.canto.nodestake.top",
      rest: "https://api.canto.nodestake.top",
      chainId: "canto_7700-1",
      chainName: "canto",
      prettyChainName: "Canto",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "CANTO",
          coinMinimalDenom: "acanto",
          coinDecimals: 18,
          coinGeckoId: "canto",
          coinImageUrl: "/tokens/generated/canto.svg",
          base: "ibc/47CAF2DB8C016FAC960F33BC492FD8E454593B65CC59D70FA9D9F30424F9C32F",
          gasPriceStep: {
            low: 1000000000000,
            average: 2000000000000,
            high: 3000000000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "CANTO",
        coinMinimalDenom: "acanto",
        coinGeckoId: "canto",
        coinImageUrl: "/tokens/generated/canto.svg",
        base: "ibc/47CAF2DB8C016FAC960F33BC492FD8E454593B65CC59D70FA9D9F30424F9C32F",
      },
      feeCurrencies: [
        {
          coinDenom: "CANTO",
          coinMinimalDenom: "acanto",
          coinDecimals: 18,
          coinGeckoId: "canto",
          coinImageUrl: "/tokens/generated/canto.svg",
          base: "ibc/47CAF2DB8C016FAC960F33BC492FD8E454593B65CC59D70FA9D9F30424F9C32F",
          gasPriceStep: {
            low: 1000000000000,
            average: 2000000000000,
            high: 3000000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "canto",
        bech32PrefixAccPub: "cantopub",
        bech32PrefixValAddr: "cantovaloper",
        bech32PrefixValPub: "cantovaloperpub",
        bech32PrefixConsAddr: "cantovalcons",
        bech32PrefixConsPub: "cantovalconspub",
      },
      explorerUrlToTx: "https://cosmos-explorers.neobase.one/canto/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "quicksilver",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Quicksilver",
    chain_id: "quicksilver-2",
    bech32_prefix: "quick",
    bech32_config: {
      bech32PrefixAccAddr: "quick",
      bech32PrefixAccPub: "quickpub",
      bech32PrefixValAddr: "quickvaloper",
      bech32PrefixValPub: "quickvaloperpub",
      bech32PrefixConsAddr: "quickvalcons",
      bech32PrefixConsPub: "quickvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uqck",
          fixed_min_gas_price: 0.0001,
          low_gas_price: 0.0001,
          average_gas_price: 0.0001,
          high_gas_price: 0.00025,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uqck",
        },
      ],
    },
    description:
      "Liquid Stake your Cosmos assets with your preferred validator and receive liquid staked assets (qASSETs) that you can use for swapping, pooling, lending, and more, all while your original stake earns staking APY from securing the network.",
    apis: {
      rpc: [
        {
          address: "https://rpc-quicksilver.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-quicksilver.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ezstaking.app/quicksilver/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qck.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qck.svg",
      theme: {
        primary_color_hex: "#b2b2b2",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-quicksilver.keplr.app",
      rest: "https://lcd-quicksilver.keplr.app",
      chainId: "quicksilver-2",
      chainName: "quicksilver",
      prettyChainName: "Quicksilver",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "qSTARS",
          coinMinimalDenom: "uqstars",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/qstars.svg",
          base: "ibc/46C83BB054E12E189882B5284542DB605D94C99827E367C9192CF0579CD5BC83",
        },
        {
          coinDenom: "qATOM",
          coinMinimalDenom: "uqatom",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/qatom.svg",
          base: "ibc/FA602364BEC305A696CBDF987058E99D8B479F0318E47314C49173E8838C5BAC",
        },
        {
          coinDenom: "qREGEN",
          coinMinimalDenom: "uqregen",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/qregen.svg",
          base: "ibc/79A676508A2ECA1021EDDC7BB9CF70CEEC9514C478DA526A5A8B3E78506C2206",
        },
        {
          coinDenom: "QCK",
          coinMinimalDenom: "uqck",
          coinDecimals: 6,
          coinGeckoId: "quicksilver",
          coinImageUrl: "/tokens/generated/qck.png",
          base: "ibc/635CB83EF1DFE598B10A3E90485306FD0D47D34217A4BE5FD9977FA010A5367D",
          gasPriceStep: {
            low: 0.0001,
            average: 0.0001,
            high: 0.00025,
          },
        },
        {
          coinDenom: "qOSMO",
          coinMinimalDenom: "uqosmo",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/qosmo.svg",
          base: "ibc/42D24879D4569CE6477B7E88206ADBFE47C222C6CAD51A54083E4A72594269FC",
        },
        {
          coinDenom: "qSOMM",
          coinMinimalDenom: "uqsomm",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/qsomm.svg",
          base: "ibc/EAF76AD1EEF7B16D167D87711FB26ABE881AC7D9F7E6D0CF313D5FA530417208",
        },
        {
          coinDenom: "qJUNO",
          coinMinimalDenom: "uqjuno",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/qjuno.svg",
          base: "ibc/B4E18E61E1505C2F371B621E49B09E983F6A138F251A7B5286A6BDF739FD0D54",
        },
        {
          coinDenom: "qSAGA",
          coinMinimalDenom: "uqsaga",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/qsaga.svg",
          base: "ibc/F2D400F2728E9DA06EAE2AFAB289931A69EDDA5A661578C66A3177EDFE3C0D13",
        },
        {
          coinDenom: "qDYDX",
          coinMinimalDenom: "aqdydx",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/qdydx.svg",
          base: "ibc/273C593E51ACE56F1F2BDB3E03A5CB81BB208B894BCAA642676A32C3454E8C27",
        },
        {
          coinDenom: "qBLD",
          coinMinimalDenom: "uqbld",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/qbld.svg",
          base: "ibc/C1C106D915C8E8C59E5DC69BF30FEF64729A6F788060B184C86A315DBB762EF7",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "QCK",
        coinMinimalDenom: "uqck",
        coinGeckoId: "quicksilver",
        coinImageUrl: "/tokens/generated/qck.png",
        base: "ibc/635CB83EF1DFE598B10A3E90485306FD0D47D34217A4BE5FD9977FA010A5367D",
      },
      feeCurrencies: [
        {
          coinDenom: "QCK",
          coinMinimalDenom: "uqck",
          coinDecimals: 6,
          coinGeckoId: "quicksilver",
          coinImageUrl: "/tokens/generated/qck.png",
          base: "ibc/635CB83EF1DFE598B10A3E90485306FD0D47D34217A4BE5FD9977FA010A5367D",
          gasPriceStep: {
            low: 0.0001,
            average: 0.0001,
            high: 0.00025,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "quick",
        bech32PrefixAccPub: "quickpub",
        bech32PrefixValAddr: "quickvaloper",
        bech32PrefixValPub: "quickvaloperpub",
        bech32PrefixConsAddr: "quickvalcons",
        bech32PrefixConsPub: "quickvalconspub",
      },
      explorerUrlToTx: "https://ezstaking.app/quicksilver/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "8ball",
    status: "killed",
    network_type: "mainnet",
    pretty_name: "8ball",
    chain_id: "eightball-1",
    bech32_prefix: "8ball",
    bech32_config: {
      bech32PrefixAccAddr: "8ball",
      bech32PrefixAccPub: "8ballpub",
      bech32PrefixValAddr: "8ballvaloper",
      bech32PrefixValPub: "8ballvaloperpub",
      bech32PrefixConsAddr: "8ballvalcons",
      bech32PrefixConsPub: "8ballvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uebl",
          fixed_min_gas_price: 0,
          low_gas_price: 0,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uebl",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.8ball.info",
        },
      ],
      rest: [
        {
          address: "https://rest.8ball.info",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.8ball.info/8ball/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/8ball/images/8ball.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/8ball/images/8ball.svg",
      theme: {
        primary_color_hex: "#dbdbdb",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.8ball.info",
      rest: "https://rest.8ball.info",
      chainId: "eightball-1",
      chainName: "8ball",
      prettyChainName: "8ball",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "EBL",
          coinMinimalDenom: "uebl",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/ebl.svg",
          base: "ibc/8BE73A810E22F80E5E850531A688600D63AE7392E7C2770AE758CAA4FD921B7F",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "EBL",
        coinMinimalDenom: "uebl",
        coinImageUrl: "/tokens/generated/ebl.svg",
        base: "ibc/8BE73A810E22F80E5E850531A688600D63AE7392E7C2770AE758CAA4FD921B7F",
      },
      feeCurrencies: [
        {
          coinDenom: "EBL",
          coinMinimalDenom: "uebl",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/ebl.svg",
          base: "ibc/8BE73A810E22F80E5E850531A688600D63AE7392E7C2770AE758CAA4FD921B7F",
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "8ball",
        bech32PrefixAccPub: "8ballpub",
        bech32PrefixValAddr: "8ballvaloper",
        bech32PrefixValPub: "8ballvaloperpub",
        bech32PrefixConsAddr: "8ballvalcons",
        bech32PrefixConsPub: "8ballvalconspub",
      },
      explorerUrlToTx: "https://explorer.8ball.info/8ball/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "arkh",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Arkhadian",
    chain_id: "arkh",
    bech32_prefix: "arkh",
    bech32_config: {
      bech32PrefixAccAddr: "arkh",
      bech32PrefixAccPub: "arkhpub",
      bech32PrefixValAddr: "arkhvaloper",
      bech32PrefixValPub: "arkhvaloperpub",
      bech32PrefixConsAddr: "arkhvalcons",
      bech32PrefixConsPub: "arkhvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "arkh",
          fixed_min_gas_price: 0.01,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.03,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "arkh",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://arkh-rpc.kynraze.com",
        },
      ],
      rest: [
        {
          address: "https://arkh-api.kynraze.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.kynraze.com/arkhadian/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/arkh/images/arkh.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/arkh/images/arkh.svg",
      theme: {
        primary_color_hex: "#bdbb82",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://arkh-rpc.kynraze.com",
      rest: "https://arkh-api.kynraze.com",
      chainId: "arkh",
      chainName: "arkh",
      prettyChainName: "Arkhadian",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "ARKH",
          coinMinimalDenom: "arkh",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/arkh.svg",
          base: "ibc/0F91EE8B98AAE3CF393D94CD7F89A10F8D7758C5EC707E721899DFE65C164C28",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "ARKH",
        coinMinimalDenom: "arkh",
        coinImageUrl: "/tokens/generated/arkh.svg",
        base: "ibc/0F91EE8B98AAE3CF393D94CD7F89A10F8D7758C5EC707E721899DFE65C164C28",
      },
      feeCurrencies: [
        {
          coinDenom: "ARKH",
          coinMinimalDenom: "arkh",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/arkh.svg",
          base: "ibc/0F91EE8B98AAE3CF393D94CD7F89A10F8D7758C5EC707E721899DFE65C164C28",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "arkh",
        bech32PrefixAccPub: "arkhpub",
        bech32PrefixValAddr: "arkhvaloper",
        bech32PrefixValPub: "arkhvaloperpub",
        bech32PrefixConsAddr: "arkhvalcons",
        bech32PrefixConsPub: "arkhvalconspub",
      },
      explorerUrlToTx: "https://explorer.kynraze.com/arkhadian/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "noble",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Noble",
    chain_id: "noble-1",
    bech32_prefix: "noble",
    bech32_config: {
      bech32PrefixAccAddr: "noble",
      bech32PrefixAccPub: "noblepub",
      bech32PrefixValAddr: "noblevaloper",
      bech32PrefixValPub: "noblevaloperpub",
      bech32PrefixConsAddr: "noblevalcons",
      bech32PrefixConsPub: "noblevalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uusdc",
          fixed_min_gas_price: 0.1,
          low_gas_price: 0.1,
          average_gas_price: 0.1,
          high_gas_price: 0.2,
        },
        {
          denom:
            "ibc/EF48E6B1A1A19F47ECAEA62F5670C37C0580E86A9E88498B7E393EB6F49F33C0",
          fixed_min_gas_price: 0.01,
          low_gas_price: 0.01,
          average_gas_price: 0.01,
          high_gas_price: 0.02,
        },
      ],
    },
    description:
      "The most reliable, secure, and frictionless way to natively issue a digital asset in Cosmos.",
    apis: {
      rpc: [
        {
          address: "https://noble-rpc.polkachu.com",
        },
      ],
      rest: [
        {
          address: "https://noble-api.polkachu.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/noble/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/stake.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/stake.svg",
      theme: {
        primary_color_hex: "#a8bbfb",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://noble-rpc.polkachu.com",
      rest: "https://noble-api.polkachu.com",
      chainId: "noble-1",
      chainName: "noble",
      prettyChainName: "Noble",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "FRNZ",
          coinMinimalDenom: "ufrienzies",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/frnz.svg",
          base: "ibc/7FA7EC64490E3BDE5A1A28CBE73CC0AD22522794957BC891C46321E3A6074DB9",
        },
        {
          coinDenom: "USDC",
          coinMinimalDenom: "uusdc",
          coinDecimals: 6,
          coinGeckoId: "usd-coin",
          coinImageUrl: "/tokens/generated/usdc.svg",
          base: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
          pegMechanism: "collateralized",
          gasPriceStep: {
            low: 0.1,
            average: 0.1,
            high: 0.2,
          },
        },
        {
          coinDenom: "USDY",
          coinMinimalDenom: "ausdy",
          coinDecimals: 18,
          coinGeckoId: "ondo-us-dollar-yield",
          coinImageUrl: "/tokens/generated/usdy.svg",
          base: "ibc/23104D411A6EB6031FA92FB75F227422B84989969E91DCAD56A535DD7FF0A373",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "EURe",
          coinMinimalDenom: "ueure",
          coinDecimals: 6,
          coinGeckoId: "monerium-eur-money",
          coinImageUrl: "/tokens/generated/eure.svg",
          base: "ibc/92AE2F53284505223A1BB80D132F859A00E190C6A738772F0B3EF65E20BA484F",
          pegMechanism: "collateralized",
        },
      ],
      stakeCurrency: {
        coinDecimals: 0,
        coinDenom: "STAKE",
        coinMinimalDenom: "tempStakePlaceholder",
      },
      feeCurrencies: [
        {
          coinDenom: "USDC",
          coinMinimalDenom: "uusdc",
          coinDecimals: 6,
          coinGeckoId: "usd-coin",
          coinImageUrl: "/tokens/generated/usdc.svg",
          base: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
          gasPriceStep: {
            low: 0.1,
            average: 0.1,
            high: 0.2,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "noble",
        bech32PrefixAccPub: "noblepub",
        bech32PrefixValAddr: "noblevaloper",
        bech32PrefixValPub: "noblevaloperpub",
        bech32PrefixConsAddr: "noblevalcons",
        bech32PrefixConsPub: "noblevalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/noble/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "migaloo",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Migaloo",
    chain_id: "migaloo-1",
    bech32_prefix: "migaloo",
    bech32_config: {
      bech32PrefixAccAddr: "migaloo",
      bech32PrefixAccPub: "migaloopub",
      bech32PrefixValAddr: "migaloovaloper",
      bech32PrefixValPub: "migaloovaloperpub",
      bech32PrefixConsAddr: "migaloovalcons",
      bech32PrefixConsPub: "migaloovalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uwhale",
          fixed_min_gas_price: 1,
          low_gas_price: 1,
          average_gas_price: 2,
          high_gas_price: 3,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uwhale",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://migaloo-rpc.lavenderfive.com",
        },
      ],
      rest: [
        {
          address: "https://migaloo-api.lavenderfive.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/migaloo/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/migaloo-light.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/migaloo-light.svg",
      theme: {
        primary_color_hex: "#3ccc64",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://migaloo-rpc.lavenderfive.com",
      rest: "https://migaloo-api.lavenderfive.com",
      chainId: "migaloo-1",
      chainName: "migaloo",
      prettyChainName: "Migaloo",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "WHALE",
          coinMinimalDenom: "uwhale",
          coinDecimals: 6,
          coinGeckoId: "white-whale",
          coinImageUrl: "/tokens/generated/whale.svg",
          base: "ibc/EDD6F0D66BCD49C1084FB2C35353B4ACD7B9191117CE63671B61320548F7C89D",
          gasPriceStep: {
            low: 1,
            average: 2,
            high: 3,
          },
        },
        {
          coinDenom: "ASH",
          coinMinimalDenom:
            "factory/migaloo1erul6xyq0gk6ws98ncj7lnq9l4jn4gnnu9we73gdz78yyl2lr7qqrvcgup/ash",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/ash.svg",
          base: "ibc/4976049456D261659D0EC499CC9C2391D3C7D1128A0B9FB0BBF2842D1B2BC7BC",
        },
        {
          coinDenom: "RAC",
          coinMinimalDenom:
            "factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/urac",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/rac.svg",
          base: "ibc/DDF1CD4CDC14AE2D6A3060193624605FF12DEE71CF1F8C19EEF35E9447653493",
        },
        {
          coinDenom: "GUPPY",
          coinMinimalDenom:
            "factory/migaloo1etlu2h30tjvv8rfa4fwdc43c92f6ul5w9acxzk/uguppy",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/guppy.png",
          base: "ibc/42A9553A7770F3D7B62F3A82AF04E7719B4FD6EAF31BE5645092AAC4A6C2201D",
        },
        {
          coinDenom: "SHARK",
          coinMinimalDenom:
            "factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/shark",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/shark.png",
          base: "ibc/64D56DF9EC69BE554F49EBCE0199611062FF1137EF105E2F645C1997344F3834",
        },
        {
          coinDenom: "RSTK",
          coinMinimalDenom:
            "factory/migaloo1d0uma9qzcts4fzt7ml39xp44aut5k6qyjfzz4asalnecppppr3rsl52vvv/rstk",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/rstk.svg",
          base: "ibc/04FAC73DFF7F1DD59395948F2F043B0BBF978AD4533EE37E811340F501A08FFB",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "WHALE",
        coinMinimalDenom: "uwhale",
        coinGeckoId: "white-whale",
        coinImageUrl: "/tokens/generated/whale.svg",
        base: "ibc/EDD6F0D66BCD49C1084FB2C35353B4ACD7B9191117CE63671B61320548F7C89D",
      },
      feeCurrencies: [
        {
          coinDenom: "WHALE",
          coinMinimalDenom: "uwhale",
          coinDecimals: 6,
          coinGeckoId: "white-whale",
          coinImageUrl: "/tokens/generated/whale.svg",
          base: "ibc/EDD6F0D66BCD49C1084FB2C35353B4ACD7B9191117CE63671B61320548F7C89D",
          gasPriceStep: {
            low: 1,
            average: 2,
            high: 3,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "migaloo",
        bech32PrefixAccPub: "migaloopub",
        bech32PrefixValAddr: "migaloovaloper",
        bech32PrefixValPub: "migaloovaloperpub",
        bech32PrefixConsAddr: "migaloovalcons",
        bech32PrefixConsPub: "migaloovalconspub",
      },
      explorerUrlToTx: "https://ping.pub/migaloo/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "omniflixhub",
    status: "live",
    network_type: "mainnet",
    pretty_name: "OmniFlix",
    chain_id: "omniflixhub-1",
    bech32_prefix: "omniflix",
    bech32_config: {
      bech32PrefixAccAddr: "omniflix",
      bech32PrefixAccPub: "omniflixpub",
      bech32PrefixValAddr: "omniflixvaloper",
      bech32PrefixValPub: "omniflixvaloperpub",
      bech32PrefixConsAddr: "omniflixvalcons",
      bech32PrefixConsPub: "omniflixvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uflix",
          fixed_min_gas_price: 0,
          low_gas_price: 0.001,
          average_gas_price: 0.0025,
          high_gas_price: 0.025,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uflix",
        },
      ],
    },
    description:
      "Decentralized media and network layer for Creators & Sovereign Communities powered by NFTs and related distribution protocols.",
    apis: {
      rpc: [
        {
          address: "https://rpc.omniflix.network",
        },
      ],
      rest: [
        {
          address: "https://rest.omniflix.network",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/omniflix/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.svg",
      theme: {
        primary_color_hex: "#c33635",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.omniflix.network",
      rest: "https://rest.omniflix.network",
      chainId: "omniflixhub-1",
      chainName: "omniflixhub",
      prettyChainName: "OmniFlix",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "FLIX",
          coinMinimalDenom: "uflix",
          coinDecimals: 6,
          coinGeckoId: "omniflix-network",
          coinImageUrl: "/tokens/generated/flix.svg",
          base: "ibc/CEE970BB3D26F4B907097B6B660489F13F3B0DA765B83CC7D9A0BC0CE220FA6F",
          gasPriceStep: {
            low: 0.001,
            average: 0.0025,
            high: 0.025,
          },
        },
        {
          coinDenom: "YGATA",
          coinMinimalDenom:
            "factory/omniflix1fwphj5p6qd8gtkehkzfgac38eur4uqzgz97uwvf6hsc0vjl004gqfj0xnv/ygata",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/ygata.svg",
          base: "ibc/50F886EFA15E1FF3D9226B177083A1EFF944176181C70B6131D74FE5AFB1F2C0",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "FLIX",
        coinMinimalDenom: "uflix",
        coinGeckoId: "omniflix-network",
        coinImageUrl: "/tokens/generated/flix.svg",
        base: "ibc/CEE970BB3D26F4B907097B6B660489F13F3B0DA765B83CC7D9A0BC0CE220FA6F",
      },
      feeCurrencies: [
        {
          coinDenom: "FLIX",
          coinMinimalDenom: "uflix",
          coinDecimals: 6,
          coinGeckoId: "omniflix-network",
          coinImageUrl: "/tokens/generated/flix.svg",
          base: "ibc/CEE970BB3D26F4B907097B6B660489F13F3B0DA765B83CC7D9A0BC0CE220FA6F",
          gasPriceStep: {
            low: 0.001,
            average: 0.0025,
            high: 0.025,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "omniflix",
        bech32PrefixAccPub: "omniflixpub",
        bech32PrefixValAddr: "omniflixvaloper",
        bech32PrefixValPub: "omniflixvaloperpub",
        bech32PrefixConsAddr: "omniflixvalcons",
        bech32PrefixConsPub: "omniflixvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/omniflix/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "axelar",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Axelar",
    chain_id: "axelar-dojo-1",
    bech32_prefix: "axelar",
    bech32_config: {
      bech32PrefixAccAddr: "axelar",
      bech32PrefixAccPub: "axelarpub",
      bech32PrefixValAddr: "axelarvaloper",
      bech32PrefixValPub: "axelarvaloperpub",
      bech32PrefixConsAddr: "axelarvalcons",
      bech32PrefixConsPub: "axelarvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uaxl",
          fixed_min_gas_price: 0.007,
          low_gas_price: 0.007,
          average_gas_price: 0.007,
          high_gas_price: 0.01,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uaxl",
        },
      ],
    },
    description:
      "Axelar delivers secure cross-chain communication for Web3. Our infrastructure enables dApp users to interact with any asset or application, on any chain, with one click.",
    apis: {
      rpc: [
        {
          address: "https://rpc-axelar.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-axelar.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://axelarscan.io/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.svg",
      theme: {
        primary_color_hex: "#040404",
      },
    },
    features: ["ibc-transfer", "ibc-go", "axelar-evm-bridge"],
    keplrChain: {
      rpc: "https://rpc-axelar.keplr.app",
      rest: "https://lcd-axelar.keplr.app",
      chainId: "axelar-dojo-1",
      chainName: "axelar",
      prettyChainName: "Axelar",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "USDC.eth.axl",
          coinMinimalDenom: "uusdc",
          coinDecimals: 6,
          coinGeckoId: "axlusdc",
          coinImageUrl: "/tokens/generated/usdc.eth.axl.svg",
          base: "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "ETH.axl",
          coinMinimalDenom: "weth-wei",
          coinDecimals: 18,
          coinGeckoId: "axlweth",
          coinImageUrl: "/tokens/generated/eth.axl.svg",
          base: "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        },
        {
          coinDenom: "WBTC.eth.axl",
          coinMinimalDenom: "wbtc-satoshi",
          coinDecimals: 8,
          coinGeckoId: "axlwbtc",
          coinImageUrl: "/tokens/generated/wbtc.eth.axl.svg",
          base: "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
        },
        {
          coinDenom: "USDT.eth.axl",
          coinMinimalDenom: "uusdt",
          coinDecimals: 6,
          coinGeckoId: "axelar-usdt",
          coinImageUrl: "/tokens/generated/usdt.eth.axl.svg",
          base: "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "DAI",
          coinMinimalDenom: "dai-wei",
          coinDecimals: 18,
          coinGeckoId: "dai",
          coinImageUrl: "/tokens/generated/dai.svg",
          base: "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "BUSD",
          coinMinimalDenom: "busd-wei",
          coinDecimals: 18,
          coinGeckoId: "binance-usd",
          coinImageUrl: "/tokens/generated/busd.svg",
          base: "ibc/6329DD8CF31A334DD5BE3F68C846C9FE313281362B37686A62343BAC1EB1546D",
        },
        {
          coinDenom: "BNB",
          coinMinimalDenom: "wbnb-wei",
          coinDecimals: 18,
          coinGeckoId: "binancecoin",
          coinImageUrl: "/tokens/generated/bnb.svg",
          base: "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
        },
        {
          coinDenom: "POL",
          coinMinimalDenom: "wmatic-wei",
          coinDecimals: 18,
          coinGeckoId: "matic-network",
          coinImageUrl: "/tokens/generated/pol.svg",
          base: "ibc/AB589511ED0DD5FA56171A39978AFBF1371DB986EC1C3526CE138A16377E39BB",
        },
        {
          coinDenom: "AVAX",
          coinMinimalDenom: "wavax-wei",
          coinDecimals: 18,
          coinGeckoId: "avalanche-2",
          coinImageUrl: "/tokens/generated/avax.svg",
          base: "ibc/6F62F01D913E3FFE472A38C78235B8F021B511BC6596ADFF02615C8F83D3B373",
        },
        {
          coinDenom: "DOT.glmr.axl",
          coinMinimalDenom: "dot-planck",
          coinDecimals: 10,
          coinImageUrl: "/tokens/generated/dot.glmr.axl.svg",
          base: "ibc/3FF92D26B407FD61AE95D975712A7C319CDE28DE4D80BDC9978D935932B991D7",
        },
        {
          coinDenom: "FRAX",
          coinMinimalDenom: "frax-wei",
          coinDecimals: 18,
          coinGeckoId: "frax",
          coinImageUrl: "/tokens/generated/frax.svg",
          base: "ibc/0E43EDE2E2A3AFA36D0CD38BDDC0B49FECA64FA426A82E102F304E430ECF46EE",
          pegMechanism: "hybrid",
        },
        {
          coinDenom: "LINK.axl",
          coinMinimalDenom: "link-wei",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/link.axl.svg",
          base: "ibc/D3327A763C23F01EC43D1F0DB3CEFEC390C362569B6FD191F40A5192F8960049",
        },
        {
          coinDenom: "AAVE",
          coinMinimalDenom: "aave-wei",
          coinDecimals: 18,
          coinGeckoId: "aave",
          coinImageUrl: "/tokens/generated/aave.svg",
          base: "ibc/384E5DD50BDE042E1AAF51F312B55F08F95BC985C503880189258B4D9374CBBE",
        },
        {
          coinDenom: "APE",
          coinMinimalDenom: "ape-wei",
          coinDecimals: 18,
          coinGeckoId: "apecoin",
          coinImageUrl: "/tokens/generated/ape.svg",
          base: "ibc/F83CC6471DA4D4B508F437244F10B9E4C68975344E551A2DEB6B8617AB08F0D4",
        },
        {
          coinDenom: "MKR",
          coinMinimalDenom: "mkr-wei",
          coinDecimals: 18,
          coinGeckoId: "maker",
          coinImageUrl: "/tokens/generated/mkr.svg",
          base: "ibc/D27DDDF34BB47E5D5A570742CC667DE53277867116CCCA341F27785E899A70F3",
        },
        {
          coinDenom: "RAI",
          coinMinimalDenom: "rai-wei",
          coinDecimals: 18,
          coinGeckoId: "rai",
          coinImageUrl: "/tokens/generated/rai.svg",
          base: "ibc/BD796662F8825327D41C96355DF62045A5BA225BAE31C0A86289B9D88ED3F44E",
        },
        {
          coinDenom: "SHIB.axl",
          coinMinimalDenom: "shib-wei",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/shib.axl.svg",
          base: "ibc/19305E20681911F14D1FB275E538CDE524C3BF88CF9AE5D5F78F4D4DA05E85B2",
        },
        {
          coinDenom: "GLMR",
          coinMinimalDenom: "wglmr-wei",
          coinDecimals: 18,
          coinGeckoId: "moonbeam",
          coinImageUrl: "/tokens/generated/glmr.svg",
          base: "ibc/1E26DB0E5122AED464D98462BD384FCCB595732A66B3970AE6CE0B58BAE0FC49",
        },
        {
          coinDenom: "AXL",
          coinMinimalDenom: "uaxl",
          coinDecimals: 6,
          coinGeckoId: "axelar",
          coinImageUrl: "/tokens/generated/axl.svg",
          base: "ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E",
          gasPriceStep: {
            low: 0.007,
            average: 0.007,
            high: 0.01,
          },
        },
        {
          coinDenom: "FTM",
          coinMinimalDenom: "wftm-wei",
          coinDecimals: 18,
          coinGeckoId: "fantom",
          coinImageUrl: "/tokens/generated/ftm.svg",
          base: "ibc/5E2DFDF1734137302129EA1C1BA21A580F96F778D4F021815EA4F6DB378DA1A4",
        },
        {
          coinDenom: "USDC.e.matic.axl",
          coinMinimalDenom: "polygon-uusdc",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdc.e.matic.axl.svg",
          base: "ibc/231FD77ECCB2DB916D314019DA30FE013202833386B1908A191D16989AD80B5A",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "USDC.avax.axl",
          coinMinimalDenom: "avalanche-uusdc",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdc.avax.axl.svg",
          base: "ibc/F17C9CA112815613C5B6771047A093054F837C3020CBA59DFFD9D780A8B2984C",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "FIL",
          coinMinimalDenom: "wfil-wei",
          coinDecimals: 18,
          coinGeckoId: "filecoin",
          coinImageUrl: "/tokens/generated/fil.svg",
          base: "ibc/18FB5C09D9D2371F659D4846A956FA56225E377EE3C3652A2BF3542BF809159D",
        },
        {
          coinDenom: "ARB.axl",
          coinMinimalDenom: "arb-wei",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/arb.axl.svg",
          base: "ibc/10E5E5B06D78FFBB61FD9F89209DEE5FD4446ED0550CBB8E3747DA79E10D9DC6",
        },
        {
          coinDenom: "PEPE.axl",
          coinMinimalDenom: "pepe-wei",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/pepe.axl.svg",
          base: "ibc/E47F4E97C534C95B942729E1B25DBDE111EA791411CFF100515050BEA0AC0C6B",
        },
        {
          coinDenom: "cbETH",
          coinMinimalDenom: "cbeth-wei",
          coinDecimals: 18,
          coinGeckoId: "coinbase-wrapped-staked-eth",
          coinImageUrl: "/tokens/generated/cbeth.png",
          base: "ibc/4D7A6F2A7744B1534C984A21F9EDFFF8809FC71A9E9243FFB702073E7FCA513A",
        },
        {
          coinDenom: "rETH",
          coinMinimalDenom: "reth-wei",
          coinDecimals: 18,
          coinGeckoId: "rocket-pool-eth",
          coinImageUrl: "/tokens/generated/reth.png",
          base: "ibc/E610B83FD5544E00A8A1967A2EB3BEF25F1A8CFE8650FE247A8BD4ECA9DC9222",
        },
        {
          coinDenom: "sfrxETH",
          coinMinimalDenom: "sfrxeth-wei",
          coinDecimals: 18,
          coinGeckoId: "staked-frax-ether",
          coinImageUrl: "/tokens/generated/sfrxeth.svg",
          base: "ibc/81F578C39006EB4B27FFFA9460954527910D73390991B379C03B18934D272F46",
        },
        {
          coinDenom: "wstETH.eth.axl",
          coinMinimalDenom: "wsteth-wei",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/wsteth.eth.axl.svg",
          base: "ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C",
        },
        {
          coinDenom: "YieldETH",
          coinMinimalDenom: "yieldeth-wei",
          coinDecimals: 18,
          coinGeckoId: "yieldeth-sommelier",
          coinImageUrl: "/tokens/generated/yieldeth.svg",
          base: "ibc/FBB3FEF80ED2344D821D4F95C31DBFD33E4E31D5324CAD94EF756E67B749F668",
        },
        {
          coinDenom: "ETH.arb.axl",
          coinMinimalDenom: "arbitrum-weth-wei",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/eth.arb.axl.svg",
          base: "ibc/64E62451C9A5682FF3047429C6E4714A02CDC0C35DE35CAB01E18D1188004CEB",
        },
        {
          coinDenom: "ETH.base.axl",
          coinMinimalDenom: "base-weth-wei",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/eth.base.axl.svg",
          base: "ibc/D7D6DEF2A4F7ED0A6F5F0E266C1B2C9726E82F67EBBE49BBB47B3DEC289F8D7B",
        },
        {
          coinDenom: "ETH.matic.axl",
          coinMinimalDenom: "polygon-weth-wei",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/eth.matic.axl.svg",
          base: "ibc/F9EB60AC212DBF05F4C5ED0FDE03BB9F08309B0EE9899A406AD4B904CF84968E",
        },
        {
          coinDenom: "OP.axl",
          coinMinimalDenom: "op-wei",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/op.axl.svg",
          base: "ibc/14A291DD362798D6805B7ABCB8D09AEEE02176108F89FA09AA43EA2EE096A2A9",
        },
        {
          coinDenom: "UNI.axl",
          coinMinimalDenom: "uni-wei",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/uni.axl.svg",
          base: "ibc/AE2719773D6FCDD05AC17B1ED63F672F5F9D84144A61965F348C86C2A83AD161",
        },
        {
          coinDenom: "USDT.e.arb.axl",
          coinMinimalDenom: "arbitrum-uusdt",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdt.e.arb.axl.svg",
          base: "ibc/57B63A0795B6BC0AC4EFD0D4DEE9FE71FCC1D0FFA87F6280C9CDEF4F6727A173",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "USDT.e.op.axl",
          coinMinimalDenom: "optimism-uusdt",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdt.e.op.axl.svg",
          base: "ibc/EEA21E12A250B7FBBCBBBD1F7AA78984F5C12D684B32EBEEFC585FF596A7BCDA",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "USDT.e.matic.axl",
          coinMinimalDenom: "polygon-uusdt",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdt.e.matic.axl.svg",
          base: "ibc/2F6003A92088B989A159C593C551DF7B04FA0A0419CA3ED087E45E0006ECFF6E",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "cbBTC.axl",
          coinMinimalDenom: "cbbtc-satoshi",
          coinDecimals: 8,
          coinImageUrl: "/tokens/generated/cbbtc.axl.svg",
          base: "ibc/616C2EA69BC328F245CE449785CB0B526B462C48F19DCF9B3D30699579B4308A",
        },
        {
          coinDenom: "FBTC.axl",
          coinMinimalDenom: "fbtc-satoshi",
          coinDecimals: 8,
          coinImageUrl: "/tokens/generated/fbtc.axl.svg",
          base: "ibc/22C342A34DD0189AC2B2697EE76C360A9FBA53748ABA76E12C3A9E9F5F1E130F",
        },
        {
          coinDenom: "LBTC.axl",
          coinMinimalDenom: "lbtc-satoshi",
          coinDecimals: 8,
          coinImageUrl: "/tokens/generated/lbtc.axl.svg",
          base: "ibc/4AC81C97BBB5482536F6401328E0E10BCCD98F0F471DCF64319A811E25E53CAB",
        },
        {
          coinDenom: "YUM",
          coinMinimalDenom: "yum-wei",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/yum.png",
          base: "ibc/21D8071EF5B02A86D945430D859A594CBF28287D38104A264BB9FD3B22BBF5DE",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "AXL",
        coinMinimalDenom: "uaxl",
        coinGeckoId: "axelar",
        coinImageUrl: "/tokens/generated/axl.svg",
        base: "ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E",
      },
      feeCurrencies: [
        {
          coinDenom: "AXL",
          coinMinimalDenom: "uaxl",
          coinDecimals: 6,
          coinGeckoId: "axelar",
          coinImageUrl: "/tokens/generated/axl.svg",
          base: "ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E",
          gasPriceStep: {
            low: 0.007,
            average: 0.007,
            high: 0.01,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "axelar",
        bech32PrefixAccPub: "axelarpub",
        bech32PrefixValAddr: "axelarvaloper",
        bech32PrefixValPub: "axelarvaloperpub",
        bech32PrefixConsAddr: "axelarvalcons",
        bech32PrefixConsPub: "axelarvalconspub",
      },
      explorerUrlToTx: "https://axelarscan.io/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "axelar-evm-bridge"],
    },
  },
  {
    chain_name: "bluzelle",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Bluzelle",
    chain_id: "bluzelle-9",
    bech32_prefix: "bluzelle",
    bech32_config: {
      bech32PrefixAccAddr: "bluzelle",
      bech32PrefixAccPub: "bluzellepub",
      bech32PrefixValAddr: "bluzellevaloper",
      bech32PrefixValPub: "bluzellevaloperpub",
      bech32PrefixConsAddr: "bluzellevalcons",
      bech32PrefixConsPub: "bluzellevalconspub",
    },
    slip44: 483,
    fees: {
      fee_tokens: [
        {
          denom: "ubnt",
          fixed_min_gas_price: 0.002,
          low_gas_price: 0.002,
          average_gas_price: 0.002,
          high_gas_price: 0.025,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ubnt",
        },
      ],
      lock_duration: {
        time: "1814400s",
      },
    },
    apis: {
      rpc: [
        {
          address: "https://a.client.sentry.net.bluzelle.com:26657",
        },
      ],
      rest: [
        {
          address: "https://a.client.sentry.net.bluzelle.com:1317",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://bd.explorer.net.bluzelle.com/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bluzelle/images/bluzelle.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bluzelle/images/bluzelle.svg",
      theme: {
        primary_color_hex: "#708ffc",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://a.client.sentry.net.bluzelle.com:26657",
      rest: "https://a.client.sentry.net.bluzelle.com:1317",
      chainId: "bluzelle-9",
      chainName: "bluzelle",
      prettyChainName: "Bluzelle",
      bip44: {
        coinType: 483,
      },
      currencies: [
        {
          coinDenom: "BLZ",
          coinMinimalDenom: "ubnt",
          coinDecimals: 6,
          coinGeckoId: "bluzelle",
          coinImageUrl: "/tokens/generated/blz.svg",
          base: "ibc/63CDD51098FD99E04E5F5610A3882CBE7614C441607BA6FCD7F3A3C1CD5325F8",
          gasPriceStep: {
            low: 0.002,
            average: 0.002,
            high: 0.025,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "BLZ",
        coinMinimalDenom: "ubnt",
        coinGeckoId: "bluzelle",
        coinImageUrl: "/tokens/generated/blz.svg",
        base: "ibc/63CDD51098FD99E04E5F5610A3882CBE7614C441607BA6FCD7F3A3C1CD5325F8",
      },
      feeCurrencies: [
        {
          coinDenom: "BLZ",
          coinMinimalDenom: "ubnt",
          coinDecimals: 6,
          coinGeckoId: "bluzelle",
          coinImageUrl: "/tokens/generated/blz.svg",
          base: "ibc/63CDD51098FD99E04E5F5610A3882CBE7614C441607BA6FCD7F3A3C1CD5325F8",
          gasPriceStep: {
            low: 0.002,
            average: 0.002,
            high: 0.025,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "bluzelle",
        bech32PrefixAccPub: "bluzellepub",
        bech32PrefixValAddr: "bluzellevaloper",
        bech32PrefixValPub: "bluzellevaloperpub",
        bech32PrefixConsAddr: "bluzellevalcons",
        bech32PrefixConsPub: "bluzellevalconspub",
      },
      explorerUrlToTx:
        "https://bd.explorer.net.bluzelle.com/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "gitopia",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Gitopia",
    chain_id: "gitopia",
    bech32_prefix: "gitopia",
    bech32_config: {
      bech32PrefixAccAddr: "gitopia",
      bech32PrefixAccPub: "gitopiapub",
      bech32PrefixValAddr: "gitopiavaloper",
      bech32PrefixValPub: "gitopiavaloperpub",
      bech32PrefixConsAddr: "gitopiavalcons",
      bech32PrefixConsPub: "gitopiavalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ulore",
          fixed_min_gas_price: 0.001,
          low_gas_price: 0.0012,
          average_gas_price: 0.0016,
          high_gas_price: 0.0024,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ulore",
        },
      ],
      lock_duration: {
        time: "1814400s",
      },
    },
    description:
      "Gitopia is the next-generation Code Collaboration Platform fuelled by a decentralized network and interactive token economy. It is designed to optimize the open-source software development process through collaboration, transparency, and incentivization.",
    apis: {
      rpc: [
        {
          address: "https://rpc-gitopia.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-gitopia.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/gitopia/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gitopia/images/gitopia.png",
      theme: {
        primary_color_hex: "#2e154d",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-gitopia.keplr.app",
      rest: "https://lcd-gitopia.keplr.app",
      chainId: "gitopia",
      chainName: "gitopia",
      prettyChainName: "Gitopia",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "LORE",
          coinMinimalDenom: "ulore",
          coinDecimals: 6,
          coinGeckoId: "gitopia",
          coinImageUrl: "/tokens/generated/lore.svg",
          base: "ibc/B1C1806A540B3E165A2D42222C59946FB85BA325596FC85662D7047649F419F3",
          gasPriceStep: {
            low: 0.0012,
            average: 0.0016,
            high: 0.0024,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "LORE",
        coinMinimalDenom: "ulore",
        coinGeckoId: "gitopia",
        coinImageUrl: "/tokens/generated/lore.svg",
        base: "ibc/B1C1806A540B3E165A2D42222C59946FB85BA325596FC85662D7047649F419F3",
      },
      feeCurrencies: [
        {
          coinDenom: "LORE",
          coinMinimalDenom: "ulore",
          coinDecimals: 6,
          coinGeckoId: "gitopia",
          coinImageUrl: "/tokens/generated/lore.svg",
          base: "ibc/B1C1806A540B3E165A2D42222C59946FB85BA325596FC85662D7047649F419F3",
          gasPriceStep: {
            low: 0.0012,
            average: 0.0016,
            high: 0.0024,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "gitopia",
        bech32PrefixAccPub: "gitopiapub",
        bech32PrefixValAddr: "gitopiavaloper",
        bech32PrefixValPub: "gitopiavaloperpub",
        bech32PrefixConsAddr: "gitopiavalcons",
        bech32PrefixConsPub: "gitopiavalconspub",
      },
      explorerUrlToTx: "https://ping.pub/gitopia/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "nolus",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Nolus",
    chain_id: "pirin-1",
    bech32_prefix: "nolus",
    bech32_config: {
      bech32PrefixAccAddr: "nolus",
      bech32PrefixAccPub: "noluspub",
      bech32PrefixValAddr: "nolusvaloper",
      bech32PrefixValPub: "nolusvaloperpub",
      bech32PrefixConsAddr: "nolusvalcons",
      bech32PrefixConsPub: "nolusvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "unls",
          fixed_min_gas_price: 0.025,
          low_gas_price: 0.025,
          average_gas_price: 0.025,
          high_gas_price: 0.05,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "unls",
        },
      ],
      lock_duration: {
        time: "1814400s",
      },
    },
    description:
      "Elevate your game with up to 3x equity. Dive into a world of minimized risks and unlock the full potential of your assets.",
    apis: {
      rpc: [
        {
          address: "https://pirin-cl.nolus.network:26657",
        },
      ],
      rest: [
        {
          address: "https://pirin-cl.nolus.network:1317",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.nolus.io/pirin-1/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nolus/images/nolus.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nolus/images/nolus.svg",
      theme: {
        primary_color_hex: "#fc542c",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://pirin-cl.nolus.network:26657",
      rest: "https://pirin-cl.nolus.network:1317",
      chainId: "pirin-1",
      chainName: "nolus",
      prettyChainName: "Nolus",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "NLS",
          coinMinimalDenom: "unls",
          coinDecimals: 6,
          coinGeckoId: "nolus",
          coinImageUrl: "/tokens/generated/nls.svg",
          base: "ibc/D9AFCECDD361D38302AA66EB3BAC23B95234832C51D12489DC451FA2B7C72782",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.05,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "NLS",
        coinMinimalDenom: "unls",
        coinGeckoId: "nolus",
        coinImageUrl: "/tokens/generated/nls.svg",
        base: "ibc/D9AFCECDD361D38302AA66EB3BAC23B95234832C51D12489DC451FA2B7C72782",
      },
      feeCurrencies: [
        {
          coinDenom: "NLS",
          coinMinimalDenom: "unls",
          coinDecimals: 6,
          coinGeckoId: "nolus",
          coinImageUrl: "/tokens/generated/nls.svg",
          base: "ibc/D9AFCECDD361D38302AA66EB3BAC23B95234832C51D12489DC451FA2B7C72782",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.05,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "nolus",
        bech32PrefixAccPub: "noluspub",
        bech32PrefixValAddr: "nolusvaloper",
        bech32PrefixValPub: "nolusvaloperpub",
        bech32PrefixConsAddr: "nolusvalcons",
        bech32PrefixConsPub: "nolusvalconspub",
      },
      explorerUrlToTx: "https://explorer.nolus.io/pirin-1/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "neutron",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Neutron",
    chain_id: "neutron-1",
    bech32_prefix: "neutron",
    bech32_config: {
      bech32PrefixAccAddr: "neutron",
      bech32PrefixAccPub: "neutronpub",
      bech32PrefixValAddr: "neutronvaloper",
      bech32PrefixValPub: "neutronvaloperpub",
      bech32PrefixConsAddr: "neutronvalcons",
      bech32PrefixConsPub: "neutronvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "untrn",
          low_gas_price: 0.0053,
          average_gas_price: 0.0053,
          high_gas_price: 0.0053,
        },
        {
          denom:
            "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
          low_gas_price: 0.0008,
          average_gas_price: 0.0008,
          high_gas_price: 0.0008,
        },
        {
          denom:
            "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
          low_gas_price: 0.008,
          average_gas_price: 0.008,
          high_gas_price: 0.008,
        },
        {
          denom:
            "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
          low_gas_price: 2903231.6597,
          average_gas_price: 2903231.6597,
          high_gas_price: 2903231.6597,
        },
        {
          denom:
            "ibc/2CB87BCE0937B1D1DFCEE79BE4501AAF3C265E923509AEAC410AD85D27F35130",
          low_gas_price: 2564102564.1026,
          average_gas_price: 2564102564.1026,
          high_gas_price: 2564102564.1026,
        },
        {
          denom:
            "ibc/773B4D0A3CD667B2275D5A4A7A2F0909C0BA0F4059C0B9181E680DDF4965DCC7",
          low_gas_price: 0.0004,
          average_gas_price: 0.0004,
          high_gas_price: 0.0004,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "untrn",
        },
      ],
    },
    description:
      "The most secure CosmWasm platform in Cosmos, Neutron lets smart-contracts leverage bleeding-edge Interchain technology with minimal overhead.",
    apis: {
      rpc: [
        {
          address: "https://rpc-neutron.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-neutron.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/neutron/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/neutron-raw.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/neutron-raw.svg",
      theme: {
        primary_color_hex: "#000000",
        background_color_hex: "#00000000",
        circle: false,
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-neutron.keplr.app",
      rest: "https://lcd-neutron.keplr.app",
      chainId: "neutron-1",
      chainName: "neutron",
      prettyChainName: "Neutron",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "NTRN",
          coinMinimalDenom: "untrn",
          coinDecimals: 6,
          coinGeckoId: "neutron-3",
          coinImageUrl: "/tokens/generated/ntrn.svg",
          base: "ibc/126DA09104B71B164883842B769C0E9EC1486C0887D27A9999E395C2C8FB5682",
          gasPriceStep: {
            low: 0.0053,
            average: 0.0053,
            high: 0.0053,
          },
        },
        {
          coinDenom: "wstETH",
          coinMinimalDenom:
            "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
          coinDecimals: 18,
          coinGeckoId: "wrapped-steth",
          coinImageUrl: "/tokens/generated/wsteth.svg",
          base: "ibc/2F21E6D4271DE3F561F20A02CD541DAF7405B1E9CB3B9B07E3C2AC7D8A4338A5",
          gasPriceStep: {
            low: 2903231.6597,
            average: 2903231.6597,
            high: 2903231.6597,
          },
        },
        {
          coinDenom: "NEWT",
          coinMinimalDenom:
            "factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
          coinDecimals: 6,
          coinGeckoId: "newt",
          coinImageUrl: "/tokens/generated/newt.png",
          base: "ibc/BF685448E564B5A4AC8F6E0493A0B979D0E0BF5EC11F7E15D25A0A2160C944DD",
        },
        {
          coinDenom: "CIRCUS",
          coinMinimalDenom:
            "factory/neutron170v88vrtnedesyfytuku257cggxc79rd7lwt7q/ucircus",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/circus.png",
          base: "ibc/8C8F6349F656C943543C6B040377BE44123D01F712277815C3C13098BB98818C",
        },
        {
          coinDenom: "BAD",
          coinMinimalDenom:
            "factory/neutron143wp6g8paqasnuuey6zyapucknwy9rhnld8hkr/bad",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/bad.png",
          base: "ibc/442A08C33AE9875DF90792FFA73B5728E1CAECE87AB4F26AE9B422F1E682ED23",
        },
        {
          coinDenom: "APOLLO",
          coinMinimalDenom:
            "factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/apollo.svg",
          base: "ibc/73BB20AF857D1FE6E061D01CA13870872AD0C979497CAF71BEA25B1CBF6879F1",
        },
        {
          coinDenom: "ATOM1KLFG",
          coinMinimalDenom:
            "factory/neutron13lkh47msw28yynspc5rnmty3yktk43wc3dsv0l/ATOM1KLFG",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/atom1klfg.png",
          base: "ibc/0E77E090EC04C476DE2BC0A7056580AC47660DAEB7B0D4701C085E3A046AC7B7",
        },
        {
          coinDenom: "ASTRO",
          coinMinimalDenom:
            "factory/neutron1ffus553eet978k024lmssw0czsxwr97mggyv85lpcsdkft8v9ufsz3sa07/astro",
          coinDecimals: 6,
          coinGeckoId: "astroport-fi",
          coinImageUrl: "/tokens/generated/astro.svg",
          base: "ibc/B8C608CEE08C4F30A15A7955306F2EDAF4A02BB191CABC4185C1A57FD978DA1B",
        },
        {
          coinDenom: "xASTRO",
          coinMinimalDenom:
            "factory/neutron1zlf3hutsa4qnmue53lz2tfxrutp8y2e3rj4nkghg3rupgl4mqy8s5jgxsn/xASTRO",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/xastro.svg",
          base: "ibc/2ED09B03AA396BC2F35B741F4CA4A82D33A24A1007BFC1973299842DD626F564",
        },
        {
          coinDenom: "WEIRD",
          coinMinimalDenom:
            "factory/neutron133xakkrfksq39wxy575unve2nyehg5npx75nph/WEIRD",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/weird.png",
          base: "ibc/38ADC6FFDDDB7D70B72AD0322CEA8844CB18FAA0A23400DBA8A99D43E18B3748",
        },
        {
          coinDenom: "MARS",
          coinMinimalDenom:
            "factory/neutron1ndu2wvkrxtane8se2tr48gv7nsm46y5gcqjhux/MARS",
          coinDecimals: 6,
          coinGeckoId: "mars-protocol-a7fcbcfb-fd61-4017-92f0-7ee9f9cc6da3",
          coinImageUrl: "/tokens/generated/mars.svg",
          base: "ibc/B67DF59507B3755EEDE0866C449445BD54B4DA82CCEBA89D775E53DC35664255",
        },
        {
          coinDenom: "SIN",
          coinMinimalDenom:
            "factory/neutron133xakkrfksq39wxy575unve2nyehg5npx75nph/sin",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sin.png",
          base: "ibc/2BF7FB3908B469FA9672767DC74AF8A18E2F47F8B623B0685DE290B828FCBD23",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "NTRN",
        coinMinimalDenom: "untrn",
        coinGeckoId: "neutron-3",
        coinImageUrl: "/tokens/generated/ntrn.svg",
        base: "ibc/126DA09104B71B164883842B769C0E9EC1486C0887D27A9999E395C2C8FB5682",
      },
      feeCurrencies: [
        {
          coinDenom: "NTRN",
          coinMinimalDenom: "untrn",
          coinDecimals: 6,
          coinGeckoId: "neutron-3",
          coinImageUrl: "/tokens/generated/ntrn.svg",
          base: "ibc/126DA09104B71B164883842B769C0E9EC1486C0887D27A9999E395C2C8FB5682",
          gasPriceStep: {
            low: 0.0053,
            average: 0.0053,
            high: 0.0053,
          },
        },
        {
          coinDenom: "wstETH",
          coinMinimalDenom:
            "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
          coinDecimals: 18,
          coinGeckoId: "wrapped-steth",
          coinImageUrl: "/tokens/generated/wsteth.svg",
          base: "ibc/2F21E6D4271DE3F561F20A02CD541DAF7405B1E9CB3B9B07E3C2AC7D8A4338A5",
          gasPriceStep: {
            low: 2903231.6597,
            average: 2903231.6597,
            high: 2903231.6597,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "neutron",
        bech32PrefixAccPub: "neutronpub",
        bech32PrefixValAddr: "neutronvaloper",
        bech32PrefixValPub: "neutronvaloperpub",
        bech32PrefixConsAddr: "neutronvalcons",
        bech32PrefixConsPub: "neutronvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/neutron/txs/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "composable",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Picasso",
    chain_id: "centauri-1",
    bech32_prefix: "pica",
    bech32_config: {
      bech32PrefixAccAddr: "pica",
      bech32PrefixAccPub: "picapub",
      bech32PrefixValAddr: "picavaloper",
      bech32PrefixValPub: "picavaloperpub",
      bech32PrefixConsAddr: "picavalcons",
      bech32PrefixConsPub: "picavalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ppica",
          fixed_min_gas_price: 0,
          low_gas_price: 0,
          average_gas_price: 0,
          high_gas_price: 0,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ppica",
        },
      ],
    },
    description:
      "Picasso is a DeFi infrastructure-focused Layer 1 protocol that leads the industry in building the trust-minimized interoperability solution -Cross-Ecosystem IBC. Complementary to the interoperability work, Picasso is building the first Generalized Restaking Layer starting with deployment on Solana, and expand support for all IBC connected ecosystems.",
    apis: {
      rpc: [
        {
          address: "https://rpc.composable-cosmos.composablenodes.tech",
        },
      ],
      rest: [
        {
          address: "https://api.composable-cosmos.composablenodes.tech",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/Composable/tx/{txHash}",
      },
    ],
    logoURIs: {
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg",
      theme: {
        primary_color_hex: "#ff8500",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.composable-cosmos.composablenodes.tech",
      rest: "https://api.composable-cosmos.composablenodes.tech",
      chainId: "centauri-1",
      chainName: "composable",
      prettyChainName: "Picasso",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "PICA",
          coinMinimalDenom: "ppica",
          coinDecimals: 12,
          coinGeckoId: "picasso",
          coinImageUrl: "/tokens/generated/pica.svg",
          base: "ibc/56D7C03B8F6A07AD322EEE1BEF3AE996E09D1C1E34C27CF37E0D4A0AC5972516",
        },
        {
          coinDenom: "KSM",
          coinMinimalDenom:
            "ibc/EE9046745AEC0E8302CB7ED9D5AD67F528FB3B7AE044B247FB0FB293DBDA35E9",
          coinDecimals: 12,
          coinGeckoId: "kusama",
          coinImageUrl: "/tokens/generated/ksm.svg",
          base: "ibc/6727B2F071643B3841BD535ECDD4ED9CAE52ABDD0DCD07C3630811A7A37B215C",
        },
        {
          coinDenom: "DOT.pica",
          coinMinimalDenom:
            "ibc/3CC19CEC7E5A3E90E78A5A9ECC5A0E2F8F826A375CF1E096F4515CF09DA3E366",
          coinDecimals: 10,
          coinImageUrl: "/tokens/generated/dot.pica.svg",
          base: "ibc/6B2B19D874851F631FF0AF82C38A20D4B82F438C7A22F41EDA33568345397244",
        },
        {
          coinDenom: "TNKR",
          coinMinimalDenom:
            "ibc/C58E5D2571042137CB68B1B9851C4E7211C05F7C2C79E21E0966AF0F063961F8",
          coinDecimals: 12,
          coinGeckoId: "tinkernet",
          coinImageUrl: "/tokens/generated/tnkr.svg",
          base: "ibc/3A0A392E610A8D477851ABFEA74F3D828F36C015AB8E93B0FBB7566A6D13C4D6",
        },
        {
          coinDenom: "ETH.pica",
          coinMinimalDenom:
            "ibc/F9D075D4079FC56A9C49B601E54A45292C319D8B0E8CC0F8439041130AA7166C",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/eth.pica.svg",
          base: "ibc/A23E590BA7E0D808706FB5085A449B3B9D6864AE4DDE7DAF936243CEBB2A3D43",
        },
        {
          coinDenom: "DAI.pica",
          coinMinimalDenom:
            "ibc/A342F6F8D1CDE1D934C50E8EAFF91E813D971E1BFEED7E557F1674E01004A533",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/dai.pica.svg",
          base: "ibc/37DFAFDA529FF7D513B0DB23E9728DF9BF73122D38D46824C78BB7F91E6A736B",
        },
        {
          coinDenom: "FXS.pica",
          coinMinimalDenom:
            "ibc/5F9BE030FC355733EC79307409FA98398BBFC747C9430B326C144A74F6808B29",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/fxs.pica.svg",
          base: "ibc/5435437A8C9416B650DDA49C338B63CCFC6465123B715F6BAA9B1B2071E27913",
        },
        {
          coinDenom: "FRAX.pica",
          coinMinimalDenom:
            "ibc/4F20D68B51ED559F99C3CD658383E91F45486D884BF546E7B25337A058562CDB",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/frax.pica.svg",
          base: "ibc/9A8CBC029002DC5170E715F93FBF35011FFC9796371F59B1F3C3094AE1B453A9",
        },
        {
          coinDenom: "USDT.eth.pica",
          coinMinimalDenom:
            "ibc/37CC704EA53E96AB09A9C31D79142DE7DB252420F3AB18015F9870AE219947BD",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdt.eth.pica.svg",
          base: "ibc/078AD6F581E8115CDFBD8FFA29D8C71AFE250CE952AFF80040CBC64868D44AD3",
        },
        {
          coinDenom: "sFRAX.pica",
          coinMinimalDenom:
            "ibc/5BD7F23FE150D9CF3BCC944DB829380BCC51A4022A131151C4D13B3AFAC2D1D9",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/sfrax.pica.svg",
          base: "ibc/0EFA07F312E05258A56AE1DD600E39B9151CF7A91C8A94EEBCF4F03ECFE5DD98",
        },
        {
          coinDenom: "frxETH.pica",
          coinMinimalDenom:
            "ibc/458032E654E41DB91EF98F13E2CE4F9E0FE86BA3E0CDBEC074A854E9F5229A90",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/frxeth.pica.svg",
          base: "ibc/688E70EF567E5D4BA1CF4C54BAD758C288BC1A6C8B0B12979F911A2AE95E27EC",
        },
        {
          coinDenom: "sfrxETH.pica",
          coinMinimalDenom:
            "ibc/4E0ECE7819D77B0F2B49F5C34B5E594A02D2BA8B1B0F103208F847B53EBFB69A",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/sfrxeth.pica.svg",
          base: "ibc/F17CCB4F07948CC2D8B72952C2D0A84F2B763962F698774BB121B872AE4611B5",
        },
        {
          coinDenom: "PEPE.pica",
          coinMinimalDenom:
            "ibc/6367C5AF2E2477FB13DD0C8CB0027FEDDF5AE947EE84C69FB75003E604E29D05",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/pepe.pica.png",
          base: "ibc/5B5BFCC8A9F0D554A4245117F7798E85BE25B6C73DBFA2D6F369BD9DD6CACC6D",
        },
        {
          coinDenom: "CRV.pica",
          coinMinimalDenom:
            "ibc/52C8C6197989684F891076F228F20CD1659AB6E1776E3B85E65CBBEC67DA5DED",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/crv.pica.png",
          base: "ibc/080CE38C1E49595F2199E88BE7281F93FAEEF3FE354EECED0640625E8311C9CF",
        },
        {
          coinDenom: "ezETH.pica",
          coinMinimalDenom:
            "ibc/E317539F148285AAC77E7614101CBE94E20EDF169B233A5E0C867112972F9041",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/ezeth.pica.png",
          base: "ibc/39AAE0F5F918B731BEF1E02E9BAED33C242805F668B0A941AC509FB569FE51CB",
        },
        {
          coinDenom: "USDe.pica",
          coinMinimalDenom:
            "ibc/FFD9EB71B4480ED4D73F7370A2AEBDB48447A0AAE27265F8060A957F0FF71983",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/usde.pica.png",
          base: "ibc/BFFE212A23384C4EB055CF6F95A1F5EC1BE0F9BD286FAA66C3748F0444E67D63",
        },
        {
          coinDenom: "ENA.pica",
          coinMinimalDenom:
            "ibc/B089810D5A6316AD5E9C7808733DC4AB11C7BA3033221D28711FC7206BACB929",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/ena.pica.png",
          base: "ibc/257FF64F160106F6EE43CEE7C761DA64C1346221895373CC810FFA1BFAC5A7CD",
        },
        {
          coinDenom: "eETH.pica",
          coinMinimalDenom:
            "ibc/34C23BA6BAA2EAE0199D85AD1E2E214F76B0BFAD42BF75542D15F71264EEB05B",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/eeth.pica.png",
          base: "ibc/8D0FFEA4EDB04E3C1738C9599B66AE49683E0540FC4C1214AC84534C200D818B",
        },
        {
          coinDenom: "pxETH.pica",
          coinMinimalDenom:
            "ibc/36EF1EA47A09689C81D848B08E5240FA9FF13B17DB7DCF48B77D4D0D9B152821",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/pxeth.pica.png",
          base: "ibc/D09BB89B2187EF13EF006B44510749B0F02FD0B34F8BB55C70D812A1FF6148C7",
        },
        {
          coinDenom: "crvUSD.pica",
          coinMinimalDenom:
            "ibc/C9D79BE8E3E75CA2DFDC722C77D7B179C39A4802D59019C790A825FDE34B724A",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/crvusd.pica.png",
          base: "ibc/63551E7BB24008F0AFC1CB051A423A5104F781F035F8B1A191264B7086A0A0F6",
        },
        {
          coinDenom: "USDT.sol.pica",
          coinMinimalDenom:
            "ibc/D105950618E47CA2AEC314282BC401625025F80A4F812808DEEBB1941C685575",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdt.sol.pica.svg",
          base: "ibc/0233A3F2541FD43DBCA569B27AF886E97F5C03FC0305E4A8A3FAC6AC26249C7A",
        },
        {
          coinDenom: "edgeSOL.pica",
          coinMinimalDenom:
            "ibc/BADB5950C4A81AC201696EBCB33CD295137FA86F0AA620CDDE946D3700E0208C",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/edgesol.pica.png",
          base: "ibc/B83F9E20B4A07FA8846880000BD9D8985D89567A090F5E9390C64E81C39B4607",
        },
        {
          coinDenom: "LST.pica",
          coinMinimalDenom:
            "ibc/55F5B582483FEFA5422794292B079B4D49A5BAB9881E7C801F9F271F1D234F1D",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/lst.pica.png",
          base: "ibc/F618D130A2B8203D169811658BD0361F18DC2453085965FA0E5AEB8018DD54EE",
        },
        {
          coinDenom: "jitoSOL.pica",
          coinMinimalDenom:
            "ibc/91A2FE07F8BDFC0552B1C9972FCCBF2CFD067DDE5F496D81E5132CE57762B0F2",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/jitosol.pica.png",
          base: "ibc/9A83BDF4C8C5FFDDE735533BC8CD4363714A6474AED1C2C492FB003BB77C7982",
        },
        {
          coinDenom: "SOL.pica",
          coinMinimalDenom:
            "ibc/2CC39C8141F257EBBA250F65B9D0F31DC8D153C225E51EC192DE6E3F65D43F0C",
          coinDecimals: 9,
          coinImageUrl: "/tokens/generated/sol.pica.png",
          base: "ibc/0F9E9277B61A78CB31014D541ACA5BF6AB06DFC4524C4C836490B131DAAECD78",
        },
        {
          coinDenom: "WHINE",
          coinMinimalDenom:
            "ibc/9D5DA3720001F91DD76B8F609A93F96688EC8185B54BF9A1A1450EB34FF2D912",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/whine.png",
          base: "ibc/A8C568580D613F16F7E9075EA9FAD69FEBE0CC1F4AF46C60255FEC4459C166F1",
        },
        {
          coinDenom: "UWU.pica",
          coinMinimalDenom:
            "ibc/586C150919550F6106711C7557DAAAEAB765DDF05648BAC0D96487AE90394BA1",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/uwu.pica.png",
          base: "ibc/C91210281CEB708DC6E41A47FC9EC298F45712273DD58C682BEBAD00DCB59DC2",
        },
      ],
      stakeCurrency: {
        coinDecimals: 12,
        coinDenom: "PICA",
        coinMinimalDenom: "ppica",
        coinGeckoId: "picasso",
        coinImageUrl: "/tokens/generated/pica.svg",
        base: "ibc/56D7C03B8F6A07AD322EEE1BEF3AE996E09D1C1E34C27CF37E0D4A0AC5972516",
      },
      feeCurrencies: [
        {
          coinDenom: "PICA",
          coinMinimalDenom: "ppica",
          coinDecimals: 12,
          coinGeckoId: "picasso",
          coinImageUrl: "/tokens/generated/pica.svg",
          base: "ibc/56D7C03B8F6A07AD322EEE1BEF3AE996E09D1C1E34C27CF37E0D4A0AC5972516",
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "pica",
        bech32PrefixAccPub: "picapub",
        bech32PrefixValAddr: "picavaloper",
        bech32PrefixValPub: "picavaloperpub",
        bech32PrefixConsAddr: "picavalcons",
        bech32PrefixConsPub: "picavalconspub",
      },
      explorerUrlToTx: "https://ping.pub/Composable/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "realio",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Realio Network",
    chain_id: "realionetwork_3301-1",
    bech32_prefix: "realio",
    bech32_config: {
      bech32PrefixAccAddr: "realio",
      bech32PrefixAccPub: "realiopub",
      bech32PrefixValAddr: "realiovaloper",
      bech32PrefixValPub: "realiovaloperpub",
      bech32PrefixConsAddr: "realiovalcons",
      bech32PrefixConsPub: "realiovalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "ario",
          fixed_min_gas_price: 1000000000,
          low_gas_price: 4000000000,
          average_gas_price: 5000000000,
          high_gas_price: 8000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ario",
        },
        {
          denom: "arst",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://realio-rpc.genznodes.dev",
        },
      ],
      rest: [
        {
          address: "https://realio-api.genznodes.dev",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.genznodes.dev/realio/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/realio/images/rio.png",
      theme: {
        primary_color_hex: "#181818",
      },
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://realio-rpc.genznodes.dev",
      rest: "https://realio-api.genznodes.dev",
      chainId: "realionetwork_3301-1",
      chainName: "realio",
      prettyChainName: "Realio Network",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "RIO",
          coinMinimalDenom: "ario",
          coinDecimals: 18,
          coinGeckoId: "realio-network",
          coinImageUrl: "/tokens/generated/rio.svg",
          base: "ibc/1CDF9C7D073DD59ED06F15DB08CC0901F2A24759BE70463570E8896F9A444ADF",
          gasPriceStep: {
            low: 4000000000,
            average: 5000000000,
            high: 8000000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "RIO",
        coinMinimalDenom: "ario",
        coinGeckoId: "realio-network",
        coinImageUrl: "/tokens/generated/rio.svg",
        base: "ibc/1CDF9C7D073DD59ED06F15DB08CC0901F2A24759BE70463570E8896F9A444ADF",
      },
      feeCurrencies: [
        {
          coinDenom: "RIO",
          coinMinimalDenom: "ario",
          coinDecimals: 18,
          coinGeckoId: "realio-network",
          coinImageUrl: "/tokens/generated/rio.svg",
          base: "ibc/1CDF9C7D073DD59ED06F15DB08CC0901F2A24759BE70463570E8896F9A444ADF",
          gasPriceStep: {
            low: 4000000000,
            average: 5000000000,
            high: 8000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "realio",
        bech32PrefixAccPub: "realiopub",
        bech32PrefixValAddr: "realiovaloper",
        bech32PrefixValPub: "realiovaloperpub",
        bech32PrefixConsAddr: "realiovalcons",
        bech32PrefixConsPub: "realiovalconspub",
      },
      explorerUrlToTx: "https://explorer.genznodes.dev/realio/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "quasar",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Quasar",
    chain_id: "quasar-1",
    bech32_prefix: "quasar",
    bech32_config: {
      bech32PrefixAccAddr: "quasar",
      bech32PrefixAccPub: "quasarpub",
      bech32PrefixValAddr: "quasarvaloper",
      bech32PrefixValPub: "quasarvaloperpub",
      bech32PrefixConsAddr: "quasarvalcons",
      bech32PrefixConsPub: "quasarvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uqsr",
          fixed_min_gas_price: 0.1,
          low_gas_price: 0.1,
          average_gas_price: 0.25,
          high_gas_price: 0.3,
        },
        {
          denom:
            "ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B",
          fixed_min_gas_price: 0.01,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.03,
        },
        {
          denom:
            "ibc/FA0006F056DB6719B8C16C551FC392B62F5729978FC0B125AC9A432DBB2AA1A5",
          fixed_min_gas_price: 0.01,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.03,
        },
        {
          denom:
            "ibc/FA7775734CC73176B7425910DE001A1D2AD9B6D9E93129A5D0750EAD13E4E63A",
          fixed_min_gas_price: 0.01,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.03,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uqsr",
        },
      ],
    },
    description:
      "Quasar is the first decentralized asset management (D.A.M.) platform enabled by IBC. A secure, permissionless, composable, and diversified interchain DeFi experience is finally here.",
    apis: {
      rpc: [
        {
          address: "https://quasar-rpc.polkachu.com/",
        },
      ],
      rest: [
        {
          address: "https://quasar-api.polkachu.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/quasar/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quasar/images/quasar.png",
      theme: {
        primary_color_hex: "#a493e4",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://quasar-rpc.polkachu.com/",
      rest: "https://quasar-api.polkachu.com",
      chainId: "quasar-1",
      chainName: "quasar",
      prettyChainName: "Quasar",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "QSR.legacy",
          coinMinimalDenom: "uqsr",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/qsr.legacy.png",
          base: "ibc/1B708808D372E959CD4839C594960309283424C775F4A038AAEBE7F83A988477",
          gasPriceStep: {
            low: 0.1,
            average: 0.25,
            high: 0.3,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "QSR.legacy",
        coinMinimalDenom: "uqsr",
        coinImageUrl: "/tokens/generated/qsr.legacy.png",
        base: "ibc/1B708808D372E959CD4839C594960309283424C775F4A038AAEBE7F83A988477",
      },
      feeCurrencies: [
        {
          coinDenom: "QSR.legacy",
          coinMinimalDenom: "uqsr",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/qsr.legacy.png",
          base: "ibc/1B708808D372E959CD4839C594960309283424C775F4A038AAEBE7F83A988477",
          gasPriceStep: {
            low: 0.1,
            average: 0.25,
            high: 0.3,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "quasar",
        bech32PrefixAccPub: "quasarpub",
        bech32PrefixValAddr: "quasarvaloper",
        bech32PrefixValPub: "quasarvaloperpub",
        bech32PrefixConsAddr: "quasarvalcons",
        bech32PrefixConsPub: "quasarvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/quasar/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "archway",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Archway",
    chain_id: "archway-1",
    bech32_prefix: "archway",
    bech32_config: {
      bech32PrefixAccAddr: "archway",
      bech32PrefixAccPub: "archwaypub",
      bech32PrefixValAddr: "archwayvaloper",
      bech32PrefixValPub: "archwayvaloperpub",
      bech32PrefixConsAddr: "archwayvalcons",
      bech32PrefixConsPub: "archwayvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "aarch",
          fixed_min_gas_price: 140000000000,
          low_gas_price: 196000000000,
          average_gas_price: 225400000000,
          high_gas_price: 254800000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "aarch",
        },
      ],
      lock_duration: {
        time: "1209600s",
      },
    },
    description:
      "An incentivized L1 blockchain that allows developers to capture the value their dapps create, enabling sustainable economic models.",
    apis: {
      rpc: [
        {
          address: "https://rpc.mainnet.archway.io",
        },
      ],
      rest: [
        {
          address: "https://api.mainnet.archway.io",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/archway/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/archway/images/archway.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/archway/images/archway.svg",
      theme: {
        primary_color_hex: "#fc4c04",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.mainnet.archway.io",
      rest: "https://api.mainnet.archway.io",
      chainId: "archway-1",
      chainName: "archway",
      prettyChainName: "Archway",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "ARCH",
          coinMinimalDenom: "aarch",
          coinDecimals: 18,
          coinGeckoId: "archway",
          coinImageUrl: "/tokens/generated/arch.svg",
          base: "ibc/23AB778D694C1ECFC59B91D8C399C115CC53B0BD1C61020D8E19519F002BDD85",
          gasPriceStep: {
            low: 196000000000,
            average: 225400000000,
            high: 254800000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "ARCH",
        coinMinimalDenom: "aarch",
        coinGeckoId: "archway",
        coinImageUrl: "/tokens/generated/arch.svg",
        base: "ibc/23AB778D694C1ECFC59B91D8C399C115CC53B0BD1C61020D8E19519F002BDD85",
      },
      feeCurrencies: [
        {
          coinDenom: "ARCH",
          coinMinimalDenom: "aarch",
          coinDecimals: 18,
          coinGeckoId: "archway",
          coinImageUrl: "/tokens/generated/arch.svg",
          base: "ibc/23AB778D694C1ECFC59B91D8C399C115CC53B0BD1C61020D8E19519F002BDD85",
          gasPriceStep: {
            low: 196000000000,
            average: 225400000000,
            high: 254800000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "archway",
        bech32PrefixAccPub: "archwaypub",
        bech32PrefixValAddr: "archwayvaloper",
        bech32PrefixValPub: "archwayvaloperpub",
        bech32PrefixConsAddr: "archwayvalcons",
        bech32PrefixConsPub: "archwayvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/archway/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "empowerchain",
    status: "live",
    network_type: "mainnet",
    pretty_name: "EmpowerChain",
    chain_id: "empowerchain-1",
    bech32_prefix: "empower",
    bech32_config: {
      bech32PrefixAccAddr: "empower",
      bech32PrefixAccPub: "empowerpub",
      bech32PrefixValAddr: "empowervaloper",
      bech32PrefixValPub: "empowervaloperpub",
      bech32PrefixConsAddr: "empowervalcons",
      bech32PrefixConsPub: "empowervalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "umpwr",
          fixed_min_gas_price: 0,
          low_gas_price: 0.025,
          average_gas_price: 0.025,
          high_gas_price: 0.03,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "umpwr",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://empower-rpc.polkachu.com",
        },
      ],
      rest: [
        {
          address: "https://empower-api.polkachu.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/empower/tx/{txHash}",
      },
    ],
    logoURIs: {
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/empowerchain/images/mpwr.svg",
      theme: {
        primary_color_hex: "#00e33a",
        background_color_hex: "#00e33a",
        circle: true,
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://empower-rpc.polkachu.com",
      rest: "https://empower-api.polkachu.com",
      chainId: "empowerchain-1",
      chainName: "empowerchain",
      prettyChainName: "EmpowerChain",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "MPWR",
          coinMinimalDenom: "umpwr",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/mpwr.svg",
          base: "ibc/DD3938D8131F41994C1F01F4EB5233DEE9A0A5B787545B9A07A321925655BF38",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "MPWR",
        coinMinimalDenom: "umpwr",
        coinImageUrl: "/tokens/generated/mpwr.svg",
        base: "ibc/DD3938D8131F41994C1F01F4EB5233DEE9A0A5B787545B9A07A321925655BF38",
      },
      feeCurrencies: [
        {
          coinDenom: "MPWR",
          coinMinimalDenom: "umpwr",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/mpwr.svg",
          base: "ibc/DD3938D8131F41994C1F01F4EB5233DEE9A0A5B787545B9A07A321925655BF38",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "empower",
        bech32PrefixAccPub: "empowerpub",
        bech32PrefixValAddr: "empowervaloper",
        bech32PrefixValPub: "empowervaloperpub",
        bech32PrefixConsAddr: "empowervalcons",
        bech32PrefixConsPub: "empowervalconspub",
      },
      explorerUrlToTx: "https://ping.pub/empower/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "kyve",
    status: "live",
    network_type: "mainnet",
    pretty_name: "KYVE",
    chain_id: "kyve-1",
    bech32_prefix: "kyve",
    bech32_config: {
      bech32PrefixAccAddr: "kyve",
      bech32PrefixAccPub: "kyvepub",
      bech32PrefixValAddr: "kyvevaloper",
      bech32PrefixValPub: "kyvevaloperpub",
      bech32PrefixConsAddr: "kyvevalcons",
      bech32PrefixConsPub: "kyvevalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ukyve",
          fixed_min_gas_price: 0.02,
          low_gas_price: 0.02,
          average_gas_price: 0.03,
          high_gas_price: 0.06,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ukyve",
        },
      ],
    },
    description:
      "Revolutionizing data reliability in the Web3 space, KYVE Network provides fast and easy tooling for data validation, immutability, and retrieval, ensuring trustless data for seamless scalability and eliminating data risks and roadblocks.",
    apis: {
      rpc: [
        {
          address: "https://rpc-eu-1.kyve.network",
        },
      ],
      rest: [
        {
          address: "https://api-eu-1.kyve.network",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://mintscan.io/kyve/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kyve/images/kyve.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kyve/images/kyve.svg",
      theme: {
        primary_color_hex: "#325350",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-eu-1.kyve.network",
      rest: "https://api-eu-1.kyve.network",
      chainId: "kyve-1",
      chainName: "kyve",
      prettyChainName: "KYVE",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "KYVE",
          coinMinimalDenom: "ukyve",
          coinDecimals: 6,
          coinGeckoId: "kyve-network",
          coinImageUrl: "/tokens/generated/kyve.svg",
          base: "ibc/613BF0BF2F2146AE9941E923725745E931676B2C14E9768CD609FA0849B2AE13",
          gasPriceStep: {
            low: 0.02,
            average: 0.03,
            high: 0.06,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "KYVE",
        coinMinimalDenom: "ukyve",
        coinGeckoId: "kyve-network",
        coinImageUrl: "/tokens/generated/kyve.svg",
        base: "ibc/613BF0BF2F2146AE9941E923725745E931676B2C14E9768CD609FA0849B2AE13",
      },
      feeCurrencies: [
        {
          coinDenom: "KYVE",
          coinMinimalDenom: "ukyve",
          coinDecimals: 6,
          coinGeckoId: "kyve-network",
          coinImageUrl: "/tokens/generated/kyve.svg",
          base: "ibc/613BF0BF2F2146AE9941E923725745E931676B2C14E9768CD609FA0849B2AE13",
          gasPriceStep: {
            low: 0.02,
            average: 0.03,
            high: 0.06,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "kyve",
        bech32PrefixAccPub: "kyvepub",
        bech32PrefixValAddr: "kyvevaloper",
        bech32PrefixValPub: "kyvevaloperpub",
        bech32PrefixConsAddr: "kyvevalcons",
        bech32PrefixConsPub: "kyvevalconspub",
      },
      explorerUrlToTx: "https://mintscan.io/kyve/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "sei",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Sei",
    chain_id: "pacific-1",
    bech32_prefix: "sei",
    bech32_config: {
      bech32PrefixAccAddr: "sei",
      bech32PrefixAccPub: "seipub",
      bech32PrefixValAddr: "seivaloper",
      bech32PrefixValPub: "seivaloperpub",
      bech32PrefixConsAddr: "seivalcons",
      bech32PrefixConsPub: "seivalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "usei",
          fixed_min_gas_price: 0.02,
          low_gas_price: 0.02,
          average_gas_price: 0.02,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "usei",
        },
      ],
    },
    description:
      "Sei is the fastest Layer 1 blockchain, designed to scale with the industry.",
    apis: {
      rpc: [
        {
          address: "https://sei-rpc.polkachu.com",
        },
      ],
      rest: [
        {
          address: "https://sei-api.polkachu.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/sei/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.svg",
      theme: {
        primary_color_hex: "#9c1c1c",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://sei-rpc.polkachu.com",
      rest: "https://sei-api.polkachu.com",
      chainId: "pacific-1",
      chainName: "sei",
      prettyChainName: "Sei",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "SEI",
          coinMinimalDenom: "usei",
          coinDecimals: 6,
          coinGeckoId: "sei-network",
          coinImageUrl: "/tokens/generated/sei.svg",
          base: "ibc/71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D",
          gasPriceStep: {
            low: 0.02,
            average: 0.02,
            high: 0.04,
          },
        },
        {
          coinDenom: "OIN",
          coinMinimalDenom:
            "factory/sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w/OIN",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/oin.png",
          base: "ibc/98B3DBF1FA79C4C14CC5F08F62ACD5498560FCB515F677526FD200D54EA048B6",
        },
        {
          type: "cw20",
          coinDenom: "SEIYAN",
          coinMinimalDenom:
            "cw20:sei1hrndqntlvtmx2kepr0zsfgr7nzjptcc72cr4ppk4yav58vvy7v3s4er8ed:SEIYAN",
          contractAddress:
            "sei1hrndqntlvtmx2kepr0zsfgr7nzjptcc72cr4ppk4yav58vvy7v3s4er8ed",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/seiyan.png",
          base: "ibc/86074B8DF625A75C25D52FA6112E3FD5446BA41FE418880C168CA99D10E22F05",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "SEI",
        coinMinimalDenom: "usei",
        coinGeckoId: "sei-network",
        coinImageUrl: "/tokens/generated/sei.svg",
        base: "ibc/71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D",
      },
      feeCurrencies: [
        {
          coinDenom: "SEI",
          coinMinimalDenom: "usei",
          coinDecimals: 6,
          coinGeckoId: "sei-network",
          coinImageUrl: "/tokens/generated/sei.svg",
          base: "ibc/71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D",
          gasPriceStep: {
            low: 0.02,
            average: 0.02,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "sei",
        bech32PrefixAccPub: "seipub",
        bech32PrefixValAddr: "seivaloper",
        bech32PrefixValPub: "seivaloperpub",
        bech32PrefixConsAddr: "seivalcons",
        bech32PrefixConsPub: "seivalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/sei/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "passage",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Passage",
    chain_id: "passage-2",
    bech32_prefix: "pasg",
    bech32_config: {
      bech32PrefixAccAddr: "pasg",
      bech32PrefixAccPub: "pasgpub",
      bech32PrefixValAddr: "pasgvaloper",
      bech32PrefixValPub: "pasgvaloperpub",
      bech32PrefixConsAddr: "pasgvalcons",
      bech32PrefixConsPub: "pasgvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "upasg",
          fixed_min_gas_price: 0,
          low_gas_price: 0.001,
          average_gas_price: 0.0025,
          high_gas_price: 0.01,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "upasg",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.passage.vitwit.com",
        },
      ],
      rest: [
        {
          address: "https://api.passage.vitwit.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/passage/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/passage/images/pasg.png",
      theme: {
        primary_color_hex: "#05050c",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.passage.vitwit.com",
      rest: "https://api.passage.vitwit.com",
      chainId: "passage-2",
      chainName: "passage",
      prettyChainName: "Passage",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "PASG",
          coinMinimalDenom: "upasg",
          coinDecimals: 6,
          coinGeckoId: "passage",
          coinImageUrl: "/tokens/generated/pasg.png",
          base: "ibc/208B2F137CDE510B44C41947C045CFDC27F996A9D990EA64460BDD5B3DBEB2ED",
          gasPriceStep: {
            low: 0.001,
            average: 0.0025,
            high: 0.01,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "PASG",
        coinMinimalDenom: "upasg",
        coinGeckoId: "passage",
        coinImageUrl: "/tokens/generated/pasg.png",
        base: "ibc/208B2F137CDE510B44C41947C045CFDC27F996A9D990EA64460BDD5B3DBEB2ED",
      },
      feeCurrencies: [
        {
          coinDenom: "PASG",
          coinMinimalDenom: "upasg",
          coinDecimals: 6,
          coinGeckoId: "passage",
          coinImageUrl: "/tokens/generated/pasg.png",
          base: "ibc/208B2F137CDE510B44C41947C045CFDC27F996A9D990EA64460BDD5B3DBEB2ED",
          gasPriceStep: {
            low: 0.001,
            average: 0.0025,
            high: 0.01,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "pasg",
        bech32PrefixAccPub: "pasgpub",
        bech32PrefixValAddr: "pasgvaloper",
        bech32PrefixValPub: "pasgvaloperpub",
        bech32PrefixConsAddr: "pasgvalcons",
        bech32PrefixConsPub: "pasgvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/passage/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "gateway",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Wormhole Gateway",
    chain_id: "wormchain",
    bech32_prefix: "wormhole",
    bech32_config: {
      bech32PrefixAccAddr: "wormhole",
      bech32PrefixAccPub: "wormholepub",
      bech32PrefixValAddr: "wormholevaloper",
      bech32PrefixValPub: "wormholevaloperpub",
      bech32PrefixConsAddr: "wormholevalcons",
      bech32PrefixConsPub: "wormholevalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "utest",
          fixed_min_gas_price: 0,
          low_gas_price: 0,
          average_gas_price: 0,
          high_gas_price: 0,
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://tncnt-eu-wormchain-main-01.rpc.p2p.world/",
        },
      ],
      rest: [
        {
          address: "https://wormchain-lcd.quickapi.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://bigdipper.live/wormhole/transactions/{txHash}",
      },
    ],
    logoURIs: {
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gateway/images/wormhole_icon.svg",
      theme: {
        background_color_hex: "#231b3b",
        primary_color_hex: "#231b3b",
        circle: false,
      },
    },
    features: ["ibc-go", "ibc-transfer", "cosmwasm"],
    keplrChain: {
      rpc: "https://tncnt-eu-wormchain-main-01.rpc.p2p.world/",
      rest: "https://wormchain-lcd.quickapi.com",
      chainId: "wormchain",
      chainName: "gateway",
      prettyChainName: "Wormhole Gateway",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "SOL.wh",
          coinMinimalDenom:
            "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
          coinDecimals: 8,
          coinImageUrl: "/tokens/generated/sol.wh.svg",
          base: "ibc/1E43D59E565D41FB4E54CA639B838FFD5BCFC20003D330A56CB1396231AA1CBA",
        },
        {
          coinDenom: "BONK",
          coinMinimalDenom:
            "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
          coinDecimals: 5,
          coinGeckoId: "bonk",
          coinImageUrl: "/tokens/generated/bonk.png",
          base: "ibc/CA3733CB0071F480FAE8EF0D9C3D47A49C6589144620A642BBE0D59A293D110E",
        },
        {
          coinDenom: "USDT.eth.wh",
          coinMinimalDenom:
            "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdt.eth.wh.svg",
          base: "ibc/2108F2D81CBE328F371AD0CEF56691B18A86E08C3651504E42487D9EE92DDE9C",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "SUI",
          coinMinimalDenom:
            "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
          coinDecimals: 8,
          coinGeckoId: "sui",
          coinImageUrl: "/tokens/generated/sui.svg",
          base: "ibc/B1C287C2701774522570010EEBCD864BCB7AB714711B3AA218699FDD75E832F5",
        },
        {
          coinDenom: "APT",
          coinMinimalDenom:
            "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
          coinDecimals: 8,
          coinGeckoId: "aptos",
          coinImageUrl: "/tokens/generated/apt.svg",
          base: "ibc/A4D176906C1646949574B48C1928D475F2DF56DE0AC04E1C99B08F90BC21ABDE",
        },
        {
          coinDenom: "USDC.eth.wh",
          coinMinimalDenom:
            "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdc.eth.wh.svg",
          base: "ibc/6B99DB46AA9FF47162148C1726866919E44A6A5E0274B90912FD17E19A337695",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "ETH.wh",
          coinMinimalDenom:
            "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
          coinDecimals: 8,
          coinImageUrl: "/tokens/generated/eth.wh.svg",
          base: "ibc/62F82550D0B96522361C89B0DA1119DE262FBDFB25E5502BC5101B5C0D0DBAAC",
        },
        {
          coinDenom: "PYTH",
          coinMinimalDenom:
            "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/B8ohBnfisop27exk2gtNABJyYjLwQA7ogrp5uNzvZCoy",
          coinDecimals: 6,
          coinGeckoId: "pyth-network",
          coinImageUrl: "/tokens/generated/pyth.svg",
          base: "ibc/E42006ED917C769EDE1B474650EEA6BFE3F97958912B9206DD7010A28D01D9D5",
        },
        {
          coinDenom: "USDC.sol.wh",
          coinMinimalDenom:
            "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/usdc.sol.wh.svg",
          base: "ibc/F08DE332018E8070CC4C68FE06E04E254F527556A614F5F8F9A68AF38D367E45",
          pegMechanism: "collateralized",
        },
        {
          coinDenom: "BSKT",
          coinMinimalDenom:
            "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/bqqqpqsxzelp2hdfd4cgmxr6ekpatlj8yt2eghk52vst",
          coinDecimals: 5,
          coinGeckoId: "basket",
          coinImageUrl: "/tokens/generated/bskt.png",
          base: "ibc/CDD1E59BD5034C1B2597DD199782204EB397DB93200AA2E99C0AF3A66B2915FA",
        },
        {
          coinDenom: "W",
          coinMinimalDenom:
            "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/2Wb6ueMFc9WLc2eyYVha6qnwHKbwzUXdooXsg6XXVvos",
          coinDecimals: 6,
          coinGeckoId: "wormhole",
          coinImageUrl: "/tokens/generated/w.png",
          base: "ibc/AC6EE43E608B5A7EEE460C960480BC1C3708010E32B2071C429DA259836E10C3",
        },
        {
          coinDenom: "PBJ",
          coinMinimalDenom:
            "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/AbYYFgqSQEhe7NyXfo6w75GT7fCanVd9wNg4E9Df2puP",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/pbj.png",
          base: "ibc/E0D6A7FFAE26FA90C8F1AA3461A5A21E74DB154F183EAE56C96769F48F81FCA2",
        },
      ],
      stakeCurrency: {
        coinDecimals: 0,
        coinDenom: "STAKE",
        coinMinimalDenom: "tempStakePlaceholder",
      },
      feeCurrencies: [],
      bech32Config: {
        bech32PrefixAccAddr: "wormhole",
        bech32PrefixAccPub: "wormholepub",
        bech32PrefixValAddr: "wormholevaloper",
        bech32PrefixValPub: "wormholevaloperpub",
        bech32PrefixConsAddr: "wormholevalcons",
        bech32PrefixConsPub: "wormholevalconspub",
      },
      explorerUrlToTx: "https://bigdipper.live/wormhole/transactions/{txHash}",
      features: ["ibc-go", "ibc-transfer", "cosmwasm"],
    },
  },
  {
    chain_name: "xpla",
    status: "live",
    network_type: "mainnet",
    pretty_name: "XPLA",
    chain_id: "dimension_37-1",
    bech32_prefix: "xpla",
    bech32_config: {
      bech32PrefixAccAddr: "xpla",
      bech32PrefixAccPub: "xplapub",
      bech32PrefixValAddr: "xplavaloper",
      bech32PrefixValPub: "xplavaloperpub",
      bech32PrefixConsAddr: "xplavalcons",
      bech32PrefixConsPub: "xplavalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "axpla",
          fixed_min_gas_price: 850000000000,
          low_gas_price: 850000000000,
          average_gas_price: 1147500000000,
          high_gas_price: 1487500000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "axpla",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://dimension-rpc.xpla.dev",
        },
      ],
      rest: [
        {
          address: "https://dimension-lcd.xpla.dev",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.xpla.io/mainnet/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/xpla/images/xpla.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/xpla/images/xpla.svg",
      theme: {
        primary_color_hex: "#04b4fc",
      },
    },
    features: [
      "eth-address-gen",
      "eth-key-sign",
      "ibc-transfer",
      "ibc-go",
      "cosmwasm",
    ],
    keplrChain: {
      rpc: "https://dimension-rpc.xpla.dev",
      rest: "https://dimension-lcd.xpla.dev",
      chainId: "dimension_37-1",
      chainName: "xpla",
      prettyChainName: "XPLA",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "XPLA",
          coinMinimalDenom: "axpla",
          coinDecimals: 18,
          coinGeckoId: "xpla",
          coinImageUrl: "/tokens/generated/xpla.svg",
          base: "ibc/95C9B5870F95E21A242E6AF9ADCB1F212EE4A8855087226C36FBE43FC41A77B8",
          gasPriceStep: {
            low: 850000000000,
            average: 1147500000000,
            high: 1487500000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "XPLA",
        coinMinimalDenom: "axpla",
        coinGeckoId: "xpla",
        coinImageUrl: "/tokens/generated/xpla.svg",
        base: "ibc/95C9B5870F95E21A242E6AF9ADCB1F212EE4A8855087226C36FBE43FC41A77B8",
      },
      feeCurrencies: [
        {
          coinDenom: "XPLA",
          coinMinimalDenom: "axpla",
          coinDecimals: 18,
          coinGeckoId: "xpla",
          coinImageUrl: "/tokens/generated/xpla.svg",
          base: "ibc/95C9B5870F95E21A242E6AF9ADCB1F212EE4A8855087226C36FBE43FC41A77B8",
          gasPriceStep: {
            low: 850000000000,
            average: 1147500000000,
            high: 1487500000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "xpla",
        bech32PrefixAccPub: "xplapub",
        bech32PrefixValAddr: "xplavaloper",
        bech32PrefixValPub: "xplavaloperpub",
        bech32PrefixConsAddr: "xplavalcons",
        bech32PrefixConsPub: "xplavalconspub",
      },
      explorerUrlToTx: "https://explorer.xpla.io/mainnet/tx/{txHash}",
      features: [
        "eth-address-gen",
        "eth-key-sign",
        "ibc-transfer",
        "ibc-go",
        "cosmwasm",
      ],
    },
  },
  {
    chain_name: "sge",
    status: "live",
    network_type: "mainnet",
    pretty_name: "SGE",
    chain_id: "sgenet-1",
    bech32_prefix: "sge",
    bech32_config: {
      bech32PrefixAccAddr: "sge",
      bech32PrefixAccPub: "sgepub",
      bech32PrefixValAddr: "sgevaloper",
      bech32PrefixValPub: "sgevaloperpub",
      bech32PrefixConsAddr: "sgevalcons",
      bech32PrefixConsPub: "sgevalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "usge",
          fixed_min_gas_price: 0.001,
          low_gas_price: 0.1,
          average_gas_price: 0.25,
          high_gas_price: 0.5,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "usge",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://sge-priv-rpc.kingnodes.com",
        },
      ],
      rest: [
        {
          address: "https://sge-priv-rest.kingnodes.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://blockexplorer.sgenetwork.io/sge/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sge/images/sge.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sge/images/sge.svg",
      theme: {
        primary_color_hex: "#b99952",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://sge-priv-rpc.kingnodes.com",
      rest: "https://sge-priv-rest.kingnodes.com",
      chainId: "sgenet-1",
      chainName: "sge",
      prettyChainName: "SGE",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "SGE",
          coinMinimalDenom: "usge",
          coinDecimals: 6,
          coinGeckoId: "six-sigma",
          coinImageUrl: "/tokens/generated/sge.svg",
          base: "ibc/A1830DECC0B742F0B2044FF74BE727B5CF92C9A28A9235C3BACE4D24A23504FA",
          gasPriceStep: {
            low: 0.1,
            average: 0.25,
            high: 0.5,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "SGE",
        coinMinimalDenom: "usge",
        coinGeckoId: "six-sigma",
        coinImageUrl: "/tokens/generated/sge.svg",
        base: "ibc/A1830DECC0B742F0B2044FF74BE727B5CF92C9A28A9235C3BACE4D24A23504FA",
      },
      feeCurrencies: [
        {
          coinDenom: "SGE",
          coinMinimalDenom: "usge",
          coinDecimals: 6,
          coinGeckoId: "six-sigma",
          coinImageUrl: "/tokens/generated/sge.svg",
          base: "ibc/A1830DECC0B742F0B2044FF74BE727B5CF92C9A28A9235C3BACE4D24A23504FA",
          gasPriceStep: {
            low: 0.1,
            average: 0.25,
            high: 0.5,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "sge",
        bech32PrefixAccPub: "sgepub",
        bech32PrefixValAddr: "sgevaloper",
        bech32PrefixValPub: "sgevaloperpub",
        bech32PrefixConsAddr: "sgevalcons",
        bech32PrefixConsPub: "sgevalconspub",
      },
      explorerUrlToTx: "https://blockexplorer.sgenetwork.io/sge/tx/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "stafihub",
    status: "live",
    network_type: "mainnet",
    pretty_name: "StaFi Hub",
    chain_id: "stafihub-1",
    bech32_prefix: "stafi",
    bech32_config: {
      bech32PrefixAccAddr: "stafi",
      bech32PrefixAccPub: "stafipub",
      bech32PrefixValAddr: "stafivaloper",
      bech32PrefixValPub: "stafivaloperpub",
      bech32PrefixConsAddr: "stafivalcons",
      bech32PrefixConsPub: "stafivalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ufis",
          fixed_min_gas_price: 0,
          low_gas_price: 0,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ufis",
        },
      ],
      lock_duration: {
        time: "1209600s",
      },
    },
    apis: {
      rpc: [
        {
          address: "https://public-rpc1.stafihub.io",
        },
      ],
      rest: [
        {
          address: "https://public-rest-rpc1.stafihub.io",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/stafi/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stafihub/images/stafihub-chain-logo.png",
      theme: {
        primary_color_hex: "#100d10",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://public-rpc1.stafihub.io",
      rest: "https://public-rest-rpc1.stafihub.io",
      chainId: "stafihub-1",
      chainName: "stafihub",
      prettyChainName: "StaFi Hub",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "FIS",
          coinMinimalDenom: "ufis",
          coinDecimals: 6,
          coinGeckoId: "stafi",
          coinImageUrl: "/tokens/generated/fis.svg",
          base: "ibc/01D2F0C4739C871BFBEE7E786709E6904A55559DC1483DD92ED392EF12247862",
        },
        {
          coinDenom: "rATOM",
          coinMinimalDenom: "uratom",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/ratom.svg",
          base: "ibc/B66CE615C600ED0A8B5AF425ECFE0D57BE2377587F66C45934A76886F34DC9B7",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "FIS",
        coinMinimalDenom: "ufis",
        coinGeckoId: "stafi",
        coinImageUrl: "/tokens/generated/fis.svg",
        base: "ibc/01D2F0C4739C871BFBEE7E786709E6904A55559DC1483DD92ED392EF12247862",
      },
      feeCurrencies: [
        {
          coinDenom: "FIS",
          coinMinimalDenom: "ufis",
          coinDecimals: 6,
          coinGeckoId: "stafi",
          coinImageUrl: "/tokens/generated/fis.svg",
          base: "ibc/01D2F0C4739C871BFBEE7E786709E6904A55559DC1483DD92ED392EF12247862",
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "stafi",
        bech32PrefixAccPub: "stafipub",
        bech32PrefixValAddr: "stafivaloper",
        bech32PrefixValPub: "stafivaloperpub",
        bech32PrefixConsAddr: "stafivalcons",
        bech32PrefixConsPub: "stafivalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/stafi/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "doravota",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Dora Vota",
    chain_id: "vota-ash",
    bech32_prefix: "dora",
    bech32_config: {
      bech32PrefixAccAddr: "dora",
      bech32PrefixAccPub: "dorapub",
      bech32PrefixValAddr: "doravaloper",
      bech32PrefixValPub: "doravaloperpub",
      bech32PrefixConsAddr: "doravalcons",
      bech32PrefixConsPub: "doravalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "peaka",
          fixed_min_gas_price: 100000000000,
          low_gas_price: 100000000000,
          average_gas_price: 100000000000,
          high_gas_price: 100000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "peaka",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://vota-rpc.dorafactory.org",
        },
      ],
      rest: [
        {
          address: "https://vota-rest.dorafactory.org",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://vota-explorer.dorafactory.org/doravota/tx/{txHash}",
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://vota-rpc.dorafactory.org",
      rest: "https://vota-rest.dorafactory.org",
      chainId: "vota-ash",
      chainName: "doravota",
      prettyChainName: "Dora Vota",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "DORA",
          coinMinimalDenom: "peaka",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/dora.svg",
          base: "ibc/672406ADE4EDFD8C5EA7A0D0DD0C37E431DA7BD8393A15CD2CFDE3364917EB2A",
          gasPriceStep: {
            low: 100000000000,
            average: 100000000000,
            high: 100000000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "DORA",
        coinMinimalDenom: "peaka",
        coinImageUrl: "/tokens/generated/dora.svg",
        base: "ibc/672406ADE4EDFD8C5EA7A0D0DD0C37E431DA7BD8393A15CD2CFDE3364917EB2A",
      },
      feeCurrencies: [
        {
          coinDenom: "DORA",
          coinMinimalDenom: "peaka",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/dora.svg",
          base: "ibc/672406ADE4EDFD8C5EA7A0D0DD0C37E431DA7BD8393A15CD2CFDE3364917EB2A",
          gasPriceStep: {
            low: 100000000000,
            average: 100000000000,
            high: 100000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "dora",
        bech32PrefixAccPub: "dorapub",
        bech32PrefixValAddr: "doravaloper",
        bech32PrefixValPub: "doravaloperpub",
        bech32PrefixConsAddr: "doravalcons",
        bech32PrefixConsPub: "doravalconspub",
      },
      explorerUrlToTx:
        "https://vota-explorer.dorafactory.org/doravota/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "coreum",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Coreum",
    chain_id: "coreum-mainnet-1",
    bech32_prefix: "core",
    bech32_config: {
      bech32PrefixAccAddr: "core",
      bech32PrefixAccPub: "corepub",
      bech32PrefixValAddr: "corevaloper",
      bech32PrefixValPub: "corevaloperpub",
      bech32PrefixConsAddr: "corevalcons",
      bech32PrefixConsPub: "corevalconspub",
    },
    slip44: 990,
    fees: {
      fee_tokens: [
        {
          denom: "ucore",
          fixed_min_gas_price: 0.03125,
          low_gas_price: 0.0625,
          average_gas_price: 0.0625,
          high_gas_price: 62.5,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ucore",
        },
      ],
      lock_duration: {
        time: "168h",
      },
    },
    apis: {
      rpc: [
        {
          address: "https://full-node.mainnet-1.coreum.dev:26657",
        },
      ],
      rest: [
        {
          address: "https://full-node.mainnet-1.coreum.dev:1317",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/coreum/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/coreum/images/coreum.png",
      theme: {
        primary_color_hex: "#25d695",
      },
    },
    features: ["ibc-go", "ibc-transfer"],
    keplrChain: {
      rpc: "https://full-node.mainnet-1.coreum.dev:26657",
      rest: "https://full-node.mainnet-1.coreum.dev:1317",
      chainId: "coreum-mainnet-1",
      chainName: "coreum",
      prettyChainName: "Coreum",
      bip44: {
        coinType: 990,
      },
      currencies: [
        {
          coinDenom: "COREUM",
          coinMinimalDenom: "ucore",
          coinDecimals: 6,
          coinGeckoId: "coreum",
          coinImageUrl: "/tokens/generated/coreum.svg",
          base: "ibc/F3166F4D31D6BA1EC6C9F5536F5DDDD4CC93DBA430F7419E7CDC41C497944A65",
          gasPriceStep: {
            low: 0.0625,
            average: 0.0625,
            high: 62.5,
          },
        },
        {
          coinDenom: "XRP.core",
          coinMinimalDenom:
            "drop-core1zhs909jp9yktml6qqx9f0ptcq2xnhhj99cja03j3lfcsp2pgm86studdrz",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/xrp.core.png",
          base: "ibc/63A7CA0B6838AD8CAD6B5103998FF9B9B6A6F06FBB9638BFF51E63E0142339F3",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "COREUM",
        coinMinimalDenom: "ucore",
        coinGeckoId: "coreum",
        coinImageUrl: "/tokens/generated/coreum.svg",
        base: "ibc/F3166F4D31D6BA1EC6C9F5536F5DDDD4CC93DBA430F7419E7CDC41C497944A65",
      },
      feeCurrencies: [
        {
          coinDenom: "COREUM",
          coinMinimalDenom: "ucore",
          coinDecimals: 6,
          coinGeckoId: "coreum",
          coinImageUrl: "/tokens/generated/coreum.svg",
          base: "ibc/F3166F4D31D6BA1EC6C9F5536F5DDDD4CC93DBA430F7419E7CDC41C497944A65",
          gasPriceStep: {
            low: 0.0625,
            average: 0.0625,
            high: 62.5,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "core",
        bech32PrefixAccPub: "corepub",
        bech32PrefixValAddr: "corevaloper",
        bech32PrefixValPub: "corevaloperpub",
        bech32PrefixConsAddr: "corevalcons",
        bech32PrefixConsPub: "corevalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/coreum/tx/{txHash}",
      features: ["ibc-go", "ibc-transfer"],
    },
  },
  {
    chain_name: "celestia",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Celestia",
    chain_id: "celestia",
    bech32_prefix: "celestia",
    bech32_config: {
      bech32PrefixAccAddr: "celestia",
      bech32PrefixAccPub: "celestiapub",
      bech32PrefixValAddr: "celestiavaloper",
      bech32PrefixValPub: "celestiavaloperpub",
      bech32PrefixConsAddr: "celestiavalcons",
      bech32PrefixConsPub: "celestiavalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "utia",
          fixed_min_gas_price: 0.002,
          low_gas_price: 0.01,
          average_gas_price: 0.02,
          high_gas_price: 0.1,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "utia",
        },
      ],
    },
    description:
      "Celestia is a modular data availability network that securely scales with the number of users, making it easy for anyone to launch their own blockchain.",
    apis: {
      rpc: [
        {
          address: "https://rpc-celestia.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-celestia.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/celestia/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.svg",
      theme: {
        primary_color_hex: "#7c2cfb",
      },
    },
    features: ["ibc-go", "ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc-celestia.keplr.app",
      rest: "https://lcd-celestia.keplr.app",
      chainId: "celestia",
      chainName: "celestia",
      prettyChainName: "Celestia",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "TIA",
          coinMinimalDenom: "utia",
          coinDecimals: 6,
          coinGeckoId: "celestia",
          coinImageUrl: "/tokens/generated/tia.svg",
          base: "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
          gasPriceStep: {
            low: 0.01,
            average: 0.02,
            high: 0.1,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "TIA",
        coinMinimalDenom: "utia",
        coinGeckoId: "celestia",
        coinImageUrl: "/tokens/generated/tia.svg",
        base: "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
      },
      feeCurrencies: [
        {
          coinDenom: "TIA",
          coinMinimalDenom: "utia",
          coinDecimals: 6,
          coinGeckoId: "celestia",
          coinImageUrl: "/tokens/generated/tia.svg",
          base: "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
          gasPriceStep: {
            low: 0.01,
            average: 0.02,
            high: 0.1,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "celestia",
        bech32PrefixAccPub: "celestiapub",
        bech32PrefixValAddr: "celestiavaloper",
        bech32PrefixValPub: "celestiavaloperpub",
        bech32PrefixConsAddr: "celestiavalcons",
        bech32PrefixConsPub: "celestiavalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/celestia/tx/{txHash}",
      features: ["ibc-go", "ibc-transfer"],
    },
  },
  {
    chain_name: "dydx",
    status: "live",
    network_type: "mainnet",
    pretty_name: "dYdX Protocol",
    chain_id: "dydx-mainnet-1",
    bech32_prefix: "dydx",
    bech32_config: {
      bech32PrefixAccAddr: "dydx",
      bech32PrefixAccPub: "dydxpub",
      bech32PrefixValAddr: "dydxvaloper",
      bech32PrefixValPub: "dydxvaloperpub",
      bech32PrefixConsAddr: "dydxvalcons",
      bech32PrefixConsPub: "dydxvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "adydx",
          fixed_min_gas_price: 12500000000,
          low_gas_price: 12500000000,
          average_gas_price: 12500000000,
          high_gas_price: 20000000000,
        },
        {
          denom:
            "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5",
          fixed_min_gas_price: 0.025,
          low_gas_price: 0.025,
          average_gas_price: 0.025,
          high_gas_price: 0.03,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "adydx",
        },
      ],
    },
    description:
      "Our goal is to build open source code that can power a first class product and trading experience.",
    apis: {
      rpc: [
        {
          address: "https://dydx-rpc.polkachu.com/",
        },
      ],
      rest: [
        {
          address: "https://dydx-api.polkachu.com/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/dydx/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dydx/images/dydx.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dydx/images/dydx.svg",
      theme: {
        primary_color_hex: "#21212f",
      },
    },
    features: ["ibc-go", "ibc-transfer"],
    keplrChain: {
      rpc: "https://dydx-rpc.polkachu.com/",
      rest: "https://dydx-api.polkachu.com/",
      chainId: "dydx-mainnet-1",
      chainName: "dydx",
      prettyChainName: "dYdX Protocol",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "DYDX",
          coinMinimalDenom: "adydx",
          coinDecimals: 18,
          coinGeckoId: "dydx-chain",
          coinImageUrl: "/tokens/generated/dydx.svg",
          base: "ibc/831F0B1BBB1D08A2B75311892876D71565478C532967545476DF4C2D7492E48C",
          gasPriceStep: {
            low: 12500000000,
            average: 12500000000,
            high: 20000000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "DYDX",
        coinMinimalDenom: "adydx",
        coinGeckoId: "dydx-chain",
        coinImageUrl: "/tokens/generated/dydx.svg",
        base: "ibc/831F0B1BBB1D08A2B75311892876D71565478C532967545476DF4C2D7492E48C",
      },
      feeCurrencies: [
        {
          coinDenom: "DYDX",
          coinMinimalDenom: "adydx",
          coinDecimals: 18,
          coinGeckoId: "dydx-chain",
          coinImageUrl: "/tokens/generated/dydx.svg",
          base: "ibc/831F0B1BBB1D08A2B75311892876D71565478C532967545476DF4C2D7492E48C",
          gasPriceStep: {
            low: 12500000000,
            average: 12500000000,
            high: 20000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "dydx",
        bech32PrefixAccPub: "dydxpub",
        bech32PrefixValAddr: "dydxvaloper",
        bech32PrefixValPub: "dydxvaloperpub",
        bech32PrefixConsAddr: "dydxvalcons",
        bech32PrefixConsPub: "dydxvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/dydx/txs/{txHash}",
      features: ["ibc-go", "ibc-transfer"],
    },
  },
  {
    chain_name: "fxcore",
    status: "live",
    network_type: "mainnet",
    pretty_name: "f(x)Core",
    chain_id: "fxcore",
    bech32_prefix: "fx",
    bech32_config: {
      bech32PrefixAccAddr: "fx",
      bech32PrefixAccPub: "fxpub",
      bech32PrefixValAddr: "fxvaloper",
      bech32PrefixValPub: "fxvaloperpub",
      bech32PrefixConsAddr: "fxvalcons",
      bech32PrefixConsPub: "fxvalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "FX",
          fixed_min_gas_price: 4000000000000,
          low_gas_price: 4000000000000,
          average_gas_price: 4200000000000,
          high_gas_price: 5000000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "FX",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://fx-json.functionx.io",
        },
      ],
      rest: [
        {
          address: "https://fx-rest.functionx.io",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://starscan.io/fxcore/tx/{txHash}",
      },
    ],
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://fx-json.functionx.io",
      rest: "https://fx-rest.functionx.io",
      chainId: "fxcore",
      chainName: "fxcore",
      prettyChainName: "f(x)Core",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "FX",
          coinMinimalDenom: "FX",
          coinDecimals: 18,
          coinGeckoId: "fx-coin",
          coinImageUrl: "/tokens/generated/fx.svg",
          base: "ibc/2B30802A0B03F91E4E16D6175C9B70F2911377C1CAE9E50FF011C821465463F9",
          gasPriceStep: {
            low: 4000000000000,
            average: 4200000000000,
            high: 5000000000000,
          },
        },
        {
          coinDenom: "PUNDIX",
          coinMinimalDenom: "eth0x0FD10b9899882a6f2fcb5c371E17e70FdEe00C38",
          coinDecimals: 18,
          coinGeckoId: "pundi-x-2",
          coinImageUrl: "/tokens/generated/pundix.svg",
          base: "ibc/46D8D1A6E2A80ECCB7CA6663086A2E749C508B68DA56A077CD26E6F4F9691EEE",
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "FX",
        coinMinimalDenom: "FX",
        coinGeckoId: "fx-coin",
        coinImageUrl: "/tokens/generated/fx.svg",
        base: "ibc/2B30802A0B03F91E4E16D6175C9B70F2911377C1CAE9E50FF011C821465463F9",
      },
      feeCurrencies: [
        {
          coinDenom: "FX",
          coinMinimalDenom: "FX",
          coinDecimals: 18,
          coinGeckoId: "fx-coin",
          coinImageUrl: "/tokens/generated/fx.svg",
          base: "ibc/2B30802A0B03F91E4E16D6175C9B70F2911377C1CAE9E50FF011C821465463F9",
          gasPriceStep: {
            low: 4000000000000,
            average: 4200000000000,
            high: 5000000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "fx",
        bech32PrefixAccPub: "fxpub",
        bech32PrefixValAddr: "fxvaloper",
        bech32PrefixValPub: "fxvaloperpub",
        bech32PrefixConsAddr: "fxvalcons",
        bech32PrefixConsPub: "fxvalconspub",
      },
      explorerUrlToTx: "https://starscan.io/fxcore/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "nomic",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Nomic",
    chain_id: "nomic-stakenet-3",
    bech32_prefix: "nomic",
    bech32_config: {
      bech32PrefixAccAddr: "nomic",
      bech32PrefixAccPub: "nomic",
      bech32PrefixConsAddr: "nomic",
      bech32PrefixConsPub: "nomic",
      bech32PrefixValAddr: "nomic",
      bech32PrefixValPub: "nomic",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "unom",
          low_gas_price: 0,
          average_gas_price: 0,
          high_gas_price: 0,
        },
        {
          denom: "usat",
          low_gas_price: 0,
          average_gas_price: 0,
          high_gas_price: 0,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "unom",
        },
      ],
      lock_duration: {
        time: "1209600s",
      },
    },
    description:
      "The superior way to use Bitcoin in Cosmos DeFi. Use IBC to securely and efficiently bridge your BTC to Osmosis and more.",
    apis: {
      rpc: [
        {
          address: "https://stakenet-rpc.nomic.io:2096",
        },
      ],
      rest: [
        {
          address: "https://app.nomic.io:8443",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://bigdipper.live/nomic/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nom.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nom.svg",
      theme: {
        primary_color_hex: "#6404fc",
      },
    },
    features: ["ibc-go", "ibc-transfer"],
    keplrChain: {
      rpc: "https://stakenet-rpc.nomic.io:2096",
      rest: "https://app.nomic.io:8443",
      chainId: "nomic-stakenet-3",
      chainName: "nomic",
      prettyChainName: "Nomic",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "nBTC",
          coinMinimalDenom: "usat",
          coinDecimals: 14,
          coinImageUrl: "/tokens/generated/nbtc.svg",
          base: "ibc/75345531D87BD90BF108BE7240BD721CB2CB0A1F16D4EBA71B09EC3C43E15C8F",
        },
      ],
      stakeCurrency: {
        coinDecimals: 0,
        coinDenom: "STAKE",
        coinMinimalDenom: "tempStakePlaceholder",
      },
      feeCurrencies: [
        {
          coinDenom: "nBTC",
          coinMinimalDenom: "usat",
          coinDecimals: 14,
          coinImageUrl: "/tokens/generated/nbtc.svg",
          base: "ibc/75345531D87BD90BF108BE7240BD721CB2CB0A1F16D4EBA71B09EC3C43E15C8F",
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "nomic",
        bech32PrefixAccPub: "nomic",
        bech32PrefixConsAddr: "nomic",
        bech32PrefixConsPub: "nomic",
        bech32PrefixValAddr: "nomic",
        bech32PrefixValPub: "nomic",
      },
      explorerUrlToTx: "https://bigdipper.live/nomic/transactions/{txHash}",
      features: ["ibc-go", "ibc-transfer"],
    },
  },
  {
    chain_name: "nois",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Nois",
    chain_id: "nois-1",
    bech32_prefix: "nois",
    bech32_config: {
      bech32PrefixAccAddr: "nois",
      bech32PrefixAccPub: "noispub",
      bech32PrefixValAddr: "noisvaloper",
      bech32PrefixValPub: "noisvaloperpub",
      bech32PrefixConsAddr: "noisvalcons",
      bech32PrefixConsPub: "noisvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "unois",
          fixed_min_gas_price: 0.05,
          low_gas_price: 0.05,
          average_gas_price: 0.05,
          high_gas_price: 0.1,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "unois",
        },
      ],
      lock_duration: {
        time: "1814400s",
      },
    },
    apis: {
      rpc: [
        {
          address: "https://nois-rpc.lavenderfive.com:443",
        },
      ],
      rest: [
        {
          address: "https://nois-api.lavenderfive.com:443",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://app.ezstaking.io/nois/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nois/images/nois.png",
      theme: {
        primary_color_hex: "#0C0914",
      },
    },
    features: ["ibc-go", "ibc-transfer"],
    keplrChain: {
      rpc: "https://nois-rpc.lavenderfive.com:443",
      rest: "https://nois-api.lavenderfive.com:443",
      chainId: "nois-1",
      chainName: "nois",
      prettyChainName: "Nois",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "NOIS",
          coinMinimalDenom: "unois",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/nois.svg",
          base: "ibc/6928AFA9EA721938FED13B051F9DBF1272B16393D20C49EA5E4901BB76D94A90",
          gasPriceStep: {
            low: 0.05,
            average: 0.05,
            high: 0.1,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "NOIS",
        coinMinimalDenom: "unois",
        coinImageUrl: "/tokens/generated/nois.svg",
        base: "ibc/6928AFA9EA721938FED13B051F9DBF1272B16393D20C49EA5E4901BB76D94A90",
      },
      feeCurrencies: [
        {
          coinDenom: "NOIS",
          coinMinimalDenom: "unois",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/nois.svg",
          base: "ibc/6928AFA9EA721938FED13B051F9DBF1272B16393D20C49EA5E4901BB76D94A90",
          gasPriceStep: {
            low: 0.05,
            average: 0.05,
            high: 0.1,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "nois",
        bech32PrefixAccPub: "noispub",
        bech32PrefixValAddr: "noisvaloper",
        bech32PrefixValPub: "noisvaloperpub",
        bech32PrefixConsAddr: "noisvalcons",
        bech32PrefixConsPub: "noisvalconspub",
      },
      explorerUrlToTx: "https://app.ezstaking.io/nois/txs/{txHash}",
      features: ["ibc-go", "ibc-transfer"],
    },
  },
  {
    chain_name: "qwoyn",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Qwoyn",
    chain_id: "qwoyn-1",
    bech32_prefix: "qwoyn",
    bech32_config: {
      bech32PrefixAccAddr: "qwoyn",
      bech32PrefixAccPub: "qwoynpub",
      bech32PrefixValAddr: "qwoynvaloper",
      bech32PrefixValPub: "qwoynvaloperpub",
      bech32PrefixConsAddr: "qwoynvalcons",
      bech32PrefixConsPub: "qwoynvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uqwoyn",
          fixed_min_gas_price: 0.03,
          low_gas_price: 0.03,
          average_gas_price: 0.05,
          high_gas_price: 0.075,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uqwoyn",
        },
      ],
    },
    description:
      "The Qwoyn Network stands as a cutting-edge gaming hub that embeds Web3 technologies into the core of interactive entertainment. It revolutionizes the gaming industry by ensuring true ownership of in-game assets for players, facilitated through blockchain. This approach not only enhances gameplay but also fosters a unique ecosystem of interoperability and innovation. As a beacon in the gaming world, Qwoyn Network is dedicated to merging the excitement of traditional gaming with the transformative potential of Web3, creating a seamless and enriched gaming experience.",
    apis: {
      rpc: [
        {
          address: "https://rpc.qwoyn.studio:443",
        },
      ],
      rest: [
        {
          address: "https://api.qwoyn.studio:443",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.theamsolutions.info/qwoyn-main/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/qwoyn/images/qwoyn.png",
      theme: {
        primary_color_hex: "#04e4fc",
      },
    },
    features: ["ibc-go", "ibc-transfer", "cosmwasm"],
    keplrChain: {
      rpc: "https://rpc.qwoyn.studio:443",
      rest: "https://api.qwoyn.studio:443",
      chainId: "qwoyn-1",
      chainName: "qwoyn",
      prettyChainName: "Qwoyn",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "QWOYN",
          coinMinimalDenom: "uqwoyn",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/qwoyn.png",
          base: "ibc/09FAF1E04435E14C68DE7AB0D03C521C92975C792DB12B2EA390BAA2E06B3F3D",
          gasPriceStep: {
            low: 0.03,
            average: 0.05,
            high: 0.075,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "QWOYN",
        coinMinimalDenom: "uqwoyn",
        coinImageUrl: "/tokens/generated/qwoyn.png",
        base: "ibc/09FAF1E04435E14C68DE7AB0D03C521C92975C792DB12B2EA390BAA2E06B3F3D",
      },
      feeCurrencies: [
        {
          coinDenom: "QWOYN",
          coinMinimalDenom: "uqwoyn",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/qwoyn.png",
          base: "ibc/09FAF1E04435E14C68DE7AB0D03C521C92975C792DB12B2EA390BAA2E06B3F3D",
          gasPriceStep: {
            low: 0.03,
            average: 0.05,
            high: 0.075,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "qwoyn",
        bech32PrefixAccPub: "qwoynpub",
        bech32PrefixValAddr: "qwoynvaloper",
        bech32PrefixValPub: "qwoynvaloperpub",
        bech32PrefixConsAddr: "qwoynvalcons",
        bech32PrefixConsPub: "qwoynvalconspub",
      },
      explorerUrlToTx:
        "https://explorer.theamsolutions.info/qwoyn-main/tx/{txHash}",
      features: ["ibc-go", "ibc-transfer", "cosmwasm"],
    },
  },
  {
    chain_name: "source",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Source",
    chain_id: "source-1",
    bech32_prefix: "source",
    bech32_config: {
      bech32PrefixAccAddr: "source",
      bech32PrefixAccPub: "sourcepub",
      bech32PrefixValAddr: "sourcevaloper",
      bech32PrefixValPub: "sourcevaloperpub",
      bech32PrefixConsAddr: "sourcevalcons",
      bech32PrefixConsPub: "sourcevalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "usource",
          fixed_min_gas_price: 0.05,
          low_gas_price: 0.05,
          average_gas_price: 0.075,
          high_gas_price: 0.1,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "usource",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.source.tcnetwork.io/",
        },
      ],
      rest: [
        {
          address: "https://rest.source.tcnetwork.io/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.tcnetwork.io/source/transaction/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/source/images/source.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/source/images/source.svg",
      theme: {
        primary_color_hex: "#39a5fc",
      },
    },
    features: ["ibc-go", "ibc-transfer", "cosmwasm"],
    keplrChain: {
      rpc: "https://rpc.source.tcnetwork.io/",
      rest: "https://rest.source.tcnetwork.io/",
      chainId: "source-1",
      chainName: "source",
      prettyChainName: "Source",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "SOURCE",
          coinMinimalDenom: "usource",
          coinDecimals: 6,
          coinGeckoId: "source",
          coinImageUrl: "/tokens/generated/source.svg",
          base: "ibc/E7905742CE2EA4EA5D592527DC89220C59B617DE803939FE7293805A64B484D7",
          gasPriceStep: {
            low: 0.05,
            average: 0.075,
            high: 0.1,
          },
        },
        {
          coinDenom: "SRCX",
          coinMinimalDenom:
            "ibc/FC5A7360EEED0713AE3E83E9D55A69AF873056A172AC495890ACE4582FF9685A",
          coinDecimals: 9,
          coinGeckoId: "source-protocol",
          coinImageUrl: "/tokens/generated/srcx.png",
          base: "ibc/C97473CD237EBA2F94FDFA6ABA5EC0E22FA140655D73D2A2754F03A347BBA40B",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "SOURCE",
        coinMinimalDenom: "usource",
        coinGeckoId: "source",
        coinImageUrl: "/tokens/generated/source.svg",
        base: "ibc/E7905742CE2EA4EA5D592527DC89220C59B617DE803939FE7293805A64B484D7",
      },
      feeCurrencies: [
        {
          coinDenom: "SOURCE",
          coinMinimalDenom: "usource",
          coinDecimals: 6,
          coinGeckoId: "source",
          coinImageUrl: "/tokens/generated/source.svg",
          base: "ibc/E7905742CE2EA4EA5D592527DC89220C59B617DE803939FE7293805A64B484D7",
          gasPriceStep: {
            low: 0.05,
            average: 0.075,
            high: 0.1,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "source",
        bech32PrefixAccPub: "sourcepub",
        bech32PrefixValAddr: "sourcevaloper",
        bech32PrefixValPub: "sourcevaloperpub",
        bech32PrefixConsAddr: "sourcevalcons",
        bech32PrefixConsPub: "sourcevalconspub",
      },
      explorerUrlToTx:
        "https://explorer.tcnetwork.io/source/transaction/{txHash}",
      features: ["ibc-go", "ibc-transfer", "cosmwasm"],
    },
  },
  {
    chain_name: "haqq",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Haqq Network",
    chain_id: "haqq_11235-1",
    bech32_prefix: "haqq",
    bech32_config: {
      bech32PrefixAccAddr: "haqq",
      bech32PrefixAccPub: "haqqpub",
      bech32PrefixValAddr: "haqqvaloper",
      bech32PrefixValPub: "haqqvaloperpub",
      bech32PrefixConsAddr: "haqqvalcons",
      bech32PrefixConsPub: "haqqvalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "aISLM",
          fixed_min_gas_price: 250000000,
          low_gas_price: 20000000000,
          average_gas_price: 25000000000,
          high_gas_price: 40000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "aISLM",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.tm.haqq.network/",
        },
      ],
      rest: [
        {
          address: "https://rest.cosmos.haqq.network/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/haqq/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/haqq/images/haqq.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/haqq/images/haqq.svg",
      theme: {
        primary_color_hex: "#b9744f",
      },
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://rpc.tm.haqq.network/",
      rest: "https://rest.cosmos.haqq.network/",
      chainId: "haqq_11235-1",
      chainName: "haqq",
      prettyChainName: "Haqq Network",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "ISLM",
          coinMinimalDenom: "aISLM",
          coinDecimals: 18,
          coinGeckoId: "islamic-coin",
          coinImageUrl: "/tokens/generated/islm.svg",
          base: "ibc/69110FF673D70B39904FF056CFDFD58A90BEC3194303F45C32CB91B8B0A738EA",
          gasPriceStep: {
            low: 20000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
        {
          coinDenom: "DEEN",
          coinMinimalDenom: "erc20/0x4FEBDDe47Ab9a76200e57eFcC80b212a07b3e6cE",
          coinDecimals: 6,
          coinGeckoId: "deenar-gold",
          coinImageUrl: "/tokens/generated/deen.svg",
          base: "ibc/108604FDBE97DAEF128FD4ECFEB2A8AFC2D04A7162C97EAA2FD5BCB0869D0BBC",
          pegMechanism: "collateralized",
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "ISLM",
        coinMinimalDenom: "aISLM",
        coinGeckoId: "islamic-coin",
        coinImageUrl: "/tokens/generated/islm.svg",
        base: "ibc/69110FF673D70B39904FF056CFDFD58A90BEC3194303F45C32CB91B8B0A738EA",
      },
      feeCurrencies: [
        {
          coinDenom: "ISLM",
          coinMinimalDenom: "aISLM",
          coinDecimals: 18,
          coinGeckoId: "islamic-coin",
          coinImageUrl: "/tokens/generated/islm.svg",
          base: "ibc/69110FF673D70B39904FF056CFDFD58A90BEC3194303F45C32CB91B8B0A738EA",
          gasPriceStep: {
            low: 20000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "haqq",
        bech32PrefixAccPub: "haqqpub",
        bech32PrefixValAddr: "haqqvaloper",
        bech32PrefixValPub: "haqqvaloperpub",
        bech32PrefixConsAddr: "haqqvalcons",
        bech32PrefixConsPub: "haqqvalconspub",
      },
      explorerUrlToTx: "https://ping.pub/haqq/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "pundix",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Pundi X Chain",
    chain_id: "PUNDIX",
    bech32_prefix: "px",
    bech32_config: {
      bech32PrefixAccAddr: "px",
      bech32PrefixAccPub: "pxpub",
      bech32PrefixValAddr: "pxvaloper",
      bech32PrefixValPub: "pxvaloperpub",
      bech32PrefixConsAddr: "pxvalcons",
      bech32PrefixConsPub: "pxvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom:
            "ibc/55367B7B6572631B78A93C66EF9FDFCE87CDE372CC4ED7848DA78C1EB1DCDD78",
          fixed_min_gas_price: 2000000000000,
          low_gas_price: 2000000000000,
          average_gas_price: 2500000000000,
          high_gas_price: 3000000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom:
            "ibc/55367B7B6572631B78A93C66EF9FDFCE87CDE372CC4ED7848DA78C1EB1DCDD78",
        },
      ],
    },
    description:
      "Pundi X Chain is a dedicated payment-focused blockchain in the Function X network. It is specially designed to perform high throughput transactions with low latency and low transaction fees. In addition, it provides room for future compliance requirement upgrades, hardware (XPOS) integration, and Point-of-Sales compatibility, with tokenonomics that offer incentives to merchants and payment processors.",
    apis: {
      rpc: [
        {
          address: "https://px-json.pundix.com",
        },
      ],
      rest: [
        {
          address: "https://px-rest.pundix.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://starscan.io/pundix/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/pundi-x-chain-logo.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/pundi-x-chain-logo.svg",
      theme: {
        primary_color_hex: "#141414",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://px-json.pundix.com",
      rest: "https://px-rest.pundix.com",
      chainId: "PUNDIX",
      chainName: "pundix",
      prettyChainName: "Pundi X Chain",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "PURSE",
          coinMinimalDenom: "bsc0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C",
          coinDecimals: 18,
          coinGeckoId: "pundi-x-purse",
          coinImageUrl: "/tokens/generated/purse.svg",
          base: "ibc/6FD2938076A4C1BB3A324A676E76B0150A4443DAE0E002FB62AC0E6B604B1519",
        },
      ],
      stakeCurrency: {
        coinDecimals: 0,
        coinDenom: "STAKE",
        coinMinimalDenom: "tempStakePlaceholder",
      },
      feeCurrencies: [],
      bech32Config: {
        bech32PrefixAccAddr: "px",
        bech32PrefixAccPub: "pxpub",
        bech32PrefixValAddr: "pxvaloper",
        bech32PrefixValPub: "pxvaloperpub",
        bech32PrefixConsAddr: "pxvalcons",
        bech32PrefixConsPub: "pxvalconspub",
      },
      explorerUrlToTx: "https://starscan.io/pundix/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "nyx",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Nym",
    chain_id: "nyx",
    bech32_prefix: "n",
    bech32_config: {
      bech32PrefixAccAddr: "n",
      bech32PrefixAccPub: "npub",
      bech32PrefixValAddr: "nvaloper",
      bech32PrefixValPub: "nvaloperpub",
      bech32PrefixConsAddr: "nvalcons",
      bech32PrefixConsPub: "nvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "unym",
          fixed_min_gas_price: 0.025,
          low_gas_price: 0.025,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
        {
          denom: "unyx",
          fixed_min_gas_price: 0.025,
          low_gas_price: 0.025,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "unyx",
        },
      ],
      lock_duration: {
        time: "1814400s",
      },
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.nymtech.net",
        },
      ],
      rest: [
        {
          address: "https://api.nymtech.net",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/nyx/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nyx/images/nym_token_light.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nyx/images/nym_token_light.svg",
      theme: {
        dark_mode: false,
        circle: true,
        primary_color_hex: "#151525",
      },
    },
    features: ["ibc-transfer", "ibc-go", "cosmwasm"],
    keplrChain: {
      rpc: "https://rpc.nymtech.net",
      rest: "https://api.nymtech.net",
      chainId: "nyx",
      chainName: "nyx",
      prettyChainName: "Nym",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "NYX",
          coinMinimalDenom: "unyx",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/nyx.png",
          base: "ibc/1A611E8A3E4248106A1A5A80A64BFA812739435E8B9888EB3F652A21F029F317",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.04,
          },
        },
        {
          coinDenom: "NYM",
          coinMinimalDenom: "unym",
          coinDecimals: 6,
          coinGeckoId: "nym",
          coinImageUrl: "/tokens/generated/nym.svg",
          base: "ibc/37CB3078432510EE57B9AFA8DBE028B33AE3280A144826FEAC5F2334CF2C5539",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "NYX",
        coinMinimalDenom: "unyx",
        coinImageUrl: "/tokens/generated/nyx.png",
        base: "ibc/1A611E8A3E4248106A1A5A80A64BFA812739435E8B9888EB3F652A21F029F317",
      },
      feeCurrencies: [
        {
          coinDenom: "NYM",
          coinMinimalDenom: "unym",
          coinDecimals: 6,
          coinGeckoId: "nym",
          coinImageUrl: "/tokens/generated/nym.svg",
          base: "ibc/37CB3078432510EE57B9AFA8DBE028B33AE3280A144826FEAC5F2334CF2C5539",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.04,
          },
        },
        {
          coinDenom: "NYX",
          coinMinimalDenom: "unyx",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/nyx.png",
          base: "ibc/1A611E8A3E4248106A1A5A80A64BFA812739435E8B9888EB3F652A21F029F317",
          gasPriceStep: {
            low: 0.025,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "n",
        bech32PrefixAccPub: "npub",
        bech32PrefixValAddr: "nvaloper",
        bech32PrefixValPub: "nvaloperpub",
        bech32PrefixConsAddr: "nvalcons",
        bech32PrefixConsPub: "nvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/nyx/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go", "cosmwasm"],
    },
  },
  {
    chain_name: "dymension",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Dymension Hub",
    chain_id: "dymension_1100-1",
    bech32_prefix: "dym",
    bech32_config: {
      bech32PrefixAccAddr: "dym",
      bech32PrefixAccPub: "dympub",
      bech32PrefixValAddr: "dymvaloper",
      bech32PrefixValPub: "dymvaloperpub",
      bech32PrefixConsAddr: "dymvalcons",
      bech32PrefixConsPub: "dymvalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "adym",
          fixed_min_gas_price: 5000000000,
          low_gas_price: 5000000000,
          average_gas_price: 5000000000,
          high_gas_price: 20000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "adym",
        },
      ],
    },
    description:
      "Dymension is a network of easily deployable and lightning fast modular blockchains called RollApps.",
    apis: {
      rpc: [
        {
          address: "https://rpc.dymension.nodestake.org/",
        },
      ],
      rest: [
        {
          address: "https://api.dymension.nodestake.org",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://dym.fyi/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dymension/images/dymension-logo.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dymension/images/dymension-logo.svg",
      theme: {
        primary_color_hex: "#24201f",
      },
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://rpc.dymension.nodestake.org/",
      rest: "https://api.dymension.nodestake.org",
      chainId: "dymension_1100-1",
      chainName: "dymension",
      prettyChainName: "Dymension Hub",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "DYM",
          coinMinimalDenom: "adym",
          coinDecimals: 18,
          coinGeckoId: "dymension",
          coinImageUrl: "/tokens/generated/dym.svg",
          base: "ibc/9A76CDF0CBCEF37923F32518FA15E5DC92B9F56128292BC4D63C4AEA76CBB110",
          gasPriceStep: {
            low: 5000000000,
            average: 5000000000,
            high: 20000000000,
          },
        },
        {
          coinDenom: "NIM",
          coinMinimalDenom:
            "ibc/FB53D1684F155CBB86D9CE917807E42B59209EBE3AD3A92E15EF66586C073942",
          coinDecimals: 18,
          coinGeckoId: "nim-network",
          coinImageUrl: "/tokens/generated/nim.svg",
          base: "ibc/279D69A6EF8E37456C8D2DC7A7C1C50F7A566EC4758F6DE17472A9FDE36C4426",
        },
        {
          coinDenom: "MAND",
          coinMinimalDenom:
            "ibc/5A26C8DC8DA66F4DD94326E67F94510188F5F7AFE2DB3933A0C823670E56EABF",
          coinDecimals: 18,
          coinGeckoId: "mande-network",
          coinImageUrl: "/tokens/generated/mand.svg",
          base: "ibc/739D70CB432FE1C6D94AF306B68C14F4CFB0B9EDD1238D3A8718B1B0E84E8547",
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "DYM",
        coinMinimalDenom: "adym",
        coinGeckoId: "dymension",
        coinImageUrl: "/tokens/generated/dym.svg",
        base: "ibc/9A76CDF0CBCEF37923F32518FA15E5DC92B9F56128292BC4D63C4AEA76CBB110",
      },
      feeCurrencies: [
        {
          coinDenom: "DYM",
          coinMinimalDenom: "adym",
          coinDecimals: 18,
          coinGeckoId: "dymension",
          coinImageUrl: "/tokens/generated/dym.svg",
          base: "ibc/9A76CDF0CBCEF37923F32518FA15E5DC92B9F56128292BC4D63C4AEA76CBB110",
          gasPriceStep: {
            low: 5000000000,
            average: 5000000000,
            high: 20000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "dym",
        bech32PrefixAccPub: "dympub",
        bech32PrefixValAddr: "dymvaloper",
        bech32PrefixValPub: "dymvaloperpub",
        bech32PrefixConsAddr: "dymvalcons",
        bech32PrefixConsPub: "dymvalconspub",
      },
      explorerUrlToTx: "https://dym.fyi/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "humans",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Humans.ai",
    chain_id: "humans_1089-1",
    bech32_prefix: "human",
    bech32_config: {
      bech32PrefixAccAddr: "human",
      bech32PrefixAccPub: "humanpub",
      bech32PrefixValAddr: "humanvaloper",
      bech32PrefixValPub: "humanvaloperpub",
      bech32PrefixConsAddr: "humanvalcons",
      bech32PrefixConsPub: "humanvalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "aheart",
          fixed_min_gas_price: 250000000,
          low_gas_price: 80000000000,
          average_gas_price: 100000000000,
          high_gas_price: 160000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "aheart",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.humans.nodestake.top",
        },
      ],
      rest: [
        {
          address: "https://api.humans.nodestake.top",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/humans/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/humans/images/heart-dark-mode.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/humans/images/heart-dark-mode.svg",
      theme: {
        primary_color_hex: "#f3f3f3",
      },
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://rpc.humans.nodestake.top",
      rest: "https://api.humans.nodestake.top",
      chainId: "humans_1089-1",
      chainName: "humans",
      prettyChainName: "Humans.ai",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "HEART",
          coinMinimalDenom: "aheart",
          coinDecimals: 18,
          coinGeckoId: "humans-ai",
          coinImageUrl: "/tokens/generated/heart.svg",
          base: "ibc/35CECC330D11DD00FACB555D07687631E0BC7D226260CC5F015F6D7980819533",
          gasPriceStep: {
            low: 80000000000,
            average: 100000000000,
            high: 160000000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "HEART",
        coinMinimalDenom: "aheart",
        coinGeckoId: "humans-ai",
        coinImageUrl: "/tokens/generated/heart.svg",
        base: "ibc/35CECC330D11DD00FACB555D07687631E0BC7D226260CC5F015F6D7980819533",
      },
      feeCurrencies: [
        {
          coinDenom: "HEART",
          coinMinimalDenom: "aheart",
          coinDecimals: 18,
          coinGeckoId: "humans-ai",
          coinImageUrl: "/tokens/generated/heart.svg",
          base: "ibc/35CECC330D11DD00FACB555D07687631E0BC7D226260CC5F015F6D7980819533",
          gasPriceStep: {
            low: 80000000000,
            average: 100000000000,
            high: 160000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "human",
        bech32PrefixAccPub: "humanpub",
        bech32PrefixValAddr: "humanvaloper",
        bech32PrefixValPub: "humanvaloperpub",
        bech32PrefixConsAddr: "humanvalcons",
        bech32PrefixConsPub: "humanvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/humans/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "scorum",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Scorum Network",
    chain_id: "scorum-1",
    bech32_prefix: "scorum",
    bech32_config: {
      bech32PrefixAccAddr: "scorum",
      bech32PrefixAccPub: "scorumpub",
      bech32PrefixValAddr: "scorumvaloper",
      bech32PrefixValPub: "scorumvaloperpub",
      bech32PrefixConsAddr: "scorumvalcons",
      bech32PrefixConsPub: "scorumvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "gas",
          fixed_min_gas_price: 1,
          low_gas_price: 1,
          average_gas_price: 1,
          high_gas_price: 1,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "nscr",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://scorum-blockchain-mainnet-rpc.scorum.com",
        },
      ],
      rest: [
        {
          address: "https://scorum-blockchain-mainnet-api.scorum.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ezstaking.app/scorum/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/scorum/images/scorum.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/scorum/images/scorum.svg",
      theme: {
        primary_color_hex: "#242424",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://scorum-blockchain-mainnet-rpc.scorum.com",
      rest: "https://scorum-blockchain-mainnet-api.scorum.com",
      chainId: "scorum-1",
      chainName: "scorum",
      prettyChainName: "Scorum Network",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "SCR",
          coinMinimalDenom: "nscr",
          coinDecimals: 9,
          coinGeckoId: "scorum",
          coinImageUrl: "/tokens/generated/scr.svg",
          base: "ibc/178248C262DE2E141EE6287EE7AB0854F05F25B0A3F40C4B912FA1C7E51F466E",
        },
      ],
      stakeCurrency: {
        coinDecimals: 9,
        coinDenom: "SCR",
        coinMinimalDenom: "nscr",
        coinGeckoId: "scorum",
        coinImageUrl: "/tokens/generated/scr.svg",
        base: "ibc/178248C262DE2E141EE6287EE7AB0854F05F25B0A3F40C4B912FA1C7E51F466E",
      },
      feeCurrencies: [],
      bech32Config: {
        bech32PrefixAccAddr: "scorum",
        bech32PrefixAccPub: "scorumpub",
        bech32PrefixValAddr: "scorumvaloper",
        bech32PrefixValPub: "scorumvaloperpub",
        bech32PrefixConsAddr: "scorumvalcons",
        bech32PrefixConsPub: "scorumvalconspub",
      },
      explorerUrlToTx: "https://ezstaking.app/scorum/txs/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "chain4energy",
    status: "live",
    network_type: "mainnet",
    pretty_name: "C4E",
    chain_id: "perun-1",
    bech32_prefix: "c4e",
    bech32_config: {
      bech32PrefixAccAddr: "c4e",
      bech32PrefixAccPub: "c4epub",
      bech32PrefixValAddr: "c4evaloper",
      bech32PrefixValPub: "c4evaloperpub",
      bech32PrefixConsAddr: "c4evalcons",
      bech32PrefixConsPub: "c4evalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uc4e",
          fixed_min_gas_price: 0,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uc4e",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.c4e.io",
        },
      ],
      rest: [
        {
          address: "https://lcd.c4e.io",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.c4e.io/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chain4energy/images/c4e.png",
      theme: {
        primary_color_hex: "#314768",
      },
    },
    features: ["ibc-go", "ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc.c4e.io",
      rest: "https://lcd.c4e.io",
      chainId: "perun-1",
      chainName: "chain4energy",
      prettyChainName: "C4E",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "C4E",
          coinMinimalDenom: "uc4e",
          coinDecimals: 6,
          coinGeckoId: "chain4energy",
          coinImageUrl: "/tokens/generated/c4e.png",
          base: "ibc/62118FB4D5FEDD5D2B18DC93648A745CD5E5B01D420E9B7A5FED5381CB13A7E8",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "C4E",
        coinMinimalDenom: "uc4e",
        coinGeckoId: "chain4energy",
        coinImageUrl: "/tokens/generated/c4e.png",
        base: "ibc/62118FB4D5FEDD5D2B18DC93648A745CD5E5B01D420E9B7A5FED5381CB13A7E8",
      },
      feeCurrencies: [
        {
          coinDenom: "C4E",
          coinMinimalDenom: "uc4e",
          coinDecimals: 6,
          coinGeckoId: "chain4energy",
          coinImageUrl: "/tokens/generated/c4e.png",
          base: "ibc/62118FB4D5FEDD5D2B18DC93648A745CD5E5B01D420E9B7A5FED5381CB13A7E8",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "c4e",
        bech32PrefixAccPub: "c4epub",
        bech32PrefixValAddr: "c4evaloper",
        bech32PrefixValPub: "c4evaloperpub",
        bech32PrefixConsAddr: "c4evalcons",
        bech32PrefixConsPub: "c4evalconspub",
      },
      explorerUrlToTx: "https://explorer.c4e.io/transactions/{txHash}",
      features: ["ibc-go", "ibc-transfer"],
    },
  },
  {
    chain_name: "pylons",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Pylons",
    chain_id: "pylons-mainnet-1",
    bech32_prefix: "pylo",
    bech32_config: {
      bech32PrefixAccAddr: "pylo",
      bech32PrefixAccPub: "pylopub",
      bech32PrefixValAddr: "pylovaloper",
      bech32PrefixValPub: "pylovaloperpub",
      bech32PrefixConsAddr: "pylovalcons",
      bech32PrefixConsPub: "pylovalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ubedrock",
          fixed_min_gas_price: 0,
          low_gas_price: 0,
          average_gas_price: 0.5,
          high_gas_price: 1,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ubedrock",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.pylons.nodestake.top/",
        },
      ],
      rest: [
        {
          address: "https://api.pylons.nodestake.top/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://pylons.explorers.guru/transaction/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pylons/images/pylons.png",
      theme: {
        primary_color_hex: "#ec4424",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.pylons.nodestake.top/",
      rest: "https://api.pylons.nodestake.top/",
      chainId: "pylons-mainnet-1",
      chainName: "pylons",
      prettyChainName: "Pylons",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "ROCK",
          coinMinimalDenom: "ubedrock",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/rock.png",
          base: "ibc/0835781EF3F3ADD053874323AB660C75B50B18B16733CAB783CA6BBD78244EDF",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "ROCK",
        coinMinimalDenom: "ubedrock",
        coinImageUrl: "/tokens/generated/rock.png",
        base: "ibc/0835781EF3F3ADD053874323AB660C75B50B18B16733CAB783CA6BBD78244EDF",
      },
      feeCurrencies: [
        {
          coinDenom: "ROCK",
          coinMinimalDenom: "ubedrock",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/rock.png",
          base: "ibc/0835781EF3F3ADD053874323AB660C75B50B18B16733CAB783CA6BBD78244EDF",
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "pylo",
        bech32PrefixAccPub: "pylopub",
        bech32PrefixValAddr: "pylovaloper",
        bech32PrefixValPub: "pylovaloperpub",
        bech32PrefixConsAddr: "pylovalcons",
        bech32PrefixConsPub: "pylovalconspub",
      },
      explorerUrlToTx: "https://pylons.explorers.guru/transaction/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "aioz",
    status: "live",
    network_type: "mainnet",
    pretty_name: "AIOZ Network",
    chain_id: "aioz_168-1",
    bech32_prefix: "aioz",
    bech32_config: {
      bech32PrefixAccAddr: "aioz",
      bech32PrefixAccPub: "aiozpub",
      bech32PrefixValAddr: "aiozvaloper",
      bech32PrefixValPub: "aiozvaloperpub",
      bech32PrefixConsAddr: "aiozvalcons",
      bech32PrefixConsPub: "aiozvalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "attoaioz",
          fixed_min_gas_price: 7000000000,
          low_gas_price: 7000000000,
          average_gas_price: 7000000000,
          high_gas_price: 10000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "attoaioz",
        },
      ],
      lock_duration: {
        time: "2419200s",
      },
    },
    description:
      "AIOZ Network is a DePIN for Web3 AI, Storage and Streaming.\n\nAIOZ empowers a faster, secure and decentralized future.\n\nPowered by a global network of DePINs, AIOZ rewards you for sharing your computational resources for storing, transcoding, and streaming digital media content and powering decentralized AI computation.",
    apis: {
      rpc: [
        {
          address: "https://rpc-dataseed.aioz.network",
        },
      ],
      rest: [
        {
          address: "https://lcd-dataseed.aioz.network",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.aioz.network/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/aioz/images/aioz.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/aioz/images/aioz.svg",
      theme: {
        primary_color_hex: "#24241c",
      },
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://rpc-dataseed.aioz.network",
      rest: "https://lcd-dataseed.aioz.network",
      chainId: "aioz_168-1",
      chainName: "aioz",
      prettyChainName: "AIOZ Network",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "AIOZ",
          coinMinimalDenom: "attoaioz",
          coinDecimals: 18,
          coinGeckoId: "aioz-network",
          coinImageUrl: "/tokens/generated/aioz.svg",
          base: "ibc/BB0AFE2AFBD6E883690DAE4B9168EAC2B306BCC9C9292DACBB4152BBB08DB25F",
          gasPriceStep: {
            low: 7000000000,
            average: 7000000000,
            high: 10000000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "AIOZ",
        coinMinimalDenom: "attoaioz",
        coinGeckoId: "aioz-network",
        coinImageUrl: "/tokens/generated/aioz.svg",
        base: "ibc/BB0AFE2AFBD6E883690DAE4B9168EAC2B306BCC9C9292DACBB4152BBB08DB25F",
      },
      feeCurrencies: [
        {
          coinDenom: "AIOZ",
          coinMinimalDenom: "attoaioz",
          coinDecimals: 18,
          coinGeckoId: "aioz-network",
          coinImageUrl: "/tokens/generated/aioz.svg",
          base: "ibc/BB0AFE2AFBD6E883690DAE4B9168EAC2B306BCC9C9292DACBB4152BBB08DB25F",
          gasPriceStep: {
            low: 7000000000,
            average: 7000000000,
            high: 10000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "aioz",
        bech32PrefixAccPub: "aiozpub",
        bech32PrefixValAddr: "aiozvaloper",
        bech32PrefixValPub: "aiozvaloperpub",
        bech32PrefixConsAddr: "aiozvalcons",
        bech32PrefixConsPub: "aiozvalconspub",
      },
      explorerUrlToTx: "https://explorer.aioz.network/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "nibiru",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Nibiru",
    chain_id: "cataclysm-1",
    bech32_prefix: "nibi",
    bech32_config: {
      bech32PrefixAccAddr: "nibi",
      bech32PrefixAccPub: "nibipub",
      bech32PrefixValAddr: "nibivaloper",
      bech32PrefixValPub: "nibivaloperpub",
      bech32PrefixConsAddr: "nibivalcons",
      bech32PrefixConsPub: "nibivalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "unibi",
          fixed_min_gas_price: 0.025,
          low_gas_price: 0.025,
          average_gas_price: 0.05,
          high_gas_price: 0.1,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "unibi",
        },
      ],
      lock_duration: {
        time: "1814400s",
      },
    },
    description: "A Web3 hub ushering in the next era of money",
    apis: {
      rpc: [
        {
          address: "https://rpc.nibiru.fi:443",
        },
      ],
      rest: [
        {
          address: "https://lcd.nibiru.fi:443",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://nibiru.explorers.guru/transaction/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nibiru/images/nibiru.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nibiru/images/nibiru.svg",
      theme: {
        primary_color_hex: "#14c0ce",
      },
    },
    features: ["ibc-transfer", "ibc-go", "cosmwasm"],
    keplrChain: {
      rpc: "https://rpc.nibiru.fi:443",
      rest: "https://lcd.nibiru.fi:443",
      chainId: "cataclysm-1",
      chainName: "nibiru",
      prettyChainName: "Nibiru",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "NIBI",
          coinMinimalDenom: "unibi",
          coinDecimals: 6,
          coinGeckoId: "nibiru",
          coinImageUrl: "/tokens/generated/nibi.svg",
          base: "ibc/4017C65CEA338196ECCEC3FE3FE8258F23D1DE88F1D95750CC912C7A1C1016FF",
          gasPriceStep: {
            low: 0.025,
            average: 0.05,
            high: 0.1,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "NIBI",
        coinMinimalDenom: "unibi",
        coinGeckoId: "nibiru",
        coinImageUrl: "/tokens/generated/nibi.svg",
        base: "ibc/4017C65CEA338196ECCEC3FE3FE8258F23D1DE88F1D95750CC912C7A1C1016FF",
      },
      feeCurrencies: [
        {
          coinDenom: "NIBI",
          coinMinimalDenom: "unibi",
          coinDecimals: 6,
          coinGeckoId: "nibiru",
          coinImageUrl: "/tokens/generated/nibi.svg",
          base: "ibc/4017C65CEA338196ECCEC3FE3FE8258F23D1DE88F1D95750CC912C7A1C1016FF",
          gasPriceStep: {
            low: 0.025,
            average: 0.05,
            high: 0.1,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "nibi",
        bech32PrefixAccPub: "nibipub",
        bech32PrefixValAddr: "nibivaloper",
        bech32PrefixValPub: "nibivaloperpub",
        bech32PrefixConsAddr: "nibivalcons",
        bech32PrefixConsPub: "nibivalconspub",
      },
      explorerUrlToTx: "https://nibiru.explorers.guru/transaction/{txHash}",
      features: ["ibc-transfer", "ibc-go", "cosmwasm"],
    },
  },
  {
    chain_name: "conscious",
    status: "live",
    network_type: "mainnet",
    pretty_name: "ConsciousDAO",
    chain_id: "cvn_2032-1",
    bech32_prefix: "cvn",
    bech32_config: {
      bech32PrefixAccAddr: "cvn",
      bech32PrefixAccPub: "cvnpub",
      bech32PrefixValAddr: "cvnvaloper",
      bech32PrefixValPub: "cvnvaloperpub",
      bech32PrefixConsAddr: "cvnvalcons",
      bech32PrefixConsPub: "cvnvalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "acvnt",
          fixed_min_gas_price: 100000000,
          low_gas_price: 100000000,
          average_gas_price: 200000000,
          high_gas_price: 300000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "acvnt",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.cvn.io:443",
        },
      ],
      rest: [
        {
          address: "https://rest.cvn.io:443",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/conscious/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/conscious/images/cvn.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/conscious/images/cvn.svg",
      theme: {
        primary_color_hex: "#047e04",
      },
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://rpc.cvn.io:443",
      rest: "https://rest.cvn.io:443",
      chainId: "cvn_2032-1",
      chainName: "conscious",
      prettyChainName: "ConsciousDAO",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "CVN",
          coinMinimalDenom: "acvnt",
          coinDecimals: 18,
          coinGeckoId: "consciousdao",
          coinImageUrl: "/tokens/generated/cvn.svg",
          base: "ibc/044B7B28AFE93CEC769CF529ADC626DA09EA0EFA3E0E3284D540E9E00E01E24A",
          gasPriceStep: {
            low: 100000000,
            average: 200000000,
            high: 300000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "CVN",
        coinMinimalDenom: "acvnt",
        coinGeckoId: "consciousdao",
        coinImageUrl: "/tokens/generated/cvn.svg",
        base: "ibc/044B7B28AFE93CEC769CF529ADC626DA09EA0EFA3E0E3284D540E9E00E01E24A",
      },
      feeCurrencies: [
        {
          coinDenom: "CVN",
          coinMinimalDenom: "acvnt",
          coinDecimals: 18,
          coinGeckoId: "consciousdao",
          coinImageUrl: "/tokens/generated/cvn.svg",
          base: "ibc/044B7B28AFE93CEC769CF529ADC626DA09EA0EFA3E0E3284D540E9E00E01E24A",
          gasPriceStep: {
            low: 100000000,
            average: 200000000,
            high: 300000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "cvn",
        bech32PrefixAccPub: "cvnpub",
        bech32PrefixValAddr: "cvnvaloper",
        bech32PrefixValPub: "cvnvaloperpub",
        bech32PrefixConsAddr: "cvnvalcons",
        bech32PrefixConsPub: "cvnvalconspub",
      },
      explorerUrlToTx: "https://ping.pub/conscious/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "dhealth",
    status: "live",
    network_type: "mainnet",
    pretty_name: "dHealth",
    chain_id: "dhealth",
    bech32_prefix: "dh",
    bech32_config: {
      bech32PrefixAccAddr: "dh",
      bech32PrefixAccPub: "dhpub",
      bech32PrefixValAddr: "dhvaloper",
      bech32PrefixValPub: "dhvaloperpub",
      bech32PrefixConsAddr: "dhvalcons",
      bech32PrefixConsPub: "dhvalconspub",
    },
    slip44: 10111,
    fees: {
      fee_tokens: [
        {
          denom: "udhp",
          fixed_min_gas_price: 0.01,
          low_gas_price: 0.025,
          average_gas_price: 0.03,
          high_gas_price: 0.035,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "udhp",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.dhealth.com",
        },
      ],
      rest: [
        {
          address: "https://lcd.dhealth.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.nodestake.org/dhealth/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dhealth/images/dhp.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dhealth/images/dhp.svg",
      theme: {
        primary_color_hex: "#140c7c",
      },
    },
    features: ["ibc-transfer", "ibc-go", "cosmwasm"],
    keplrChain: {
      rpc: "https://rpc.dhealth.com",
      rest: "https://lcd.dhealth.com",
      chainId: "dhealth",
      chainName: "dhealth",
      prettyChainName: "dHealth",
      bip44: {
        coinType: 10111,
      },
      currencies: [
        {
          coinDenom: "DHP",
          coinMinimalDenom: "udhp",
          coinDecimals: 6,
          coinGeckoId: "dhealth",
          coinImageUrl: "/tokens/generated/dhp.svg",
          base: "ibc/FD506CCA1FC574F2A8175FB574C981E9F6351E194AA48AC219BD67FF934E2F33",
          gasPriceStep: {
            low: 0.025,
            average: 0.03,
            high: 0.035,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "DHP",
        coinMinimalDenom: "udhp",
        coinGeckoId: "dhealth",
        coinImageUrl: "/tokens/generated/dhp.svg",
        base: "ibc/FD506CCA1FC574F2A8175FB574C981E9F6351E194AA48AC219BD67FF934E2F33",
      },
      feeCurrencies: [
        {
          coinDenom: "DHP",
          coinMinimalDenom: "udhp",
          coinDecimals: 6,
          coinGeckoId: "dhealth",
          coinImageUrl: "/tokens/generated/dhp.svg",
          base: "ibc/FD506CCA1FC574F2A8175FB574C981E9F6351E194AA48AC219BD67FF934E2F33",
          gasPriceStep: {
            low: 0.025,
            average: 0.03,
            high: 0.035,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "dh",
        bech32PrefixAccPub: "dhpub",
        bech32PrefixValAddr: "dhvaloper",
        bech32PrefixValPub: "dhvaloperpub",
        bech32PrefixConsAddr: "dhvalcons",
        bech32PrefixConsPub: "dhvalconspub",
      },
      explorerUrlToTx: "https://explorer.nodestake.org/dhealth/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "cosmwasm"],
    },
  },
  {
    chain_name: "furya",
    status: "live",
    network_type: "mainnet",
    pretty_name: "furya",
    chain_id: "furya-1",
    bech32_prefix: "furya",
    bech32_config: {
      bech32PrefixAccAddr: "furya",
      bech32PrefixAccPub: "furyapub",
      bech32PrefixValAddr: "furyavaloper",
      bech32PrefixValPub: "furyavaloperpub",
      bech32PrefixConsAddr: "furyavalcons",
      bech32PrefixConsPub: "furyavalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ufury",
          low_gas_price: 0.1,
          average_gas_price: 0.25,
          high_gas_price: 0.5,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ufury",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.furya.xyz",
        },
      ],
      rest: [
        {
          address: "https://api.furya.xyz",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.furya.wtf/furya/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/furya/images/chain.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/furya/images/chain.svg",
      theme: {
        primary_color_hex: "#040404",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc.furya.xyz",
      rest: "https://api.furya.xyz",
      chainId: "furya-1",
      chainName: "furya",
      prettyChainName: "furya",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "FURY",
          coinMinimalDenom: "ufury",
          coinDecimals: 6,
          coinGeckoId: "fanfury",
          coinImageUrl: "/tokens/generated/fury.svg",
          base: "ibc/E4C60B9F95BF54CC085A5E39F6057ABD4DF92793D330EB884A36530F7E6804DE",
          gasPriceStep: {
            low: 0.1,
            average: 0.25,
            high: 0.5,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "FURY",
        coinMinimalDenom: "ufury",
        coinGeckoId: "fanfury",
        coinImageUrl: "/tokens/generated/fury.svg",
        base: "ibc/E4C60B9F95BF54CC085A5E39F6057ABD4DF92793D330EB884A36530F7E6804DE",
      },
      feeCurrencies: [
        {
          coinDenom: "FURY",
          coinMinimalDenom: "ufury",
          coinDecimals: 6,
          coinGeckoId: "fanfury",
          coinImageUrl: "/tokens/generated/fury.svg",
          base: "ibc/E4C60B9F95BF54CC085A5E39F6057ABD4DF92793D330EB884A36530F7E6804DE",
          gasPriceStep: {
            low: 0.1,
            average: 0.25,
            high: 0.5,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "furya",
        bech32PrefixAccPub: "furyapub",
        bech32PrefixValAddr: "furyavaloper",
        bech32PrefixValPub: "furyavaloperpub",
        bech32PrefixConsAddr: "furyavalcons",
        bech32PrefixConsPub: "furyavalconspub",
      },
      explorerUrlToTx: "https://explorer.furya.wtf/furya/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "saga",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Saga",
    chain_id: "ssc-1",
    bech32_prefix: "saga",
    bech32_config: {
      bech32PrefixAccAddr: "saga",
      bech32PrefixAccPub: "sagapub",
      bech32PrefixValAddr: "sagavaloper",
      bech32PrefixValPub: "sagavaloperpub",
      bech32PrefixConsAddr: "sagavalcons",
      bech32PrefixConsPub: "sagavalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "usaga",
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "usaga",
        },
      ],
      lock_duration: {
        time: "1814400s",
      },
    },
    description:
      "Saga is a Layer 1 protocol that allows developers to automatically spin up VM-agnostic, parallelized and interoperable dedicated chains, or “Chainlets,” that provide applications with infinite horizontal scalability. Each Chainlet is a replica of the Saga Mainnet, with the same validator set and security model.\n\nSaga’s mission is to enable the next 1000 chains in gaming and entertainment as part of the growing Saga Multiverse. ",
    apis: {
      rpc: [
        {
          address: "https://rpc-saga.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-saga.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/saga/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/saga/images/saga.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/saga/images/saga.svg",
      theme: {
        primary_color_hex: "#040404",
      },
    },
    features: ["ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://rpc-saga.keplr.app",
      rest: "https://lcd-saga.keplr.app",
      chainId: "ssc-1",
      chainName: "saga",
      prettyChainName: "Saga",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "SAGA",
          coinMinimalDenom: "usaga",
          coinDecimals: 6,
          coinGeckoId: "saga-2",
          coinImageUrl: "/tokens/generated/saga.svg",
          base: "ibc/094FB70C3006906F67F5D674073D2DAFAFB41537E7033098F5C752F211E7B6C2",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "SAGA",
        coinMinimalDenom: "usaga",
        coinGeckoId: "saga-2",
        coinImageUrl: "/tokens/generated/saga.svg",
        base: "ibc/094FB70C3006906F67F5D674073D2DAFAFB41537E7033098F5C752F211E7B6C2",
      },
      feeCurrencies: [
        {
          coinDenom: "SAGA",
          coinMinimalDenom: "usaga",
          coinDecimals: 6,
          coinGeckoId: "saga-2",
          coinImageUrl: "/tokens/generated/saga.svg",
          base: "ibc/094FB70C3006906F67F5D674073D2DAFAFB41537E7033098F5C752F211E7B6C2",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "saga",
        bech32PrefixAccPub: "sagapub",
        bech32PrefixValAddr: "sagavaloper",
        bech32PrefixValPub: "sagavaloperpub",
        bech32PrefixConsAddr: "sagavalcons",
        bech32PrefixConsPub: "sagavalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/saga/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "shido",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Shido",
    chain_id: "shido_9008-1",
    bech32_prefix: "shido",
    bech32_config: {
      bech32PrefixAccAddr: "shido",
      bech32PrefixAccPub: "shidopub",
      bech32PrefixValAddr: "shidovaloper",
      bech32PrefixValPub: "shidovaloperpub",
      bech32PrefixConsAddr: "shidovalcons",
      bech32PrefixConsPub: "shidovalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "shido",
          fixed_min_gas_price: 250000000,
          low_gas_price: 20000000000,
          average_gas_price: 25000000000,
          high_gas_price: 40000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "shido",
        },
      ],
    },
    description:
      "Developers use Shido as the Ethereum and Wasm Chain to deploy applications of the future. Get all the functionalities of Ethereum and Wasm with the power of IBC and Interchain composability.",
    apis: {
      rpc: [
        {
          address: "https://tendermint.shidoscan.com/",
        },
      ],
      rest: [
        {
          address: "https://swagger.shidoscan.com/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://shidoscan.com/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shido/images/shido.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shido/images/shido.svg",
      theme: {
        primary_color_hex: "#046ffc",
      },
    },
    features: [
      "ibc-transfer",
      "ibc-go",
      "eth-address-gen",
      "eth-key-sign",
      "cosmwasm",
      "wasmd_0.24+",
    ],
    keplrChain: {
      rpc: "https://tendermint.shidoscan.com/",
      rest: "https://swagger.shidoscan.com/",
      chainId: "shido_9008-1",
      chainName: "shido",
      prettyChainName: "Shido",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "SHIDO",
          coinMinimalDenom: "shido",
          coinDecimals: 18,
          coinGeckoId: "shido-2",
          coinImageUrl: "/tokens/generated/shido.svg",
          base: "ibc/62B50BB1DAEAD2A92D6C6ACAC118F4ED8CBE54265DCF5688E8D0A0A978AA46E7",
          gasPriceStep: {
            low: 20000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "SHIDO",
        coinMinimalDenom: "shido",
        coinGeckoId: "shido-2",
        coinImageUrl: "/tokens/generated/shido.svg",
        base: "ibc/62B50BB1DAEAD2A92D6C6ACAC118F4ED8CBE54265DCF5688E8D0A0A978AA46E7",
      },
      feeCurrencies: [
        {
          coinDenom: "SHIDO",
          coinMinimalDenom: "shido",
          coinDecimals: 18,
          coinGeckoId: "shido-2",
          coinImageUrl: "/tokens/generated/shido.svg",
          base: "ibc/62B50BB1DAEAD2A92D6C6ACAC118F4ED8CBE54265DCF5688E8D0A0A978AA46E7",
          gasPriceStep: {
            low: 20000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "shido",
        bech32PrefixAccPub: "shidopub",
        bech32PrefixValAddr: "shidovaloper",
        bech32PrefixValPub: "shidovaloperpub",
        bech32PrefixConsAddr: "shidovalcons",
        bech32PrefixConsPub: "shidovalconspub",
      },
      explorerUrlToTx: "https://shidoscan.com/tx/{txHash}",
      features: [
        "ibc-transfer",
        "ibc-go",
        "eth-address-gen",
        "eth-key-sign",
        "cosmwasm",
        "wasmd_0.24+",
      ],
    },
  },
  {
    chain_name: "cifer",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Cifer",
    chain_id: "cifer-2",
    bech32_prefix: "cife",
    bech32_config: {
      bech32PrefixAccAddr: "cife",
      bech32PrefixAccPub: "cifepub",
      bech32PrefixValAddr: "cifevaloper",
      bech32PrefixValPub: "cifevaloperpub",
      bech32PrefixConsAddr: "cifevalcons",
      bech32PrefixConsPub: "cifevalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ucif",
          fixed_min_gas_price: 0.0025,
          low_gas_price: 1,
          average_gas_price: 5,
          high_gas_price: 10,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ucif",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://cif_node.cifer.ai",
        },
      ],
      rest: [
        {
          address: "https://api.cifer.ai",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/cifer/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cifer/images/cif.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cifer/images/cif.svg",
      theme: {
        primary_color_hex: "#af49b7",
      },
    },
    features: ["ibc-go", "ibc-transfer"],
    keplrChain: {
      rpc: "https://cif_node.cifer.ai",
      rest: "https://api.cifer.ai",
      chainId: "cifer-2",
      chainName: "cifer",
      prettyChainName: "Cifer",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "CIF",
          coinMinimalDenom: "ucif",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/cif.svg",
          base: "ibc/EFC1776BEFB7842F2DC7BABD9A3050E188145C99007ECC5F3526FED45A68D5F5",
          gasPriceStep: {
            low: 1,
            average: 5,
            high: 10,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "CIF",
        coinMinimalDenom: "ucif",
        coinImageUrl: "/tokens/generated/cif.svg",
        base: "ibc/EFC1776BEFB7842F2DC7BABD9A3050E188145C99007ECC5F3526FED45A68D5F5",
      },
      feeCurrencies: [
        {
          coinDenom: "CIF",
          coinMinimalDenom: "ucif",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/cif.svg",
          base: "ibc/EFC1776BEFB7842F2DC7BABD9A3050E188145C99007ECC5F3526FED45A68D5F5",
          gasPriceStep: {
            low: 1,
            average: 5,
            high: 10,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "cife",
        bech32PrefixAccPub: "cifepub",
        bech32PrefixValAddr: "cifevaloper",
        bech32PrefixValPub: "cifevaloperpub",
        bech32PrefixConsAddr: "cifevalcons",
        bech32PrefixConsPub: "cifevalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/cifer/txs/{txHash}",
      features: ["ibc-go", "ibc-transfer"],
    },
  },
  {
    chain_name: "seda",
    status: "live",
    network_type: "mainnet",
    pretty_name: "SEDA",
    chain_id: "seda-1",
    bech32_prefix: "seda",
    bech32_config: {
      bech32PrefixAccAddr: "seda",
      bech32PrefixAccPub: "sedapub",
      bech32PrefixValAddr: "sedavaloper",
      bech32PrefixValPub: "sedavaloperpub",
      bech32PrefixConsAddr: "sedavalcons",
      bech32PrefixConsPub: "sedavalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "aseda",
          fixed_min_gas_price: 10000000000,
          low_gas_price: 10000000000,
          average_gas_price: 10000000000,
          high_gas_price: 14000000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "aseda",
        },
      ],
    },
    description:
      "SEDA is a standard for modular data transport and querying. Any data type, for all networks.",
    apis: {
      rpc: [
        {
          address: "https://rpc.mainnet.seda.xyz",
        },
      ],
      rest: [
        {
          address: "https://lcd.mainnet.seda.xyz",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.seda.xyz/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/seda/images/seda.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/seda/images/seda.svg",
      theme: {
        primary_color_hex: "#8178d1",
      },
    },
    features: ["ibc-go", "ibc-transfer", "cosmwasm", "wasmd_0.24+"],
    keplrChain: {
      rpc: "https://rpc.mainnet.seda.xyz",
      rest: "https://lcd.mainnet.seda.xyz",
      chainId: "seda-1",
      chainName: "seda",
      prettyChainName: "SEDA",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "SEDA",
          coinMinimalDenom: "aseda",
          coinDecimals: 18,
          coinGeckoId: "seda-2",
          coinImageUrl: "/tokens/generated/seda.svg",
          base: "ibc/956AEF1DA92F70584266E87978C3F30A43B91EE6ABC62F03D097E79F6B99C4D8",
          gasPriceStep: {
            low: 10000000000,
            average: 10000000000,
            high: 14000000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "SEDA",
        coinMinimalDenom: "aseda",
        coinGeckoId: "seda-2",
        coinImageUrl: "/tokens/generated/seda.svg",
        base: "ibc/956AEF1DA92F70584266E87978C3F30A43B91EE6ABC62F03D097E79F6B99C4D8",
      },
      feeCurrencies: [
        {
          coinDenom: "SEDA",
          coinMinimalDenom: "aseda",
          coinDecimals: 18,
          coinGeckoId: "seda-2",
          coinImageUrl: "/tokens/generated/seda.svg",
          base: "ibc/956AEF1DA92F70584266E87978C3F30A43B91EE6ABC62F03D097E79F6B99C4D8",
          gasPriceStep: {
            low: 10000000000,
            average: 10000000000,
            high: 14000000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "seda",
        bech32PrefixAccPub: "sedapub",
        bech32PrefixValAddr: "sedavaloper",
        bech32PrefixValPub: "sedavaloperpub",
        bech32PrefixConsAddr: "sedavalcons",
        bech32PrefixConsPub: "sedavalconspub",
      },
      explorerUrlToTx: "https://explorer.seda.xyz/txs/{txHash}",
      features: ["ibc-go", "ibc-transfer", "cosmwasm", "wasmd_0.24+"],
    },
  },
  {
    chain_name: "neutaro",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Neutaro",
    chain_id: "Neutaro-1",
    bech32_prefix: "neutaro",
    bech32_config: {
      bech32PrefixAccAddr: "neutaro",
      bech32PrefixAccPub: "neutaropub",
      bech32PrefixValAddr: "neutarovaloper",
      bech32PrefixValPub: "neutarovaloperpub",
      bech32PrefixConsAddr: "neutarovalcons",
      bech32PrefixConsPub: "neutarovalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uneutaro",
          fixed_min_gas_price: 0,
          low_gas_price: 0,
          average_gas_price: 0,
          high_gas_price: 0.035,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uneutaro",
        },
      ],
    },
    description:
      "The Blockchain that is Pioneering Ethical Standards, Values, and Transparency in cross chain Blockchain Technology to drive innovation",
    apis: {
      rpc: [
        {
          address: "https://rpc2.neutaro.io/",
        },
      ],
      rest: [
        {
          address: "https://api2.neutaro.io/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.neutaro.io/Neutaro/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutaro/images/neutaro.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutaro/images/neutaro.svg",
      theme: {
        primary_color_hex: "#cbfb06",
      },
    },
    features: ["ibc-go", "ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc2.neutaro.io/",
      rest: "https://api2.neutaro.io/",
      chainId: "Neutaro-1",
      chainName: "neutaro",
      prettyChainName: "Neutaro",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "NTMPI",
          coinMinimalDenom: "uneutaro",
          coinDecimals: 6,
          coinGeckoId: "neutaro",
          coinImageUrl: "/tokens/generated/ntmpi.svg",
          base: "ibc/DAED51CBD967A3BE0C467687970AFD97B202AFE4A1718B36936F49178AFE0133",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "NTMPI",
        coinMinimalDenom: "uneutaro",
        coinGeckoId: "neutaro",
        coinImageUrl: "/tokens/generated/ntmpi.svg",
        base: "ibc/DAED51CBD967A3BE0C467687970AFD97B202AFE4A1718B36936F49178AFE0133",
      },
      feeCurrencies: [
        {
          coinDenom: "NTMPI",
          coinMinimalDenom: "uneutaro",
          coinDecimals: 6,
          coinGeckoId: "neutaro",
          coinImageUrl: "/tokens/generated/ntmpi.svg",
          base: "ibc/DAED51CBD967A3BE0C467687970AFD97B202AFE4A1718B36936F49178AFE0133",
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "neutaro",
        bech32PrefixAccPub: "neutaropub",
        bech32PrefixValAddr: "neutarovaloper",
        bech32PrefixValPub: "neutarovaloperpub",
        bech32PrefixConsAddr: "neutarovalcons",
        bech32PrefixConsPub: "neutarovalconspub",
      },
      explorerUrlToTx: "https://explorer.neutaro.io/Neutaro/tx/{txHash}",
      features: ["ibc-go", "ibc-transfer"],
    },
  },
  {
    chain_name: "firmachain",
    status: "live",
    network_type: "mainnet",
    pretty_name: "FIRMACHAIN",
    chain_id: "colosseum-1",
    bech32_prefix: "firma",
    bech32_config: {
      bech32PrefixAccAddr: "firma",
      bech32PrefixAccPub: "firmapub",
      bech32PrefixValAddr: "firmavaloper",
      bech32PrefixValPub: "firmavaloperpub",
      bech32PrefixConsAddr: "firmavalcons",
      bech32PrefixConsPub: "firmavalconspub",
    },
    slip44: 7777777,
    fees: {
      fee_tokens: [
        {
          denom: "ufct",
          fixed_min_gas_price: 0.1,
          low_gas_price: 0.1,
          average_gas_price: 0.15,
          high_gas_price: 0.2,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ufct",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc-explorer-mainnet.firmachain.dev",
        },
      ],
      rest: [
        {
          address: "https://lcd-explorer-mainnet.firmachain.dev",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.firmachain.dev/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/firmachain/images/fct.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/firmachain/images/fct.svg",
      theme: {
        primary_color_hex: "#1c1c1c",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc-explorer-mainnet.firmachain.dev",
      rest: "https://lcd-explorer-mainnet.firmachain.dev",
      chainId: "colosseum-1",
      chainName: "firmachain",
      prettyChainName: "FIRMACHAIN",
      bip44: {
        coinType: 7777777,
      },
      currencies: [
        {
          coinDenom: "FCT",
          coinMinimalDenom: "ufct",
          coinDecimals: 6,
          coinGeckoId: "firmachain",
          coinImageUrl: "/tokens/generated/fct.svg",
          base: "ibc/E43ABCC7E80E99E4E6E1226AE5695DDE0F83CB5C257CD04D47C36B8B90C1C839",
          gasPriceStep: {
            low: 0.1,
            average: 0.15,
            high: 0.2,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "FCT",
        coinMinimalDenom: "ufct",
        coinGeckoId: "firmachain",
        coinImageUrl: "/tokens/generated/fct.svg",
        base: "ibc/E43ABCC7E80E99E4E6E1226AE5695DDE0F83CB5C257CD04D47C36B8B90C1C839",
      },
      feeCurrencies: [
        {
          coinDenom: "FCT",
          coinMinimalDenom: "ufct",
          coinDecimals: 6,
          coinGeckoId: "firmachain",
          coinImageUrl: "/tokens/generated/fct.svg",
          base: "ibc/E43ABCC7E80E99E4E6E1226AE5695DDE0F83CB5C257CD04D47C36B8B90C1C839",
          gasPriceStep: {
            low: 0.1,
            average: 0.15,
            high: 0.2,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "firma",
        bech32PrefixAccPub: "firmapub",
        bech32PrefixValAddr: "firmavaloper",
        bech32PrefixValPub: "firmavaloperpub",
        bech32PrefixConsAddr: "firmavalcons",
        bech32PrefixConsPub: "firmavalconspub",
      },
      explorerUrlToTx: "https://explorer.firmachain.dev/transactions/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "lava",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Lava",
    chain_id: "lava-mainnet-1",
    bech32_prefix: "lava@",
    bech32_config: {
      bech32PrefixAccAddr: "lava@",
      bech32PrefixAccPub: "lava@pub",
      bech32PrefixValAddr: "lava@valoper",
      bech32PrefixValPub: "lava@valoperpub",
      bech32PrefixConsAddr: "lava@valcons",
      bech32PrefixConsPub: "lava@valconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ulava",
          fixed_min_gas_price: 0.00002,
          low_gas_price: 0.00002,
          average_gas_price: 0.025,
          high_gas_price: 0.05,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ulava",
        },
      ],
      lock_duration: {
        time: "1814400s",
      },
    },
    description:
      "Lava (LAVA) is the data access layer of the modular stack. developers and ecosystems permissionlessly add services to be served or accessed through lava. featuring a fully decentralized open source sdk integrable in frontends and a battle tested fully scalable open source server kit and can be used locally or through managed endpoints. Lava features rpc data access, indexing services, debug apis, archive access and more. Service providers can join the network, earn rewards either in the native token of the chain via token bought subscriptions on chain or through any ibc transferred token via incentive pools created and funded by ecosystems and DAOs. Developers can use the abstraction and go multi chain in seconds, not needing to choose what tools to use, having the access aggregated for them. Build whatever, wherever.",
    apis: {
      rpc: [
        {
          address: "https://lava-rpc.w3coins.io",
        },
      ],
      rest: [
        {
          address: "https://lava-api.w3coins.io",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://lava-explorer.w3coins.io/Lava/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lava/images/lava.png",
      theme: {
        primary_color_hex: "#6f043e",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://lava-rpc.w3coins.io",
      rest: "https://lava-api.w3coins.io",
      chainId: "lava-mainnet-1",
      chainName: "lava",
      prettyChainName: "Lava",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "LAVA",
          coinMinimalDenom: "ulava",
          coinDecimals: 6,
          coinGeckoId: "lava-network",
          coinImageUrl: "/tokens/generated/lava.png",
          base: "ibc/1AEF145C549D4F9847C79E49710B198C294C7F4A107F4610DEE8E725FFC4B378",
          gasPriceStep: {
            low: 0.00002,
            average: 0.025,
            high: 0.05,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "LAVA",
        coinMinimalDenom: "ulava",
        coinGeckoId: "lava-network",
        coinImageUrl: "/tokens/generated/lava.png",
        base: "ibc/1AEF145C549D4F9847C79E49710B198C294C7F4A107F4610DEE8E725FFC4B378",
      },
      feeCurrencies: [
        {
          coinDenom: "LAVA",
          coinMinimalDenom: "ulava",
          coinDecimals: 6,
          coinGeckoId: "lava-network",
          coinImageUrl: "/tokens/generated/lava.png",
          base: "ibc/1AEF145C549D4F9847C79E49710B198C294C7F4A107F4610DEE8E725FFC4B378",
          gasPriceStep: {
            low: 0.00002,
            average: 0.025,
            high: 0.05,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "lava@",
        bech32PrefixAccPub: "lava@pub",
        bech32PrefixValAddr: "lava@valoper",
        bech32PrefixValPub: "lava@valoperpub",
        bech32PrefixConsAddr: "lava@valcons",
        bech32PrefixConsPub: "lava@valconspub",
      },
      explorerUrlToTx: "https://lava-explorer.w3coins.io/Lava/tx/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "routerchain",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Router Protocol",
    chain_id: "router_9600-1",
    bech32_prefix: "router",
    bech32_config: {
      bech32PrefixAccAddr: "router",
      bech32PrefixAccPub: "routerpub",
      bech32PrefixValAddr: "routervaloper",
      bech32PrefixValPub: "routervaloperpub",
      bech32PrefixConsAddr: "routervalcons",
      bech32PrefixConsPub: "routervalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "route",
          fixed_min_gas_price: 7,
          low_gas_price: 7,
          average_gas_price: 7,
          high_gas_price: 10,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "route",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://sentry.tm.rpc.routerprotocol.com/",
        },
      ],
      rest: [
        {
          address: "https://sentry.lcd.routerprotocol.com/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://routerscan.io/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/routerchain/images/router.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/routerchain/images/router.svg",
      theme: {
        primary_color_hex: "#cb0766",
      },
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://sentry.tm.rpc.routerprotocol.com/",
      rest: "https://sentry.lcd.routerprotocol.com/",
      chainId: "router_9600-1",
      chainName: "routerchain",
      prettyChainName: "Router Protocol",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "ROUTE",
          coinMinimalDenom: "route",
          coinDecimals: 18,
          coinGeckoId: "router-protocol-2",
          coinImageUrl: "/tokens/generated/route.svg",
          base: "ibc/3F8F00094F0F79D17750FF69C5F09B078084018570AAF4F1C92C86D3F73E6488",
          gasPriceStep: {
            low: 7,
            average: 7,
            high: 10,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 18,
        coinDenom: "ROUTE",
        coinMinimalDenom: "route",
        coinGeckoId: "router-protocol-2",
        coinImageUrl: "/tokens/generated/route.svg",
        base: "ibc/3F8F00094F0F79D17750FF69C5F09B078084018570AAF4F1C92C86D3F73E6488",
      },
      feeCurrencies: [
        {
          coinDenom: "ROUTE",
          coinMinimalDenom: "route",
          coinDecimals: 18,
          coinGeckoId: "router-protocol-2",
          coinImageUrl: "/tokens/generated/route.svg",
          base: "ibc/3F8F00094F0F79D17750FF69C5F09B078084018570AAF4F1C92C86D3F73E6488",
          gasPriceStep: {
            low: 7,
            average: 7,
            high: 10,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "router",
        bech32PrefixAccPub: "routerpub",
        bech32PrefixValAddr: "routervaloper",
        bech32PrefixValPub: "routervaloperpub",
        bech32PrefixConsAddr: "routervalcons",
        bech32PrefixConsPub: "routervalconspub",
      },
      explorerUrlToTx: "https://routerscan.io/transactions/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "lorenzo",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Lorenzo Protocol",
    chain_id: "lorenzo_8329-1",
    bech32_prefix: "lrz",
    bech32_config: {
      bech32PrefixAccAddr: "lrz",
      bech32PrefixAccPub: "lrzpub",
      bech32PrefixValAddr: "lrzvaloper",
      bech32PrefixValPub: "lrzvaloperpub",
      bech32PrefixConsAddr: "lrzvalcons",
      bech32PrefixConsPub: "lrzvalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "stBTC",
          fixed_min_gas_price: 2000000,
          low_gas_price: 2000000,
          average_gas_price: 2000000,
          high_gas_price: 8000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "alrz",
        },
      ],
    },
    description:
      "Lorenzo aims to be the premier Bitcoin platform for yield-bearing token issuance, trading, and settlement.",
    apis: {
      rpc: [
        {
          address: "https://rpc-cosmos.lorenzo-protocol.xyz",
        },
      ],
      rest: [
        {
          address: "https://raw-api.lorenzo-protocol.xyz",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://scan.lorenzo-protocol.xyz/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lorenzo/images/lorenzo.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lorenzo/images/lorenzo.svg",
      theme: {
        primary_color_hex: "#133348",
      },
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://rpc-cosmos.lorenzo-protocol.xyz",
      rest: "https://raw-api.lorenzo-protocol.xyz",
      chainId: "lorenzo_8329-1",
      chainName: "lorenzo",
      prettyChainName: "Lorenzo Protocol",
      bip44: {
        coinType: 60,
      },
      currencies: [
        {
          coinDenom: "stBTC",
          coinMinimalDenom: "stBTC",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/stbtc.svg",
          base: "ibc/453B5B25834A5D4B8FE1E894E69D73F46424F28E8ED3D8E8CA654AEFF1EC5D3B",
          gasPriceStep: {
            low: 2000000,
            average: 2000000,
            high: 8000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 0,
        coinDenom: "STAKE",
        coinMinimalDenom: "tempStakePlaceholder",
      },
      feeCurrencies: [
        {
          coinDenom: "stBTC",
          coinMinimalDenom: "stBTC",
          coinDecimals: 18,
          coinImageUrl: "/tokens/generated/stbtc.svg",
          base: "ibc/453B5B25834A5D4B8FE1E894E69D73F46424F28E8ED3D8E8CA654AEFF1EC5D3B",
          gasPriceStep: {
            low: 2000000,
            average: 2000000,
            high: 8000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "lrz",
        bech32PrefixAccPub: "lrzpub",
        bech32PrefixValAddr: "lrzvaloper",
        bech32PrefixValPub: "lrzvaloperpub",
        bech32PrefixConsAddr: "lrzvalcons",
        bech32PrefixConsPub: "lrzvalconspub",
      },
      explorerUrlToTx: "https://scan.lorenzo-protocol.xyz/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "andromeda",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Andromeda",
    chain_id: "andromeda-1",
    bech32_prefix: "andr",
    bech32_config: {
      bech32PrefixAccAddr: "andr",
      bech32PrefixAccPub: "andrpub",
      bech32PrefixValAddr: "andrvaloper",
      bech32PrefixValPub: "andrvaloperpub",
      bech32PrefixConsAddr: "andrvalcons",
      bech32PrefixConsPub: "andrvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uandr",
          low_gas_price: 0.03,
          average_gas_price: 0.05,
          high_gas_price: 0.075,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uandr",
        },
      ],
      lock_duration: {
        time: "1814400s",
      },
    },
    apis: {
      rpc: [
        {
          address: "https://andromeda-rpc.polkachu.com/",
        },
      ],
      rest: [
        {
          address: "https://andromeda-api.polkachu.com/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.stavr.tech/Andromeda-Mainnet/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/andromeda/images/andromeda-logo.png",
      theme: {
        primary_color_hex: "#040404",
      },
    },
    features: ["cosmwasm", "wasmd_0.24+", "ibc-transfer", "ibc-go"],
    keplrChain: {
      rpc: "https://andromeda-rpc.polkachu.com/",
      rest: "https://andromeda-api.polkachu.com/",
      chainId: "andromeda-1",
      chainName: "andromeda",
      prettyChainName: "Andromeda",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "ANDR",
          coinMinimalDenom: "uandr",
          coinDecimals: 6,
          coinGeckoId: "andromeda-2",
          coinImageUrl: "/tokens/generated/andr.png",
          base: "ibc/631DB9935E8523BDCF76B55129F5238A14C809CCB3B43AECC157DC19702F3F9E",
          gasPriceStep: {
            low: 0.03,
            average: 0.05,
            high: 0.075,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "ANDR",
        coinMinimalDenom: "uandr",
        coinGeckoId: "andromeda-2",
        coinImageUrl: "/tokens/generated/andr.png",
        base: "ibc/631DB9935E8523BDCF76B55129F5238A14C809CCB3B43AECC157DC19702F3F9E",
      },
      feeCurrencies: [
        {
          coinDenom: "ANDR",
          coinMinimalDenom: "uandr",
          coinDecimals: 6,
          coinGeckoId: "andromeda-2",
          coinImageUrl: "/tokens/generated/andr.png",
          base: "ibc/631DB9935E8523BDCF76B55129F5238A14C809CCB3B43AECC157DC19702F3F9E",
          gasPriceStep: {
            low: 0.03,
            average: 0.05,
            high: 0.075,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "andr",
        bech32PrefixAccPub: "andrpub",
        bech32PrefixValAddr: "andrvaloper",
        bech32PrefixValPub: "andrvaloperpub",
        bech32PrefixConsAddr: "andrvalcons",
        bech32PrefixConsPub: "andrvalconspub",
      },
      explorerUrlToTx:
        "https://explorer.stavr.tech/Andromeda-Mainnet/tx/{txHash}",
      features: ["cosmwasm", "wasmd_0.24+", "ibc-transfer", "ibc-go"],
    },
  },
  {
    chain_name: "kimanetwork",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Kima Network",
    chain_id: "kima_network",
    bech32_prefix: "kima",
    bech32_config: {
      bech32PrefixAccAddr: "kima",
      bech32PrefixAccPub: "kimapub",
      bech32PrefixValAddr: "kimavaloper",
      bech32PrefixValPub: "kimavaloperpub",
      bech32PrefixConsAddr: "kimavalcons",
      bech32PrefixConsPub: "kimavalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uKIMA",
          fixed_min_gas_price: 0,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.05,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uKIMA",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.kima.network/",
        },
      ],
      rest: [
        {
          address: "https://api.kima.network/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.kima.network/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kimanetwork/images/kima.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kimanetwork/images/kima.svg",
    },
    features: ["ibc-go", "ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc.kima.network/",
      rest: "https://api.kima.network/",
      chainId: "kima_network",
      chainName: "kimanetwork",
      prettyChainName: "Kima Network",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "KIMA",
          coinMinimalDenom: "uKIMA",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/kima.svg",
          base: "ibc/629B5691DE993DCD07AA1B0587AD52A7FA4E8F28B77DE15BCBDF936CA6F76E6C",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.05,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "KIMA",
        coinMinimalDenom: "uKIMA",
        coinImageUrl: "/tokens/generated/kima.svg",
        base: "ibc/629B5691DE993DCD07AA1B0587AD52A7FA4E8F28B77DE15BCBDF936CA6F76E6C",
      },
      feeCurrencies: [
        {
          coinDenom: "KIMA",
          coinMinimalDenom: "uKIMA",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/kima.svg",
          base: "ibc/629B5691DE993DCD07AA1B0587AD52A7FA4E8F28B77DE15BCBDF936CA6F76E6C",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.05,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "kima",
        bech32PrefixAccPub: "kimapub",
        bech32PrefixValAddr: "kimavaloper",
        bech32PrefixValPub: "kimavaloperpub",
        bech32PrefixConsAddr: "kimavalcons",
        bech32PrefixConsPub: "kimavalconspub",
      },
      explorerUrlToTx: "https://explorer.kima.network/transactions/{txHash}",
      features: ["ibc-go", "ibc-transfer"],
    },
  },
  {
    chain_name: "stratos",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Stratos",
    chain_id: "stratos-1",
    bech32_prefix: "st",
    bech32_config: {
      bech32PrefixAccAddr: "st",
      bech32PrefixAccPub: "stpub",
      bech32PrefixValAddr: "stvaloper",
      bech32PrefixValPub: "stvaloperpub",
      bech32PrefixConsAddr: "stvalcons",
      bech32PrefixConsPub: "stvalconspub",
    },
    slip44: 606,
    fees: {
      fee_tokens: [
        {
          denom: "wei",
          low_gas_price: 1000000000,
          average_gas_price: 1200000000,
          high_gas_price: 1600000000,
        },
      ],
    },
    description:
      "STOS coin is the native token for the Stratos Blockchain. Stratos is a pioneering decentralized infrastructure service provider, revolutionizing AI and DePIN with advanced decentralized solutions in storage, computing, databases, and blockchain services. We empower Web 3.0 developpers and dApps through our scalable, reliable, and high-performance networks.",
    apis: {
      rpc: [
        {
          address: "https://rpc.thestratos.org",
        },
      ],
      rest: [
        {
          address: "https://rest.thestratos.org",
        },
      ],
    },
    explorers: [
      {
        tx_page:
          "https://explorer.thestratos.org/stratos/transactions/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stratos/images/stratos.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stratos/images/stratos.svg",
      theme: {
        primary_color_hex: "#04847c",
      },
    },
    features: ["ibc-go", "ibc-transfer", "eth-address-gen", "eth-key-sign"],
    keplrChain: {
      rpc: "https://rpc.thestratos.org",
      rest: "https://rest.thestratos.org",
      chainId: "stratos-1",
      chainName: "stratos",
      prettyChainName: "Stratos",
      bip44: {
        coinType: 606,
      },
      currencies: [
        {
          coinDenom: "STOS",
          coinMinimalDenom: "wei",
          coinDecimals: 18,
          coinGeckoId: "stratos",
          coinImageUrl: "/tokens/generated/stos.svg",
          base: "ibc/ABD49F44559CB3E557CC458459CB6A67CEBD66E23C7674A0B2B445230BDA1F6C",
          gasPriceStep: {
            low: 1000000000,
            average: 1200000000,
            high: 1600000000,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 0,
        coinDenom: "STAKE",
        coinMinimalDenom: "tempStakePlaceholder",
      },
      feeCurrencies: [
        {
          coinDenom: "STOS",
          coinMinimalDenom: "wei",
          coinDecimals: 18,
          coinGeckoId: "stratos",
          coinImageUrl: "/tokens/generated/stos.svg",
          base: "ibc/ABD49F44559CB3E557CC458459CB6A67CEBD66E23C7674A0B2B445230BDA1F6C",
          gasPriceStep: {
            low: 1000000000,
            average: 1200000000,
            high: 1600000000,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "st",
        bech32PrefixAccPub: "stpub",
        bech32PrefixValAddr: "stvaloper",
        bech32PrefixValPub: "stvaloperpub",
        bech32PrefixConsAddr: "stvalcons",
        bech32PrefixConsPub: "stvalconspub",
      },
      explorerUrlToTx:
        "https://explorer.thestratos.org/stratos/transactions/{txHash}",
      features: ["ibc-go", "ibc-transfer", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    chain_name: "pryzm",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Pryzm",
    chain_id: "pryzm-1",
    bech32_prefix: "pryzm",
    bech32_config: {
      bech32PrefixAccAddr: "pryzm",
      bech32PrefixAccPub: "pryzmpub",
      bech32PrefixValAddr: "pryzmvaloper",
      bech32PrefixValPub: "pryzmvaloperpub",
      bech32PrefixConsAddr: "pryzmvalcons",
      bech32PrefixConsPub: "pryzmvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          fixed_min_gas_price: 0.0025,
          low_gas_price: 0.0025,
          average_gas_price: 0.003,
          high_gas_price: 0.004,
        },
        {
          denom:
            "ibc/DE63D8AC34B752FB7D4CAA7594145EDE1C9FC256AC6D4043D0F12310EB8FC255",
          fixed_min_gas_price: 500000000,
          low_gas_price: 500000000,
          average_gas_price: 600000000,
          high_gas_price: 700000000,
        },
        {
          denom:
            "ibc/13B2C536BB057AC79D5616B8EA1B9540EC1F2170718CAFF6F0083C966FFFED0B",
          fixed_min_gas_price: 0.025,
          low_gas_price: 0.025,
          average_gas_price: 0.03,
          high_gas_price: 0.04,
        },
        {
          denom:
            "ibc/BF28D9C17E0306B194D50F51C3B2590BEAD15E04E03ADD34C3A26E62D85C9676",
          fixed_min_gas_price: 0.002,
          low_gas_price: 0.002,
          average_gas_price: 0.003,
          high_gas_price: 0.004,
        },
        {
          denom:
            "ibc/B8AF5D92165F35AB31F3FC7C7B444B9D240760FA5D406C49D24862BD0284E395",
          fixed_min_gas_price: 0.015,
          low_gas_price: 0.015,
          average_gas_price: 0.02,
          high_gas_price: 0.03,
        },
        {
          denom:
            "ibc/BFAAB7870A9AAABF64A7366DAAA0B8E5065EAA1FCE762F45677DC24BE796EF65",
          fixed_min_gas_price: 0.02,
          low_gas_price: 0.02,
          average_gas_price: 0.03,
          high_gas_price: 0.04,
        },
        {
          denom: "factory/pryzm1jnhcsa5ddjsjq2t97v6a82z542rduxvtw6wd9h/uauuu",
          fixed_min_gas_price: 0.01,
          low_gas_price: 0.01,
          average_gas_price: 0.015,
          high_gas_price: 0.02,
        },
        {
          denom:
            "ibc/F8CA5236869F819BC006EEF088E67889A26E4140339757878F0F4E229CDDA858",
          fixed_min_gas_price: 10000000000,
          low_gas_price: 10000000000,
          average_gas_price: 12000000000,
          high_gas_price: 14000000000,
        },
        {
          denom:
            "ibc/FA78980867B7E87F382CDA00275C55DDC248CABC7DEE27AC6868CCF97DD5E02F",
          fixed_min_gas_price: 0.002,
          low_gas_price: 0.002,
          average_gas_price: 0.003,
          high_gas_price: 0.004,
        },
        {
          denom:
            "ibc/120DC39B61CC121E91525C1D51624E41BBE74C537D7B0BE50BBFF9A00E37B6EE",
          fixed_min_gas_price: 10000000000,
          low_gas_price: 10000000000,
          average_gas_price: 12000000000,
          high_gas_price: 14000000000,
        },
        {
          denom:
            "ibc/EA6E1E8BA2EB9F681C4BD12C8C81A46530A62934F2BD561B120A00F46946CE87",
          fixed_min_gas_price: 0.0025,
          low_gas_price: 0.0025,
          average_gas_price: 0.003,
          high_gas_price: 0.004,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "upryzm",
        },
      ],
      lock_duration: {
        time: "1814400s",
      },
    },
    description: "Trade Your Future Yield, Today",
    apis: {
      rpc: [
        {
          address: "https://rpc.pryzm.zone",
        },
      ],
      rest: [
        {
          address: "https://api.pryzm.zone",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://chainsco.pe/pryzm/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pryzm/images/pryzm-logo.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pryzm/images/pryzm-logo.svg",
      theme: {
        primary_color_hex: "#141424",
      },
    },
    features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
    keplrChain: {
      rpc: "https://rpc.pryzm.zone",
      rest: "https://api.pryzm.zone",
      chainId: "pryzm-1",
      chainName: "pryzm",
      prettyChainName: "Pryzm",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "OSMO-YIELD-LP",
          coinMinimalDenom: "lp:8:uosmo:OSMO-YIELD-LP",
          contractAddress: "8",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/osmo-yield-lp.svg",
          base: "ibc/54B2D9DC9602A1CE2A0329D51C6A1C7C4ADE71477186AEAAA549318C4513A453",
        },
      ],
      stakeCurrency: {
        coinDecimals: 0,
        coinDenom: "STAKE",
        coinMinimalDenom: "tempStakePlaceholder",
      },
      feeCurrencies: [],
      bech32Config: {
        bech32PrefixAccAddr: "pryzm",
        bech32PrefixAccPub: "pryzmpub",
        bech32PrefixValAddr: "pryzmvaloper",
        bech32PrefixValPub: "pryzmvaloperpub",
        bech32PrefixConsAddr: "pryzmvalcons",
        bech32PrefixConsPub: "pryzmvalconspub",
      },
      explorerUrlToTx: "https://chainsco.pe/pryzm/tx/{txHash}",
      features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
    },
  },
  {
    chain_name: "int3face",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Int3face",
    chain_id: "int3face-1",
    bech32_prefix: "int3",
    bech32_config: {
      bech32PrefixAccAddr: "int3",
      bech32PrefixAccPub: "int3pub",
      bech32PrefixValAddr: "int3valoper",
      bech32PrefixValPub: "int3valoperpub",
      bech32PrefixConsAddr: "int3valcons",
      bech32PrefixConsPub: "int3valconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uint3",
          fixed_min_gas_price: 0.0025,
          low_gas_price: 0.0025,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uint3",
        },
      ],
    },
    description:
      "Int3face is a cross-chain bridge that connects the Cosmos ecosystem with other blockchains.",
    apis: {
      rpc: [
        {
          address: "https://rpc.mainnet.int3face.zone/",
        },
      ],
      rest: [
        {
          address: "https://api.mainnet.int3face.zone/",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.int3face.zone/int3face-1/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/int3face/images/int3.png",
      theme: {
        primary_color_hex: "#3d3d3d",
      },
    },
    features: ["ibc-go", "ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc.mainnet.int3face.zone/",
      rest: "https://api.mainnet.int3face.zone/",
      chainId: "int3face-1",
      chainName: "int3face",
      prettyChainName: "Int3face",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "INT3",
          coinMinimalDenom: "uint3",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/int3.png",
          base: "ibc/7D29C888219883C47C623578ACACFC89CC29AA70FBF09C895A1EED911BF90F32",
          gasPriceStep: {
            low: 0.0025,
            average: 0.025,
            high: 0.04,
          },
        },
        {
          coinDenom: "DOGE.int3",
          coinMinimalDenom:
            "factory/int31zlefkpe3g0vvm9a4h0jf9000lmqutlh99h7fsd/dogecoin-doge",
          coinDecimals: 8,
          coinImageUrl: "/tokens/generated/doge.int3.svg",
          base: "ibc/B3DFDC2958A2BE482532DA3B6B5729B469BE7475598F7487D98B1B3E085245DE",
        },
        {
          coinDenom: "BTC.int3",
          coinMinimalDenom:
            "factory/int31zlefkpe3g0vvm9a4h0jf9000lmqutlh99h7fsd/bitcoin-btc",
          coinDecimals: 8,
          coinImageUrl: "/tokens/generated/btc.int3.svg",
          base: "ibc/2F4258D6E1E01B203D6CA83F2C7E4959615053A21EC2C2FC196F7911CAC832EF",
        },
        {
          coinDenom: "BCH.int3",
          coinMinimalDenom:
            "factory/int31zlefkpe3g0vvm9a4h0jf9000lmqutlh99h7fsd/bitcoin-cash-bch",
          coinDecimals: 8,
          coinImageUrl: "/tokens/generated/bch.int3.svg",
          base: "ibc/869E01805EBBDDCAEA588666CD5149728B7DC7D69F30D92F77AD67F77CEB3FDA",
        },
        {
          coinDenom: "LTC.int3",
          coinMinimalDenom:
            "factory/int31zlefkpe3g0vvm9a4h0jf9000lmqutlh99h7fsd/litecoin-ltc",
          coinDecimals: 8,
          coinImageUrl: "/tokens/generated/ltc.int3.svg",
          base: "ibc/905326586AE1C86AC8B1CDB20BE957DE5FB23963EDD2C9ADD3E835CC22115A46",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "INT3",
        coinMinimalDenom: "uint3",
        coinImageUrl: "/tokens/generated/int3.png",
        base: "ibc/7D29C888219883C47C623578ACACFC89CC29AA70FBF09C895A1EED911BF90F32",
      },
      feeCurrencies: [
        {
          coinDenom: "INT3",
          coinMinimalDenom: "uint3",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/int3.png",
          base: "ibc/7D29C888219883C47C623578ACACFC89CC29AA70FBF09C895A1EED911BF90F32",
          gasPriceStep: {
            low: 0.0025,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "int3",
        bech32PrefixAccPub: "int3pub",
        bech32PrefixValAddr: "int3valoper",
        bech32PrefixValPub: "int3valoperpub",
        bech32PrefixConsAddr: "int3valcons",
        bech32PrefixConsPub: "int3valconspub",
      },
      explorerUrlToTx: "https://explorer.int3face.zone/int3face-1/tx/{txHash}",
      features: ["ibc-go", "ibc-transfer"],
    },
  },
  {
    chain_name: "mantrachain",
    status: "live",
    network_type: "mainnet",
    pretty_name: "MANTRA",
    chain_id: "mantra-1",
    bech32_prefix: "mantra",
    bech32_config: {
      bech32PrefixAccAddr: "mantra",
      bech32PrefixAccPub: "mantrapub",
      bech32PrefixValAddr: "mantravaloper",
      bech32PrefixValPub: "mantravaloperpub",
      bech32PrefixConsAddr: "mantravalcons",
      bech32PrefixConsPub: "mantravalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uom",
          fixed_min_gas_price: 0.01,
          low_gas_price: 0.01,
          average_gas_price: 0.02,
          high_gas_price: 0.03,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uom",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc.mantrachain.io",
        },
      ],
      rest: [
        {
          address: "https://api.mantrachain.io",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/mantra/txs/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/mantrachain/images/OM-Prim-Col.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/mantrachain/images/OM-Prim-Col.svg",
      theme: {
        circle: true,
        primary_color_hex: "#fba0c1",
      },
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc.mantrachain.io",
      rest: "https://api.mantrachain.io",
      chainId: "mantra-1",
      chainName: "mantrachain",
      prettyChainName: "MANTRA",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "OM",
          coinMinimalDenom: "uom",
          coinDecimals: 6,
          coinGeckoId: "mantra-dao",
          coinImageUrl: "/tokens/generated/om.svg",
          base: "ibc/164807F6226F91990F358C6467EEE8B162E437BDCD3DADEC3F0CE20693720795",
          gasPriceStep: {
            low: 0.01,
            average: 0.02,
            high: 0.03,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "OM",
        coinMinimalDenom: "uom",
        coinGeckoId: "mantra-dao",
        coinImageUrl: "/tokens/generated/om.svg",
        base: "ibc/164807F6226F91990F358C6467EEE8B162E437BDCD3DADEC3F0CE20693720795",
      },
      feeCurrencies: [
        {
          coinDenom: "OM",
          coinMinimalDenom: "uom",
          coinDecimals: 6,
          coinGeckoId: "mantra-dao",
          coinImageUrl: "/tokens/generated/om.svg",
          base: "ibc/164807F6226F91990F358C6467EEE8B162E437BDCD3DADEC3F0CE20693720795",
          gasPriceStep: {
            low: 0.01,
            average: 0.02,
            high: 0.03,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "mantra",
        bech32PrefixAccPub: "mantrapub",
        bech32PrefixValAddr: "mantravaloper",
        bech32PrefixValPub: "mantravaloperpub",
        bech32PrefixConsAddr: "mantravalcons",
        bech32PrefixConsPub: "mantravalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/mantra/txs/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "atomone",
    status: "live",
    network_type: "mainnet",
    pretty_name: "AtomOne",
    chain_id: "atomone-1",
    bech32_prefix: "atone",
    bech32_config: {
      bech32PrefixAccAddr: "atone",
      bech32PrefixAccPub: "atonepub",
      bech32PrefixValAddr: "atonevaloper",
      bech32PrefixValPub: "atonevaloperpub",
      bech32PrefixConsAddr: "atonevalcons",
      bech32PrefixConsPub: "atonevalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uatone",
          fixed_min_gas_price: 0.001,
          low_gas_price: 0.006,
          average_gas_price: 0.006,
          high_gas_price: 0.009,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uatone",
        },
      ],
    },
    description:
      "The Cosmos community, at a crossroads, confronts divergent views on key aspects such as mission, tokenomics, and security philosophy. AtomOne emerges as a beacon, offering an alternative fork to navigate these waters, equipped to handle contingencies and embodying a bastion for diverse political thought.",
    apis: {
      rpc: [
        {
          address: "https://atomone-rpc.allinbits.com",
        },
      ],
      rest: [
        {
          address: "https://atomone-grpc.allinbits.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.allinbits.com/atomone/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/atomone/images/atomone.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/atomone/images/atomone.svg",
    },
    features: ["ibc-transfer"],
    keplrChain: {
      rpc: "https://atomone-rpc.allinbits.com",
      rest: "https://atomone-grpc.allinbits.com",
      chainId: "atomone-1",
      chainName: "atomone",
      prettyChainName: "AtomOne",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "ATONE",
          coinMinimalDenom: "uatone",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/atone.svg",
          base: "ibc/715283E4A955EB803AB1DD30B488587A4D63BF0B51BADA537053DEE479BA10D6",
          gasPriceStep: {
            low: 0.006,
            average: 0.006,
            high: 0.009,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "ATONE",
        coinMinimalDenom: "uatone",
        coinImageUrl: "/tokens/generated/atone.svg",
        base: "ibc/715283E4A955EB803AB1DD30B488587A4D63BF0B51BADA537053DEE479BA10D6",
      },
      feeCurrencies: [
        {
          coinDenom: "ATONE",
          coinMinimalDenom: "uatone",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/atone.svg",
          base: "ibc/715283E4A955EB803AB1DD30B488587A4D63BF0B51BADA537053DEE479BA10D6",
          gasPriceStep: {
            low: 0.006,
            average: 0.006,
            high: 0.009,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "atone",
        bech32PrefixAccPub: "atonepub",
        bech32PrefixValAddr: "atonevaloper",
        bech32PrefixValPub: "atonevaloperpub",
        bech32PrefixConsAddr: "atonevalcons",
        bech32PrefixConsPub: "atonevalconspub",
      },
      explorerUrlToTx: "https://explorer.allinbits.com/atomone/tx/{txHash}",
      features: ["ibc-transfer"],
    },
  },
  {
    chain_name: "dungeon",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Dungeon Chain",
    chain_id: "dungeon-1",
    bech32_prefix: "dungeon",
    bech32_config: {
      bech32PrefixAccAddr: "dungeon",
      bech32PrefixAccPub: "dungeonpub",
      bech32PrefixValAddr: "dungeonvaloper",
      bech32PrefixValPub: "dungeonvaloperpub",
      bech32PrefixConsAddr: "dungeonvalcons",
      bech32PrefixConsPub: "dungeonvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "udgn",
          fixed_min_gas_price: 0,
          low_gas_price: 0,
          average_gas_price: 0,
          high_gas_price: 0.001,
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc-dungeonchain.apeironnodes.com",
        },
      ],
      rest: [
        {
          address: "https://api-dungeonchain.apeironnodes.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/Dungeonchain/tx/{txHash}",
      },
    ],
    features: ["ibc-go", "ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc-dungeonchain.apeironnodes.com",
      rest: "https://api-dungeonchain.apeironnodes.com",
      chainId: "dungeon-1",
      chainName: "dungeon",
      prettyChainName: "Dungeon Chain",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "DGN",
          coinMinimalDenom: "udgn",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/dgn.png",
          base: "ibc/3B95D63B520C283BCA86F8CD426D57584039463FD684A5CBA31D2780B86A1995",
        },
      ],
      stakeCurrency: {
        coinDecimals: 0,
        coinDenom: "STAKE",
        coinMinimalDenom: "tempStakePlaceholder",
      },
      feeCurrencies: [
        {
          coinDenom: "DGN",
          coinMinimalDenom: "udgn",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/dgn.png",
          base: "ibc/3B95D63B520C283BCA86F8CD426D57584039463FD684A5CBA31D2780B86A1995",
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "dungeon",
        bech32PrefixAccPub: "dungeonpub",
        bech32PrefixValAddr: "dungeonvaloper",
        bech32PrefixValPub: "dungeonvaloperpub",
        bech32PrefixConsAddr: "dungeonvalcons",
        bech32PrefixConsPub: "dungeonvalconspub",
      },
      explorerUrlToTx: "https://ping.pub/Dungeonchain/tx/{txHash}",
      features: ["ibc-go", "ibc-transfer"],
    },
  },
  {
    chain_name: "synternet",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Synternet",
    chain_id: "synternet-1",
    bech32_prefix: "synt",
    bech32_config: {
      bech32PrefixAccAddr: "synt",
      bech32PrefixAccPub: "syntpub",
      bech32PrefixValAddr: "syntvaloper",
      bech32PrefixValPub: "syntvaloperpub",
      bech32PrefixConsAddr: "syntvalcons",
      bech32PrefixConsPub: "syntvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "usynt",
          fixed_min_gas_price: 0.01,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.03,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "usynt",
        },
      ],
    },
    description:
      "Synternet is the backbone of the Data Layer, a protocol serving as the customizable execution layer between all blockchains. It enables builders to See, Interpret and Act on any data from any chain, supercharging their applications.",
    apis: {
      rpc: [
        {
          address: "https://rpc.synternet.com",
        },
      ],
      rest: [
        {
          address: "https://api.synternet.com",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://ping.pub/synternet/tx/{txHash}",
      },
    ],
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/synternet/images/synt.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/synternet/images/synt.svg",
      theme: {
        primary_color_hex: "#272d45",
      },
    },
    features: ["ibc-go", "ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc.synternet.com",
      rest: "https://api.synternet.com",
      chainId: "synternet-1",
      chainName: "synternet",
      prettyChainName: "Synternet",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "SYNT",
          coinMinimalDenom: "usynt",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/synt.svg",
          base: "ibc/1B454982D3746951510D3845145B83628D4ED380D95722C8077776C4689F973A",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "SYNT",
        coinMinimalDenom: "usynt",
        coinImageUrl: "/tokens/generated/synt.svg",
        base: "ibc/1B454982D3746951510D3845145B83628D4ED380D95722C8077776C4689F973A",
      },
      feeCurrencies: [
        {
          coinDenom: "SYNT",
          coinMinimalDenom: "usynt",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/synt.svg",
          base: "ibc/1B454982D3746951510D3845145B83628D4ED380D95722C8077776C4689F973A",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "synt",
        bech32PrefixAccPub: "syntpub",
        bech32PrefixValAddr: "syntvaloper",
        bech32PrefixValPub: "syntvaloperpub",
        bech32PrefixConsAddr: "syntvalcons",
        bech32PrefixConsPub: "syntvalconspub",
      },
      explorerUrlToTx: "https://ping.pub/synternet/tx/{txHash}",
      features: ["ibc-go", "ibc-transfer"],
    },
  },
];

export type MainnetChainIds =
  | "osmosis-1" /** osmosis */
  | "cosmoshub-4" /** cosmoshub */
  | "columbus-5" /** terra */
  | "secret-4" /** secretnetwork */
  | "akashnet-2" /** akash */
  | "regen-1" /** regen */
  | "sentinelhub-2" /** sentinel */
  | "core-1" /** persistence */
  | "irishub-1" /** irisnet */
  | "crypto-org-chain-mainnet-1" /** cryptoorgchain */
  | "iov-mainnet-ibc" /** starname */
  | "emoney-3" /** emoney */
  | "juno-1" /** juno */
  | "microtick-1" /** microtick */
  | "likecoin-mainnet-2" /** likecoin */
  | "ixo-5" /** impacthub */
  | "bitcanna-1" /** bitcanna */
  | "bitsong-2b" /** bitsong */
  | "kichain-2" /** kichain */
  | "panacea-3" /** panacea */
  | "bostrom" /** bostrom */
  | "comdex-1" /** comdex */
  | "cheqd-mainnet-1" /** cheqd */
  | "stargaze-1" /** stargaze */
  | "chihuahua-1" /** chihuahua */
  | "lum-network-1" /** lumnetwork */
  | "vidulum-1" /** vidulum */
  | "desmos-mainnet" /** desmos */
  | "dig-1" /** dig */
  | "sommelier-3" /** sommelier */
  | "sifchain-1" /** sifchain */
  | "laozi-mainnet" /** bandchain */
  | "darchub" /** konstellation */
  | "umee-1" /** umee */
  | "gravity-bridge-3" /** gravitybridge */
  | "mainnet-3" /** decentr */
  | "shentu-2.2" /** shentu */
  | "carbon-1" /** carbon */
  | "injective-1" /** injective */
  | "cerberus-chain-1" /** cerberus */
  | "fetchhub-4" /** fetchhub */
  | "mantle-1" /** assetmantle */
  | "pio-mainnet-1" /** provenance */
  | "galaxy-1" /** galaxy */
  | "meme-1" /** meme */
  | "evmos_9001-2" /** evmos */
  | "phoenix-1" /** terra2 */
  | "titan-1" /** rizon */
  | "kava_2222-10" /** kava */
  | "genesis_29-2" /** genesisl1 */
  | "kaiyo-1" /** kujira */
  | "tgrade-mainnet-1" /** tgrade */
  | "echelon_3000-3" /** echelon */
  | "odin-mainnet-freya" /** odin */
  | "crescent-1" /** crescent */
  | "LumenX" /** lumenx */
  | "Oraichain" /** oraichain */
  | "cudos-1" /** cudos */
  | "agoric-3" /** agoric */
  | "stride-1" /** stride */
  | "reb_1111-1" /** rebus */
  | "teritori-1" /** teritori */
  | "lambda_92000-1" /** lambda */
  | "FUND-MainNet-2" /** unification */
  | "jackal-1" /** jackal */
  | "beezee-1" /** beezee */
  | "acre_9052-1" /** acrechain */
  | "imversed_5555555-1" /** imversed */
  | "medasdigital-2" /** medasdigital */
  | "onomy-mainnet-1" /** onomy */
  | "planq_7070-2" /** planq */
  | "dyson-mainnet-01" /** dyson */
  | "mars-1" /** mars */
  | "canto_7700-1" /** canto */
  | "quicksilver-2" /** quicksilver */
  | "eightball-1" /** 8ball */
  | "arkh" /** arkh */
  | "noble-1" /** noble */
  | "migaloo-1" /** migaloo */
  | "omniflixhub-1" /** omniflixhub */
  | "axelar-dojo-1" /** axelar */
  | "bluzelle-9" /** bluzelle */
  | "gitopia" /** gitopia */
  | "pirin-1" /** nolus */
  | "neutron-1" /** neutron */
  | "centauri-1" /** composable */
  | "realionetwork_3301-1" /** realio */
  | "quasar-1" /** quasar */
  | "archway-1" /** archway */
  | "empowerchain-1" /** empowerchain */
  | "kyve-1" /** kyve */
  | "pacific-1" /** sei */
  | "passage-2" /** passage */
  | "wormchain" /** gateway */
  | "dimension_37-1" /** xpla */
  | "sgenet-1" /** sge */
  | "stafihub-1" /** stafihub */
  | "vota-ash" /** doravota */
  | "coreum-mainnet-1" /** coreum */
  | "celestia" /** celestia */
  | "dydx-mainnet-1" /** dydx */
  | "fxcore" /** fxcore */
  | "nomic-stakenet-3" /** nomic */
  | "nois-1" /** nois */
  | "qwoyn-1" /** qwoyn */
  | "source-1" /** source */
  | "haqq_11235-1" /** haqq */
  | "PUNDIX" /** pundix */
  | "nyx" /** nyx */
  | "dymension_1100-1" /** dymension */
  | "humans_1089-1" /** humans */
  | "scorum-1" /** scorum */
  | "perun-1" /** chain4energy */
  | "pylons-mainnet-1" /** pylons */
  | "aioz_168-1" /** aioz */
  | "cataclysm-1" /** nibiru */
  | "cvn_2032-1" /** conscious */
  | "dhealth" /** dhealth */
  | "furya-1" /** furya */
  | "ssc-1" /** saga */
  | "shido_9008-1" /** shido */
  | "cifer-2" /** cifer */
  | "seda-1" /** seda */
  | "Neutaro-1" /** neutaro */
  | "colosseum-1" /** firmachain */
  | "lava-mainnet-1" /** lava */
  | "router_9600-1" /** routerchain */
  | "lorenzo_8329-1" /** lorenzo */
  | "andromeda-1" /** andromeda */
  | "kima_network" /** kimanetwork */
  | "stratos-1" /** stratos */
  | "pryzm-1" /** pryzm */
  | "int3face-1" /** int3face */
  | "mantra-1" /** mantrachain */
  | "atomone-1" /** atomone */
  | "dungeon-1" /** dungeon */
  | "synternet-1" /** synternet */;
export type TestnetChainIds =
  | "osmo-test-5" /** osmosistestnet */
  | "theta-testnet-001" /** cosmoshubtestnet */
  | "uni-6" /** junotestnet */
  | "ares-1" /** marstestnet */
  | "axelar-testnet-lisbon-3" /** axelartestnet */
  | "grand-1" /** nobletestnet */
  | "sandbox-01" /** akashtestnet */
  | "kaon-1" /** kyvetestnet */
  | "rhye-2" /** quicksilvertestnet */
  | "babajaga-1" /** chain4energytestnet */
  | "banksy-testnet-3" /** composabletestnet */
  | "test-core-2" /** persistencetestnet2 */
  | "xion-testnet-1" /** xiontestnet */
  | "ssc-testnet-1" /** sagatestnet */
  | "pandora-8" /** impacthubtestnet */
  | "constantine-3" /** archwaytestnet */
  | "symphony-testnet-3" /** symphonytestnet */
  | "kima_testnet" /** kimanetworktestnet */
  | "nomic-testnet-6" /** nomictestnet */;
