import type { AssetList } from "@osmosis-labs/types";
export const AssetLists: AssetList[] = [
  {
    chain_name: "osmosis",
    chain_id: "osmosis-1",
    assets: [
      {
        chainName: "osmosis",
        sourceDenom: "uosmo",
        coinMinimalDenom: "uosmo",
        symbol: "OSMO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg",
        },
        coingeckoId: "osmosis",
        price: {
          poolId: "1263",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [],
        counterparty: [],
        name: "Osmosis",
        description:
          "The native token of Osmosis\n\nOsmosis (OSMO) is the premier DEX and cross-chain DeFi hub within the Cosmos ecosystem, a network of over 50 sovereign, interoperable blockchains seamlessly connected through the Inter-Blockchain Communication Protocol (IBC). Pioneering in its approach, Osmosis offers a dynamic trading and liquidity provision experience, integrating non-IBC assets from other ecosystems, including Ethereum, Solana, Avalanche, and Polkadot. Initially adopting Balancer-style pools, Osmosis now also features a concentrated liquidity model that is orders of magnitude more capital efficient, meaning that significantly less liquidity is required to handle the same amount of trading volume with minimal slippage.\n\nAs a true appchain, Osmosis has greater control over the full blockchain stack than traditional smart contract DEXs, which must follow the code of the parent chain that it is built on. This fine-grained control has enabled, for example, the development of Superfluid Staking, an extension of Proof of Stake that allows assets at the application layer to be staked to secure the chain. The customizability of appchains also allows implementing features like the Protocol Revenue module, which enables Osmosis to conduct on-chain arbitrage on behalf of OSMO stakers, balancing prices across pools while generating real yield revenue from this volume. Additionally, as a sovereign appchain, Osmosis governance can vote on upgrades to the protocol. One example of this was the introduction of a Taker Fee, which switched on the collection of exchange fees to generate diverse yield from Osmosis volume and distribute it to OSMO stakers.\n\nOsmosis is bringing the full centralized exchange experience to the decentralized world by building a cross-chain native DEX and trading suite that connects all chains over IBC, including Ethereum and Bitcoin. To reach this goal, Osmosis hosts an ever-expanding suite of DeFi applications aimed at providing a one-stop experience that includes lending, credit, margin, DeFi strategy vaults, power perps, fiat on-ramps, NFTs, stablecoins, and more — all of the functionalities that centralized exchange offer and more, in the trust-minimized environment of decentralized finance.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/osmosiszone",
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
          },
        ],
        relative_image_url: "/tokens/generated/osmo.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom: "uion",
        coinMinimalDenom: "uion",
        symbol: "ION",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ion.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ion.svg",
        },
        coingeckoId: "ion",
        price: {
          poolId: "2",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [],
        counterparty: [],
        name: "Ion DAO",
        description: "",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/_IONDAO",
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
          },
        ],
        relative_image_url: "/tokens/generated/ion.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
        coinMinimalDenom:
          "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
        symbol: "IBCX",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ibcx.svg",
        },
        coingeckoId: "ibc-index",
        price: {
          poolId: "1254",
          denom:
            "ibc/D3B574938631B0A1BA704879020C696E514CFADAA7643CDE4BD5EB010BDE327B",
        },
        categories: ["defi"],
        transferMethods: [],
        counterparty: [],
        name: "IBC Index",
        description: "",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
          },
        ],
        relative_image_url: "/tokens/generated/ibcx.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
        coinMinimalDenom:
          "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
        symbol: "stIBCX",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/stibcx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/stibcx.svg",
        },
        price: {
          poolId: "1107",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [],
        counterparty: [],
        name: "Staked IBCX",
        description: "",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
          },
        ],
        relative_image_url: "/tokens/generated/stibcx.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
        coinMinimalDenom:
          "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
        symbol: "ampOSMO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/amposmo.png",
        },
        price: {
          poolId: "1067",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "ERIS Amplified OSMO",
        description: "ERIS liquid staked OSMO",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
          },
        ],
        relative_image_url: "/tokens/generated/amposmo.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
        coinMinimalDenom:
          "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
        symbol: "CDT",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/CDT.svg",
        },
        coingeckoId: "collateralized-debt-token",
        price: {
          poolId: "1268",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "collateralized",
        transferMethods: [],
        counterparty: [],
        name: "CDT Stablecoin",
        description: "Membrane's CDP-style stablecoin called CDT",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
          },
        ],
        relative_image_url: "/tokens/generated/cdt.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
        coinMinimalDenom:
          "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
        symbol: "MBRN",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/MBRN.svg",
        },
        coingeckoId: "membrane",
        price: {
          poolId: "1225",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [],
        counterparty: [],
        name: "Membrane",
        description: "Membrane's protocol token",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
          },
        ],
        relative_image_url: "/tokens/generated/mbrn.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
        coinMinimalDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
        symbol: "sqOSMO",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sqosmo.svg",
        },
        price: {
          poolId: "1267",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [],
        counterparty: [],
        name: "OSMO Squared",
        description: "Margined Power Token sqOSMO",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
          },
        ],
        relative_image_url: "/tokens/generated/sqosmo.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
        coinMinimalDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
        symbol: "sqATOM",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sqatom.svg",
        },
        price: {
          poolId: "1299",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["defi"],
        transferMethods: [],
        counterparty: [],
        name: "ATOM Squared",
        description: "Margined Power Token sqATOM",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          },
        ],
        relative_image_url: "/tokens/generated/sqatom.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc",
        coinMinimalDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc",
        symbol: "sqBTC",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sqbtc.svg",
        },
        categories: ["defi"],
        transferMethods: [],
        counterparty: [],
        name: "BTC Squared",
        description: "Margined Power Token sqBTC",
        verified: true,
        unstable: false,
        disabled: false,
        preview: true,
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          },
        ],
        relative_image_url: "/tokens/generated/sqbtc.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1mlng7pz4pnyxtpq0akfwall37czyk9lukaucsrn30ameplhhshtqdvfm5c/ulvn",
        coinMinimalDenom:
          "factory/osmo1mlng7pz4pnyxtpq0akfwall37czyk9lukaucsrn30ameplhhshtqdvfm5c/ulvn",
        symbol: "LVN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/levana.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/levana.svg",
        },
        coingeckoId: "levana-protocol",
        price: {
          poolId: "1337",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [],
        counterparty: [],
        name: "Levana",
        description: "Levana native token",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          },
        ],
        relative_image_url: "/tokens/generated/lvn.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
        coinMinimalDenom:
          "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
        symbol: "milkTIA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/milktia.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/milktia.svg",
        },
        coingeckoId: "milkyway-staked-tia",
        price: {
          poolId: "1335",
          denom:
            "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [],
        counterparty: [],
        name: "milkTIA",
        description: "MilkyWay's liquid staked TIA",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "celestia",
            sourceDenom: "utia",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          },
        ],
        relative_image_url: "/tokens/generated/milktia.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
        coinMinimalDenom:
          "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
        symbol: "WBTC",
        decimals: 8,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.svg",
        },
        price: {
          poolId: "1422",
          denom:
            "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [
          {
            chainName: "ethereum",
            sourceDenom: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            chainType: "evm",
            chainId: 1,
            address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            symbol: "WBTC",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.svg",
            },
          },
          {
            chainName: "bitcoin",
            sourceDenom: "sat",
            chainType: "non-cosmos",
            symbol: "BTC",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/bitcoin/images/btc.png",
            },
          },
        ],
        variantGroupKey: "BTC",
        name: "Wrapped Bitcoin",
        description: "",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-29T09:57:00.000Z",
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "nomic",
            sourceDenom: "usat",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "ugraviton",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
        ],
        relative_image_url: "/tokens/generated/wbtc.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
        coinMinimalDenom:
          "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
        symbol: "WOSMO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/wosmo.png",
        },
        price: {
          poolId: "1408",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "WOSMO",
        description:
          "The first native memecoin on Osmosis. Crafted by the deftest of hands in the lab of lunacy. It's scientifically anarchic, professionally foolish, and your ticket to the madhouse.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-22T15:42:00.000Z",
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          },
        ],
        relative_image_url: "/tokens/generated/wosmo.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqtia",
        coinMinimalDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqtia",
        symbol: "sqTIA",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sqtia.svg",
        },
        price: {
          poolId: "1378",
          denom:
            "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
        },
        categories: ["defi"],
        transferMethods: [],
        counterparty: [],
        name: "TIA Squared",
        description: "Margined Power Token sqTIA",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-19T15:51:00.000Z",
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          },
        ],
        relative_image_url: "/tokens/generated/sqtia.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1279xudevmf5cw83vkhglct7jededp86k90k2le/RAPTR",
        coinMinimalDenom:
          "factory/osmo1279xudevmf5cw83vkhglct7jededp86k90k2le/RAPTR",
        symbol: "RAPTR",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/RAPTR.png",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "RAPTR",
        description:
          "Rapture insurance is the first ever P2P insurance platform on $OSMO. Get rewarded to take care of peoples loved ones after the Rapture.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          },
        ],
        relative_image_url: "/tokens/generated/raptr.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo10n8rv8npx870l69248hnp6djy6pll2yuzzn9x8/BADKID",
        coinMinimalDenom:
          "factory/osmo10n8rv8npx870l69248hnp6djy6pll2yuzzn9x8/BADKID",
        symbol: "BADKID",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/badkid.png",
        },
        price: {
          poolId: "1470",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "BADKID",
        description:
          "A clan of 11y bad kids crafting chaos on the Cosmos eco. One bad memecoin to rule them all  $BADKID. Airdropped to Badkids NFT holders and $STARS stakers. It's so bad, your wallet's throwing a tantrum for it.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        tooltipMessage:
          "This asset is NOT affiliated with the Bad Kids NFT collection.",
        listingDate: "2024-02-13T21:32:00.000Z",
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          },
        ],
        relative_image_url: "/tokens/generated/badkid.png",
      },
    ],
  },
];
