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
          poolId: "1430",
          denom:
            "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
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
          poolId: "1325",
          denom: "uosmo",
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
          poolId: "1436",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
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
  {
    chain_name: "axelar",
    chain_id: "axelar-dojo-1",
    assets: [
      {
        chainName: "axelar",
        sourceDenom: "uusdc",
        coinMinimalDenom:
          "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        symbol: "USDC.axl",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdc.axl.svg",
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdc.axl.png",
        },
        coingeckoId: "axlusdc",
        categories: ["stablecoin", "defi"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Axelar Bridge",
            type: "integrated_bridge",
            counterparty: [
              {
                unwrappedAssetId: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                evmChainId: 1,
                sourceChainId: "Ethereum",
              },
              {
                unwrappedAssetId: "0xfab550568C688d5d8a52c7d794cb93edc26ec0ec",
                evmChainId: 43114,
                sourceChainId: "Avalanche",
              },
              {
                unwrappedAssetId: "0xca01a1d0993565291051daff390892518acfad3a",
                evmChainId: 1284,
                sourceChainId: "Moonbeam",
              },
              {
                unwrappedAssetId: "0x750e4c4984a9e0f12978ea6742bc1c5d248f40ed",
                evmChainId: 137,
                sourceChainId: "Polygon",
              },
            ],
            unwrappedAssetId: "uusdc",
          },
          {
            name: "Satellite",
            type: "external_interface",
            depositUrl:
              "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=uusdc",
            withdrawUrl:
              "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=uusdc",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "uusdc",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/uusdc",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdc.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            chainType: "evm",
            chainId: 1,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
        ],
        variantGroupKey: "USDC",
        name: "USD Coin (Axelar)",
        description: "Circle's stablecoin on Axelar",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
          },
          {
            chainName: "axelar",
            sourceDenom: "polygon-uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "avalanche-uusdc",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
        ],
        relative_image_url: "/tokens/generated/usdc.axl.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "weth-wei",
        coinMinimalDenom:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        symbol: "ETH",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
        },
        coingeckoId: "ethereum",
        price: {
          poolId: "1134",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Axelar Bridge",
            type: "integrated_bridge",
            counterparty: [
              {
                wrappedAssetId: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                unwrappedAssetId: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                evmChainId: 1,
                sourceChainId: "Ethereum",
              },
            ],
            wrappedAssetId: "weth-wei",
            unwrappedAssetId: "eth",
          },
          {
            name: "Satellite",
            type: "external_interface",
            depositUrl:
              "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=weth-wei",
            withdrawUrl:
              "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=weth-wei",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "weth-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/weth-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "WETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/weth.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            chainType: "evm",
            chainId: 1,
            address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            symbol: "WETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/weth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "wei",
            chainType: "evm",
            chainId: 1,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "ETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg",
            },
          },
        ],
        variantGroupKey: "ETH",
        name: "Ether",
        description:
          "Ethereum (ETH) is a decentralized, open-source blockchain system featuring smart contract functionality. It's the native cryptocurrency of the Ethereum platform, often regarded as the second most popular digital currency after Bitcoin. Ethereum was proposed in late 2013 and development was crowdfunded in 2014, leading to its network going live on 30 July 2015.\n\nETH, as a digital currency, is used for a variety of purposes within the Ethereum ecosystem, including the execution of decentralized smart contracts and as a mode of payment. Unlike Bitcoin, Ethereum was designed to be a platform for applications that can operate without the need for intermediaries, using blockchain technology. This has made Ethereum a leading platform for various applications, including decentralized finance (DeFi), non-fungible tokens (NFTs), and more. Ethereum is constantly evolving, with a significant upgrade termed Ethereum 2.0, which aims to improve its scalability, security, and sustainability.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
        ],
        relative_image_url: "/tokens/generated/eth.png",
      },
      {
        chainName: "axelar",
        sourceDenom: "wbtc-satoshi",
        coinMinimalDenom:
          "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
        symbol: "WBTC.axl",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/wbtc.axl.svg",
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/wbtc.axl.png",
        },
        price: {
          poolId: "1422",
          denom:
            "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wbtc-satoshi",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wbtc-satoshi",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "WBTC",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/wbtc.png",
            },
          },
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
        ],
        variantGroupKey: "WBTC",
        name: "Wrapped Bitcoin (Axelar)",
        description: "Wrapped Bitcoin on Axelar",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "axelar",
          sourceDenom: "uaxl",
        },
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          },
          {
            chainName: "nomic",
            sourceDenom: "usat",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
        ],
        relative_image_url: "/tokens/generated/wbtc.axl.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "uusdt",
        coinMinimalDenom:
          "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4",
        symbol: "USDT.axl",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdt.axl.svg",
        },
        price: {
          poolId: "1150",
          denom:
            "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "uusdt",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/uusdt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdt.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            chainType: "evm",
            chainId: 1,
            address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
        ],
        variantGroupKey: "USDT",
        name: "Tether USD (Axelar)",
        description: "Tether's USD stablecoin on Axelar",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "axelar",
          sourceDenom: "uaxl",
        },
        relatedAssets: [
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
          },
          {
            chainName: "kava",
            sourceDenom: "ukava",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
        ],
        relative_image_url: "/tokens/generated/usdt.axl.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "dai-wei",
        coinMinimalDenom:
          "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
        symbol: "DAI",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/dai.svg",
        },
        coingeckoId: "dai",
        price: {
          poolId: "1260",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "dai-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/dai-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "DAI",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/dai.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/dai.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x6b175474e89094c44da98b954eedeac495271d0f",
            chainType: "evm",
            chainId: 1,
            address: "0x6b175474e89094c44da98b954eedeac495271d0f",
            symbol: "DAI",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/dai.svg",
            },
          },
        ],
        variantGroupKey: "DAI",
        name: "Dai Stablecoin",
        description:
          "Multi-Collateral Dai, brings a lot of new and exciting features, such as support for new CDP collateral types and Dai Savings Rate.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
        ],
        relative_image_url: "/tokens/generated/dai.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "busd-wei",
        coinMinimalDenom:
          "ibc/6329DD8CF31A334DD5BE3F68C846C9FE313281362B37686A62343BAC1EB1546D",
        symbol: "BUSD",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/busd.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/busd.svg",
        },
        coingeckoId: "binance-usd",
        price: {
          poolId: "877",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "busd-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/busd-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "BUSD",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/busd.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
            chainType: "evm",
            chainId: 1,
            address: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
            symbol: "BUSD",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/busd.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/busd.svg",
            },
          },
        ],
        variantGroupKey: "BUSD",
        name: "Binance USD",
        description:
          "Binance USD (BUSD) is a dollar-backed stablecoin issued and custodied by Paxos Trust Company, and regulated by the New York State Department of Financial Services. BUSD is available directly for sale 1:1 with USD on Paxos.com and will be listed for trading on Binance.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
        ],
        relative_image_url: "/tokens/generated/busd.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "wbnb-wei",
        coinMinimalDenom:
          "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
        symbol: "BNB",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/bnb.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/bnb.svg",
        },
        coingeckoId: "binancecoin",
        price: {
          poolId: "840",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wbnb-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wbnb-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "WBNB",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/wbnb.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/wbnb.svg",
            },
          },
          {
            chainName: "binancesmartchain",
            sourceDenom: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            chainType: "evm",
            chainId: 56,
            address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            symbol: "WBNB",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/wbnb.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/wbnb.svg",
            },
          },
          {
            chainName: "binancesmartchain",
            sourceDenom: "wei",
            chainType: "evm",
            chainId: 56,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "BNB",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/bnb.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/bnb.svg",
            },
          },
        ],
        variantGroupKey: "BNB",
        name: "Binance Coin",
        description:
          "BNB powers the BNB Chain ecosystem and is the native coin of the BNB Beacon Chain and BNB Smart Chain.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "dot-planck",
          },
        ],
        relative_image_url: "/tokens/generated/bnb.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "wmatic-wei",
        coinMinimalDenom:
          "ibc/AB589511ED0DD5FA56171A39978AFBF1371DB986EC1C3526CE138A16377E39BB",
        symbol: "MATIC",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/matic-purple.png",
        },
        coingeckoId: "matic-network",
        price: {
          poolId: "789",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wmatic-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wmatic-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "WMATIC",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/wmatic.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/wmatic.svg",
            },
          },
          {
            chainName: "polygon",
            sourceDenom: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
            chainType: "evm",
            chainId: 137,
            address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
            symbol: "WMATIC",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/wmatic.svg",
            },
          },
          {
            chainName: "polygon",
            sourceDenom: "wei",
            chainType: "evm",
            chainId: 137,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "MATIC",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/matic-purple.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/matic-purple.svg",
            },
          },
        ],
        variantGroupKey: "MATIC",
        name: "Polygon",
        description:
          "Polygon (formerly Matic) Network brings massive scale to Ethereum using an adapted version of Plasma with PoS based side chains. Polygon is a well-structured, easy-to-use platform for Ethereum scaling and infrastructure development.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "dot-planck",
          },
        ],
        relative_image_url: "/tokens/generated/matic.png",
      },
      {
        chainName: "axelar",
        sourceDenom: "wavax-wei",
        coinMinimalDenom:
          "ibc/6F62F01D913E3FFE472A38C78235B8F021B511BC6596ADFF02615C8F83D3B373",
        symbol: "AVAX",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/avalanche/images/avax.png",
        },
        coingeckoId: "avalanche-2",
        price: {
          poolId: "1427",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wavax-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wavax-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "WAVAX",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/avalanche/images/wavax.svg",
            },
          },
          {
            chainName: "avalanche",
            sourceDenom: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
            chainType: "evm",
            chainId: 43114,
            address: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
            symbol: "WAVAX",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/avalanche/images/wavax.svg",
            },
          },
          {
            chainName: "avalanche",
            sourceDenom: "wei",
            chainType: "evm",
            chainId: 43114,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "AVAX",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/avalanche/images/avax.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/avalanche/images/avax.svg",
            },
          },
        ],
        variantGroupKey: "AVAX",
        name: "Avalanche",
        description:
          "AVAX is the native token of Avalanche. It is a hard-capped, scarce asset that is used to pay for fees, secure the platform through staking, and provide a basic unit of account between the multiple subnets created on Avalanche.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "dot-planck",
          },
        ],
        relative_image_url: "/tokens/generated/avax.png",
      },
      {
        chainName: "axelar",
        sourceDenom: "dot-planck",
        coinMinimalDenom:
          "ibc/3FF92D26B407FD61AE95D975712A7C319CDE28DE4D80BDC9978D935932B991D7",
        symbol: "DOT.axl",
        decimals: 10,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/dot.axl.svg",
        },
        price: {
          poolId: "1091",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "dot-planck",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/dot-planck",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "dot-planck",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "DOT",
            decimals: 10,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.svg",
            },
          },
          {
            chainName: "moonbeam",
            sourceDenom: "0xffffffff1fcacbd218edc0eba20fc2308c778080",
            chainType: "evm",
            chainId: 1284,
            address: "0xffffffff1fcacbd218edc0eba20fc2308c778080",
            symbol: "xcDOT",
            decimals: 10,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.svg",
            },
          },
        ],
        variantGroupKey: "xcDOT",
        name: "Wrapped Polkadot (Axelar)",
        description: "Wrapped Polkadot on Axelar",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "axelar",
          sourceDenom: "uaxl",
        },
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "composable",
            sourceDenom:
              "ibc/3CC19CEC7E5A3E90E78A5A9ECC5A0E2F8F826A375CF1E096F4515CF09DA3E366",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
        ],
        relative_image_url: "/tokens/generated/dot.axl.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "frax-wei",
        coinMinimalDenom:
          "ibc/0E43EDE2E2A3AFA36D0CD38BDDC0B49FECA64FA426A82E102F304E430ECF46EE",
        symbol: "FRAX",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frax.svg",
        },
        coingeckoId: "frax",
        price: {
          poolId: "679",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "hybrid",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "frax-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/frax-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "frax-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "FRAX",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frax.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x853d955acef822db058eb8505911ed77f175b99e",
            chainType: "evm",
            chainId: 1,
            address: "0x853d955acef822db058eb8505911ed77f175b99e",
            symbol: "FRAX",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frax.svg",
            },
          },
        ],
        variantGroupKey: "FRAX",
        name: "Frax",
        description:
          "Frax is a fractional-algorithmic stablecoin protocol. It aims to provide a highly scalable, decentralized, algorithmic money in place of fixed-supply assets like BTC. Additionally, FXS is the value accrual and governance token of the entire Frax ecosystem.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
        ],
        relative_image_url: "/tokens/generated/frax.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "link-wei",
        coinMinimalDenom:
          "ibc/D3327A763C23F01EC43D1F0DB3CEFEC390C362569B6FD191F40A5192F8960049",
        symbol: "LINK",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/link.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/link.svg",
        },
        coingeckoId: "chainlink",
        price: {
          poolId: "731",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "link-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/link-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "link-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "LINK",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/link.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/link.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x514910771af9ca656af840dff83e8264ecf986ca",
            chainType: "evm",
            chainId: 1,
            address: "0x514910771af9ca656af840dff83e8264ecf986ca",
            symbol: "LINK",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/link.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/link.svg",
            },
          },
        ],
        variantGroupKey: "LINK",
        name: "Chainlink",
        description:
          "A blockchain-based middleware, acting as a bridge between cryptocurrency smart contracts, data feeds, APIs and traditional bank account payments.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/link.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "aave-wei",
        coinMinimalDenom:
          "ibc/384E5DD50BDE042E1AAF51F312B55F08F95BC985C503880189258B4D9374CBBE",
        symbol: "AAVE",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/aave.svg",
        },
        coingeckoId: "aave",
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "aave-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/aave-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "aave-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "AAVE",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/aave.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
            chainType: "evm",
            chainId: 1,
            address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
            symbol: "AAVE",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/aave.svg",
            },
          },
        ],
        variantGroupKey: "AAVE",
        name: "Aave",
        description:
          "Aave is an Open Source and Non-Custodial protocol to earn interest on deposits & borrow assets. It also features access to highly innovative flash loans, which let developers borrow instantly and easily; no collateral needed. With 16 different assets, 5 of which are stablecoins.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/aave.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "ape-wei",
        coinMinimalDenom:
          "ibc/F83CC6471DA4D4B508F437244F10B9E4C68975344E551A2DEB6B8617AB08F0D4",
        symbol: "APE",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/ape.svg",
        },
        coingeckoId: "apecoin",
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "ape-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/ape-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "ape-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "APE",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/ape.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x4d224452801aced8b2f0aebe155379bb5d594381",
            chainType: "evm",
            chainId: 1,
            address: "0x4d224452801aced8b2f0aebe155379bb5d594381",
            symbol: "APE",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/ape.svg",
            },
          },
        ],
        variantGroupKey: "APE",
        name: "ApeCoin",
        description:
          "ApeCoin found new expression in web3 through art, gaming, entertainment, and events. APE is a token made to support what’s next, controlled, and built on by the community. It will serve as a decentralized protocol layer for community-led initiatives that drive culture forward into the metaverse.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/ape.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "mkr-wei",
        coinMinimalDenom:
          "ibc/D27DDDF34BB47E5D5A570742CC667DE53277867116CCCA341F27785E899A70F3",
        symbol: "MKR",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/mkr.svg",
        },
        coingeckoId: "maker",
        price: {
          poolId: "733",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "mkr-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/mkr-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "mkr-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "MKR",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/mkr.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
            chainType: "evm",
            chainId: 1,
            address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
            symbol: "MKR",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/mkr.svg",
            },
          },
        ],
        variantGroupKey: "MKR",
        name: "Maker",
        description:
          "Maker is a Decentralized Autonomous Organization that creates and insures the dai stablecoin on the Ethereum blockchain",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/mkr.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "rai-wei",
        coinMinimalDenom:
          "ibc/BD796662F8825327D41C96355DF62045A5BA225BAE31C0A86289B9D88ED3F44E",
        symbol: "RAI",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/rai.svg",
        },
        coingeckoId: "rai",
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "rai-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/rai-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "rai-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "RAI",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/rai.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x03ab458634910aad20ef5f1c8ee96f1d6ac54919",
            chainType: "evm",
            chainId: 1,
            address: "0x03ab458634910aad20ef5f1c8ee96f1d6ac54919",
            symbol: "RAI",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/rai.svg",
            },
          },
        ],
        variantGroupKey: "RAI",
        name: "Rai Reflex Index",
        description:
          "RAI is a non-pegged, ETH-backed stable asset. It is useful as more 'stable' collateral for other DeFi protocols (compared to ETH or BTC) or as a stable asset with an embedded interest rate.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
        ],
        relative_image_url: "/tokens/generated/rai.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "shib-wei",
        coinMinimalDenom:
          "ibc/19305E20681911F14D1FB275E538CDE524C3BF88CF9AE5D5F78F4D4DA05E85B2",
        symbol: "SHIB",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/shib.svg",
        },
        coingeckoId: "shiba-inu",
        price: {
          poolId: "880",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "shib-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/shib-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "shib-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "SHIB",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/shib.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
            chainType: "evm",
            chainId: 1,
            address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
            symbol: "SHIB",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/shib.svg",
            },
          },
        ],
        variantGroupKey: "SHIB",
        name: "Shiba Inu",
        description:
          "SHIBA INU is a 100% decentralized community experiment with it claims that 1/2 the tokens have been sent to Vitalik and the other half were locked to a Uniswap pool and the keys burned.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/shib.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "wglmr-wei",
        coinMinimalDenom:
          "ibc/1E26DB0E5122AED464D98462BD384FCCB595732A66B3970AE6CE0B58BAE0FC49",
        symbol: "GLMR",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.svg",
        },
        coingeckoId: "moonbeam",
        price: {
          poolId: "825",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wglmr-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wglmr-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wglmr-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "WGLMR",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.svg",
            },
          },
          {
            chainName: "moonbeam",
            sourceDenom: "0xacc15dc74880c9944775448304b263d191c6077f",
            chainType: "evm",
            chainId: 1284,
            address: "0xacc15dc74880c9944775448304b263d191c6077f",
            symbol: "WGLMR",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.svg",
            },
          },
          {
            chainName: "moonbeam",
            sourceDenom: "Wei",
            chainType: "evm",
            chainId: 1284,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "GLMR",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.svg",
            },
          },
        ],
        variantGroupKey: "GLMR",
        name: "Moonbeam",
        description:
          "Glimmer (GLMR) is the utility token of the Moonbeam Network, Moonbeam’s primary deployment on the Polkadot network that serves as a developer-friendly parachain.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/glmr.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "uaxl",
        coinMinimalDenom:
          "ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E",
        symbol: "AXL",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.svg",
        },
        coingeckoId: "axelar",
        price: {
          poolId: "812",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "uaxl",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/uaxl",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "AXL",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.svg",
            },
          },
        ],
        variantGroupKey: "AXL",
        name: "Axelar",
        description:
          "The native token of Axelar\n\nAxelar delivers secure cross-chain communication for Web3. Our infrastructure enables dApp users to interact with any asset or application, on any chain, with one click.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/axelarnetwork",
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "dot-planck",
          },
        ],
        relative_image_url: "/tokens/generated/axl.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "wftm-wei",
        coinMinimalDenom:
          "ibc/5E2DFDF1734137302129EA1C1BA21A580F96F778D4F021815EA4F6DB378DA1A4",
        symbol: "FTM",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.svg",
        },
        coingeckoId: "fantom",
        price: {
          poolId: "900",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wftm-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wftm-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wftm-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "WFTM",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.png",
            },
          },
          {
            chainName: "fantom",
            sourceDenom: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
            chainType: "evm",
            chainId: 250,
            address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
            symbol: "WFTM",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.svg",
            },
          },
          {
            chainName: "fantom",
            sourceDenom: "wei",
            chainType: "evm",
            chainId: 250,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "FTM",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.svg",
            },
          },
        ],
        variantGroupKey: "FTM",
        name: "Fantom",
        description:
          "Fantom's native utility token — FTM — powers the entire Fantom blockchain ecosystem. FTM tokens are used for staking, governance, payments, and fees on the network.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/ftm.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "polygon-uusdc",
        coinMinimalDenom:
          "ibc/231FD77ECCB2DB916D314019DA30FE013202833386B1908A191D16989AD80B5A",
        symbol: "polygon.USDC",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/polygon.usdc.svg",
        },
        coingeckoId: "usd-coin",
        price: {
          poolId: "938",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "polygon-uusdc",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/polygon-uusdc",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "polygon-uusdc",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdc.svg",
            },
          },
          {
            chainName: "polygon",
            sourceDenom: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            chainType: "evm",
            chainId: 137,
            address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            chainType: "evm",
            chainId: 1,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
        ],
        variantGroupKey: "USDC",
        name: "USD Coin (Polygon)",
        description:
          "USDC is a fully collateralized US Dollar stablecoin developed by CENTRE, the open source project with Circle being the first of several forthcoming issuers.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
          },
          {
            chainName: "axelar",
            sourceDenom: "avalanche-uusdc",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
        ],
        relative_image_url: "/tokens/generated/polygon.usdc.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "avalanche-uusdc",
        coinMinimalDenom:
          "ibc/F17C9CA112815613C5B6771047A093054F837C3020CBA59DFFD9D780A8B2984C",
        symbol: "avalanche.USDC",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/avalanche.usdc.svg",
        },
        coingeckoId: "usd-coin",
        price: {
          poolId: "938",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "avalanche-uusdc",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/avalanche-uusdc",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "avalanche-uusdc",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdc.svg",
            },
          },
          {
            chainName: "avalanche",
            sourceDenom: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
            chainType: "evm",
            chainId: 43114,
            address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            chainType: "evm",
            chainId: 1,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
        ],
        variantGroupKey: "USDC",
        name: "USD Coin (Avalanche)",
        description:
          "USDC is a fully collateralized US Dollar stablecoin developed by CENTRE, the open source project with Circle being the first of several forthcoming issuers.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
          },
          {
            chainName: "axelar",
            sourceDenom: "polygon-uusdc",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
        ],
        relative_image_url: "/tokens/generated/avalanche.usdc.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "wfil-wei",
        coinMinimalDenom:
          "ibc/18FB5C09D9D2371F659D4846A956FA56225E377EE3C3652A2BF3542BF809159D",
        symbol: "FIL",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/fil.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/fil.svg",
        },
        coingeckoId: "filecoin",
        price: {
          poolId: "1006",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wfil-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wfil-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wfil-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "axlFIL",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/wfil.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/wfil.svg",
            },
          },
          {
            chainName: "filecoin",
            sourceDenom: "0x60E1773636CF5E4A227d9AC24F20fEca034ee25A",
            chainType: "evm",
            chainId: 461,
            address: "0x60E1773636CF5E4A227d9AC24F20fEca034ee25A",
            symbol: "WFIL",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/wfil.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/wfil.svg",
            },
          },
          {
            chainName: "filecoin",
            sourceDenom: "attoFIL",
            chainType: "evm",
            chainId: 461,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "FIL",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/fil.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/fil.svg",
            },
          },
        ],
        variantGroupKey: "FIL",
        name: "Filecoin",
        description:
          "Filecoin is a decentralized storage network designed to turn cloud storage into an algorithmic market. The network facilitates open markets for storing and retrieving data, where users pay to store their files on storage miners. Filecoin is built on top of the InterPlanetary File System (IPFS), a peer-to-peer storage network. Filecoin aims to store data in a decentralized manner, unlike traditional cloud storage providers.\n\nParticipants in the Filecoin network are incentivized to act honestly and store as much data as possible because they earn the Filecoin cryptocurrency (FIL) in exchange for their storage services. This setup ensures the integrity and accessibility of data stored. Filecoin's model allows for a variety of storage options, including long-term archival storage and more rapid retrieval services, making it a versatile solution for decentralized data storage. The project, developed by Protocol Labs, also focuses on ensuring that data is stored reliably and efficiently.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/fil.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "arb-wei",
        coinMinimalDenom:
          "ibc/10E5E5B06D78FFBB61FD9F89209DEE5FD4446ED0550CBB8E3747DA79E10D9DC6",
        symbol: "ARB",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/arbitrum/images/arb.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/arbitrum/images/arb.svg",
        },
        coingeckoId: "arbitrum",
        price: {
          poolId: "1011",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "arb-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/arb-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "arb-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "ARB",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/arbitrum/images/arb.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/arbitrum/images/arb.svg",
            },
          },
          {
            chainName: "arbitrum",
            sourceDenom: "0x912CE59144191C1204E64559FE8253a0e49E6548",
            chainType: "evm",
            chainId: 42161,
            address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
            symbol: "ARB",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/arbitrum/images/arb.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/arbitrum/images/arb.svg",
            },
          },
        ],
        variantGroupKey: "ARB",
        name: "Arbitrum",
        description: "Native token of Arbitrum",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/arb.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "pepe-wei",
        coinMinimalDenom:
          "ibc/E47F4E97C534C95B942729E1B25DBDE111EA791411CFF100515050BEA0AC0C6B",
        symbol: "PEPE",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.svg",
        },
        coingeckoId: "pepe",
        price: {
          poolId: "1018",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "pepe-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/pepe-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "pepe-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "PEPE",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
            chainType: "evm",
            chainId: 1,
            address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
            symbol: "PEPE",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.svg",
            },
          },
        ],
        variantGroupKey: "PEPE",
        name: "Pepe",
        description: "",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/pepe.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "cbeth-wei",
        coinMinimalDenom:
          "ibc/4D7A6F2A7744B1534C984A21F9EDFFF8809FC71A9E9243FFB702073E7FCA513A",
        symbol: "cbETH",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/cbeth.png",
        },
        coingeckoId: "coinbase-wrapped-staked-eth",
        price: {
          poolId: "1030",
          denom:
            "ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "cbeth-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/cbeth-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "cbeth-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "cbETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/cbeth.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xbe9895146f7af43049ca1c1ae358b0541ea49704",
            chainType: "evm",
            chainId: 1,
            address: "0xbe9895146f7af43049ca1c1ae358b0541ea49704",
            symbol: "cbETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/cbeth.png",
            },
          },
        ],
        variantGroupKey: "cbETH",
        name: "Coinbase Wrapped Staked ETH",
        description:
          "Coinbase Wrapped Staked ETH (“cbETH”) is a utility token and liquid representation of ETH staked through Coinbase. cbETH gives customers the option to sell, transfer, or otherwise use their staked ETH in dapps while it remains locked by the Ethereum protocol.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/cbeth.png",
      },
      {
        chainName: "axelar",
        sourceDenom: "reth-wei",
        coinMinimalDenom:
          "ibc/E610B83FD5544E00A8A1967A2EB3BEF25F1A8CFE8650FE247A8BD4ECA9DC9222",
        symbol: "rETH",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/reth.png",
        },
        coingeckoId: "rocket-pool-eth",
        price: {
          poolId: "1030",
          denom:
            "ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "reth-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/reth-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "reth-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "rETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/reth.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xae78736cd615f374d3085123a210448e74fc6393",
            chainType: "evm",
            chainId: 1,
            address: "0xae78736cd615f374d3085123a210448e74fc6393",
            symbol: "rETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/reth.png",
            },
          },
        ],
        variantGroupKey: "rETH",
        name: "Rocket Pool Ether",
        description:
          "Rocket Pool is a decentralised Ethereum Proof of Stake pool.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/reth.png",
      },
      {
        chainName: "axelar",
        sourceDenom: "sfrxeth-wei",
        coinMinimalDenom:
          "ibc/81F578C39006EB4B27FFFA9460954527910D73390991B379C03B18934D272F46",
        symbol: "sfrxETH",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/sfrxeth.svg",
        },
        coingeckoId: "staked-frax-ether",
        price: {
          poolId: "1030",
          denom:
            "ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "sfrxeth-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/sfrxeth-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "sfrxeth-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "sfrxETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/sfrxeth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xac3e018457b222d93114458476f3e3416abbe38f",
            chainType: "evm",
            chainId: 1,
            address: "0xac3e018457b222d93114458476f3e3416abbe38f",
            symbol: "sfrxETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/sfrxeth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x5e8422345238f34275888049021821e8e08caa1f",
            chainType: "evm",
            chainId: 1,
            address: "0x5e8422345238f34275888049021821e8e08caa1f",
            symbol: "frxETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg",
            },
          },
        ],
        variantGroupKey: "frxETH",
        name: "Staked Frax Ether",
        description:
          "sfrxETH is the version of frxETH which accrues staking yield. All profit generated from Frax Ether validators is distributed to sfrxETH holders. By exchanging frxETH for sfrxETH, one become's eligible for staking yield, which is redeemed upon converting sfrxETH back to frxETH.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/sfrxeth.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "wsteth-wei",
        coinMinimalDenom:
          "ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C",
        symbol: "wstETH.axl",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/wstETH.axl.svg",
        },
        price: {
          poolId: "1024",
          denom:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wsteth-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wsteth-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wsteth-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "wstETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
            chainType: "evm",
            chainId: 1,
            address: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
            symbol: "wstETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
            chainType: "evm",
            chainId: 1,
            address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
            symbol: "stETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/steth.svg",
            },
          },
        ],
        variantGroupKey: "stETH",
        name: "Wrapped Lido Staked Ether (Axelar)",
        description: "",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "axelar",
          sourceDenom: "uaxl",
        },
        relatedAssets: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "neutron",
            sourceDenom: "untrn",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
        ],
        relative_image_url: "/tokens/generated/wsteth.axl.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "yieldeth-wei",
        coinMinimalDenom:
          "ibc/FBB3FEF80ED2344D821D4F95C31DBFD33E4E31D5324CAD94EF756E67B749F668",
        symbol: "YieldETH",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/yieldeth.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/yieldeth.svg",
        },
        coingeckoId: "yieldeth-sommelier",
        price: {
          poolId: "1213",
          denom:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "yieldeth-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/yieldeth-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "yieldeth-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "YieldETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/yieldeth.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/yieldeth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xb5b29320d2Dde5BA5BAFA1EbcD270052070483ec",
            chainType: "evm",
            chainId: 1,
            address: "0xb5b29320d2Dde5BA5BAFA1EbcD270052070483ec",
            symbol: "YieldETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/yieldeth.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/yieldeth.svg",
            },
          },
        ],
        variantGroupKey: "YieldETH",
        name: "Real Yield ETH",
        description:
          "Maximize ETH yield through leveraged staking across Aave, Compound and Morpho and liquidity provision of ETH liquid staking tokens on Uniswap V3.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/yieldeth.svg",
      },
    ],
  },
  {
    chain_name: "cosmoshub",
    chain_id: "cosmoshub-4",
    assets: [
      {
        chainName: "cosmoshub",
        sourceDenom: "uatom",
        coinMinimalDenom:
          "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        symbol: "ATOM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg",
        },
        coingeckoId: "cosmos",
        price: {
          poolId: "1400",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "cosmoshub",
              chainId: "cosmoshub-4",
              sourceDenom: "uatom",
              port: "transfer",
              channelId: "channel-141",
            },
            chain: {
              port: "transfer",
              channelId: "channel-0",
              path: "transfer/channel-0/uatom",
            },
          },
        ],
        counterparty: [
          {
            chainName: "cosmoshub",
            sourceDenom: "uatom",
            chainType: "cosmos",
            chainId: "cosmoshub-4",
            symbol: "ATOM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg",
            },
          },
        ],
        variantGroupKey: "ATOM",
        name: "Cosmos Hub",
        description:
          "The native staking and governance token of the Cosmos Hub.\n\nIn a nutshell, Cosmos Hub bills itself as a project that solves some of the hardest problems facing the blockchain industry. It aims to offer an antidote to slow, expensive, unscalable and environmentally harmful proof-of-work protocols, like those used by Bitcoin, by offering an ecosystem of connected blockchains.\n\nThe project’s other goals include making blockchain technology less complex and difficult for developers thanks to a modular framework that demystifies decentralized apps. Last but not least, an Inter-blockchain Communication protocol makes it easier for blockchain networks to communicate with each other — preventing fragmentation in the industry.\n\nCosmos Hub's origins can be dated back to 2014, when Tendermint, a core contributor to the network, was founded. In 2016, a white paper for Cosmos was published — and a token sale was held the following year. ATOM tokens are earned through a hybrid proof-of-stake algorithm, and they help to keep the Cosmos Hub, the project’s flagship blockchain, secure. This cryptocurrency also has a role in the network’s governance.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/cosmoshub",
        relatedAssets: [
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqatom",
          },
          {
            chainName: "stafihub",
            sourceDenom: "uratom",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
          },
          {
            chainName: "stafihub",
            sourceDenom: "ufis",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
        ],
        relative_image_url: "/tokens/generated/atom.svg",
      },
    ],
  },
  {
    chain_name: "cryptoorgchain",
    chain_id: "crypto-org-chain-mainnet-1",
    assets: [
      {
        chainName: "cryptoorgchain",
        sourceDenom: "basecro",
        coinMinimalDenom:
          "ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1",
        symbol: "CRO",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cronos/images/cro.svg",
        },
        coingeckoId: "crypto-com-chain",
        price: {
          poolId: "9",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "cryptoorgchain",
              chainId: "crypto-org-chain-mainnet-1",
              sourceDenom: "basecro",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-5",
              path: "transfer/channel-5/basecro",
            },
          },
        ],
        counterparty: [
          {
            chainName: "cryptoorgchain",
            sourceDenom: "basecro",
            chainType: "cosmos",
            chainId: "crypto-org-chain-mainnet-1",
            symbol: "CRO",
            decimals: 8,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cronos/images/cro.svg",
            },
          },
        ],
        variantGroupKey: "CRO",
        name: "Cronos POS Chain",
        description:
          "CRO is the native token of the Crypto.org Chain, referred to as Native CRO.\n\nCronos PoS Chain is a public, open-source and permissionless blockchain - a fully decentralized network with high speed and low fees, designed to be a public good that helps drive mass adoption of blockchain technology through use cases like Payments, DeFi and NFTs.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/cronos_chain",
        relatedAssets: [],
        relative_image_url: "/tokens/generated/cro.svg",
      },
    ],
  },
  {
    chain_name: "terra",
    chain_id: "columbus-5",
    assets: [
      {
        chainName: "terra",
        sourceDenom: "uluna",
        coinMinimalDenom:
          "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
        symbol: "LUNC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/luna.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/luna.svg",
        },
        coingeckoId: "terra-luna",
        price: {
          poolId: "800",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Terra Bridge",
            type: "external_interface",
            depositUrl: "https://bridge.terra.money",
            withdrawUrl: "https://bridge.terra.money",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra",
              chainId: "columbus-5",
              sourceDenom: "uluna",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-72",
              path: "transfer/channel-72/uluna",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra",
            sourceDenom: "uluna",
            chainType: "cosmos",
            chainId: "columbus-5",
            symbol: "LUNC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/luna.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/luna.svg",
            },
          },
        ],
        variantGroupKey: "LUNC",
        name: "Luna Classic",
        description: "The native staking token of Terra Classic.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "terra",
            sourceDenom: "uusd",
          },
          {
            chainName: "terra",
            sourceDenom: "ukrw",
          },
        ],
        relative_image_url: "/tokens/generated/lunc.svg",
      },
      {
        chainName: "terra",
        sourceDenom: "uusd",
        coinMinimalDenom:
          "ibc/BE1BB42D4BE3C30D50B68D7C41DB4DFCE9678E8EF8C539F6E6A9345048894FCC",
        symbol: "USTC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/ust.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/ust.svg",
        },
        coingeckoId: "terrausd",
        price: {
          poolId: "560",
          denom: "uosmo",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "algorithmic",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra",
              chainId: "columbus-5",
              sourceDenom: "uusd",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-72",
              path: "transfer/channel-72/uusd",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra",
            sourceDenom: "uusd",
            chainType: "cosmos",
            chainId: "columbus-5",
            symbol: "USTC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/ust.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/ust.svg",
            },
          },
        ],
        variantGroupKey: "USTC",
        name: "TerraClassicUSD",
        description: "The USD stablecoin of Terra Classic.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "terra",
            sourceDenom: "uluna",
          },
          {
            chainName: "terra",
            sourceDenom: "ukrw",
          },
        ],
        relative_image_url: "/tokens/generated/ustc.svg",
      },
      {
        chainName: "terra",
        sourceDenom: "ukrw",
        coinMinimalDenom:
          "ibc/204A582244FC241613DBB50B04D1D454116C58C4AF7866C186AA0D6EEAD42780",
        symbol: "KRTC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/krt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/krt.svg",
        },
        coingeckoId: "terrakrw",
        price: {
          poolId: "581",
          denom:
            "ibc/BE1BB42D4BE3C30D50B68D7C41DB4DFCE9678E8EF8C539F6E6A9345048894FCC",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "algorithmic",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra",
              chainId: "columbus-5",
              sourceDenom: "ukrw",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-72",
              path: "transfer/channel-72/ukrw",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra",
            sourceDenom: "ukrw",
            chainType: "cosmos",
            chainId: "columbus-5",
            symbol: "KRTC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/krt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/krt.svg",
            },
          },
        ],
        variantGroupKey: "KRTC",
        name: "TerraClassicKRW",
        description: "The KRW stablecoin of Terra Classic.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "terra",
            sourceDenom: "uluna",
          },
          {
            chainName: "terra",
            sourceDenom: "uusd",
          },
        ],
        relative_image_url: "/tokens/generated/krtc.svg",
      },
    ],
  },
  {
    chain_name: "juno",
    chain_id: "juno-1",
    assets: [
      {
        chainName: "juno",
        sourceDenom: "ujuno",
        coinMinimalDenom:
          "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
        symbol: "JUNO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.svg",
        },
        coingeckoId: "juno-network",
        price: {
          poolId: "1097",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom: "ujuno",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-42",
              path: "transfer/channel-42/ujuno",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "JUNO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.svg",
            },
          },
        ],
        variantGroupKey: "JUNO",
        name: "Juno",
        description:
          "The native token of JUNO Chain\n\nJuno is a completely community owned and operated smart contract platform.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/JunoNetwork",
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
          },
        ],
        relative_image_url: "/tokens/generated/juno.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
        coinMinimalDenom:
          "ibc/F6B691D5F7126579DDC87357B09D653B47FDCE0A3383FF33C8D8B544FE29A8A6",
        symbol: "MARBLE",
        decimals: 3,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/marble.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/marble.svg",
        },
        coingeckoId: "marble",
        price: {
          poolId: "649",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "MARBLE",
            decimals: 3,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/marble.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/marble.svg",
            },
          },
        ],
        variantGroupKey: "MARBLE",
        name: "Marble",
        description: "The native token cw20 for Marble DAO on Juno Chain",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
          },
        ],
        relative_image_url: "/tokens/generated/marble.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
        coinMinimalDenom:
          "ibc/297C64CC42B5A8D8F82FE2EBE208A6FE8F94B86037FA28C4529A23701C228F7A",
        symbol: "NETA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/neta.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/neta.svg",
        },
        coingeckoId: "neta",
        price: {
          poolId: "631",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "NETA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/neta.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/neta.svg",
            },
          },
        ],
        variantGroupKey: "NETA",
        name: "Neta",
        description: "The native token cw20 for Neta on Juno Chain",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
          },
        ],
        relative_image_url: "/tokens/generated/neta.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
        coinMinimalDenom:
          "ibc/C2A2E9CA95DDD4828B75124B5E27B8401C7D8493BC48353D418CBFC04565899B",
        symbol: "HOPE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hope.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hope.svg",
        },
        coingeckoId: "hope-galaxy",
        price: {
          poolId: "653",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "HOPE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hope.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hope.svg",
            },
          },
        ],
        variantGroupKey: "HOPE",
        name: "Hope Galaxy",
        description:
          "Hope Galaxy is an NFT collection based on its own native Token $HOPE, a cw20 token on Juno chain.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
          },
        ],
        relative_image_url: "/tokens/generated/hope.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
        coinMinimalDenom:
          "ibc/6BDB4C8CCD45033F9604E4B93ED395008A753E01EECD6992E7D1EA23D9D3B788",
        symbol: "juno.RAC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/rac.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/rac.svg",
        },
        coingeckoId: "racoon",
        price: {
          poolId: "669",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "RAC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/rac.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/rac.svg",
            },
          },
        ],
        variantGroupKey: "RAC",
        name: "Racoon",
        description:
          "Racoon aims to simplify accessibility to AI, NFTs and Gambling on the Cosmos Ecosystem",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
          },
        ],
        relative_image_url: "/tokens/generated/juno.rac.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
        coinMinimalDenom:
          "ibc/DB9755CB6FE55192948AE074D18FA815E1429D3D374D5BDA8D89623C6CF235C3",
        symbol: "BLOCK",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/block.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/block.svg",
        },
        price: {
          poolId: "691",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "BLOCK",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/block.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/block.svg",
            },
          },
        ],
        variantGroupKey: "BLOCK",
        name: "Block",
        description: "The native token of Marble DEX on Juno Chain",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
          },
        ],
        relative_image_url: "/tokens/generated/block.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
        coinMinimalDenom:
          "ibc/52E12CF5CA2BB903D84F5298B4BFD725D66CAB95E09AA4FC75B2904CA5485FEB",
        symbol: "DHK",
        decimals: 0,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dhk.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dhk.svg",
        },
        price: {
          poolId: "695",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "DHK",
            decimals: 0,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dhk.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dhk.svg",
            },
          },
        ],
        variantGroupKey: "DHK",
        name: "DHK",
        description: "The DAO token to build consensus among Hong Kong People",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
          },
        ],
        relative_image_url: "/tokens/generated/dhk.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
        coinMinimalDenom:
          "ibc/00B6E60AD3D65CBEF5579AC8AF609527C0B57535B6E32D96C80A735344FD9DCC",
        symbol: "RAW",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/raw.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/raw.svg",
        },
        coingeckoId: "junoswap-raw-dao",
        price: {
          poolId: "700",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "RAW",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/raw.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/raw.svg",
            },
          },
        ],
        variantGroupKey: "RAW",
        name: "JunoSwap",
        description: "Token governance for Junoswap",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
          },
        ],
        relative_image_url: "/tokens/generated/raw.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
        coinMinimalDenom:
          "ibc/AA1C80225BCA7B32ED1FC6ABF8B8E899BEB48ECDB4B417FD69873C6D715F97E7",
        symbol: "ASVT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/asvt.png",
        },
        price: {
          poolId: "771",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "ASVT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/asvt.png",
            },
          },
        ],
        variantGroupKey: "ASVT",
        name: "Another.Software Validator Token",
        description:
          "Profit sharing token for Another.Software validator. Hold and receive dividends from Another.Software validator commissions!",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
          },
        ],
        relative_image_url: "/tokens/generated/asvt.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
        coinMinimalDenom:
          "ibc/0CB9DB3441D0D50F35699DEE22B9C965487E83FB2D9F483D1CC5CA34E856C484",
        symbol: "JOE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/joe.png",
        },
        price: {
          poolId: "718",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "JOE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/joe.png",
            },
          },
        ],
        variantGroupKey: "JOE",
        name: "JoeDAO",
        description: "DAO dedicated to building tools on the Juno Network",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
          },
        ],
        relative_image_url: "/tokens/generated/joe.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
        coinMinimalDenom:
          "ibc/52C57FCA7D6854AA178E7A183DDBE4EF322B904B1D719FC485F6FFBC1F72A19E",
        symbol: "GLTO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.svg",
        },
        price: {
          poolId: "778",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "GLTO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.svg",
            },
          },
        ],
        variantGroupKey: "GLTO",
        name: "Gelotto",
        description: "DeFi gaming platform built on Juno",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "injective",
            sourceDenom: "peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
          },
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "injective",
            sourceDenom: "inj",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
        ],
        relative_image_url: "/tokens/generated/glto.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh",
        coinMinimalDenom:
          "ibc/7C781B4C2082CD62129A972D47486D78EC17155C299270E3C89348EA026BEAF8",
        symbol: "GKEY",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/gkey.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/gkey.svg",
        },
        price: {
          poolId: "790",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "GKEY",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/gkey.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/gkey.svg",
            },
          },
        ],
        variantGroupKey: "GKEY",
        name: "GKey",
        description: "Gelotto Year 1 Grand Prize Token",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/gkey.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv",
        coinMinimalDenom:
          "ibc/C6B6BFCB6EE49A7CAB1A7E7B021DE35B99D525AC660844952F0F6C78DCB2A57B",
        symbol: "SEJUNO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sejuno.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sejuno.svg",
        },
        coingeckoId: "stakeeasy-juno-derivative",
        price: {
          poolId: "807",
          denom:
            "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SEJUNO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sejuno.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sejuno.svg",
            },
          },
        ],
        variantGroupKey: "SEJUNO",
        name: "StakeEasy seJUNO",
        description: "Staking derivative seJUNO for staked JUNO",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/sejuno.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3",
        coinMinimalDenom:
          "ibc/C2DF5C3949CA835B221C575625991F09BAB4E48FB9C11A4EE357194F736111E3",
        symbol: "BJUNO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/bjuno.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/bjuno.svg",
        },
        coingeckoId: "stakeeasy-bjuno",
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "BJUNO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/bjuno.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/bjuno.svg",
            },
          },
        ],
        variantGroupKey: "BJUNO",
        name: "StakeEasy bJUNO",
        description: "Staking derivative bJUNO for staked JUNO",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/bjuno.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse",
        coinMinimalDenom:
          "ibc/C3FC4DED273E7D1DD2E7BAA3317EC9A53CD3252B577AA33DC00D9DF2BDF3ED5C",
        symbol: "SOLAR",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/solar.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/solar.svg",
        },
        price: {
          poolId: "941",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SOLAR",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/solar.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/solar.svg",
            },
          },
        ],
        variantGroupKey: "SOLAR",
        name: "Solarbank DAO",
        description:
          "Solarbank DAO Governance Token for speeding up the shift to renewable and green energy",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/solar.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf",
        coinMinimalDenom:
          "ibc/18A676A074F73B9B42DA4F9DFC8E5AEF334C9A6636DDEC8D34682F52F1DECDF6",
        symbol: "SEASY",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/seasy.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/seasy.svg",
        },
        price: {
          poolId: "808",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SEASY",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/seasy.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/seasy.svg",
            },
          },
        ],
        variantGroupKey: "SEASY",
        name: "StakeEasy SEASY",
        description: "StakeEasy governance token",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/seasy.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3",
        coinMinimalDenom:
          "ibc/6B982170CE024689E8DD0E7555B129B488005130D4EDA426733D552D10B36D8F",
        symbol: "MUSE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/muse.png",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "MUSE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/muse.png",
            },
          },
        ],
        variantGroupKey: "MUSE",
        name: "MuseDAO",
        description: "The native token cw20 for MuseDAO on Juno Chain",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/muse.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz",
        coinMinimalDenom:
          "ibc/7CE5F388D661D82A0774E47B5129DA51CC7129BD1A70B5FA6BCEBB5B0A2FAEAF",
        symbol: "FURY",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/fanfury.png",
        },
        coingeckoId: "fanfury",
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "FURY",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/fanfury.png",
            },
          },
        ],
        variantGroupKey: "FURY",
        name: "Fanfury",
        description: "The native token cw20 for Fanfury on Juno Chain",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/fury.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l",
        coinMinimalDenom:
          "ibc/D3B574938631B0A1BA704879020C696E514CFADAA7643CDE4BD5EB010BDE327B",
        symbol: "PHMN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/phmn.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/phmn.svg",
        },
        coingeckoId: "posthuman",
        price: {
          poolId: "1255",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "PHMN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/phmn.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/phmn.svg",
            },
          },
        ],
        variantGroupKey: "PHMN",
        name: "POSTHUMAN",
        description: "The native token cw20 for PHMN on Juno Chain",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/phmn.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n",
        coinMinimalDenom:
          "ibc/D3ADAF73F84CDF205BCB72C142FDAEEA2C612AB853CEE6D6C06F184FA38B1099",
        symbol: "HOPERS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hopers.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hopers.svg",
        },
        coingeckoId: "hopers-io",
        price: {
          poolId: "894",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "HOPERS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hopers.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hopers.svg",
            },
          },
        ],
        variantGroupKey: "HOPERS",
        name: "Hopers",
        description: "The native token cw20 for Hopers on Juno Chain",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/hopers.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
        coinMinimalDenom:
          "ibc/2FBAC4BF296D7844796844B35978E5899984BA5A6314B2DD8F83C215550010B3",
        symbol: "WYND",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/wynd.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/wynd.svg",
        },
        coingeckoId: "wynd",
        price: {
          poolId: "902",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "WYND",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/wynd.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/wynd.svg",
            },
          },
        ],
        variantGroupKey: "WYND",
        name: "Wynd DAO Governance Token",
        description: "WYND DAO Governance Token",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/wynd.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq",
        coinMinimalDenom:
          "ibc/E750D31033DC1CF4A044C3AA0A8117401316DC918FBEBC4E3D34F91B09D5F54C",
        symbol: "NRIDE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/nride.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/nride.svg",
        },
        price: {
          poolId: "924",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "NRIDE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/nride.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/nride.svg",
            },
          },
        ],
        variantGroupKey: "NRIDE",
        name: "nRide Token",
        description: "nRide Token",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/nride.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x",
        coinMinimalDenom:
          "ibc/4F24D904BAB5FFBD3524F2DE3EC3C7A9E687A2408D9A985E57B356D9FA9201C6",
        symbol: "FOX",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/fox.png",
        },
        price: {
          poolId: "949",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "FOX",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/fox.png",
            },
          },
        ],
        variantGroupKey: "FOX",
        name: "Juno Fox",
        description:
          "Inspired by Bonk. A community project to celebrate the settlers of JunoNetwork.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/fox.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma",
        coinMinimalDenom:
          "ibc/BAC9C6998F1F5C316D3353622EAEDAF8BD00FAABEB374FECDF8C9BC475172CFA",
        symbol: "GRDN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/guardian.png",
        },
        price: {
          poolId: "959",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "GRDN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/guardian.png",
            },
          },
        ],
        variantGroupKey: "GRDN",
        name: "Guardian",
        description: "Evmos Guardians governance token.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/grdn.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my",
        coinMinimalDenom:
          "ibc/DC0D3303BBE739E073224D0314385B88B247F56D71D726A91414CCA244FFFE7E",
        symbol: "MNPU",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mnpu.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mnpu.svg",
        },
        price: {
          poolId: "961",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "MNPU",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mnpu.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mnpu.svg",
            },
          },
        ],
        variantGroupKey: "MNPU",
        name: "Mini Punks",
        description: "Mini Punks Token",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/mnpu.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z",
        coinMinimalDenom:
          "ibc/447A0DCE83691056289503DDAB8EB08E52E167A73629F2ACC59F056B92F51CE8",
        symbol: "SHIBAC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/shibacosmos.png",
        },
        price: {
          poolId: "962",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SHIBAC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/shibacosmos.png",
            },
          },
        ],
        variantGroupKey: "SHIBAC",
        name: "ShibaCosmos",
        description: "Shiba Cosmos",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/shibac.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp",
        coinMinimalDenom:
          "ibc/71066B030D8FC6479E638580E1BA9C44925E8C1F6E45036669D22017CFDC8C5E",
        symbol: "SKOJ",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sikoba.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sikoba.svg",
        },
        price: {
          poolId: "964",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SKOJ",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sikoba.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sikoba.svg",
            },
          },
        ],
        variantGroupKey: "SKOJ",
        name: "Sikoba Token",
        description: "Sikoba Governance Token",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/skoj.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg",
        coinMinimalDenom:
          "ibc/0E4FA664327BD40B32803EE84A77F145834C0281B7F82B65521333B3669FA0BA",
        symbol: "CLST",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/celestims.png",
        },
        price: {
          poolId: "974",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "CLST",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/celestims.png",
            },
          },
        ],
        variantGroupKey: "CLST",
        name: "Celestims",
        description: "Celestims",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/clst.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je",
        coinMinimalDenom:
          "ibc/8AEEA9B9304392070F72611076C0E328CE3F2DECA1E18557E36F9DB4F09C0156",
        symbol: "OSDOGE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/osdoge.png",
        },
        price: {
          poolId: "975",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "OSDOGE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/osdoge.png",
            },
          },
        ],
        variantGroupKey: "OSDOGE",
        name: "Osmosis Doge",
        description: "The First Doge on Osmosis",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/osdoge.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06",
        coinMinimalDenom:
          "ibc/1EB03F13F29FEA73444586FC4E88A8C14ACE9291501E9658E3BEF951EA4AC85D",
        symbol: "APEMOS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/apemos.png",
        },
        price: {
          poolId: "977",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "APEMOS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/apemos.png",
            },
          },
        ],
        variantGroupKey: "APEMOS",
        name: "Apemos",
        description: "Apemos",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/apemos.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8",
        coinMinimalDenom:
          "ibc/3DB1721541C94AD19D7735FECED74C227E13F925BDB814392980B40A19C1ED54",
        symbol: "INVDRS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/invdrs.png",
        },
        price: {
          poolId: "969",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "INVDRS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/invdrs.png",
            },
          },
        ],
        variantGroupKey: "INVDRS",
        name: "Invaders",
        description: "Evmos Guardians' Invaders DAO token.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/invdrs.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d",
        coinMinimalDenom:
          "ibc/04BE4E9C825ED781F9684A1226114BB49607500CAD855F1E3FEEC18532297250",
        symbol: "DOGA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/doga.png",
        },
        price: {
          poolId: "978",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "DOGA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/doga.png",
            },
          },
        ],
        variantGroupKey: "DOGA",
        name: "Doge Apr",
        description: "Doge Apr",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/doga.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488",
        coinMinimalDenom:
          "ibc/F4A07138CAEF0BFB4889E03C44C57956A48631061F1C8AB80421C1F229C1B835",
        symbol: "CATMOS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/catmos.png",
        },
        price: {
          poolId: "981",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "CATMOS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/catmos.png",
            },
          },
        ],
        variantGroupKey: "CATMOS",
        name: "Catmos",
        description: "Catmos",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/catmos.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
        coinMinimalDenom:
          "ibc/56B988C4D934FB7503F5EA9B440C75D489C8AD5D193715B477BEC4F84B8BBA2A",
        symbol: "SUMMIT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/summit.png",
        },
        price: {
          poolId: "982",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SUMMIT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/summit.png",
            },
          },
        ],
        variantGroupKey: "SUMMIT",
        name: "Summit",
        description:
          "Social Impact DAO providing showers, meals, and vehicles to the homeless",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/summit.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg",
        coinMinimalDenom:
          "ibc/7A496DB7C2277D4B74EC4428DDB5AC8A62816FBD0DEBE1CFE094935D746BE19C",
        symbol: "SPACER",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/spacer.png",
        },
        price: {
          poolId: "993",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SPACER",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/spacer.png",
            },
          },
        ],
        variantGroupKey: "SPACER",
        name: "Spacer",
        description: "Spacer",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/spacer.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l",
        coinMinimalDenom:
          "ibc/3DC08BDF2689978DBCEE28C7ADC2932AA658B2F64B372760FBC5A0058669AD29",
        symbol: "LIGHT",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/light.png",
        },
        price: {
          poolId: "1009",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "LIGHT",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/light.png",
            },
          },
        ],
        variantGroupKey: "LIGHT",
        name: "LIGHT",
        description: "Light: LumenX community DAO treasury token",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/light.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d",
        coinMinimalDenom:
          "ibc/912275A63A565BFD80734AEDFFB540132C51E446EAC41483B26EDE8A557C71CF",
        symbol: "MILE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mille.png",
        },
        price: {
          poolId: "1000",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "MILE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mille.png",
            },
          },
        ],
        variantGroupKey: "MILE",
        name: "Mille",
        description: "Mille: the 1000th token on osmosis",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/mile.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq",
        coinMinimalDenom:
          "ibc/980A2748F37C938AD129B92A51E2ABA8CFFC6862ADD61EC1B291125535DBE30B",
        symbol: "MANNA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/manna.png",
        },
        price: {
          poolId: "997",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "MANNA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/manna.png",
            },
          },
        ],
        variantGroupKey: "MANNA",
        name: "Manna",
        description:
          "Social Impact DAO dedicated to combatting food insecurity and malnutrition",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/manna.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8",
        coinMinimalDenom:
          "ibc/593F820ECE676A3E0890C734EC4F3A8DE16EC10A54EEDFA8BDFEB40EEA903960",
        symbol: "VOID",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/void.png",
        },
        price: {
          poolId: "1003",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "VOID",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/void.png",
            },
          },
        ],
        variantGroupKey: "VOID",
        name: "Void",
        description: "Void",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/void.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux",
        coinMinimalDenom:
          "ibc/5164ECF584AD7DC27DA9E6A89E75DAB0F7C4FCB0A624B69215B8BC6A2C40CD07",
        symbol: "SLCA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/silica.png",
        },
        price: {
          poolId: "1023",
          denom:
            "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SLCA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/silica.png",
            },
          },
        ],
        variantGroupKey: "SLCA",
        name: "Silica",
        description: "Silica",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/slca.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k",
        coinMinimalDenom:
          "ibc/C00B17F74C94449A62935B4C886E6F0F643249A270DEF269D53CE6741ECCDB93",
        symbol: "PEPEC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/pepec.png",
        },
        price: {
          poolId: "1016",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "PEPEC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/pepec.png",
            },
          },
        ],
        variantGroupKey: "PEPEC",
        name: "Pepec",
        description: "Pepec",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/pepec.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss",
        coinMinimalDenom:
          "ibc/2F5C084037D951B24D100F15CC013A131DF786DCE1B1DBDC48F018A9B9A138DE",
        symbol: "CASA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/casa.png",
        },
        price: {
          poolId: "1028",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "CASA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/casa.png",
            },
          },
        ],
        variantGroupKey: "CASA",
        name: "Casa",
        description:
          "An innovative DAO dedicated to housing the most vulnerable",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/casa.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw",
        coinMinimalDenom:
          "ibc/AABCB14ACAFD53A5C455BAC01EA0CA5AE18714895846681A52BFF1E3B960B44E",
        symbol: "WATR",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/watr.png",
        },
        price: {
          poolId: "1071",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "WATR",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/watr.png",
            },
          },
        ],
        variantGroupKey: "WATR",
        name: "WATR",
        description:
          "A revolutionary DAO created to bring clean drinking water to men, women, and children worldwide. We hope you join us on our journey!",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/watr.png",
      },
      {
        chainName: "juno",
        sourceDenom: "factory/juno1u805lv20qc6jy7c3ttre7nct6uyl20pfky5r7e/DGL",
        coinMinimalDenom:
          "ibc/D69F6D787EC649F4E998161A9F0646F4C2DCC64748A2AB982F14CAFBA7CC0EC9",
        symbol: "DGL",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dgl.png",
        },
        price: {
          poolId: "1143",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "factory/juno1u805lv20qc6jy7c3ttre7nct6uyl20pfky5r7e/DGL",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-42",
              path: "transfer/channel-42/factory/juno1u805lv20qc6jy7c3ttre7nct6uyl20pfky5r7e/DGL",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "factory/juno1u805lv20qc6jy7c3ttre7nct6uyl20pfky5r7e/DGL",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "DGL",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dgl.png",
            },
          },
        ],
        variantGroupKey: "DGL",
        name: "Licorice",
        description: "",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/dgl.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno10gthz5ufgrpuk5cscve2f0hjp56wgp90psqxcrqlg4m9mcu9dh8q4864xy",
        coinMinimalDenom:
          "ibc/5F5B7DA5ECC80F6C7A8702D525BB0B74279B1F7B8EFAE36E423D68788F7F39FF",
        symbol: "KLEO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/kleomedes.png",
        },
        price: {
          poolId: "1421",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno10gthz5ufgrpuk5cscve2f0hjp56wgp90psqxcrqlg4m9mcu9dh8q4864xy",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno10gthz5ufgrpuk5cscve2f0hjp56wgp90psqxcrqlg4m9mcu9dh8q4864xy",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno10gthz5ufgrpuk5cscve2f0hjp56wgp90psqxcrqlg4m9mcu9dh8q4864xy",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "KLEO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/kleomedes.png",
            },
          },
        ],
        variantGroupKey: "KLEO",
        name: "Kleomedes",
        description: "Kleomedes Token",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/kleo.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1zkwveux7y6fmsr88atf3cyffx96p0c96qr8tgcsj7vfnhx7sal3s3zu3ps",
        coinMinimalDenom:
          "ibc/176DD560277BB0BD676260BE02EBAB697725CA85144D8A2BF286C6B5323DB5FE",
        symbol: "JAPE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/jape.png",
        },
        price: {
          poolId: "1377",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1zkwveux7y6fmsr88atf3cyffx96p0c96qr8tgcsj7vfnhx7sal3s3zu3ps",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1zkwveux7y6fmsr88atf3cyffx96p0c96qr8tgcsj7vfnhx7sal3s3zu3ps",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1zkwveux7y6fmsr88atf3cyffx96p0c96qr8tgcsj7vfnhx7sal3s3zu3ps",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "JAPE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/jape.png",
            },
          },
        ],
        variantGroupKey: "JAPE",
        name: "Junø Apes",
        description:
          "Governance and utility token for the Junø Apes NFT platform on Juno",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-17T17:14:00.000Z",
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/jape.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno14lycavan8gvpjn97aapzvwmsj8kyrvf644p05r0hu79namyj3ens87650k",
        coinMinimalDenom:
          "ibc/4BDADBEDA31899036AB286E9901116496A9D85FB87B35A408C9D67C0DCAC660A",
        symbol: "SGNL",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sgnl.png",
        },
        price: {
          poolId: "1392",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno14lycavan8gvpjn97aapzvwmsj8kyrvf644p05r0hu79namyj3ens87650k",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno14lycavan8gvpjn97aapzvwmsj8kyrvf644p05r0hu79namyj3ens87650k",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno14lycavan8gvpjn97aapzvwmsj8kyrvf644p05r0hu79namyj3ens87650k",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SGNL",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sgnl.png",
            },
          },
        ],
        variantGroupKey: "SGNL",
        name: "Signal",
        description: "Signal Art and Gaming on Juno",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-18T15:42:00.000Z",
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
          },
        ],
        relative_image_url: "/tokens/generated/sgnl.png",
      },
    ],
  },
  {
    chain_name: "evmos",
    chain_id: "evmos_9001-2",
    assets: [
      {
        chainName: "evmos",
        sourceDenom: "aevmos",
        coinMinimalDenom:
          "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A",
        symbol: "EVMOS",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.svg",
        },
        coingeckoId: "evmos",
        price: {
          poolId: "722",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Evmos App",
            type: "external_interface",
            depositUrl: "https://app.evmos.org/assets",
            withdrawUrl: "https://app.evmos.org/assets",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "evmos",
              chainId: "evmos_9001-2",
              sourceDenom: "aevmos",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-204",
              path: "transfer/channel-204/aevmos",
            },
          },
        ],
        counterparty: [
          {
            chainName: "evmos",
            sourceDenom: "aevmos",
            chainType: "cosmos",
            chainId: "evmos_9001-2",
            symbol: "EVMOS",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.svg",
            },
          },
        ],
        variantGroupKey: "EVMOS",
        name: "Evmos",
        description:
          "The native EVM, governance and staking token of the Evmos Hub\n\nDevelopers use Evmos as the Ethereum Canary Chain to deploy applications of the future. Get all the functionalities of Ethereum with the power of IBC and Interchain composability.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/EvmosOrg",
        relatedAssets: [
          {
            chainName: "evmos",
            sourceDenom: "erc20/0x655ecB57432CC1370f65e5dc2309588b71b473A9",
          },
          {
            chainName: "stride",
            sourceDenom: "staevmos",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "stride",
            sourceDenom: "stuumee",
          },
          {
            chainName: "stride",
            sourceDenom: "stusomm",
          },
        ],
        relative_image_url: "/tokens/generated/evmos.svg",
      },
      {
        chainName: "evmos",
        sourceDenom: "erc20/0x655ecB57432CC1370f65e5dc2309588b71b473A9",
        coinMinimalDenom:
          "ibc/DEE262653B9DE39BCEF0493D47E0DFC4FE62F7F046CF38B9FDEFEBE98D149A71",
        symbol: "NEOK",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/neok.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/neok.svg",
        },
        price: {
          poolId: "1121",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Evmos App",
            type: "external_interface",
            depositUrl: "https://app.evmos.org/assets",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "evmos",
              chainId: "evmos_9001-2",
              sourceDenom: "erc20/0x655ecB57432CC1370f65e5dc2309588b71b473A9",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-204",
              path: "transfer/channel-204/erc20/0x655ecB57432CC1370f65e5dc2309588b71b473A9",
            },
          },
        ],
        counterparty: [
          {
            chainName: "evmos",
            sourceDenom: "erc20/0x655ecB57432CC1370f65e5dc2309588b71b473A9",
            chainType: "cosmos",
            chainId: "evmos_9001-2",
            symbol: "NEOK",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/neok.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/neok.svg",
            },
          },
        ],
        variantGroupKey: "NEOK",
        name: "Neokingdom DAO",
        description: "The token of Neokingdom DAO.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "evmos",
            sourceDenom: "aevmos",
          },
          {
            chainName: "stride",
            sourceDenom: "staevmos",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "stride",
            sourceDenom: "stuumee",
          },
          {
            chainName: "stride",
            sourceDenom: "stusomm",
          },
        ],
        relative_image_url: "/tokens/generated/neok.svg",
      },
    ],
  },
  {
    chain_name: "kava",
    chain_id: "kava_2222-10",
    assets: [
      {
        chainName: "kava",
        sourceDenom: "ukava",
        coinMinimalDenom:
          "ibc/57AA1A70A4BC9769C525EBF6386F7A21536E04A79D62E1981EFCEF9428EBB205",
        symbol: "KAVA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/kava.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/kava.svg",
        },
        coingeckoId: "kava",
        price: {
          poolId: "1105",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kava",
              chainId: "kava_2222-10",
              sourceDenom: "ukava",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-143",
              path: "transfer/channel-143/ukava",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kava",
            sourceDenom: "ukava",
            chainType: "cosmos",
            chainId: "kava_2222-10",
            symbol: "KAVA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/kava.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/kava.svg",
            },
          },
        ],
        variantGroupKey: "KAVA",
        name: "Kava",
        description:
          "The native staking and governance token of Kava\n\nKava is a decentralized blockchain that combines the speed and interoperability of Cosmos with the developer power of Ethereum.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/KAVA_CHAIN",
        relatedAssets: [
          {
            chainName: "kava",
            sourceDenom: "hard",
          },
          {
            chainName: "kava",
            sourceDenom: "swp",
          },
          {
            chainName: "kava",
            sourceDenom: "usdx",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
        ],
        relative_image_url: "/tokens/generated/kava.svg",
      },
      {
        chainName: "kava",
        sourceDenom: "hard",
        coinMinimalDenom:
          "ibc/D6C28E07F7343360AC41E15DDD44D79701DDCA2E0C2C41279739C8D4AE5264BC",
        symbol: "HARD",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/hard.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/hard.svg",
        },
        coingeckoId: "kava-lend",
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kava",
              chainId: "kava_2222-10",
              sourceDenom: "hard",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-143",
              path: "transfer/channel-143/hard",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kava",
            sourceDenom: "hard",
            chainType: "cosmos",
            chainId: "kava_2222-10",
            symbol: "HARD",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/hard.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/hard.svg",
            },
          },
        ],
        variantGroupKey: "HARD",
        name: "Kava Hard",
        description: "Governance token of Kava Lend Protocol",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "kava",
            sourceDenom: "ukava",
          },
          {
            chainName: "kava",
            sourceDenom: "swp",
          },
          {
            chainName: "kava",
            sourceDenom: "usdx",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
        ],
        relative_image_url: "/tokens/generated/hard.svg",
      },
      {
        chainName: "kava",
        sourceDenom: "swp",
        coinMinimalDenom:
          "ibc/70CF1A54E23EA4E480DEDA9E12082D3FD5684C3483CBDCE190C5C807227688C5",
        symbol: "SWP",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/swp.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/swp.svg",
        },
        coingeckoId: "kava-swap",
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kava",
              chainId: "kava_2222-10",
              sourceDenom: "swp",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-143",
              path: "transfer/channel-143/swp",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kava",
            sourceDenom: "swp",
            chainType: "cosmos",
            chainId: "kava_2222-10",
            symbol: "SWP",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/swp.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/swp.svg",
            },
          },
        ],
        variantGroupKey: "SWP",
        name: "Kava Swap",
        description: "Governance token of Kava Swap Protocol",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "kava",
            sourceDenom: "ukava",
          },
          {
            chainName: "kava",
            sourceDenom: "hard",
          },
          {
            chainName: "kava",
            sourceDenom: "usdx",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
        ],
        relative_image_url: "/tokens/generated/swp.svg",
      },
      {
        chainName: "kava",
        sourceDenom: "usdx",
        coinMinimalDenom:
          "ibc/C78F65E1648A3DFE0BAEB6C4CDA69CC2A75437F1793C0E6386DFDA26393790AE",
        symbol: "USDX",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/usdx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/usdx.svg",
        },
        coingeckoId: "usdx",
        price: {
          poolId: "1390",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kava",
              chainId: "kava_2222-10",
              sourceDenom: "usdx",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-143",
              path: "transfer/channel-143/usdx",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kava",
            sourceDenom: "usdx",
            chainType: "cosmos",
            chainId: "kava_2222-10",
            symbol: "USDX",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/usdx.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/usdx.svg",
            },
          },
        ],
        variantGroupKey: "USDX",
        name: "Kava USDX",
        description: "The native stablecoin of Kava",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "kava",
            sourceDenom: "ukava",
          },
          {
            chainName: "kava",
            sourceDenom: "hard",
          },
          {
            chainName: "kava",
            sourceDenom: "swp",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
        ],
        relative_image_url: "/tokens/generated/usdx.svg",
      },
      {
        chainName: "kava",
        sourceDenom: "erc20/tether/usdt",
        coinMinimalDenom:
          "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        symbol: "USDT",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
        },
        coingeckoId: "tether",
        price: {
          poolId: "1220",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kava",
              chainId: "kava_2222-10",
              sourceDenom: "erc20/tether/usdt",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-143",
              path: "transfer/channel-143/erc20/tether/usdt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
            chainType: "cosmos",
            chainId: "kava_2222-10",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            chainType: "evm",
            chainId: 1,
            address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
        ],
        variantGroupKey: "USDT",
        name: "Tether USD",
        description:
          "Tether gives you the joint benefits of open blockchain technology and traditional currency by converting your cash into a stable digital currency equivalent.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
          },
          {
            chainName: "kava",
            sourceDenom: "ukava",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "frax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/usdt.svg",
      },
    ],
  },
  {
    chain_name: "secretnetwork",
    chain_id: "secret-4",
    assets: [
      {
        chainName: "secretnetwork",
        sourceDenom: "uscrt",
        coinMinimalDenom:
          "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
        symbol: "SCRT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.svg",
        },
        coingeckoId: "secret",
        price: {
          poolId: "1095",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "uscrt",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-88",
              path: "transfer/channel-88/uscrt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "uscrt",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "SCRT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.svg",
            },
          },
        ],
        variantGroupKey: "SCRT",
        name: "Secret Network",
        description:
          "The native token of Secret Network\n\nSecret Network is the first blockchain with customizable privacy. You get to choose what you share, with whom, and how. This protects users, and empowers developers to build a better Web3.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/SecretNetwork",
        relatedAssets: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
          },
        ],
        relative_image_url: "/tokens/generated/scrt.svg",
      },
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
        coinMinimalDenom:
          "ibc/A6383B6CF5EA23E067666C06BC34E2A96869927BD9744DC0C1643E589C710AA3",
        symbol: "ALTER",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/alter.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/alter.svg",
        },
        coingeckoId: "alter",
        price: {
          poolId: "845",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Secret Network IBC Transfer",
            type: "external_interface",
            depositUrl: "https://dash.scrt.network/ibc",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channelId: "channel-44",
            },
            chain: {
              port: "transfer",
              channelId: "channel-476",
              path: "transfer/channel-476/cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "ALTER",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/alter.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/alter.svg",
            },
          },
        ],
        variantGroupKey: "ALTER",
        name: "Alter",
        description: "The native token cw20 for Alter on Secret Network",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "secretnetwork",
            sourceDenom: "uscrt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
          },
        ],
        relative_image_url: "/tokens/generated/alter.svg",
      },
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
        coinMinimalDenom:
          "ibc/1FBA9E763B8679BEF7BAAAF2D16BCA78C3B297D226C3F31312C769D7B8F992D8",
        symbol: "BUTT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/butt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/butt.svg",
        },
        coingeckoId: "buttcoin-2",
        price: {
          poolId: "985",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Secret Network IBC Transfer",
            type: "external_interface",
            depositUrl: "https://dash.scrt.network/ibc",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channelId: "channel-44",
            },
            chain: {
              port: "transfer",
              channelId: "channel-476",
              path: "transfer/channel-476/cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "BUTT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/butt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/butt.svg",
            },
          },
        ],
        variantGroupKey: "BUTT",
        name: "Button",
        description: "The native token cw20 for Button on Secret Network",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "secretnetwork",
            sourceDenom: "uscrt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
          },
        ],
        relative_image_url: "/tokens/generated/butt.svg",
      },
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
        coinMinimalDenom:
          "ibc/71055835C7639739EAE03AACD1324FE162DBA41D09F197CB72D966D014225B1C",
        symbol: "SHD(old)",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shdold.svg",
        },
        price: {
          poolId: "846",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Secret Network IBC Transfer",
            type: "external_interface",
            depositUrl: "https://dash.scrt.network/ibc",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channelId: "channel-44",
            },
            chain: {
              port: "transfer",
              channelId: "channel-476",
              path: "transfer/channel-476/cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "SHD(old)",
            decimals: 8,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shdold.svg",
            },
          },
        ],
        variantGroupKey: "SHD(old)",
        name: "Shade (old)",
        description: "The native token cw20 for Shade on Secret Network",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "secretnetwork",
            sourceDenom: "uscrt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
          },
        ],
        relative_image_url: "/tokens/generated/shd(old).svg",
      },
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
        coinMinimalDenom:
          "ibc/9A8A93D04917A149C8AC7C16D3DA8F470D59E8D867499C4DA97450E1D7363213",
        symbol: "SIENNA",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/sienna.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/sienna.svg",
        },
        coingeckoId: "sienna",
        price: {
          poolId: "853",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Secret Network IBC Transfer",
            type: "external_interface",
            depositUrl: "https://dash.scrt.network/ibc",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channelId: "channel-44",
            },
            chain: {
              port: "transfer",
              channelId: "channel-476",
              path: "transfer/channel-476/cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "SIENNA",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/sienna.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/sienna.svg",
            },
          },
        ],
        variantGroupKey: "SIENNA",
        name: "SIENNA",
        description: "The native token cw20 for SIENNA on Secret Network",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "secretnetwork",
            sourceDenom: "uscrt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
          },
        ],
        relative_image_url: "/tokens/generated/sienna.svg",
      },
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
        coinMinimalDenom:
          "ibc/D0E5BF2940FB58D9B283A339032DE88111407AAD7D94A7F1F3EB78874F8616D4",
        symbol: "stkd-SCRT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/stkd-scrt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/stkd-scrt.svg",
        },
        coingeckoId: "stkd-scrt",
        price: {
          poolId: "854",
          denom:
            "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Secret Network IBC Transfer",
            type: "external_interface",
            depositUrl: "https://dash.scrt.network/ibc",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channelId: "channel-44",
            },
            chain: {
              port: "transfer",
              channelId: "channel-476",
              path: "transfer/channel-476/cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "stkd-SCRT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/stkd-scrt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/stkd-scrt.svg",
            },
          },
        ],
        variantGroupKey: "stkd-SCRT",
        name: "SCRT Staking Derivatives",
        description:
          "The native token cw20 for SCRT Staking Derivatives on Secret Network",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "secretnetwork",
            sourceDenom: "uscrt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
          },
        ],
        relative_image_url: "/tokens/generated/stkd-scrt.svg",
      },
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
        coinMinimalDenom:
          "ibc/18A1B70E3205A48DE8590C0D11030E7146CDBF1048789261D53FFFD7527F8B55",
        symbol: "AMBER",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/amber.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/amber.svg",
        },
        price: {
          poolId: "984",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Secret Network IBC Transfer",
            type: "external_interface",
            depositUrl: "https://dash.scrt.network/ibc",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channelId: "channel-44",
            },
            chain: {
              port: "transfer",
              channelId: "channel-476",
              path: "transfer/channel-476/cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "AMBER",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/amber.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/amber.svg",
            },
          },
        ],
        variantGroupKey: "AMBER",
        name: "Amber",
        description: "The native token cw20 for Amber on Secret Network",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "secretnetwork",
            sourceDenom: "uscrt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
          },
        ],
        relative_image_url: "/tokens/generated/amber.svg",
      },
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
        coinMinimalDenom:
          "ibc/8A025A1E70101E39DE0C0F153E582A30806D3DA16795F6D868A3AA247D2DEDF7",
        symbol: "SILK",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/silk.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/silk.svg",
        },
        coingeckoId: "silk-bcec1136-561c-4706-a42c-8b67d0d7f7d2",
        price: {
          poolId: "1358",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Secret Network IBC Transfer",
            type: "external_interface",
            depositUrl: "https://dash.scrt.network/ibc",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channelId: "channel-44",
            },
            chain: {
              port: "transfer",
              channelId: "channel-476",
              path: "transfer/channel-476/cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "SILK",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/silk.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/silk.svg",
            },
          },
        ],
        variantGroupKey: "SILK",
        name: "Silk",
        description: "The native token cw20 for Silk on Secret Network",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "secretnetwork",
            sourceDenom: "uscrt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
          },
        ],
        relative_image_url: "/tokens/generated/silk.svg",
      },
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
        coinMinimalDenom:
          "ibc/0B3D528E74E3DEAADF8A68F393887AC7E06028904D02173561B0D27F6E751D0A",
        symbol: "SHD",
        decimals: 8,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shd.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shd.svg",
        },
        coingeckoId: "shade-protocol",
        price: {
          poolId: "1170",
          denom:
            "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channelId: "channel-44",
            },
            chain: {
              port: "transfer",
              channelId: "channel-476",
              path: "transfer/channel-476/cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "SHD",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shd.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shd.svg",
            },
          },
        ],
        variantGroupKey: "SHD",
        name: "Shade",
        description: "The native token cw20 for Shade on Secret Network",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "secretnetwork",
            sourceDenom: "uscrt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
          },
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
          },
        ],
        relative_image_url: "/tokens/generated/shd.svg",
      },
    ],
  },
  {
    chain_name: "stargaze",
    chain_id: "stargaze-1",
    assets: [
      {
        chainName: "stargaze",
        sourceDenom: "ustars",
        coinMinimalDenom:
          "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
        symbol: "STARS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.svg",
        },
        coingeckoId: "stargaze",
        price: {
          poolId: "1096",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stargaze",
              chainId: "stargaze-1",
              sourceDenom: "ustars",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-75",
              path: "transfer/channel-75/ustars",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stargaze",
            sourceDenom: "ustars",
            chainType: "cosmos",
            chainId: "stargaze-1",
            symbol: "STARS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.svg",
            },
          },
        ],
        variantGroupKey: "STARS",
        name: "Stargaze",
        description:
          "The native token of Stargaze\n\nThe premier community-focused blockchain for NFTs. Stargaze empowers creators, developers, collectors, and traders to participate on the platform. The Stargaze chain consists of various NFT-related apps such as a Launchpad, and a Marketplace with offers and auctions.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/StargazeZone",
        relatedAssets: [
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
          },
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
          },
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars1xx5976njvxpl9n4v8huvff6cudhx7yuu8e7rt4/usneaky",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
        ],
        relative_image_url: "/tokens/generated/stars.svg",
      },
      {
        chainName: "stargaze",
        sourceDenom:
          "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
        coinMinimalDenom:
          "ibc/CFF40564FDA3E958D9904B8B479124987901168494655D9CC6B7C0EC0416020B",
        symbol: "STRDST",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/dust.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/dust.svg",
        },
        coingeckoId: "",
        price: {
          poolId: "1234",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stargaze",
              chainId: "stargaze-1",
              sourceDenom:
                "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-75",
              path: "transfer/channel-75/factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
            chainType: "cosmos",
            chainId: "stargaze-1",
            symbol: "STRDST",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/dust.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/dust.svg",
            },
          },
        ],
        variantGroupKey: "STRDST",
        name: "Stardust STRDST",
        description: "The native token of ohhNFT.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "stargaze",
            sourceDenom: "ustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
          },
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars1xx5976njvxpl9n4v8huvff6cudhx7yuu8e7rt4/usneaky",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
        ],
        relative_image_url: "/tokens/generated/strdst.svg",
      },
      {
        chainName: "stargaze",
        sourceDenom:
          "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
        coinMinimalDenom:
          "ibc/71DAA4CAFA4FE2F9803ABA0696BA5FC0EFC14305A2EA8B4E01880DB851B1EC02",
        symbol: "BRNCH",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/brnch.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/brnch.svg",
        },
        coingeckoId: "",
        price: {
          poolId: "1288",
          denom:
            "ibc/CFF40564FDA3E958D9904B8B479124987901168494655D9CC6B7C0EC0416020B",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stargaze",
              chainId: "stargaze-1",
              sourceDenom:
                "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-75",
              path: "transfer/channel-75/factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
            chainType: "cosmos",
            chainId: "stargaze-1",
            symbol: "BRNCH",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/brnch.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/brnch.svg",
            },
          },
        ],
        variantGroupKey: "BRNCH",
        name: "Branch",
        description: "ohhNFT LP token.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "stargaze",
            sourceDenom: "ustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
          },
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars1xx5976njvxpl9n4v8huvff6cudhx7yuu8e7rt4/usneaky",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
        ],
        relative_image_url: "/tokens/generated/brnch.svg",
      },
      {
        chainName: "stargaze",
        sourceDenom:
          "factory/stars1xx5976njvxpl9n4v8huvff6cudhx7yuu8e7rt4/usneaky",
        coinMinimalDenom:
          "ibc/94ED1F172BC633DFC56D7E26551D8B101ADCCC69052AC44FED89F97FF658138F",
        symbol: "SNEAKY",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/sneaky.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/sneaky.svg",
        },
        coingeckoId: "",
        price: {
          poolId: "1403",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stargaze",
              chainId: "stargaze-1",
              sourceDenom:
                "factory/stars1xx5976njvxpl9n4v8huvff6cudhx7yuu8e7rt4/usneaky",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-75",
              path: "transfer/channel-75/factory/stars1xx5976njvxpl9n4v8huvff6cudhx7yuu8e7rt4/usneaky",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars1xx5976njvxpl9n4v8huvff6cudhx7yuu8e7rt4/usneaky",
            chainType: "cosmos",
            chainId: "stargaze-1",
            symbol: "SNEAKY",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/sneaky.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/sneaky.svg",
            },
          },
        ],
        variantGroupKey: "SNEAKY",
        name: "Sneaky Productions",
        description: "The native coin of Sneaky Productions.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-22T12:50:00.000Z",
        relatedAssets: [
          {
            chainName: "stargaze",
            sourceDenom: "ustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
          },
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
        ],
        relative_image_url: "/tokens/generated/sneaky.svg",
      },
    ],
  },
  {
    chain_name: "chihuahua",
    chain_id: "chihuahua-1",
    assets: [
      {
        chainName: "chihuahua",
        sourceDenom: "uhuahua",
        coinMinimalDenom:
          "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
        symbol: "HUAHUA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/huahua.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/huahua.svg",
        },
        coingeckoId: "chihuahua-token",
        price: {
          poolId: "1111",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "chihuahua",
              chainId: "chihuahua-1",
              sourceDenom: "uhuahua",
              port: "transfer",
              channelId: "channel-7",
            },
            chain: {
              port: "transfer",
              channelId: "channel-113",
              path: "transfer/channel-113/uhuahua",
            },
          },
        ],
        counterparty: [
          {
            chainName: "chihuahua",
            sourceDenom: "uhuahua",
            chainType: "cosmos",
            chainId: "chihuahua-1",
            symbol: "HUAHUA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/huahua.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/huahua.svg",
            },
          },
        ],
        variantGroupKey: "HUAHUA",
        name: "Chihuahua",
        description: "The native token of Chihuahua Chain",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "chihuahua",
            sourceDenom:
              "cw20:chihuahua1yl8z39ugle8s02fpwkhh293509q5xcpalmdzc4amvchz8nkexrmsy95gef",
          },
          {
            chainName: "chihuahua",
            sourceDenom:
              "factory/chihuahua1x4q2vkrz4dfgd9hcw0p5m2f2nuv2uqmt9xr8k2/achihuahuawifhat",
          },
          {
            chainName: "chihuahua",
            sourceDenom:
              "factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/uwoof",
          },
        ],
        relative_image_url: "/tokens/generated/huahua.svg",
      },
      {
        chainName: "chihuahua",
        sourceDenom:
          "cw20:chihuahua1yl8z39ugle8s02fpwkhh293509q5xcpalmdzc4amvchz8nkexrmsy95gef",
        coinMinimalDenom:
          "ibc/46AC07DBFF1352EC94AF5BD4D23740D92D9803A6B41F6E213E77F3A1143FB963",
        symbol: "PUPPY",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/puppyhuahua_logo.png",
        },
        price: {
          poolId: "1332",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "chihuahua",
              chainId: "chihuahua-1",
              sourceDenom:
                "cw20:chihuahua1yl8z39ugle8s02fpwkhh293509q5xcpalmdzc4amvchz8nkexrmsy95gef",
              port: "wasm.chihuahua1jwkag4yvhyj9fuddtkygvavya8hmdjuzmgxwg9vp3lw9twv6lrcq9mgl52",
              channelId: "channel-73",
            },
            chain: {
              port: "transfer",
              channelId: "channel-11348",
              path: "transfer/channel-11348/cw20:chihuahua1yl8z39ugle8s02fpwkhh293509q5xcpalmdzc4amvchz8nkexrmsy95gef",
            },
          },
        ],
        counterparty: [
          {
            chainName: "chihuahua",
            sourceDenom:
              "cw20:chihuahua1yl8z39ugle8s02fpwkhh293509q5xcpalmdzc4amvchz8nkexrmsy95gef",
            chainType: "cosmos",
            chainId: "chihuahua-1",
            symbol: "PUPPY",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/puppyhuahua_logo.png",
            },
          },
        ],
        variantGroupKey: "PUPPY",
        name: "Puppy",
        description: "Puppy",
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        relatedAssets: [
          {
            chainName: "chihuahua",
            sourceDenom: "uhuahua",
          },
          {
            chainName: "chihuahua",
            sourceDenom:
              "factory/chihuahua1x4q2vkrz4dfgd9hcw0p5m2f2nuv2uqmt9xr8k2/achihuahuawifhat",
          },
          {
            chainName: "chihuahua",
            sourceDenom:
              "factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/uwoof",
          },
        ],
        relative_image_url: "/tokens/generated/puppy.png",
      },
      {
        chainName: "chihuahua",
        sourceDenom:
          "factory/chihuahua1x4q2vkrz4dfgd9hcw0p5m2f2nuv2uqmt9xr8k2/achihuahuawifhat",
        coinMinimalDenom:
          "ibc/2FFE07C4B4EFC0DDA099A16C6AF3C9CCA653CC56077E87217A585D48794B0BC7",
        symbol: "BADDOG",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/baddog.png",
        },
        price: {
          poolId: "1420",
          denom:
            "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "chihuahua",
              chainId: "chihuahua-1",
              sourceDenom:
                "factory/chihuahua1x4q2vkrz4dfgd9hcw0p5m2f2nuv2uqmt9xr8k2/achihuahuawifhat",
              port: "transfer",
              channelId: "channel-7",
            },
            chain: {
              port: "transfer",
              channelId: "channel-113",
              path: "transfer/channel-113/factory/chihuahua1x4q2vkrz4dfgd9hcw0p5m2f2nuv2uqmt9xr8k2/achihuahuawifhat",
            },
          },
        ],
        counterparty: [
          {
            chainName: "chihuahua",
            sourceDenom:
              "factory/chihuahua1x4q2vkrz4dfgd9hcw0p5m2f2nuv2uqmt9xr8k2/achihuahuawifhat",
            chainType: "cosmos",
            chainId: "chihuahua-1",
            symbol: "BADDOG",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/baddog.png",
            },
          },
        ],
        variantGroupKey: "BADDOG",
        name: "Chihuahuawifhat",
        description: "has a hat",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "chihuahua",
            sourceDenom: "uhuahua",
          },
          {
            chainName: "chihuahua",
            sourceDenom:
              "cw20:chihuahua1yl8z39ugle8s02fpwkhh293509q5xcpalmdzc4amvchz8nkexrmsy95gef",
          },
          {
            chainName: "chihuahua",
            sourceDenom:
              "factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/uwoof",
          },
        ],
        relative_image_url: "/tokens/generated/baddog.png",
      },
      {
        chainName: "chihuahua",
        sourceDenom:
          "factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/uwoof",
        coinMinimalDenom:
          "ibc/9B8EC667B6DF55387DC0F3ACC4F187DA6921B0806ED35DE6B04DE96F5AB81F53",
        symbol: "WOOF",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/woof.png",
        },
        price: {
          poolId: "1365",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "chihuahua",
              chainId: "chihuahua-1",
              sourceDenom:
                "factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/uwoof",
              port: "transfer",
              channelId: "channel-7",
            },
            chain: {
              port: "transfer",
              channelId: "channel-113",
              path: "transfer/channel-113/factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/uwoof",
            },
          },
        ],
        counterparty: [
          {
            chainName: "chihuahua",
            sourceDenom:
              "factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/uwoof",
            chainType: "cosmos",
            chainId: "chihuahua-1",
            symbol: "WOOF",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/woof.png",
            },
          },
        ],
        variantGroupKey: "WOOF",
        name: "WOOF",
        description: "Woof",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-17T17:41:00.000Z",
        relatedAssets: [
          {
            chainName: "chihuahua",
            sourceDenom: "uhuahua",
          },
          {
            chainName: "chihuahua",
            sourceDenom:
              "cw20:chihuahua1yl8z39ugle8s02fpwkhh293509q5xcpalmdzc4amvchz8nkexrmsy95gef",
          },
          {
            chainName: "chihuahua",
            sourceDenom:
              "factory/chihuahua1x4q2vkrz4dfgd9hcw0p5m2f2nuv2uqmt9xr8k2/achihuahuawifhat",
          },
        ],
        relative_image_url: "/tokens/generated/woof.png",
      },
    ],
  },
  {
    chain_name: "persistence",
    chain_id: "core-1",
    assets: [
      {
        chainName: "persistence",
        sourceDenom: "uxprt",
        coinMinimalDenom:
          "ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293",
        symbol: "XPRT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.svg",
        },
        coingeckoId: "persistence",
        price: {
          poolId: "1101",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "persistence",
              chainId: "core-1",
              sourceDenom: "uxprt",
              port: "transfer",
              channelId: "channel-6",
            },
            chain: {
              port: "transfer",
              channelId: "channel-4",
              path: "transfer/channel-4/uxprt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "persistence",
            sourceDenom: "uxprt",
            chainType: "cosmos",
            chainId: "core-1",
            symbol: "XPRT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.svg",
            },
          },
        ],
        variantGroupKey: "XPRT",
        name: "Persistence",
        description:
          "The XPRT token is primarily a governance token for the Persistence chain.\n\nPersistence is an app chain for Liquid Staking powering an ecosystem of DeFi applications focused on unlocking the liquidity of staked assets.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/PersistenceOne",
        relatedAssets: [
          {
            chainName: "persistence",
            sourceDenom:
              "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
          },
          {
            chainName: "persistence",
            sourceDenom: "stk/uatom",
          },
          {
            chainName: "persistence",
            sourceDenom: "stk/uosmo",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "ugraviton",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
          },
        ],
        relative_image_url: "/tokens/generated/xprt.svg",
      },
      {
        chainName: "persistence",
        sourceDenom:
          "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
        coinMinimalDenom:
          "ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961",
        symbol: "PSTAKE",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.svg",
        },
        coingeckoId: "pstake-finance",
        price: {
          poolId: "648",
          denom: "uosmo",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "persistence",
              chainId: "core-1",
              sourceDenom:
                "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
              port: "transfer",
              channelId: "channel-6",
            },
            chain: {
              port: "transfer",
              channelId: "channel-4",
              path: "transfer/channel-4/transfer/channel-38/gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
            },
          },
        ],
        counterparty: [
          {
            chainName: "persistence",
            sourceDenom:
              "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
            chainType: "cosmos",
            chainId: "core-1",
            symbol: "PSTAKE",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.svg",
            },
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "PSTAKE",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
            chainType: "evm",
            chainId: 1,
            address: "0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
            symbol: "PSTAKE",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.svg",
            },
          },
        ],
        variantGroupKey: "PSTAKE",
        name: "pSTAKE Finance",
        description:
          "pSTAKE is a liquid staking protocol unlocking the liquidity of staked assets. Stakers of PoS tokens can stake their assets while maintaining the liquidity of these assets. Users earn staking rewards + receive 1:1 pegged staked representative tokens which can be used to generate additional yield.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "persistence",
            sourceDenom: "uxprt",
          },
          {
            chainName: "persistence",
            sourceDenom: "stk/uatom",
          },
          {
            chainName: "persistence",
            sourceDenom: "stk/uosmo",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "ugraviton",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
          },
        ],
        relative_image_url: "/tokens/generated/pstake.svg",
      },
      {
        chainName: "persistence",
        sourceDenom: "stk/uatom",
        coinMinimalDenom:
          "ibc/CAA179E40F0266B0B29FB5EAA288FB9212E628822265D4141EBD1C47C3CBFCBC",
        symbol: "stkATOM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkatom.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkatom.svg",
        },
        coingeckoId: "stkatom",
        price: {
          poolId: "886",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "persistence",
              chainId: "core-1",
              sourceDenom: "stk/uatom",
              port: "transfer",
              channelId: "channel-6",
            },
            chain: {
              port: "transfer",
              channelId: "channel-4",
              path: "transfer/channel-4/stk/uatom",
            },
          },
        ],
        counterparty: [
          {
            chainName: "persistence",
            sourceDenom: "stk/uatom",
            chainType: "cosmos",
            chainId: "core-1",
            symbol: "stkATOM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkatom.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkatom.svg",
            },
          },
        ],
        variantGroupKey: "stkATOM",
        name: "PSTAKE staked ATOM",
        description: "PSTAKE Liquid-Staked ATOM",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "persistence",
            sourceDenom: "uxprt",
          },
          {
            chainName: "persistence",
            sourceDenom:
              "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
          },
          {
            chainName: "persistence",
            sourceDenom: "stk/uosmo",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "ugraviton",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
          },
        ],
        relative_image_url: "/tokens/generated/stkatom.svg",
      },
      {
        chainName: "persistence",
        sourceDenom: "stk/uosmo",
        coinMinimalDenom:
          "ibc/ECBE78BF7677320A93E7BA1761D144BCBF0CBC247C290C049655E106FE5DC68E",
        symbol: "stkOSMO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkosmo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkosmo.svg",
        },
        coingeckoId: "pstake-staked-osmo",
        price: {
          poolId: "1323",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "persistence",
              chainId: "core-1",
              sourceDenom: "stk/uosmo",
              port: "transfer",
              channelId: "channel-6",
            },
            chain: {
              port: "transfer",
              channelId: "channel-4",
              path: "transfer/channel-4/stk/uosmo",
            },
          },
        ],
        counterparty: [
          {
            chainName: "persistence",
            sourceDenom: "stk/uosmo",
            chainType: "cosmos",
            chainId: "core-1",
            symbol: "stkOSMO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkosmo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkosmo.svg",
            },
          },
        ],
        variantGroupKey: "stkOSMO",
        name: "PSTAKE staked OSMO",
        description: "PSTAKE Liquid-Staked OSMO",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "persistence",
            sourceDenom: "uxprt",
          },
          {
            chainName: "persistence",
            sourceDenom:
              "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
          },
          {
            chainName: "persistence",
            sourceDenom: "stk/uatom",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "ugraviton",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
          },
        ],
        relative_image_url: "/tokens/generated/stkosmo.svg",
      },
    ],
  },
  {
    chain_name: "akash",
    chain_id: "akashnet-2",
    assets: [
      {
        chainName: "akash",
        sourceDenom: "uakt",
        coinMinimalDenom:
          "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
        symbol: "AKT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.svg",
        },
        coingeckoId: "akash-network",
        price: {
          poolId: "1093",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "akash",
              chainId: "akashnet-2",
              sourceDenom: "uakt",
              port: "transfer",
              channelId: "channel-9",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1",
              path: "transfer/channel-1/uakt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "akash",
            sourceDenom: "uakt",
            chainType: "cosmos",
            chainId: "akashnet-2",
            symbol: "AKT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.svg",
            },
          },
        ],
        variantGroupKey: "AKT",
        name: "Akash",
        description:
          "Akash Token (AKT) is the Akash Network's native utility token, used as the primary means to govern, secure the blockchain, incentivize participants, and provide a default mechanism to store and exchange value.\n\nAkash is open-source Supercloud that lets users buy and sell computing resources securely and efficiently. Purpose-built for public utility.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/akashnet_",
        relatedAssets: [],
        relative_image_url: "/tokens/generated/akt.svg",
      },
    ],
  },
  {
    chain_name: "regen",
    chain_id: "regen-1",
    assets: [
      {
        chainName: "regen",
        sourceDenom: "uregen",
        coinMinimalDenom:
          "ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076",
        symbol: "REGEN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.svg",
        },
        coingeckoId: "regen",
        price: {
          poolId: "42",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "regen",
              chainId: "regen-1",
              sourceDenom: "uregen",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-8",
              path: "transfer/channel-8/uregen",
            },
          },
        ],
        counterparty: [
          {
            chainName: "regen",
            sourceDenom: "uregen",
            chainType: "cosmos",
            chainId: "regen-1",
            symbol: "REGEN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.svg",
            },
          },
        ],
        variantGroupKey: "REGEN",
        name: "Regen",
        description:
          "REGEN coin is the token for the Regen Network Platform\n\nRegen Network, a platform to originate and invest in high-integrity carbon and biodiversity credits from ecological regeneration projects.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/regen_network",
        relatedAssets: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqregen",
          },
          {
            chainName: "regen",
            sourceDenom: "eco.uC.NCT",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqatom",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqsomm",
          },
          {
            chainName: "cosmoshub",
            sourceDenom: "uatom",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "stargaze",
            sourceDenom: "ustars",
          },
        ],
        relative_image_url: "/tokens/generated/regen.svg",
      },
      {
        chainName: "regen",
        sourceDenom: "eco.uC.NCT",
        coinMinimalDenom:
          "ibc/A76EB6ECF4E3E2D4A23C526FD1B48FDD42F171B206C9D2758EF778A7826ADD68",
        symbol: "NCT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/nct.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/nct.svg",
        },
        coingeckoId: "toucan-protocol-nature-carbon-tonne",
        price: {
          poolId: "972",
          denom:
            "ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "regen",
              chainId: "regen-1",
              sourceDenom: "eco.uC.NCT",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-8",
              path: "transfer/channel-8/eco.uC.NCT",
            },
          },
        ],
        counterparty: [
          {
            chainName: "regen",
            sourceDenom: "eco.uC.NCT",
            chainType: "cosmos",
            chainId: "regen-1",
            symbol: "NCT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/nct.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/nct.svg",
            },
          },
        ],
        variantGroupKey: "NCT",
        name: "Nature Carbon Ton",
        description:
          "Nature Carbon Ton (NCT) is a carbon token standard backed 1:1 by carbon credits issued by Verra, a global leader in the voluntary carbon market. NCT credits on Regen Network have been tokenized by Toucan.earth.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "regen",
            sourceDenom: "uregen",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqregen",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqatom",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqsomm",
          },
          {
            chainName: "cosmoshub",
            sourceDenom: "uatom",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "stargaze",
            sourceDenom: "ustars",
          },
        ],
        relative_image_url: "/tokens/generated/nct.svg",
      },
    ],
  },
  {
    chain_name: "sentinel",
    chain_id: "sentinelhub-2",
    assets: [
      {
        chainName: "sentinel",
        sourceDenom: "udvpn",
        coinMinimalDenom:
          "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
        symbol: "DVPN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sentinel/images/dvpn.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sentinel/images/dvpn.svg",
        },
        coingeckoId: "sentinel",
        price: {
          poolId: "6",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "sentinel",
              chainId: "sentinelhub-2",
              sourceDenom: "udvpn",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2",
              path: "transfer/channel-2/udvpn",
            },
          },
        ],
        counterparty: [
          {
            chainName: "sentinel",
            sourceDenom: "udvpn",
            chainType: "cosmos",
            chainId: "sentinelhub-2",
            symbol: "DVPN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sentinel/images/dvpn.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sentinel/images/dvpn.svg",
            },
          },
        ],
        variantGroupKey: "DVPN",
        name: "Sentinel",
        description:
          "DVPN is the native token of the Sentinel Hub.\n\nThe Sentinel ecosystem is a global network of autonomous dVPN applications that enable private and censorship resistant internet access.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/SentinelVPN",
        relatedAssets: [],
        relative_image_url: "/tokens/generated/dvpn.svg",
      },
    ],
  },
  {
    chain_name: "irisnet",
    chain_id: "irishub-1",
    assets: [
      {
        chainName: "irisnet",
        sourceDenom: "uiris",
        coinMinimalDenom:
          "ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0",
        symbol: "IRIS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/irisnet/images/iris.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/irisnet/images/iris.svg",
        },
        coingeckoId: "iris-network",
        price: {
          poolId: "1106",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "irisnet",
              chainId: "irishub-1",
              sourceDenom: "uiris",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-6",
              path: "transfer/channel-6/uiris",
            },
          },
        ],
        counterparty: [
          {
            chainName: "irisnet",
            sourceDenom: "uiris",
            chainType: "cosmos",
            chainId: "irishub-1",
            symbol: "IRIS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/irisnet/images/iris.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/irisnet/images/iris.svg",
            },
          },
        ],
        variantGroupKey: "IRIS",
        name: "IRISnet",
        description:
          "The IRIS token is the native governance token for the IrisNet chain.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/iris.svg",
      },
    ],
  },
  {
    chain_name: "starname",
    chain_id: "iov-mainnet-ibc",
    assets: [
      {
        chainName: "starname",
        sourceDenom: "uiov",
        coinMinimalDenom:
          "ibc/52B1AA623B34EB78FD767CEA69E8D7FA6C9CFE1FBF49C5406268FD325E2CC2AC",
        symbol: "IOV",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/starname/images/iov.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/starname/images/iov.svg",
        },
        coingeckoId: "starname",
        price: {
          poolId: "197",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "starname",
              chainId: "iov-mainnet-ibc",
              sourceDenom: "uiov",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-15",
              path: "transfer/channel-15/uiov",
            },
          },
        ],
        counterparty: [
          {
            chainName: "starname",
            sourceDenom: "uiov",
            chainType: "cosmos",
            chainId: "iov-mainnet-ibc",
            symbol: "IOV",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/starname/images/iov.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/starname/images/iov.svg",
            },
          },
        ],
        variantGroupKey: "IOV",
        name: "Starname",
        description:
          "IOV coin is the token for the Starname (IOV) Asset Name Service\n\nStarname is the best way to claim your part of the blockchain. You can use it for decentralized identification, payments, ownership and applications. Starname can be integrated into digital wallets, dapps and exchanges.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/starname_me",
        relatedAssets: [],
        relative_image_url: "/tokens/generated/iov.svg",
      },
    ],
  },
  {
    chain_name: "emoney",
    chain_id: "emoney-3",
    assets: [
      {
        chainName: "emoney",
        sourceDenom: "ungm",
        coinMinimalDenom:
          "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
        symbol: "NGM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/ngm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/ngm.svg",
        },
        coingeckoId: "e-money",
        price: {
          poolId: "463",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "emoney",
              chainId: "emoney-3",
              sourceDenom: "ungm",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-37",
              path: "transfer/channel-37/ungm",
            },
          },
        ],
        counterparty: [
          {
            chainName: "emoney",
            sourceDenom: "ungm",
            chainType: "cosmos",
            chainId: "emoney-3",
            symbol: "NGM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/ngm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/ngm.svg",
            },
          },
        ],
        variantGroupKey: "NGM",
        name: "e-Money",
        description:
          "e-Money NGM staking token. In addition to earning staking rewards the token is bought back and burned based on e-Money stablecoin inflation.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "emoney",
            sourceDenom: "eeur",
          },
        ],
        relative_image_url: "/tokens/generated/ngm.svg",
      },
      {
        chainName: "emoney",
        sourceDenom: "eeur",
        coinMinimalDenom:
          "ibc/5973C068568365FFF40DEDCF1A1CB7582B6116B731CD31A12231AE25E20B871F",
        symbol: "EEUR",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/eeur.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/eeur.svg",
        },
        coingeckoId: "e-money-eur",
        price: {
          poolId: "481",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "emoney",
              chainId: "emoney-3",
              sourceDenom: "eeur",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-37",
              path: "transfer/channel-37/eeur",
            },
          },
        ],
        counterparty: [
          {
            chainName: "emoney",
            sourceDenom: "eeur",
            chainType: "cosmos",
            chainId: "emoney-3",
            symbol: "EEUR",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/eeur.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/eeur.svg",
            },
          },
        ],
        variantGroupKey: "EEUR",
        name: "e-Money EUR",
        description:
          "e-Money EUR stablecoin. Audited and backed by fiat EUR deposits and government bonds.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "emoney",
            sourceDenom: "ungm",
          },
        ],
        relative_image_url: "/tokens/generated/eeur.svg",
      },
    ],
  },
  {
    chain_name: "likecoin",
    chain_id: "likecoin-mainnet-2",
    assets: [
      {
        chainName: "likecoin",
        sourceDenom: "nanolike",
        coinMinimalDenom:
          "ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525",
        symbol: "LIKE",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/likecoin/images/like.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/likecoin/images/like.svg",
        },
        coingeckoId: "likecoin",
        price: {
          poolId: "553",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "likecoin",
              chainId: "likecoin-mainnet-2",
              sourceDenom: "nanolike",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-53",
              path: "transfer/channel-53/nanolike",
            },
          },
        ],
        counterparty: [
          {
            chainName: "likecoin",
            sourceDenom: "nanolike",
            chainType: "cosmos",
            chainId: "likecoin-mainnet-2",
            symbol: "LIKE",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/likecoin/images/like.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/likecoin/images/like.svg",
            },
          },
        ],
        variantGroupKey: "LIKE",
        name: "LikeCoin",
        description:
          "LIKE is the native staking and governance token of LikeCoin chain, a Decentralized Publishing Infrastructure to empower content ownership, authenticity, and provenance.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/like.svg",
      },
    ],
  },
  {
    chain_name: "impacthub",
    chain_id: "ixo-5",
    assets: [
      {
        chainName: "impacthub",
        sourceDenom: "uixo",
        coinMinimalDenom:
          "ibc/F3FF7A84A73B62921538642F9797C423D2B4C4ACB3C7FCFFCE7F12AA69909C4B",
        symbol: "IXO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/impacthub/images/ixo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/impacthub/images/ixo.svg",
        },
        coingeckoId: "ixo",
        price: {
          poolId: "558",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "impacthub",
              chainId: "ixo-5",
              sourceDenom: "uixo",
              port: "transfer",
              channelId: "channel-4",
            },
            chain: {
              port: "transfer",
              channelId: "channel-38",
              path: "transfer/channel-38/uixo",
            },
          },
        ],
        counterparty: [
          {
            chainName: "impacthub",
            sourceDenom: "uixo",
            chainType: "cosmos",
            chainId: "ixo-5",
            symbol: "IXO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/impacthub/images/ixo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/impacthub/images/ixo.svg",
            },
          },
        ],
        variantGroupKey: "IXO",
        name: "Impacts Hub",
        description: "The native token of IXO Chain",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/ixo.svg",
      },
    ],
  },
  {
    chain_name: "bitcanna",
    chain_id: "bitcanna-1",
    assets: [
      {
        chainName: "bitcanna",
        sourceDenom: "ubcna",
        coinMinimalDenom:
          "ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5",
        symbol: "BCNA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.svg",
        },
        coingeckoId: "bitcanna",
        price: {
          poolId: "571",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bitcanna",
              chainId: "bitcanna-1",
              sourceDenom: "ubcna",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-51",
              path: "transfer/channel-51/ubcna",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bitcanna",
            sourceDenom: "ubcna",
            chainType: "cosmos",
            chainId: "bitcanna-1",
            symbol: "BCNA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.svg",
            },
          },
        ],
        variantGroupKey: "BCNA",
        name: "BitCanna",
        description:
          "The BCNA coin is the transactional token within the BitCanna network, serving the legal cannabis industry through its payment network, supply chain and trust network.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/bcna.svg",
      },
    ],
  },
  {
    chain_name: "bitsong",
    chain_id: "bitsong-2b",
    assets: [
      {
        chainName: "bitsong",
        sourceDenom: "ubtsg",
        coinMinimalDenom:
          "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
        symbol: "BTSG",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/btsg.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/btsg.svg",
        },
        coingeckoId: "bitsong",
        price: {
          poolId: "574",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bitsong",
              chainId: "bitsong-2b",
              sourceDenom: "ubtsg",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-73",
              path: "transfer/channel-73/ubtsg",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bitsong",
            sourceDenom: "ubtsg",
            chainType: "cosmos",
            chainId: "bitsong-2b",
            symbol: "BTSG",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/btsg.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/btsg.svg",
            },
          },
        ],
        variantGroupKey: "BTSG",
        name: "BitSong",
        description:
          "BitSong Native Token\n\nArtists, Fans, Managers and Labels in One Single Holistic Ecosystem: $BTSG. Earn real-time royalties, discover exclusive content, mint and trade Fantokens, buy & sell NFTs.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/BitSongOfficial",
        relatedAssets: [],
        relative_image_url: "/tokens/generated/btsg.svg",
      },
    ],
  },
  {
    chain_name: "kichain",
    chain_id: "kichain-2",
    assets: [
      {
        chainName: "kichain",
        sourceDenom: "uxki",
        coinMinimalDenom:
          "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
        symbol: "XKI",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/xki.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/xki.svg",
        },
        coingeckoId: "ki",
        price: {
          poolId: "577",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kichain",
              chainId: "kichain-2",
              sourceDenom: "uxki",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-77",
              path: "transfer/channel-77/uxki",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kichain",
            sourceDenom: "uxki",
            chainType: "cosmos",
            chainId: "kichain-2",
            symbol: "XKI",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/xki.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/xki.svg",
            },
          },
        ],
        variantGroupKey: "XKI",
        name: "Ki",
        description: "The native token of Ki Chain",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "kichain",
            sourceDenom:
              "cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy",
          },
        ],
        relative_image_url: "/tokens/generated/xki.svg",
      },
      {
        chainName: "kichain",
        sourceDenom:
          "cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy",
        coinMinimalDenom:
          "ibc/AD185F62399F770CCCE8A36A180A77879FF6C26A0398BD3D2A74E087B0BFA121",
        symbol: "kichain.LVN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/lvn.png",
        },
        coingeckoId: "lvn",
        price: {
          poolId: "772",
          denom:
            "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kichain",
              chainId: "kichain-2",
              sourceDenom:
                "cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy",
              port: "wasm.ki1hzz0s0ucrhdp6tue2lxk3c03nj6f60qy463we7lgx0wudd72ctmsd9kgha",
              channelId: "channel-18",
            },
            chain: {
              port: "transfer",
              channelId: "channel-261",
              path: "transfer/channel-261/cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kichain",
            sourceDenom:
              "cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy",
            chainType: "cosmos",
            chainId: "kichain-2",
            symbol: "LVN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/lvn.png",
            },
          },
        ],
        variantGroupKey: "LVN",
        name: "LVN",
        description: "ELEVENPARIS loyalty token on KiChain",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "kichain",
            sourceDenom: "uxki",
          },
        ],
        relative_image_url: "/tokens/generated/kichain.lvn.png",
      },
    ],
  },
  {
    chain_name: "panacea",
    chain_id: "panacea-3",
    assets: [
      {
        chainName: "panacea",
        sourceDenom: "umed",
        coinMinimalDenom:
          "ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB",
        symbol: "MED",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/panacea/images/med.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/panacea/images/med.svg",
        },
        coingeckoId: "medibloc",
        price: {
          poolId: "586",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "panacea",
              chainId: "panacea-3",
              sourceDenom: "umed",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-82",
              path: "transfer/channel-82/umed",
            },
          },
        ],
        counterparty: [
          {
            chainName: "panacea",
            sourceDenom: "umed",
            chainType: "cosmos",
            chainId: "panacea-3",
            symbol: "MED",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/panacea/images/med.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/panacea/images/med.svg",
            },
          },
        ],
        variantGroupKey: "MED",
        name: "Medibloc",
        description:
          "Panacea is a public blockchain launched by MediBloc, which is the key infrastructure for reinventing the patient-centered healthcare data ecosystem",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/med.svg",
      },
    ],
  },
  {
    chain_name: "bostrom",
    chain_id: "bostrom",
    assets: [
      {
        chainName: "bostrom",
        sourceDenom: "boot",
        coinMinimalDenom:
          "ibc/FE2CD1E6828EC0FAB8AF39BAC45BC25B965BA67CCBC50C13A14BD610B0D1E2C4",
        symbol: "BOOT",
        decimals: 0,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/boot.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/boot.svg",
        },
        coingeckoId: "bostrom",
        price: {
          poolId: "912",
          denom:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bostrom",
              chainId: "bostrom",
              sourceDenom: "boot",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-95",
              path: "transfer/channel-95/boot",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bostrom",
            sourceDenom: "boot",
            chainType: "cosmos",
            chainId: "bostrom",
            symbol: "BOOT",
            decimals: 0,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/boot.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/boot.svg",
            },
          },
        ],
        variantGroupKey: "BOOT",
        name: "bostrom",
        description: "The staking token of Bostrom",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "bostrom",
            sourceDenom: "hydrogen",
          },
          {
            chainName: "bostrom",
            sourceDenom: "tocyb",
          },
          {
            chainName: "bostrom",
            sourceDenom: "millivolt",
          },
          {
            chainName: "bostrom",
            sourceDenom: "milliampere",
          },
        ],
        relative_image_url: "/tokens/generated/boot.svg",
      },
      {
        chainName: "bostrom",
        sourceDenom: "hydrogen",
        coinMinimalDenom:
          "ibc/4F3B0EC2FE2D370D10C3671A1B7B06D2A964C721470C305CBB846ED60E6CAA20",
        symbol: "HYDROGEN",
        decimals: 0,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/hydrogen.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/hydrogen.svg",
        },
        price: {
          poolId: "1330",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bostrom",
              chainId: "bostrom",
              sourceDenom: "hydrogen",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-95",
              path: "transfer/channel-95/hydrogen",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bostrom",
            sourceDenom: "hydrogen",
            chainType: "cosmos",
            chainId: "bostrom",
            symbol: "HYDROGEN",
            decimals: 0,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/hydrogen.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/hydrogen.svg",
            },
          },
        ],
        variantGroupKey: "HYDROGEN",
        name: "Bostrom Hydrogen",
        description: "The liquid staking token of Bostrom",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "bostrom",
            sourceDenom: "boot",
          },
          {
            chainName: "bostrom",
            sourceDenom: "tocyb",
          },
          {
            chainName: "bostrom",
            sourceDenom: "millivolt",
          },
          {
            chainName: "bostrom",
            sourceDenom: "milliampere",
          },
        ],
        relative_image_url: "/tokens/generated/hydrogen.svg",
      },
      {
        chainName: "bostrom",
        sourceDenom: "tocyb",
        coinMinimalDenom:
          "ibc/BCDB35B7390806F35E716D275E1E017999F8281A81B6F128F087EF34D1DFA761",
        symbol: "TOCYB",
        decimals: 0,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/tocyb.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/tocyb.svg",
        },
        price: {
          poolId: "1310",
          denom:
            "ibc/4F3B0EC2FE2D370D10C3671A1B7B06D2A964C721470C305CBB846ED60E6CAA20",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bostrom",
              chainId: "bostrom",
              sourceDenom: "tocyb",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-95",
              path: "transfer/channel-95/tocyb",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bostrom",
            sourceDenom: "tocyb",
            chainType: "cosmos",
            chainId: "bostrom",
            symbol: "TOCYB",
            decimals: 0,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/tocyb.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/tocyb.svg",
            },
          },
        ],
        variantGroupKey: "TOCYB",
        name: "Bostrom Tocyb",
        description: "The staking token of Cyber",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "bostrom",
            sourceDenom: "boot",
          },
          {
            chainName: "bostrom",
            sourceDenom: "hydrogen",
          },
          {
            chainName: "bostrom",
            sourceDenom: "millivolt",
          },
          {
            chainName: "bostrom",
            sourceDenom: "milliampere",
          },
        ],
        relative_image_url: "/tokens/generated/tocyb.svg",
      },
      {
        chainName: "bostrom",
        sourceDenom: "millivolt",
        coinMinimalDenom:
          "ibc/D3A1900B2B520E45608B5671ADA461E1109628E89B4289099557C6D3996F7DAA",
        symbol: "V",
        decimals: 3,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/volt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/volt.svg",
        },
        price: {
          poolId: "1304",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bostrom",
              chainId: "bostrom",
              sourceDenom: "millivolt",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-95",
              path: "transfer/channel-95/millivolt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bostrom",
            sourceDenom: "millivolt",
            chainType: "cosmos",
            chainId: "bostrom",
            symbol: "V",
            decimals: 3,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/volt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/volt.svg",
            },
          },
        ],
        variantGroupKey: "V",
        name: "Bostrom Volt",
        description: "The resource token of Bostrom",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "bostrom",
            sourceDenom: "boot",
          },
          {
            chainName: "bostrom",
            sourceDenom: "hydrogen",
          },
          {
            chainName: "bostrom",
            sourceDenom: "tocyb",
          },
          {
            chainName: "bostrom",
            sourceDenom: "milliampere",
          },
        ],
        relative_image_url: "/tokens/generated/v.svg",
      },
      {
        chainName: "bostrom",
        sourceDenom: "milliampere",
        coinMinimalDenom:
          "ibc/020F5162B7BC40656FC5432622647091F00D53E82EE8D21757B43D3282F25424",
        symbol: "A",
        decimals: 3,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/ampere.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/ampere.svg",
        },
        price: {
          poolId: "1303",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bostrom",
              chainId: "bostrom",
              sourceDenom: "milliampere",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-95",
              path: "transfer/channel-95/milliampere",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bostrom",
            sourceDenom: "milliampere",
            chainType: "cosmos",
            chainId: "bostrom",
            symbol: "A",
            decimals: 3,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/ampere.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/ampere.svg",
            },
          },
        ],
        variantGroupKey: "A",
        name: "Bostrom Ampere",
        description: "The resource token of Bostrom",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "bostrom",
            sourceDenom: "boot",
          },
          {
            chainName: "bostrom",
            sourceDenom: "hydrogen",
          },
          {
            chainName: "bostrom",
            sourceDenom: "tocyb",
          },
          {
            chainName: "bostrom",
            sourceDenom: "millivolt",
          },
        ],
        relative_image_url: "/tokens/generated/a.svg",
      },
    ],
  },
  {
    chain_name: "comdex",
    chain_id: "comdex-1",
    assets: [
      {
        chainName: "comdex",
        sourceDenom: "ucmdx",
        coinMinimalDenom:
          "ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0",
        symbol: "CMDX",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.svg",
        },
        coingeckoId: "comdex",
        price: {
          poolId: "601",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "comdex",
              chainId: "comdex-1",
              sourceDenom: "ucmdx",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-87",
              path: "transfer/channel-87/ucmdx",
            },
          },
        ],
        counterparty: [
          {
            chainName: "comdex",
            sourceDenom: "ucmdx",
            chainType: "cosmos",
            chainId: "comdex-1",
            symbol: "CMDX",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.svg",
            },
          },
        ],
        variantGroupKey: "CMDX",
        name: "Comdex",
        description: "Native Token of Comdex Protocol",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "comdex",
            sourceDenom: "ucmst",
          },
          {
            chainName: "comdex",
            sourceDenom: "uharbor",
          },
        ],
        relative_image_url: "/tokens/generated/cmdx.svg",
      },
      {
        chainName: "comdex",
        sourceDenom: "ucmst",
        coinMinimalDenom:
          "ibc/23CA6C8D1AB2145DD13EB1E089A2E3F960DC298B468CCE034E19E5A78B61136E",
        symbol: "CMST",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmst.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmst.svg",
        },
        coingeckoId: "composite",
        price: {
          poolId: "1258",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "comdex",
              chainId: "comdex-1",
              sourceDenom: "ucmst",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-87",
              path: "transfer/channel-87/ucmst",
            },
          },
        ],
        counterparty: [
          {
            chainName: "comdex",
            sourceDenom: "ucmst",
            chainType: "cosmos",
            chainId: "comdex-1",
            symbol: "CMST",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmst.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmst.svg",
            },
          },
        ],
        variantGroupKey: "CMST",
        name: "CMST",
        description: "Stable Token of Harbor protocol on Comdex network",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "comdex",
            sourceDenom: "ucmdx",
          },
          {
            chainName: "comdex",
            sourceDenom: "uharbor",
          },
        ],
        relative_image_url: "/tokens/generated/cmst.svg",
      },
      {
        chainName: "comdex",
        sourceDenom: "uharbor",
        coinMinimalDenom:
          "ibc/AD4DEA52408EA07C0C9E19444EC8DA84A274A70AD2687A710EFDDEB28BB2986A",
        symbol: "HARBOR",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/harbor.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/harbor.svg",
        },
        coingeckoId: "harbor-2",
        price: {
          poolId: "967",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "comdex",
              chainId: "comdex-1",
              sourceDenom: "uharbor",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-87",
              path: "transfer/channel-87/uharbor",
            },
          },
        ],
        counterparty: [
          {
            chainName: "comdex",
            sourceDenom: "uharbor",
            chainType: "cosmos",
            chainId: "comdex-1",
            symbol: "HARBOR",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/harbor.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/harbor.svg",
            },
          },
        ],
        variantGroupKey: "HARBOR",
        name: "Harbor",
        description: "Governance Token of Harbor protocol on Comdex network",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "comdex",
            sourceDenom: "ucmdx",
          },
          {
            chainName: "comdex",
            sourceDenom: "ucmst",
          },
        ],
        relative_image_url: "/tokens/generated/harbor.svg",
      },
    ],
  },
  {
    chain_name: "cheqd",
    chain_id: "cheqd-mainnet-1",
    assets: [
      {
        chainName: "cheqd",
        sourceDenom: "ncheq",
        coinMinimalDenom:
          "ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA",
        symbol: "CHEQ",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cheqd/images/cheq.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cheqd/images/cheq.svg",
        },
        coingeckoId: "cheqd-network",
        price: {
          poolId: "1273",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "cheqd",
              chainId: "cheqd-mainnet-1",
              sourceDenom: "ncheq",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-108",
              path: "transfer/channel-108/ncheq",
            },
          },
        ],
        counterparty: [
          {
            chainName: "cheqd",
            sourceDenom: "ncheq",
            chainType: "cosmos",
            chainId: "cheqd-mainnet-1",
            symbol: "CHEQ",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cheqd/images/cheq.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cheqd/images/cheq.svg",
            },
          },
        ],
        variantGroupKey: "CHEQ",
        name: "Cheqd",
        description: "Native token for the cheqd network",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/cheq.svg",
      },
    ],
  },
  {
    chain_name: "lumnetwork",
    chain_id: "lum-network-1",
    assets: [
      {
        chainName: "lumnetwork",
        sourceDenom: "ulum",
        coinMinimalDenom:
          "ibc/8A34AF0C1943FD0DFCDE9ADBF0B2C9959C45E87E6088EA2FC6ADACD59261B8A2",
        symbol: "LUM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumnetwork/images/lum.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumnetwork/images/lum.svg",
        },
        coingeckoId: "lum-network",
        price: {
          poolId: "608",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "lumnetwork",
              chainId: "lum-network-1",
              sourceDenom: "ulum",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-115",
              path: "transfer/channel-115/ulum",
            },
          },
        ],
        counterparty: [
          {
            chainName: "lumnetwork",
            sourceDenom: "ulum",
            chainType: "cosmos",
            chainId: "lum-network-1",
            symbol: "LUM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumnetwork/images/lum.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumnetwork/images/lum.svg",
            },
          },
        ],
        variantGroupKey: "LUM",
        name: "Lum Network",
        description: "Native token of the Lum Network",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/lum.svg",
      },
    ],
  },
  {
    chain_name: "vidulum",
    chain_id: "vidulum-1",
    assets: [
      {
        chainName: "vidulum",
        sourceDenom: "uvdl",
        coinMinimalDenom:
          "ibc/E7B35499CFBEB0FF5778127ABA4FB2C4B79A6B8D3D831D4379C4048C238796BD",
        symbol: "VDL",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/vidulum/images/vdl.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/vidulum/images/vdl.svg",
        },
        coingeckoId: "vidulum",
        price: {
          poolId: "613",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "vidulum",
              chainId: "vidulum-1",
              sourceDenom: "uvdl",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-124",
              path: "transfer/channel-124/uvdl",
            },
          },
        ],
        counterparty: [
          {
            chainName: "vidulum",
            sourceDenom: "uvdl",
            chainType: "cosmos",
            chainId: "vidulum-1",
            symbol: "VDL",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/vidulum/images/vdl.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/vidulum/images/vdl.svg",
            },
          },
        ],
        variantGroupKey: "VDL",
        name: "Vidulum",
        description: "The native token of Vidulum",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/vdl.svg",
      },
    ],
  },
  {
    chain_name: "desmos",
    chain_id: "desmos-mainnet",
    assets: [
      {
        chainName: "desmos",
        sourceDenom: "udsm",
        coinMinimalDenom:
          "ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C",
        symbol: "DSM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.svg",
        },
        coingeckoId: "desmos",
        price: {
          poolId: "619",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "desmos",
              chainId: "desmos-mainnet",
              sourceDenom: "udsm",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-135",
              path: "transfer/channel-135/udsm",
            },
          },
        ],
        counterparty: [
          {
            chainName: "desmos",
            sourceDenom: "udsm",
            chainType: "cosmos",
            chainId: "desmos-mainnet",
            symbol: "DSM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.svg",
            },
          },
        ],
        variantGroupKey: "DSM",
        name: "Desmos",
        description: "The native token of Desmos",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/dsm.svg",
      },
    ],
  },
  {
    chain_name: "dig",
    chain_id: "dig-1",
    assets: [
      {
        chainName: "dig",
        sourceDenom: "udig",
        coinMinimalDenom:
          "ibc/307E5C96C8F60D1CBEE269A9A86C0834E1DB06F2B3788AE4F716EDB97A48B97D",
        symbol: "DIG",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dig/images/dig.png",
        },
        coingeckoId: "dig-chain",
        price: {
          poolId: "621",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "dig",
              chainId: "dig-1",
              sourceDenom: "udig",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-128",
              path: "transfer/channel-128/udig",
            },
          },
        ],
        counterparty: [
          {
            chainName: "dig",
            sourceDenom: "udig",
            chainType: "cosmos",
            chainId: "dig-1",
            symbol: "DIG",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dig/images/dig.png",
            },
          },
        ],
        variantGroupKey: "DIG",
        name: "Dig Chain",
        description: "Native token of Dig Chain",
        verified: true,
        unstable: true,
        disabled: true,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/dig.png",
      },
    ],
  },
  {
    chain_name: "sommelier",
    chain_id: "sommelier-3",
    assets: [
      {
        chainName: "sommelier",
        sourceDenom: "usomm",
        coinMinimalDenom:
          "ibc/9BBA9A1C257E971E38C1422780CE6F0B0686F0A3085E2D61118D904BFE0F5F5E",
        symbol: "SOMM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.svg",
        },
        coingeckoId: "sommelier",
        price: {
          poolId: "1372",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "sommelier",
              chainId: "sommelier-3",
              sourceDenom: "usomm",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-165",
              path: "transfer/channel-165/usomm",
            },
          },
        ],
        counterparty: [
          {
            chainName: "sommelier",
            sourceDenom: "usomm",
            chainType: "cosmos",
            chainId: "sommelier-3",
            symbol: "SOMM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.svg",
            },
          },
        ],
        variantGroupKey: "SOMM",
        name: "Sommelier",
        description:
          "Somm Token (SOMM) is the native staking token of the Sommelier Chain\n\nAutomated vaults find best-in-class yields while mitigating risk.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/sommfinance",
        relatedAssets: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqsomm",
          },
          {
            chainName: "stride",
            sourceDenom: "stusomm",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
        ],
        relative_image_url: "/tokens/generated/somm.svg",
      },
    ],
  },
  {
    chain_name: "bandchain",
    chain_id: "laozi-mainnet",
    assets: [
      {
        chainName: "bandchain",
        sourceDenom: "uband",
        coinMinimalDenom:
          "ibc/F867AE2112EFE646EC71A25CD2DFABB8927126AC1E19F1BBF0FF693A4ECA05DE",
        symbol: "BAND",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bandchain/images/band.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bandchain/images/band.svg",
        },
        coingeckoId: "band-protocol",
        price: {
          poolId: "626",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bandchain",
              chainId: "laozi-mainnet",
              sourceDenom: "uband",
              port: "transfer",
              channelId: "channel-83",
            },
            chain: {
              port: "transfer",
              channelId: "channel-148",
              path: "transfer/channel-148/uband",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bandchain",
            sourceDenom: "uband",
            chainType: "cosmos",
            chainId: "laozi-mainnet",
            symbol: "BAND",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bandchain/images/band.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bandchain/images/band.svg",
            },
          },
        ],
        variantGroupKey: "BAND",
        name: "Band Protocol",
        description:
          "The native token of BandChain\n\nBand Protocol is a cross-chain data oracle platform that aggregates and connects real-world data and APIs to smart contracts.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/BandProtocol",
        relatedAssets: [],
        relative_image_url: "/tokens/generated/band.svg",
      },
    ],
  },
  {
    chain_name: "konstellation",
    chain_id: "darchub",
    assets: [
      {
        chainName: "konstellation",
        sourceDenom: "udarc",
        coinMinimalDenom:
          "ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593",
        symbol: "DARC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/konstellation/images/darc.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/konstellation/images/darc.svg",
        },
        coingeckoId: "darcmatter-coin",
        price: {
          poolId: "637",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "konstellation",
              chainId: "darchub",
              sourceDenom: "udarc",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-171",
              path: "transfer/channel-171/udarc",
            },
          },
        ],
        counterparty: [
          {
            chainName: "konstellation",
            sourceDenom: "udarc",
            chainType: "cosmos",
            chainId: "darchub",
            symbol: "DARC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/konstellation/images/darc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/konstellation/images/darc.svg",
            },
          },
        ],
        variantGroupKey: "DARC",
        name: "Konstellation",
        description: "The native token of Konstellation Network",
        verified: true,
        unstable: true,
        disabled: true,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/darc.svg",
      },
    ],
  },
  {
    chain_name: "umee",
    chain_id: "umee-1",
    assets: [
      {
        chainName: "umee",
        sourceDenom: "uumee",
        coinMinimalDenom:
          "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
        symbol: "UMEE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/umee/images/umee.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/umee/images/umee.svg",
        },
        coingeckoId: "umee",
        price: {
          poolId: "1110",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "umee",
              chainId: "umee-1",
              sourceDenom: "uumee",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-184",
              path: "transfer/channel-184/uumee",
            },
          },
        ],
        counterparty: [
          {
            chainName: "umee",
            sourceDenom: "uumee",
            chainType: "cosmos",
            chainId: "umee-1",
            symbol: "UMEE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/umee/images/umee.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/umee/images/umee.svg",
            },
          },
        ],
        variantGroupKey: "UMEE",
        name: "Umee",
        description: "The native token of Umee",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "stride",
            sourceDenom: "stuumee",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "stride",
            sourceDenom: "staevmos",
          },
          {
            chainName: "stride",
            sourceDenom: "stusomm",
          },
          {
            chainName: "stride",
            sourceDenom: "stadydx",
          },
        ],
        relative_image_url: "/tokens/generated/umee.svg",
      },
    ],
  },
  {
    chain_name: "gravitybridge",
    chain_id: "gravity-bridge-3",
    assets: [
      {
        chainName: "gravitybridge",
        sourceDenom: "ugraviton",
        coinMinimalDenom:
          "ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44",
        symbol: "GRAV",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.svg",
        },
        coingeckoId: "graviton",
        price: {
          poolId: "625",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gravitybridge",
              chainId: "gravity-bridge-3",
              sourceDenom: "ugraviton",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-144",
              path: "transfer/channel-144/ugraviton",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gravitybridge",
            sourceDenom: "ugraviton",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "GRAV",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.svg",
            },
          },
        ],
        variantGroupKey: "GRAV",
        name: "Gravity Bridge",
        description:
          "The native token of Gravity Bridge\n\nAn open, decentralized bridge that unlocks the power of interoperability & liquidity between blockchain ecosystems.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/gravity_bridge",
        relatedAssets: [
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
        ],
        relative_image_url: "/tokens/generated/grav.svg",
      },
      {
        chainName: "gravitybridge",
        sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        coinMinimalDenom:
          "ibc/C9B0D48FD2C5B91135F118FF2484551888966590D7BDC20F6A87308DBA670796",
        symbol: "WBTC.grv",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/wbtc.grv.svg",
        },
        price: {
          poolId: "694",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: [],
        transferMethods: [
          {
            name: "Gravity Bridge",
            type: "external_interface",
            depositUrl:
              "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
            withdrawUrl:
              "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gravitybridge",
              chainId: "gravity-bridge-3",
              sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-144",
              path: "transfer/channel-144/gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "WBTC",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.svg",
            },
          },
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
        ],
        variantGroupKey: "WBTC",
        name: "Wrapped Bitcoin (Gravity Bridge)",
        description: "Gravity Bridge WBTC",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "gravitybridge",
          sourceDenom: "ugrav",
        },
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "ugraviton",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "nomic",
            sourceDenom: "usat",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          },
        ],
        relative_image_url: "/tokens/generated/wbtc.grv.svg",
      },
      {
        chainName: "gravitybridge",
        sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        coinMinimalDenom:
          "ibc/65381C5F3FD21442283D56925E62EA524DED8B6927F0FF94E21E0020954C40B5",
        symbol: "WETH.grv",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/weth.grv.svg",
        },
        price: {
          poolId: "1297",
          denom:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        },
        categories: [],
        transferMethods: [
          {
            name: "Gravity Bridge",
            type: "external_interface",
            depositUrl:
              "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
            withdrawUrl:
              "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gravitybridge",
              chainId: "gravity-bridge-3",
              sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-144",
              path: "transfer/channel-144/gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "WETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/weth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            chainType: "evm",
            chainId: 1,
            address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            symbol: "WETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/weth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "wei",
            chainType: "evm",
            chainId: 1,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "ETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg",
            },
          },
        ],
        variantGroupKey: "ETH",
        name: "Ether (Gravity Bridge)",
        description: "Gravity Bridge WETH",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "gravitybridge",
          sourceDenom: "ugrav",
        },
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "ugraviton",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
          },
          {
            chainName: "axelar",
            sourceDenom: "cbeth-wei",
          },
        ],
        relative_image_url: "/tokens/generated/weth.grv.svg",
      },
      {
        chainName: "gravitybridge",
        sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        coinMinimalDenom:
          "ibc/9F9B07EF9AD291167CF5700628145DE1DEB777C2CFC7907553B24446515F6D0E",
        symbol: "USDC.grv",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdc.grv.svg",
        },
        price: {
          poolId: "872",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Gravity Bridge",
            type: "external_interface",
            depositUrl:
              "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
            withdrawUrl:
              "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gravitybridge",
              chainId: "gravity-bridge-3",
              sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-144",
              path: "transfer/channel-144/gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            chainType: "evm",
            chainId: 1,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
        ],
        variantGroupKey: "USDC",
        name: "USD Coin (Gravity Bridge)",
        description: "Gravity Bridge USDC",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "gravitybridge",
          sourceDenom: "ugrav",
        },
        relatedAssets: [
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "ugraviton",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
          },
          {
            chainName: "axelar",
            sourceDenom: "polygon-uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "avalanche-uusdc",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
        ],
        relative_image_url: "/tokens/generated/usdc.grv.svg",
      },
      {
        chainName: "gravitybridge",
        sourceDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
        coinMinimalDenom:
          "ibc/F292A17CF920E3462C816CBE6B042E779F676CAB59096904C4C1C966413E3DF5",
        symbol: "DAI.grv",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/dai.grv.svg",
        },
        price: {
          poolId: "702",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Gravity Bridge",
            type: "external_interface",
            depositUrl:
              "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
            withdrawUrl:
              "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gravitybridge",
              chainId: "gravity-bridge-3",
              sourceDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-144",
              path: "transfer/channel-144/gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "DAI",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/dai.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x6b175474e89094c44da98b954eedeac495271d0f",
            chainType: "evm",
            chainId: 1,
            address: "0x6b175474e89094c44da98b954eedeac495271d0f",
            symbol: "DAI",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/dai.svg",
            },
          },
        ],
        variantGroupKey: "DAI",
        name: "DAI Stablecoin (Gravity Bridge)",
        description: "Gravity Bridge DAI",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "gravitybridge",
          sourceDenom: "ugrav",
        },
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "ugraviton",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "frax-wei",
          },
        ],
        relative_image_url: "/tokens/generated/dai.grv.svg",
      },
      {
        chainName: "gravitybridge",
        sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
        coinMinimalDenom:
          "ibc/71B441E27F1BBB44DD0891BCD370C2794D404D60A4FFE5AECCD9B1E28BC89805",
        symbol: "USDT.grv",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdt.grv.svg",
        },
        price: {
          poolId: "818",
          denom: "uosmo",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Gravity Bridge",
            type: "external_interface",
            depositUrl:
              "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
            withdrawUrl:
              "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gravitybridge",
              chainId: "gravity-bridge-3",
              sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-144",
              path: "transfer/channel-144/gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            chainType: "evm",
            chainId: 1,
            address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
        ],
        variantGroupKey: "USDT",
        name: "Tether USD (Gravity Bridge)",
        description: "Gravity Bridge USDT",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "gravitybridge",
          sourceDenom: "ugrav",
        },
        relatedAssets: [
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "ugraviton",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
          },
          {
            chainName: "kava",
            sourceDenom: "ukava",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
        ],
        relative_image_url: "/tokens/generated/usdt.grv.svg",
      },
      {
        chainName: "gravitybridge",
        sourceDenom: "gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
        coinMinimalDenom:
          "ibc/23A62409E4AD8133116C249B1FA38EED30E500A115D7B153109462CD82C1CD99",
        symbol: "PAGE",
        decimals: 8,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/page.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/page.svg",
        },
        coingeckoId: "page",
        price: {
          poolId: "1344",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Gravity Bridge",
            type: "external_interface",
            depositUrl:
              "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
            withdrawUrl:
              "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gravitybridge",
              chainId: "gravity-bridge-3",
              sourceDenom: "gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-144",
              path: "transfer/channel-144/gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "PAGE",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/page.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/page.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
            chainType: "evm",
            chainId: 1,
            address: "0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
            symbol: "PAGE",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/page.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/page.svg",
            },
          },
        ],
        variantGroupKey: "PAGE",
        name: "Page",
        description:
          "The PAGE token is used for actions in the PageDAO NFT literary ecosystem and for DAO governance.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "gravitybridge",
            sourceDenom: "ugraviton",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
        ],
        relative_image_url: "/tokens/generated/page.svg",
      },
    ],
  },
  {
    chain_name: "decentr",
    chain_id: "mainnet-3",
    assets: [
      {
        chainName: "decentr",
        sourceDenom: "udec",
        coinMinimalDenom:
          "ibc/9BCB27203424535B6230D594553F1659C77EC173E36D9CF4759E7186EE747E84",
        symbol: "DEC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/decentr/images/dec.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/decentr/images/dec.svg",
        },
        coingeckoId: "decentr",
        price: {
          poolId: "644",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "decentr",
              chainId: "mainnet-3",
              sourceDenom: "udec",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-181",
              path: "transfer/channel-181/udec",
            },
          },
        ],
        counterparty: [
          {
            chainName: "decentr",
            sourceDenom: "udec",
            chainType: "cosmos",
            chainId: "mainnet-3",
            symbol: "DEC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/decentr/images/dec.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/decentr/images/dec.svg",
            },
          },
        ],
        variantGroupKey: "DEC",
        name: "Decentr",
        description: "The native token of Decentr",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/dec.svg",
      },
    ],
  },
  {
    chain_name: "carbon",
    chain_id: "carbon-1",
    assets: [
      {
        chainName: "carbon",
        sourceDenom: "swth",
        coinMinimalDenom:
          "ibc/8FEFAE6AECF6E2A255585617F781F35A8D5709A545A804482A261C0C9548A9D3",
        symbol: "SWTH",
        decimals: 8,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/carbon/images/swth.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/carbon/images/swth.svg",
        },
        coingeckoId: "switcheo",
        price: {
          poolId: "651",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Carbon Demex",
            type: "external_interface",
            depositUrl:
              "https://app.dem.exchange/account/balance/withdraw/swth",
            withdrawUrl:
              "https://app.dem.exchange/account/balance/deposit/swth",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "carbon",
              chainId: "carbon-1",
              sourceDenom: "swth",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-188",
              path: "transfer/channel-188/swth",
            },
          },
        ],
        counterparty: [
          {
            chainName: "carbon",
            sourceDenom: "swth",
            chainType: "cosmos",
            chainId: "carbon-1",
            symbol: "SWTH",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/carbon/images/swth.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/carbon/images/swth.svg",
            },
          },
        ],
        variantGroupKey: "SWTH",
        name: "Carbon",
        description: "The native governance token of Carbon",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/swth.svg",
      },
    ],
  },
  {
    chain_name: "cerberus",
    chain_id: "cerberus-chain-1",
    assets: [
      {
        chainName: "cerberus",
        sourceDenom: "ucrbrus",
        coinMinimalDenom:
          "ibc/41999DF04D9441DAC0DF5D8291DF4333FBCBA810FFD63FDCE34FDF41EF37B6F7",
        symbol: "CRBRUS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cerberus/images/crbrus.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cerberus/images/crbrus.svg",
        },
        coingeckoId: "cerberus-2",
        price: {
          poolId: "662",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "cerberus",
              chainId: "cerberus-chain-1",
              sourceDenom: "ucrbrus",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-212",
              path: "transfer/channel-212/ucrbrus",
            },
          },
        ],
        counterparty: [
          {
            chainName: "cerberus",
            sourceDenom: "ucrbrus",
            chainType: "cosmos",
            chainId: "cerberus-chain-1",
            symbol: "CRBRUS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cerberus/images/crbrus.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cerberus/images/crbrus.svg",
            },
          },
        ],
        variantGroupKey: "CRBRUS",
        name: "Cerberus",
        description: "The native token of Cerberus Chain",
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/crbrus.svg",
      },
    ],
  },
  {
    chain_name: "fetchhub",
    chain_id: "fetchhub-4",
    assets: [
      {
        chainName: "fetchhub",
        sourceDenom: "afet",
        coinMinimalDenom:
          "ibc/5D1F516200EE8C6B2354102143B78A2DEDA25EDE771AC0F8DC3C1837C8FD4447",
        symbol: "FET",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.svg",
        },
        coingeckoId: "fetch-ai",
        price: {
          poolId: "681",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "fetchhub",
              chainId: "fetchhub-4",
              sourceDenom: "afet",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-229",
              path: "transfer/channel-229/afet",
            },
          },
        ],
        counterparty: [
          {
            chainName: "fetchhub",
            sourceDenom: "afet",
            chainType: "cosmos",
            chainId: "fetchhub-4",
            symbol: "FET",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.svg",
            },
          },
        ],
        variantGroupKey: "FET",
        name: "Fetch.ai",
        description:
          "The native staking and governance token of the Fetch Hub.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/fet.svg",
      },
    ],
  },
  {
    chain_name: "assetmantle",
    chain_id: "mantle-1",
    assets: [
      {
        chainName: "assetmantle",
        sourceDenom: "umntl",
        coinMinimalDenom:
          "ibc/CBA34207E969623D95D057D9B11B0C8B32B89A71F170577D982FDDE623813FFC",
        symbol: "MNTL",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/assetmantle/images/mntl.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/assetmantle/images/mntl.svg",
        },
        coingeckoId: "assetmantle",
        price: {
          poolId: "686",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "assetmantle",
              chainId: "mantle-1",
              sourceDenom: "umntl",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-232",
              path: "transfer/channel-232/umntl",
            },
          },
        ],
        counterparty: [
          {
            chainName: "assetmantle",
            sourceDenom: "umntl",
            chainType: "cosmos",
            chainId: "mantle-1",
            symbol: "MNTL",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/assetmantle/images/mntl.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/assetmantle/images/mntl.svg",
            },
          },
        ],
        variantGroupKey: "MNTL",
        name: "AssetMantle",
        description:
          "The native token of Asset Mantle\n\nAssetMantle’s suite of products is focused on the NFT ecosystem, helping you up your game with digital asset ownership.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/AssetMantle",
        relatedAssets: [],
        relative_image_url: "/tokens/generated/mntl.svg",
      },
    ],
  },
  {
    chain_name: "injective",
    chain_id: "injective-1",
    assets: [
      {
        chainName: "injective",
        sourceDenom: "inj",
        coinMinimalDenom:
          "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273",
        symbol: "INJ",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.svg",
        },
        coingeckoId: "injective-protocol",
        price: {
          poolId: "1319",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Injective Hub",
            type: "external_interface",
            depositUrl:
              "https://hub.injective.network/bridge/?destination=osmosis&origin=injective&token=inj",
            withdrawUrl:
              "https://hub.injective.network/bridge/?destination=injective&origin=osmosis&token=inj",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "injective",
              chainId: "injective-1",
              sourceDenom: "inj",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-122",
              path: "transfer/channel-122/inj",
            },
          },
        ],
        counterparty: [
          {
            chainName: "injective",
            sourceDenom: "inj",
            chainType: "cosmos",
            chainId: "injective-1",
            symbol: "INJ",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.svg",
            },
          },
        ],
        variantGroupKey: "INJ",
        name: "Injective",
        description:
          "The INJ token is the native governance token for the Injective chain.\n\nInjective’s mission is to create a truly free and inclusive financial system through decentralization.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/Injective_",
        relatedAssets: [
          {
            chainName: "injective",
            sourceDenom:
              "factory/inj14lf8xm6fcvlggpa7guxzjqwjmtr24gnvf56hvz/autism",
          },
          {
            chainName: "injective",
            sourceDenom:
              "factory/inj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w/ninja",
          },
          {
            chainName: "injective",
            sourceDenom: "peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
          },
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
        ],
        relative_image_url: "/tokens/generated/inj.svg",
      },
      {
        chainName: "injective",
        sourceDenom:
          "factory/inj14lf8xm6fcvlggpa7guxzjqwjmtr24gnvf56hvz/autism",
        coinMinimalDenom:
          "ibc/9DDF52A334F92BC57A9E0D59DFF9984EAC61D2A14E5162605DF601AA58FDFC6D",
        symbol: "AUTISM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/autism.png",
        },
        coingeckoId: "autism",
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "injective",
              chainId: "injective-1",
              sourceDenom:
                "factory/inj14lf8xm6fcvlggpa7guxzjqwjmtr24gnvf56hvz/autism",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-122",
              path: "transfer/channel-122/factory/inj14lf8xm6fcvlggpa7guxzjqwjmtr24gnvf56hvz/autism",
            },
          },
        ],
        counterparty: [
          {
            chainName: "injective",
            sourceDenom:
              "factory/inj14lf8xm6fcvlggpa7guxzjqwjmtr24gnvf56hvz/autism",
            chainType: "cosmos",
            chainId: "injective-1",
            symbol: "AUTISM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/autism.png",
            },
          },
        ],
        variantGroupKey: "AUTISM",
        name: "Autism",
        description:
          "$AUTISM exists to celebrate autism as a superior biological tech stack for a changing world",
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relatedAssets: [
          {
            chainName: "injective",
            sourceDenom: "inj",
          },
          {
            chainName: "injective",
            sourceDenom:
              "factory/inj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w/ninja",
          },
          {
            chainName: "injective",
            sourceDenom: "peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
          },
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
        ],
        relative_image_url: "/tokens/generated/autism.png",
      },
      {
        chainName: "injective",
        sourceDenom: "factory/inj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w/ninja",
        coinMinimalDenom:
          "ibc/183C0BB962D2F57C957E0B134CFA0AC9D6F755C02DE9DC2A59089BA23009DEC3",
        symbol: "NINJA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/ninja.png",
        },
        coingeckoId: "dog-wif-nuchucks",
        price: {
          poolId: "1384",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://tfm.com/bridge?chainFrom=injective-1&chainTo=osmosis-1&token0=factory%2Finj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w%2Fninja&token1=ibc%2F183C0BB962D2F57C957E0B134CFA0AC9D6F755C02DE9DC2A59089BA23009DEC3",
            withdrawUrl:
              "https://tfm.com/bridge?chainFrom=osmosis-1&chainTo=injective-1&token0=ibc%2F183C0BB962D2F57C957E0B134CFA0AC9D6F755C02DE9DC2A59089BA23009DEC3&token1=factory%2Finj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w%2Fninja",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "injective",
              chainId: "injective-1",
              sourceDenom:
                "factory/inj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w/ninja",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-122",
              path: "transfer/channel-122/factory/inj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w/ninja",
            },
          },
        ],
        counterparty: [
          {
            chainName: "injective",
            sourceDenom:
              "factory/inj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w/ninja",
            chainType: "cosmos",
            chainId: "injective-1",
            symbol: "NINJA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/ninja.png",
            },
          },
        ],
        variantGroupKey: "NINJA",
        name: "Dog wif nunchucks",
        description:
          "The first meme coin on Injective. It’s a dog, but he has nunchucks",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-24T10:58:00.000Z",
        relatedAssets: [
          {
            chainName: "injective",
            sourceDenom: "inj",
          },
          {
            chainName: "injective",
            sourceDenom:
              "factory/inj14lf8xm6fcvlggpa7guxzjqwjmtr24gnvf56hvz/autism",
          },
          {
            chainName: "injective",
            sourceDenom: "peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
          },
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
        ],
        relative_image_url: "/tokens/generated/ninja.png",
      },
      {
        chainName: "injective",
        sourceDenom: "peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
        coinMinimalDenom:
          "ibc/072E5B3D6F278B3E6A9C51D7EAD1A737148609512C5EBE8CBCB5663264A0DDB7",
        symbol: "injective.GLTO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.svg",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "injective",
              chainId: "injective-1",
              sourceDenom: "peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-122",
              path: "transfer/channel-122/peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
            },
          },
        ],
        counterparty: [
          {
            chainName: "injective",
            sourceDenom: "peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
            chainType: "cosmos",
            chainId: "injective-1",
            symbol: "GLTO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
            chainType: "evm",
            chainId: 1,
            address: "0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
            symbol: "GLTO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.svg",
            },
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "GLTO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.svg",
            },
          },
        ],
        variantGroupKey: "GLTO",
        name: "Gelotto (Injective)",
        description: "GLTO-ERC20 on injective",
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        twitterURL: "https://twitter.com/Gelotto2",
        relatedAssets: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
          },
          {
            chainName: "injective",
            sourceDenom: "inj",
          },
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "injective",
            sourceDenom:
              "factory/inj14lf8xm6fcvlggpa7guxzjqwjmtr24gnvf56hvz/autism",
          },
          {
            chainName: "injective",
            sourceDenom:
              "factory/inj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w/ninja",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
        ],
        relative_image_url: "/tokens/generated/injective.glto.svg",
      },
    ],
  },
  {
    chain_name: "microtick",
    chain_id: "microtick-1",
    assets: [
      {
        chainName: "microtick",
        sourceDenom: "utick",
        coinMinimalDenom:
          "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8",
        symbol: "TICK",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/microtick/images/tick.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/microtick/images/tick.svg",
        },
        coingeckoId: "microtick",
        price: {
          poolId: "547",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "microtick",
              chainId: "microtick-1",
              sourceDenom: "utick",
              port: "transfer",
              channelId: "channel-16",
            },
            chain: {
              port: "transfer",
              channelId: "channel-39",
              path: "transfer/channel-39/utick",
            },
          },
        ],
        counterparty: [
          {
            chainName: "microtick",
            sourceDenom: "utick",
            chainType: "cosmos",
            chainId: "microtick-1",
            symbol: "TICK",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/microtick/images/tick.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/microtick/images/tick.svg",
            },
          },
        ],
        variantGroupKey: "TICK",
        name: "Microtick",
        description:
          "TICK coin is the token for the Microtick Price Discovery & Oracle App",
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/tick.svg",
      },
    ],
  },
  {
    chain_name: "sifchain",
    chain_id: "sifchain-1",
    assets: [
      {
        chainName: "sifchain",
        sourceDenom: "rowan",
        coinMinimalDenom:
          "ibc/8318FD63C42203D16DDCAF49FE10E8590669B3219A3E87676AC9DA50722687FB",
        symbol: "ROWAN",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.svg",
        },
        coingeckoId: "sifchain",
        price: {
          poolId: "629",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "sifchain",
              chainId: "sifchain-1",
              sourceDenom: "rowan",
              port: "transfer",
              channelId: "channel-17",
            },
            chain: {
              port: "transfer",
              channelId: "channel-47",
              path: "transfer/channel-47/rowan",
            },
          },
        ],
        counterparty: [
          {
            chainName: "sifchain",
            sourceDenom: "rowan",
            chainType: "cosmos",
            chainId: "sifchain-1",
            symbol: "ROWAN",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.svg",
            },
          },
        ],
        variantGroupKey: "ROWAN",
        name: "Sifchain",
        description:
          "Rowan Token (ROWAN) is the Sifchain Network's native utility token, used as the primary means to govern, provide liquidity, secure the blockchain, incentivize participants, and provide a default mechanism to store and exchange value.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/rowan.svg",
      },
    ],
  },
  {
    chain_name: "shentu",
    chain_id: "shentu-2.2",
    assets: [
      {
        chainName: "shentu",
        sourceDenom: "uctk",
        coinMinimalDenom:
          "ibc/7ED954CFFFC06EE8419387F3FC688837FF64EF264DE14219935F724EEEDBF8D3",
        symbol: "CTK",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shentu/images/ctk.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shentu/images/ctk.svg",
        },
        coingeckoId: "certik",
        price: {
          poolId: "1020",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "shentu",
              chainId: "shentu-2.2",
              sourceDenom: "uctk",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-146",
              path: "transfer/channel-146/uctk",
            },
          },
        ],
        counterparty: [
          {
            chainName: "shentu",
            sourceDenom: "uctk",
            chainType: "cosmos",
            chainId: "shentu-2.2",
            symbol: "CTK",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shentu/images/ctk.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shentu/images/ctk.svg",
            },
          },
        ],
        variantGroupKey: "CTK",
        name: "Shentu",
        description: "The native token of Shentu",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/ctk.svg",
      },
    ],
  },
  {
    chain_name: "provenance",
    chain_id: "pio-mainnet-1",
    assets: [
      {
        chainName: "provenance",
        sourceDenom: "nhash",
        coinMinimalDenom:
          "ibc/CE5BFF1D9BADA03BB5CCA5F56939392A761B53A10FBD03B37506669C3218D3B2",
        symbol: "HASH",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/provenance/images/prov.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/provenance/images/prov.svg",
        },
        coingeckoId: "provenance-blockchain",
        price: {
          poolId: "693",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "provenance",
              chainId: "pio-mainnet-1",
              sourceDenom: "nhash",
              port: "transfer",
              channelId: "channel-7",
            },
            chain: {
              port: "transfer",
              channelId: "channel-222",
              path: "transfer/channel-222/nhash",
            },
          },
        ],
        counterparty: [
          {
            chainName: "provenance",
            sourceDenom: "nhash",
            chainType: "cosmos",
            chainId: "pio-mainnet-1",
            symbol: "HASH",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/provenance/images/prov.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/provenance/images/prov.svg",
            },
          },
        ],
        variantGroupKey: "HASH",
        name: "Provenance",
        description: "Hash is the staking token of the Provenance Blockchain",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/hash.svg",
      },
    ],
  },
  {
    chain_name: "galaxy",
    chain_id: "galaxy-1",
    assets: [
      {
        chainName: "galaxy",
        sourceDenom: "uglx",
        coinMinimalDenom:
          "ibc/F49DE040EBA5AB2FAD5F660C2A1DDF98A68470FAE82229818BE775EBF3EE79F2",
        symbol: "GLX",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/galaxy/images/glx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/galaxy/images/glx.svg",
        },
        price: {
          poolId: "697",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "galaxy",
              chainId: "galaxy-1",
              sourceDenom: "uglx",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-236",
              path: "transfer/channel-236/uglx",
            },
          },
        ],
        counterparty: [
          {
            chainName: "galaxy",
            sourceDenom: "uglx",
            chainType: "cosmos",
            chainId: "galaxy-1",
            symbol: "GLX",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/galaxy/images/glx.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/galaxy/images/glx.svg",
            },
          },
        ],
        variantGroupKey: "GLX",
        name: "Galaxy",
        description: "GLX is the staking token of the Galaxy Chain",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/glx.svg",
      },
    ],
  },
  {
    chain_name: "meme",
    chain_id: "meme-1",
    assets: [
      {
        chainName: "meme",
        sourceDenom: "umeme",
        coinMinimalDenom:
          "ibc/67C89B8B0A70C08F093C909A4DD996DD10E0494C87E28FD9A551697BF173D4CA",
        symbol: "MEME",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/meme/images/meme.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/meme/images/meme.svg",
        },
        coingeckoId: "meme-network",
        price: {
          poolId: "701",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "meme",
              chainId: "meme-1",
              sourceDenom: "umeme",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-238",
              path: "transfer/channel-238/umeme",
            },
          },
        ],
        counterparty: [
          {
            chainName: "meme",
            sourceDenom: "umeme",
            chainType: "cosmos",
            chainId: "meme-1",
            symbol: "MEME",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/meme/images/meme.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/meme/images/meme.svg",
            },
          },
        ],
        variantGroupKey: "MEME",
        name: "MEME",
        description:
          "MEME Token (MEME) is the native staking token of the MEME Chain",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/meme.svg",
      },
    ],
  },
  {
    chain_name: "terra2",
    chain_id: "phoenix-1",
    assets: [
      {
        chainName: "terra2",
        sourceDenom: "uluna",
        coinMinimalDenom:
          "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
        symbol: "LUNA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/luna.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/luna.svg",
        },
        coingeckoId: "terra-luna-2",
        price: {
          poolId: "1163",
          denom:
            "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra2",
              chainId: "phoenix-1",
              sourceDenom: "uluna",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-251",
              path: "transfer/channel-251/uluna",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra2",
            sourceDenom: "uluna",
            chainType: "cosmos",
            chainId: "phoenix-1",
            symbol: "LUNA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/luna.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/luna.svg",
            },
          },
        ],
        variantGroupKey: "LUNA",
        name: "Luna",
        description:
          "The native staking token of Terra.\n\nFueled by a passionate community and deep developer talent pool, the Terra blockchain is built to enable the next generation of Web3 products and services.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/terra_money",
        relatedAssets: [
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
        ],
        relative_image_url: "/tokens/generated/luna.svg",
      },
      {
        chainName: "terra2",
        sourceDenom:
          "cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
        coinMinimalDenom:
          "ibc/98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0",
        symbol: "ROAR",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/roar.png",
        },
        coingeckoId: "lion-dao",
        price: {
          poolId: "1043",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://tfm.com/bridge?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv&token1=ibc%2F98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0",
            withdrawUrl:
              "https://tfm.com/bridge?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2F98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0&token1=terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra2",
              chainId: "phoenix-1",
              sourceDenom:
                "cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
              port: "wasm.terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au",
              channelId: "channel-26",
            },
            chain: {
              port: "transfer",
              channelId: "channel-341",
              path: "transfer/channel-341/cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
            chainType: "cosmos",
            chainId: "phoenix-1",
            symbol: "ROAR",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/roar.png",
            },
          },
        ],
        variantGroupKey: "ROAR",
        name: "Lion DAO",
        description:
          "Lion DAO is a community DAO that lives on the Terra blockchain with the mission to reactivate the LUNAtic community and showcase Terra protocols & tooling",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "terra2",
            sourceDenom: "uluna",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
        ],
        relative_image_url: "/tokens/generated/roar.png",
      },
      {
        chainName: "terra2",
        sourceDenom:
          "cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
        coinMinimalDenom:
          "ibc/6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3",
        symbol: "CUB",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/cub.png",
        },
        price: {
          poolId: "1072",
          denom:
            "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://tfm.com/bridge?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t&token1=ibc%2F6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3",
            withdrawUrl:
              "https://tfm.com/bridge?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2F6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3&token1=terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra2",
              chainId: "phoenix-1",
              sourceDenom:
                "cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
              port: "wasm.terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au",
              channelId: "channel-26",
            },
            chain: {
              port: "transfer",
              channelId: "channel-341",
              path: "transfer/channel-341/cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
            chainType: "cosmos",
            chainId: "phoenix-1",
            symbol: "CUB",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/cub.png",
            },
          },
        ],
        variantGroupKey: "CUB",
        name: "Lion Cub DAO",
        description: "Lion Cub DAO is a useless meme community DAO on Terra",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "terra2",
            sourceDenom: "uluna",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
        ],
        relative_image_url: "/tokens/generated/cub.png",
      },
      {
        chainName: "terra2",
        sourceDenom:
          "cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
        coinMinimalDenom:
          "ibc/DA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E",
        symbol: "BLUE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/blue.png",
        },
        price: {
          poolId: "1073",
          denom:
            "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://tfm.com/bridge?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584&token1=ibc%2FDA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E",
            withdrawUrl:
              "https://tfm.com/bridge?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2FDA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E&token1=terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra2",
              chainId: "phoenix-1",
              sourceDenom:
                "cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
              port: "wasm.terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au",
              channelId: "channel-26",
            },
            chain: {
              port: "transfer",
              channelId: "channel-341",
              path: "transfer/channel-341/cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
            chainType: "cosmos",
            chainId: "phoenix-1",
            symbol: "BLUE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/blue.png",
            },
          },
        ],
        variantGroupKey: "BLUE",
        name: "BLUE CUB DAO",
        description: "BLUE CUB DAO is a community DAO on Terra",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "terra2",
            sourceDenom: "uluna",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
        ],
        relative_image_url: "/tokens/generated/blue.png",
      },
      {
        chainName: "terra2",
        sourceDenom:
          "cw20:terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
        coinMinimalDenom:
          "ibc/E5916C205E90C7C3481AFD8663A13C1D6C63145FB6C38DA9FC151FEE706F32EF",
        symbol: "ASTRO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/astro.png",
        },
        coingeckoId: "astroport-fi",
        categories: ["meme"],
        transferMethods: [
          {
            name: "TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://tfm.com/bridge?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26&token1=ibc%2F8410580A4F5421DFDBD888212624591E92A9E3B5C87D3C58913CE16ABD98B9B4",
            withdrawUrl:
              "https://tfm.com/bridge?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2F8410580A4F5421DFDBD888212624591E92A9E3B5C87D3C58913CE16ABD98B9B4&token1=terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra2",
              chainId: "phoenix-1",
              sourceDenom:
                "cw20:terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
              port: "wasm.terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au",
              channelId: "channel-26",
            },
            chain: {
              port: "transfer",
              channelId: "channel-341",
              path: "transfer/channel-341/cw20:terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
            chainType: "cosmos",
            chainId: "phoenix-1",
            symbol: "ASTRO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/astro.png",
            },
          },
        ],
        variantGroupKey: "ASTRO",
        name: "Astroport",
        description:
          "Astroport is a neutral marketplace where anyone, from anywhere in the galaxy, can dock to trade their wares.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: true,
        twitterURL: "https://twitter.com/astroport_fi",
        relatedAssets: [
          {
            chainName: "terra2",
            sourceDenom: "uluna",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
        ],
        relative_image_url: "/tokens/generated/astro.png",
      },
    ],
  },
  {
    chain_name: "rizon",
    chain_id: "titan-1",
    assets: [
      {
        chainName: "rizon",
        sourceDenom: "uatolo",
        coinMinimalDenom:
          "ibc/2716E3F2E146664BEFA9217F1A03BFCEDBCD5178B3C71CACB1A0D7584451D219",
        symbol: "ATOLO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rizon/images/atolo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rizon/images/atolo.svg",
        },
        coingeckoId: "rizon",
        price: {
          poolId: "729",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "rizon",
              chainId: "titan-1",
              sourceDenom: "uatolo",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-221",
              path: "transfer/channel-221/uatolo",
            },
          },
        ],
        counterparty: [
          {
            chainName: "rizon",
            sourceDenom: "uatolo",
            chainType: "cosmos",
            chainId: "titan-1",
            symbol: "ATOLO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rizon/images/atolo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rizon/images/atolo.svg",
            },
          },
        ],
        variantGroupKey: "ATOLO",
        name: "Rizon",
        description: "Native token of Rizon Chain",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/atolo.svg",
      },
    ],
  },
  {
    chain_name: "genesisl1",
    chain_id: "genesis_29-2",
    assets: [
      {
        chainName: "genesisl1",
        sourceDenom: "el1",
        coinMinimalDenom:
          "ibc/F16FDC11A7662B86BC0B9CE61871CBACF7C20606F95E86260FD38915184B75B4",
        symbol: "L1",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/genesisl1/images/l1.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/genesisl1/images/l1.svg",
        },
        price: {
          poolId: "732",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "genesisl1",
              chainId: "genesis_29-2",
              sourceDenom: "el1",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-253",
              path: "transfer/channel-253/el1",
            },
          },
        ],
        counterparty: [
          {
            chainName: "genesisl1",
            sourceDenom: "el1",
            chainType: "cosmos",
            chainId: "genesis_29-2",
            symbol: "L1",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/genesisl1/images/l1.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/genesisl1/images/l1.svg",
            },
          },
        ],
        variantGroupKey: "L1",
        name: "GenesisL1",
        description:
          "L1 coin is the GenesisL1 blockchain utility, governance and EVM token",
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/l1.svg",
      },
    ],
  },
  {
    chain_name: "kujira",
    chain_id: "kaiyo-1",
    assets: [
      {
        chainName: "kujira",
        sourceDenom: "ukuji",
        coinMinimalDenom:
          "ibc/BB6BCDB515050BAE97516111873CCD7BCF1FD0CCB723CC12F3C4F704D6C646CE",
        symbol: "KUJI",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.svg",
        },
        coingeckoId: "kujira",
        price: {
          poolId: "1161",
          denom:
            "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Kujira Blue",
            type: "external_interface",
            depositUrl:
              "https://blue.kujira.app/ibc?destination=osmosis-1&denom=ukuji",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kujira",
              chainId: "kaiyo-1",
              sourceDenom: "ukuji",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-259",
              path: "transfer/channel-259/ukuji",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kujira",
            sourceDenom: "ukuji",
            chainType: "cosmos",
            chainId: "kaiyo-1",
            symbol: "KUJI",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.svg",
            },
          },
        ],
        variantGroupKey: "KUJI",
        name: "Kujira",
        description:
          "The native staking and governance token of the Kujira chain.\n\nA decentralized ecosystem for protocols, builders and web3 users seeking sustainable FinTech.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/TeamKujira",
        relatedAssets: [
          {
            chainName: "kujira",
            sourceDenom:
              "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
          },
          {
            chainName: "kujira",
            sourceDenom:
              "factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta",
          },
          {
            chainName: "kujira",
            sourceDenom:
              "factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk",
          },
        ],
        relative_image_url: "/tokens/generated/kuji.svg",
      },
      {
        chainName: "kujira",
        sourceDenom:
          "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
        coinMinimalDenom:
          "ibc/44492EAB24B72E3FB59B9FA619A22337FB74F95D8808FE6BC78CC0E6C18DC2EC",
        symbol: "USK",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/usk.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/usk.svg",
        },
        coingeckoId: "usk",
        price: {
          poolId: "827",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Kujira Blue",
            type: "external_interface",
            depositUrl:
              "https://blue.kujira.app/ibc?destination=osmosis-1&source=kaiyo-1&denom=factory%2Fkujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7%2Fuusk",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kujira",
              chainId: "kaiyo-1",
              sourceDenom:
                "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-259",
              path: "transfer/channel-259/factory:kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7:uusk",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kujira",
            sourceDenom:
              "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
            chainType: "cosmos",
            chainId: "kaiyo-1",
            symbol: "USK",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/usk.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/usk.svg",
            },
          },
        ],
        variantGroupKey: "USK",
        name: "USK",
        description:
          "The native over-collateralized stablecoin from the Kujira chain.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "kujira",
            sourceDenom: "ukuji",
          },
          {
            chainName: "kujira",
            sourceDenom:
              "factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta",
          },
          {
            chainName: "kujira",
            sourceDenom:
              "factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk",
          },
        ],
        relative_image_url: "/tokens/generated/usk.svg",
      },
      {
        chainName: "kujira",
        sourceDenom:
          "factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta",
        coinMinimalDenom:
          "ibc/51D893F870B7675E507E91DA8DB0B22EA66333207E4F5C0708757F08EE059B0B",
        symbol: "MNTA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/mnta.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/mnta.svg",
        },
        coingeckoId: "mantadao",
        price: {
          poolId: "1215",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Kujira Blue",
            type: "external_interface",
            depositUrl:
              "https://blue.kujira.app/ibc?destination=osmosis-1&source=kaiyo-1&denom=factory%2Fkujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7%2Fumnta",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kujira",
              chainId: "kaiyo-1",
              sourceDenom:
                "factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-259",
              path: "transfer/channel-259/factory:kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7:umnta",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kujira",
            sourceDenom:
              "factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta",
            chainType: "cosmos",
            chainId: "kaiyo-1",
            symbol: "MNTA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/mnta.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/mnta.svg",
            },
          },
        ],
        variantGroupKey: "MNTA",
        name: "MantaDAO",
        description: "MantaDAO Governance Token",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "kujira",
            sourceDenom: "ukuji",
          },
          {
            chainName: "kujira",
            sourceDenom:
              "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
          },
          {
            chainName: "kujira",
            sourceDenom:
              "factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk",
          },
        ],
        relative_image_url: "/tokens/generated/mnta.svg",
      },
      {
        chainName: "kujira",
        sourceDenom:
          "factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk",
        coinMinimalDenom:
          "ibc/690EB0A0CA0DA2DC1E9CF62FB23C935AE5C7E9F57919CF89690521D5D70948A7",
        symbol: "NSTK",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/nstk.svg",
        },
        coingeckoId: "unstake-fi",
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kujira",
              chainId: "kaiyo-1",
              sourceDenom:
                "factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-259",
              path: "transfer/channel-259/factory:kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh:unstk",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kujira",
            sourceDenom:
              "factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk",
            chainType: "cosmos",
            chainId: "kaiyo-1",
            symbol: "NSTK",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/nstk.svg",
            },
          },
        ],
        variantGroupKey: "NSTK",
        name: "Unstake Fi",
        description: "The Revenue & Governance token of Unstake.fi",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "kujira",
            sourceDenom: "ukuji",
          },
          {
            chainName: "kujira",
            sourceDenom:
              "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
          },
          {
            chainName: "kujira",
            sourceDenom:
              "factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta",
          },
        ],
        relative_image_url: "/tokens/generated/nstk.svg",
      },
    ],
  },
  {
    chain_name: "tgrade",
    chain_id: "tgrade-mainnet-1",
    assets: [
      {
        chainName: "tgrade",
        sourceDenom: "utgd",
        coinMinimalDenom:
          "ibc/1E09CB0F506ACF12FDE4683FB6B34DA62FB4BE122641E0D93AAF98A87675676C",
        symbol: "TGD",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/tgrade/images/tgrade-symbol-gradient.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/tgrade/images/tgrade-symbol-gradient.svg",
        },
        coingeckoId: "tgrade",
        price: {
          poolId: "769",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "tgrade",
              chainId: "tgrade-mainnet-1",
              sourceDenom: "utgd",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-263",
              path: "transfer/channel-263/utgd",
            },
          },
        ],
        counterparty: [
          {
            chainName: "tgrade",
            sourceDenom: "utgd",
            chainType: "cosmos",
            chainId: "tgrade-mainnet-1",
            symbol: "TGD",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/tgrade/images/tgrade-symbol-gradient.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/tgrade/images/tgrade-symbol-gradient.svg",
            },
          },
        ],
        variantGroupKey: "TGD",
        name: "Tgrade",
        description: "The native token of Tgrade",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/tgd.svg",
      },
    ],
  },
  {
    chain_name: "echelon",
    chain_id: "echelon_3000-3",
    assets: [
      {
        chainName: "echelon",
        sourceDenom: "aechelon",
        coinMinimalDenom:
          "ibc/47EE224A9B33CF0ABEAC82106E52F0F6E8D8CEC5BA80B9D9A6F55172CBB0177D",
        symbol: "ECH",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/echelon/images/ech.svg",
        },
        coingeckoId: "echelon",
        price: {
          poolId: "848",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Echelon Network",
            type: "external_interface",
            depositUrl: "https://app.ech.network/ibc",
            withdrawUrl: "https://app.ech.network/ibc",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "echelon",
              chainId: "echelon_3000-3",
              sourceDenom: "aechelon",
              port: "transfer",
              channelId: "channel-11",
            },
            chain: {
              port: "transfer",
              channelId: "channel-403",
              path: "transfer/channel-403/aechelon",
            },
          },
        ],
        counterparty: [
          {
            chainName: "echelon",
            sourceDenom: "aechelon",
            chainType: "cosmos",
            chainId: "echelon_3000-3",
            symbol: "ECH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/echelon/images/ech.svg",
            },
          },
        ],
        variantGroupKey: "ECH",
        name: "Echelon",
        description:
          "Echelon - a scalable EVM on Cosmos, built on Proof-of-Stake with fast-finality that prioritizes interoperability and novel economics",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/ech.svg",
      },
    ],
  },
  {
    chain_name: "odin",
    chain_id: "odin-mainnet-freya",
    assets: [
      {
        chainName: "odin",
        sourceDenom: "loki",
        coinMinimalDenom:
          "ibc/C360EF34A86D334F625E4CBB7DA3223AEA97174B61F35BB3758081A8160F7D9B",
        symbol: "ODIN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/odin.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/odin.svg",
        },
        coingeckoId: "odin-protocol",
        price: {
          poolId: "777",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "odin",
              chainId: "odin-mainnet-freya",
              sourceDenom: "loki",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-258",
              path: "transfer/channel-258/loki",
            },
          },
        ],
        counterparty: [
          {
            chainName: "odin",
            sourceDenom: "loki",
            chainType: "cosmos",
            chainId: "odin-mainnet-freya",
            symbol: "ODIN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/odin.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/odin.svg",
            },
          },
        ],
        variantGroupKey: "ODIN",
        name: "Odin Protocol",
        description: "Staking and governance token for ODIN Protocol",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "odin",
            sourceDenom: "mGeo",
          },
          {
            chainName: "odin",
            sourceDenom: "mO9W",
          },
        ],
        relative_image_url: "/tokens/generated/odin.svg",
      },
      {
        chainName: "odin",
        sourceDenom: "mGeo",
        coinMinimalDenom:
          "ibc/9B6FBABA36BB4A3BF127AE5E96B572A5197FD9F3111D895D8919B07BC290764A",
        symbol: "GEO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/geo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/geo.svg",
        },
        price: {
          poolId: "787",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "odin",
              chainId: "odin-mainnet-freya",
              sourceDenom: "mGeo",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-258",
              path: "transfer/channel-258/mGeo",
            },
          },
        ],
        counterparty: [
          {
            chainName: "odin",
            sourceDenom: "mGeo",
            chainType: "cosmos",
            chainId: "odin-mainnet-freya",
            symbol: "GEO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/geo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/geo.svg",
            },
          },
        ],
        variantGroupKey: "GEO",
        name: "GEO",
        description: "GEO token for ODIN Protocol",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "odin",
            sourceDenom: "loki",
          },
          {
            chainName: "odin",
            sourceDenom: "mO9W",
          },
        ],
        relative_image_url: "/tokens/generated/geo.svg",
      },
      {
        chainName: "odin",
        sourceDenom: "mO9W",
        coinMinimalDenom:
          "ibc/0CD46223FEABD2AEAAAF1F057D01E63BCA79B7D4BD6B68F1EB973A987344695D",
        symbol: "O9W",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/o9w.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/o9w.svg",
        },
        price: {
          poolId: "805",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "odin",
              chainId: "odin-mainnet-freya",
              sourceDenom: "mO9W",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-258",
              path: "transfer/channel-258/mO9W",
            },
          },
        ],
        counterparty: [
          {
            chainName: "odin",
            sourceDenom: "mO9W",
            chainType: "cosmos",
            chainId: "odin-mainnet-freya",
            symbol: "O9W",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/o9w.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/o9w.svg",
            },
          },
        ],
        variantGroupKey: "O9W",
        name: "O9W",
        description: "O9W token for ODIN Protocol",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "odin",
            sourceDenom: "loki",
          },
          {
            chainName: "odin",
            sourceDenom: "mGeo",
          },
        ],
        relative_image_url: "/tokens/generated/o9w.svg",
      },
    ],
  },
  {
    chain_name: "crescent",
    chain_id: "crescent-1",
    assets: [
      {
        chainName: "crescent",
        sourceDenom: "ucre",
        coinMinimalDenom:
          "ibc/5A7C219BA5F7582B99629BA3B2A01A61BFDA0F6FD1FE95B5366F7334C4BC0580",
        symbol: "CRE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/crescent/images/cre.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/crescent/images/cre.svg",
        },
        coingeckoId: "crescent-network",
        price: {
          poolId: "786",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "crescent",
              chainId: "crescent-1",
              sourceDenom: "ucre",
              port: "transfer",
              channelId: "channel-9",
            },
            chain: {
              port: "transfer",
              channelId: "channel-297",
              path: "transfer/channel-297/ucre",
            },
          },
        ],
        counterparty: [
          {
            chainName: "crescent",
            sourceDenom: "ucre",
            chainType: "cosmos",
            chainId: "crescent-1",
            symbol: "CRE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/crescent/images/cre.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/crescent/images/cre.svg",
            },
          },
        ],
        variantGroupKey: "CRE",
        name: "Crescent",
        description: "The native token of Crescent",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/cre.svg",
      },
    ],
  },
  {
    chain_name: "lumenx",
    chain_id: "LumenX",
    assets: [
      {
        chainName: "lumenx",
        sourceDenom: "ulumen",
        coinMinimalDenom:
          "ibc/FFA652599C77E853F017193E36B5AB2D4D9AFC4B54721A74904F80C9236BF3B7",
        symbol: "LUMEN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumenx/images/lumen.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumenx/images/lumen.svg",
        },
        price: {
          poolId: "788",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "lumenx",
              chainId: "LumenX",
              sourceDenom: "ulumen",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-286",
              path: "transfer/channel-286/ulumen",
            },
          },
        ],
        counterparty: [
          {
            chainName: "lumenx",
            sourceDenom: "ulumen",
            chainType: "cosmos",
            chainId: "LumenX",
            symbol: "LUMEN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumenx/images/lumen.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumenx/images/lumen.svg",
            },
          },
        ],
        variantGroupKey: "LUMEN",
        name: "LumenX",
        description: "The native token of LumenX Network",
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/lumen.svg",
      },
    ],
  },
  {
    chain_name: "oraichain",
    chain_id: "Oraichain",
    assets: [
      {
        chainName: "oraichain",
        sourceDenom: "orai",
        coinMinimalDenom:
          "ibc/161D7D62BAB3B9C39003334F1671208F43C06B643CC9EDBBE82B64793C857F1D",
        symbol: "ORAI",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai-white.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai-white.svg",
        },
        coingeckoId: "oraichain-token",
        price: {
          poolId: "799",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "oraichain",
              chainId: "Oraichain",
              sourceDenom: "orai",
              port: "transfer",
              channelId: "channel-13",
            },
            chain: {
              port: "transfer",
              channelId: "channel-216",
              path: "transfer/channel-216/orai",
            },
          },
        ],
        counterparty: [
          {
            chainName: "oraichain",
            sourceDenom: "orai",
            chainType: "cosmos",
            chainId: "Oraichain",
            symbol: "ORAI",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai-white.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai-white.svg",
            },
          },
        ],
        variantGroupKey: "ORAI",
        name: "Oraichain",
        description: "The native token of Oraichain",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/orai.svg",
      },
    ],
  },
  {
    chain_name: "cudos",
    chain_id: "cudos-1",
    assets: [
      {
        chainName: "cudos",
        sourceDenom: "acudos",
        coinMinimalDenom:
          "ibc/E09ED39F390EC51FA9F3F69BEA08B5BBE6A48B3057B2B1C3467FAAE9E58B021B",
        symbol: "CUDOS",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cudos/images/cudos.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cudos/images/cudos.svg",
        },
        coingeckoId: "cudos",
        price: {
          poolId: "796",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "cudos",
              chainId: "cudos-1",
              sourceDenom: "acudos",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-298",
              path: "transfer/channel-298/acudos",
            },
          },
        ],
        counterparty: [
          {
            chainName: "cudos",
            sourceDenom: "acudos",
            chainType: "cosmos",
            chainId: "cudos-1",
            symbol: "CUDOS",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cudos/images/cudos.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cudos/images/cudos.svg",
            },
          },
        ],
        variantGroupKey: "CUDOS",
        name: "Cudos",
        description: "The native token of the Cudos blockchain",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/cudos.svg",
      },
    ],
  },
  {
    chain_name: "agoric",
    chain_id: "agoric-3",
    assets: [
      {
        chainName: "agoric",
        sourceDenom: "ubld",
        coinMinimalDenom:
          "ibc/2DA9C149E9AD2BD27FEFA635458FB37093C256C1A940392634A16BEA45262604",
        symbol: "BLD",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/bld.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/bld.svg",
        },
        coingeckoId: "agoric",
        price: {
          poolId: "1104",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "agoric",
              chainId: "agoric-3",
              sourceDenom: "ubld",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-320",
              path: "transfer/channel-320/ubld",
            },
          },
        ],
        counterparty: [
          {
            chainName: "agoric",
            sourceDenom: "ubld",
            chainType: "cosmos",
            chainId: "agoric-3",
            symbol: "BLD",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/bld.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/bld.svg",
            },
          },
        ],
        variantGroupKey: "BLD",
        name: "Agoric",
        description:
          "BLD is the token used to secure the Agoric chain through staking and to backstop Inter Protocol.\n\nThe Agoric platform makes it safe and seamless to build decentralized apps using your existing JavaScript knowledge.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/agoric",
        relatedAssets: [
          {
            chainName: "agoric",
            sourceDenom: "uist",
          },
        ],
        relative_image_url: "/tokens/generated/bld.svg",
      },
      {
        chainName: "agoric",
        sourceDenom: "uist",
        coinMinimalDenom:
          "ibc/92BE0717F4678905E53F4E45B2DED18BC0CB97BF1F8B6A25AFEDF3D5A879B4D5",
        symbol: "IST",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/ist.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/ist.svg",
        },
        coingeckoId: "inter-stable-token",
        price: {
          poolId: "1224",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "agoric",
              chainId: "agoric-3",
              sourceDenom: "uist",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-320",
              path: "transfer/channel-320/uist",
            },
          },
        ],
        counterparty: [
          {
            chainName: "agoric",
            sourceDenom: "uist",
            chainType: "cosmos",
            chainId: "agoric-3",
            symbol: "IST",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/ist.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/ist.svg",
            },
          },
        ],
        variantGroupKey: "IST",
        name: "Inter Stable Token",
        description:
          "IST is the stable token used by the Agoric chain for execution fees and commerce.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "agoric",
            sourceDenom: "ubld",
          },
        ],
        relative_image_url: "/tokens/generated/ist.svg",
      },
    ],
  },
  {
    chain_name: "stride",
    chain_id: "stride-1",
    assets: [
      {
        chainName: "stride",
        sourceDenom: "ustrd",
        coinMinimalDenom:
          "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
        symbol: "STRD",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.svg",
        },
        coingeckoId: "stride",
        price: {
          poolId: "1098",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "ustrd",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/ustrd",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "ustrd",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "STRD",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.svg",
            },
          },
        ],
        variantGroupKey: "STRD",
        name: "Stride",
        description:
          "The native token of Stride\n\nStride is a blockchain that provides liquidity for staked tokens. Using Stride, you can earn both taking and DeFi yields across the Cosmos IBC ecosystem.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/stride_zone",
        relatedAssets: [
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "stride",
            sourceDenom: "staevmos",
          },
          {
            chainName: "stride",
            sourceDenom: "stuumee",
          },
          {
            chainName: "stride",
            sourceDenom: "stusomm",
          },
          {
            chainName: "stride",
            sourceDenom: "stadydx",
          },
          {
            chainName: "stride",
            sourceDenom: "stutia",
          },
        ],
        relative_image_url: "/tokens/generated/strd.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stuatom",
        coinMinimalDenom:
          "ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901",
        symbol: "stATOM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/statom.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/statom.svg",
        },
        coingeckoId: "stride-staked-atom",
        price: {
          poolId: "1136",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stuatom",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stuatom",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stuatom",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stATOM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/statom.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/statom.svg",
            },
          },
        ],
        variantGroupKey: "stATOM",
        name: "Stride Staked ATOM",
        description: "",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "cosmoshub",
            sourceDenom: "uatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "stride",
            sourceDenom: "staevmos",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stuumee",
          },
          {
            chainName: "stride",
            sourceDenom: "stusomm",
          },
        ],
        relative_image_url: "/tokens/generated/statom.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stustars",
        coinMinimalDenom:
          "ibc/5DD1F95ED336014D00CE2520977EC71566D282F9749170ADC83A392E0EA7426A",
        symbol: "stSTARS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/ststars.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/ststars.svg",
        },
        coingeckoId: "stride-staked-stars",
        price: {
          poolId: "1397",
          denom:
            "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stustars",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stustars",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stustars",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stSTARS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/ststars.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/ststars.svg",
            },
          },
        ],
        variantGroupKey: "stSTARS",
        name: "Stride Staked STARS",
        description: "",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "stargaze",
            sourceDenom: "ustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "stride",
            sourceDenom: "staevmos",
          },
          {
            chainName: "stride",
            sourceDenom: "stuumee",
          },
          {
            chainName: "stride",
            sourceDenom: "stusomm",
          },
        ],
        relative_image_url: "/tokens/generated/ststars.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stujuno",
        coinMinimalDenom:
          "ibc/84502A75BCA4A5F68D464C00B3F610CE2585847D59B52E5FFB7C3C9D2DDCD3FE",
        symbol: "stJUNO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stjuno.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stjuno.svg",
        },
        coingeckoId: "stride-staked-juno",
        price: {
          poolId: "817",
          denom:
            "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stujuno",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stujuno",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stujuno",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stJUNO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stjuno.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stjuno.svg",
            },
          },
        ],
        variantGroupKey: "stJUNO",
        name: "Stride Staked JUNO",
        description: "",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "juno",
            sourceDenom: "ujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
          },
        ],
        relative_image_url: "/tokens/generated/stjuno.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stuosmo",
        coinMinimalDenom:
          "ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC",
        symbol: "stOSMO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stosmo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stosmo.svg",
        },
        coingeckoId: "stride-staked-osmo",
        price: {
          poolId: "833",
          denom: "uosmo",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stuosmo",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stuosmo",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stOSMO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stosmo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stosmo.svg",
            },
          },
        ],
        variantGroupKey: "stOSMO",
        name: "Stride Staked OSMO",
        description: "",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "stride",
            sourceDenom: "staevmos",
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
        relative_image_url: "/tokens/generated/stosmo.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stuluna",
        coinMinimalDenom:
          "ibc/C491E7582E94AE921F6A029790083CDE1106C28F3F6C4AD7F1340544C13EC372",
        symbol: "stLUNA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stluna.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stluna.svg",
        },
        coingeckoId: "stride-staked-luna",
        price: {
          poolId: "913",
          denom:
            "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stuluna",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stuluna",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stuluna",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stLUNA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stluna.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stluna.svg",
            },
          },
        ],
        variantGroupKey: "stLUNA",
        name: "Stride Staked LUNA",
        description: "",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "terra2",
            sourceDenom: "uluna",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "staevmos",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
          },
          {
            chainName: "stride",
            sourceDenom: "stuumee",
          },
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
          },
        ],
        relative_image_url: "/tokens/generated/stluna.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "staevmos",
        coinMinimalDenom:
          "ibc/C5579A9595790017C600DD726276D978B9BF314CF82406CE342720A9C7911A01",
        symbol: "stEVMOS",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stevmos.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stevmos.svg",
        },
        coingeckoId: "stride-staked-evmos",
        price: {
          poolId: "922",
          denom:
            "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "staevmos",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/staevmos",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "staevmos",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stEVMOS",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stevmos.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stevmos.svg",
            },
          },
        ],
        variantGroupKey: "stEVMOS",
        name: "Stride Staked EVMOS",
        description: "",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "evmos",
            sourceDenom: "aevmos",
          },
          {
            chainName: "stride",
            sourceDenom: "stuumee",
          },
          {
            chainName: "stride",
            sourceDenom: "stusomm",
          },
          {
            chainName: "stride",
            sourceDenom: "stadydx",
          },
        ],
        relative_image_url: "/tokens/generated/stevmos.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stuumee",
        coinMinimalDenom:
          "ibc/02F196DA6FD0917DD5FEA249EE61880F4D941EE9059E7964C5C9B50AF103800F",
        symbol: "stUMEE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stumee.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stumee.svg",
        },
        coingeckoId: "stride-staked-umee",
        price: {
          poolId: "1035",
          denom:
            "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stuumee",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stuumee",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stuumee",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stUMEE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stumee.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stumee.svg",
            },
          },
        ],
        variantGroupKey: "stUMEE",
        name: "Stride Staked UMEE",
        description: "",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "umee",
            sourceDenom: "uumee",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "stride",
            sourceDenom: "staevmos",
          },
          {
            chainName: "stride",
            sourceDenom: "stusomm",
          },
          {
            chainName: "stride",
            sourceDenom: "stadydx",
          },
        ],
        relative_image_url: "/tokens/generated/stumee.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stusomm",
        coinMinimalDenom:
          "ibc/5A0060579D24FBE5268BEA74C3281E7FE533D361C41A99307B4998FEC611E46B",
        symbol: "stSOMM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsomm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsomm.svg",
        },
        coingeckoId: "stride-staked-sommelier",
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stusomm",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stusomm",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stusomm",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stSOMM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsomm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsomm.svg",
            },
          },
        ],
        variantGroupKey: "stSOMM",
        name: "Stride Staked SOMM",
        description: "",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "sommelier",
            sourceDenom: "usomm",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "stride",
            sourceDenom: "staevmos",
          },
          {
            chainName: "stride",
            sourceDenom: "stuumee",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqsomm",
          },
        ],
        relative_image_url: "/tokens/generated/stsomm.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stadydx",
        coinMinimalDenom:
          "ibc/980E82A9F8E7CA8CD480F4577E73682A6D3855A267D1831485D7EBEF0E7A6C2C",
        symbol: "stDYDX",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stdydx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stdydx.svg",
        },
        price: {
          poolId: "1423",
          denom:
            "ibc/831F0B1BBB1D08A2B75311892876D71565478C532967545476DF4C2D7492E48C",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stadydx",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stadydx",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stadydx",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stDYDX",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stdydx.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stdydx.svg",
            },
          },
        ],
        variantGroupKey: "stDYDX",
        name: "Stride Staked DYDX",
        description: "Stride's liquid staked DYDX",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "stride",
          sourceDenom: "ustrd",
        },
        listingDate: "2024-01-29T12:48:00.000Z",
        relatedAssets: [
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "dydx",
            sourceDenom: "adydx",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "stride",
            sourceDenom: "staevmos",
          },
          {
            chainName: "stride",
            sourceDenom: "stuumee",
          },
          {
            chainName: "stride",
            sourceDenom: "stusomm",
          },
        ],
        relative_image_url: "/tokens/generated/stdydx.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stutia",
        coinMinimalDenom:
          "ibc/698350B8A61D575025F3ED13E9AC9C0F45C89DEFE92F76D5838F1D3C1A7FF7C9",
        symbol: "stTIA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/sttia.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/sttia.svg",
        },
        price: {
          poolId: "1428",
          denom:
            "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stutia",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stutia",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stutia",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stTIA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/sttia.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/sttia.svg",
            },
          },
        ],
        variantGroupKey: "stTIA",
        name: "Stride Staked TIA",
        description: "Stride's liquid staked TIA",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "stride",
          sourceDenom: "ustrd",
        },
        listingDate: "2024-01-31T23:17:00.000Z",
        relatedAssets: [
          {
            chainName: "celestia",
            sourceDenom: "utia",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "stride",
            sourceDenom: "staevmos",
          },
          {
            chainName: "stride",
            sourceDenom: "stuumee",
          },
          {
            chainName: "stride",
            sourceDenom: "stusomm",
          },
        ],
        relative_image_url: "/tokens/generated/sttia.svg",
      },
    ],
  },
  {
    chain_name: "rebus",
    chain_id: "reb_1111-1",
    assets: [
      {
        chainName: "rebus",
        sourceDenom: "arebus",
        coinMinimalDenom:
          "ibc/A1AC7F9EE2F643A68E3A35BCEB22040120BEA4059773BB56985C76BDFEBC71D9",
        symbol: "REBUS",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rebus/images/rebus.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rebus/images/rebus.svg",
        },
        coingeckoId: "rebus",
        price: {
          poolId: "813",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "rebus",
              chainId: "reb_1111-1",
              sourceDenom: "arebus",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-355",
              path: "transfer/channel-355/arebus",
            },
          },
        ],
        counterparty: [
          {
            chainName: "rebus",
            sourceDenom: "arebus",
            chainType: "cosmos",
            chainId: "reb_1111-1",
            symbol: "REBUS",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rebus/images/rebus.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rebus/images/rebus.svg",
            },
          },
        ],
        variantGroupKey: "REBUS",
        name: "Rebus",
        description: "REBUS, the native coin of the Rebus chain.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/rebus.svg",
      },
    ],
  },
  {
    chain_name: "teritori",
    chain_id: "teritori-1",
    assets: [
      {
        chainName: "teritori",
        sourceDenom: "utori",
        coinMinimalDenom:
          "ibc/EB7FB9C8B425F289B63703413327C2051030E848CE4EAAEA2E51199D6D39D3EC",
        symbol: "TORI",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/teritori/images/utori.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/teritori/images/utori.svg",
        },
        coingeckoId: "teritori",
        price: {
          poolId: "816",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "teritori",
              chainId: "teritori-1",
              sourceDenom: "utori",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-362",
              path: "transfer/channel-362/utori",
            },
          },
        ],
        counterparty: [
          {
            chainName: "teritori",
            sourceDenom: "utori",
            chainType: "cosmos",
            chainId: "teritori-1",
            symbol: "TORI",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/teritori/images/utori.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/teritori/images/utori.svg",
            },
          },
        ],
        variantGroupKey: "TORI",
        name: "Teritori",
        description: "The native token of Teritori",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/tori.svg",
      },
    ],
  },
  {
    chain_name: "lambda",
    chain_id: "lambda_92000-1",
    assets: [
      {
        chainName: "lambda",
        sourceDenom: "ulamb",
        coinMinimalDenom:
          "ibc/80825E8F04B12D914ABEADB1F4D39C04755B12C8402F6876EE3168450C0A90BB",
        symbol: "LAMB",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lambda/images/lambda.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lambda/images/lambda.svg",
        },
        coingeckoId: "lambda",
        price: {
          poolId: "826",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "lambda",
              chainId: "lambda_92000-1",
              sourceDenom: "ulamb",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-378",
              path: "transfer/channel-378/ulamb",
            },
          },
        ],
        counterparty: [
          {
            chainName: "lambda",
            sourceDenom: "ulamb",
            chainType: "cosmos",
            chainId: "lambda_92000-1",
            symbol: "LAMB",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lambda/images/lambda.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lambda/images/lambda.svg",
            },
          },
        ],
        variantGroupKey: "LAMB",
        name: "Lambda",
        description: "The native token of Lambda",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/lamb.svg",
      },
    ],
  },
  {
    chain_name: "unification",
    chain_id: "FUND-MainNet-2",
    assets: [
      {
        chainName: "unification",
        sourceDenom: "nund",
        coinMinimalDenom:
          "ibc/608EF5C0CE64FEA097500DB39657BDD36CA708CC5DCC2E250A024B6981DD36BC",
        symbol: "FUND",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/unification/images/fund.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/unification/images/fund.svg",
        },
        coingeckoId: "unification",
        price: {
          poolId: "1240",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "unification",
              chainId: "FUND-MainNet-2",
              sourceDenom: "nund",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-382",
              path: "transfer/channel-382/nund",
            },
          },
        ],
        counterparty: [
          {
            chainName: "unification",
            sourceDenom: "nund",
            chainType: "cosmos",
            chainId: "FUND-MainNet-2",
            symbol: "FUND",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/unification/images/fund.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/unification/images/fund.svg",
            },
          },
        ],
        variantGroupKey: "FUND",
        name: "Unification",
        description:
          "Staking and governance coin for the Unification Blockchain",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/fund.svg",
      },
    ],
  },
  {
    chain_name: "jackal",
    chain_id: "jackal-1",
    assets: [
      {
        chainName: "jackal",
        sourceDenom: "ujkl",
        coinMinimalDenom:
          "ibc/8E697BDABE97ACE8773C6DF7402B2D1D5104DD1EEABE12608E3469B7F64C15BA",
        symbol: "JKL",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/jackal/images/jkl.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/jackal/images/jkl.svg",
        },
        coingeckoId: "jackal-protocol",
        price: {
          poolId: "832",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "jackal",
              chainId: "jackal-1",
              sourceDenom: "ujkl",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-412",
              path: "transfer/channel-412/ujkl",
            },
          },
        ],
        counterparty: [
          {
            chainName: "jackal",
            sourceDenom: "ujkl",
            chainType: "cosmos",
            chainId: "jackal-1",
            symbol: "JKL",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/jackal/images/jkl.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/jackal/images/jkl.svg",
            },
          },
        ],
        variantGroupKey: "JKL",
        name: "Jackal",
        description: "The native staking and governance token of Jackal.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/jkl.svg",
      },
    ],
  },
  {
    chain_name: "beezee",
    chain_id: "beezee-1",
    assets: [
      {
        chainName: "beezee",
        sourceDenom: "ubze",
        coinMinimalDenom:
          "ibc/C822645522FC3EECF817609AA38C24B64D04F5C267A23BCCF8F2E3BC5755FA88",
        symbol: "BZE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/beezee/images/bze.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/beezee/images/bze.svg",
        },
        coingeckoId: "bzedge",
        price: {
          poolId: "856",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "beezee",
              chainId: "beezee-1",
              sourceDenom: "ubze",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-340",
              path: "transfer/channel-340/ubze",
            },
          },
        ],
        counterparty: [
          {
            chainName: "beezee",
            sourceDenom: "ubze",
            chainType: "cosmos",
            chainId: "beezee-1",
            symbol: "BZE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/beezee/images/bze.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/beezee/images/bze.svg",
            },
          },
        ],
        variantGroupKey: "BZE",
        name: "BeeZee",
        description: "BeeZee native blockchain",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/bze.svg",
      },
    ],
  },
  {
    chain_name: "acrechain",
    chain_id: "acre_9052-1",
    assets: [
      {
        chainName: "acrechain",
        sourceDenom: "aacre",
        coinMinimalDenom:
          "ibc/BB936517F7E5D77A63E0ADB05217A6608B0C4CF8FBA7EA2F4BAE4107A7238F06",
        symbol: "ACRE",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/acre.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/acre.svg",
        },
        coingeckoId: "arable-protocol",
        price: {
          poolId: "858",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "acrechain",
              chainId: "acre_9052-1",
              sourceDenom: "aacre",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-490",
              path: "transfer/channel-490/aacre",
            },
          },
        ],
        counterparty: [
          {
            chainName: "acrechain",
            sourceDenom: "aacre",
            chainType: "cosmos",
            chainId: "acre_9052-1",
            symbol: "ACRE",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/acre.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/acre.svg",
            },
          },
        ],
        variantGroupKey: "ACRE",
        name: "Acrechain",
        description:
          "The native EVM, governance and staking token of the Acrechain",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "acrechain",
            sourceDenom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
          },
          {
            chainName: "acrechain",
            sourceDenom: "erc20/0xAE6D3334989a22A65228732446731438672418F2",
          },
        ],
        relative_image_url: "/tokens/generated/acre.svg",
      },
      {
        chainName: "acrechain",
        sourceDenom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
        coinMinimalDenom:
          "ibc/5D270A584B1078FBE07D14570ED5E88EC1FEDA8518B76C322606291E6FD8286F",
        symbol: "arUSD",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/arusd.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/arusd.svg",
        },
        coingeckoId: "arable-usd",
        price: {
          poolId: "895",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: [],
        transferMethods: [
          {
            name: "Arable Finance",
            type: "external_interface",
            depositUrl: "https://app.arable.finance/#/ibc",
            withdrawUrl: "https://app.arable.finance/#/ibc",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "acrechain",
              chainId: "acre_9052-1",
              sourceDenom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-490",
              path: "transfer/channel-490/erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
            },
          },
        ],
        counterparty: [
          {
            chainName: "acrechain",
            sourceDenom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
            chainType: "cosmos",
            chainId: "acre_9052-1",
            symbol: "arUSD",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/arusd.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/arusd.svg",
            },
          },
        ],
        variantGroupKey: "arUSD",
        name: "Arable USD",
        description: "Overcollateralized stable coin for Arable derivatives v1",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "acrechain",
            sourceDenom: "aacre",
          },
          {
            chainName: "acrechain",
            sourceDenom: "erc20/0xAE6D3334989a22A65228732446731438672418F2",
          },
        ],
        relative_image_url: "/tokens/generated/arusd.svg",
      },
      {
        chainName: "acrechain",
        sourceDenom: "erc20/0xAE6D3334989a22A65228732446731438672418F2",
        coinMinimalDenom:
          "ibc/D38BB3DD46864694F009AF01DA5A815B3A875F8CC52FF5679BFFCC35DC7451D5",
        symbol: "CNTO",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/cnto.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/cnto.svg",
        },
        price: {
          poolId: "909",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: [],
        transferMethods: [
          {
            name: "Arable Finance",
            type: "external_interface",
            depositUrl: "https://app.arable.finance/#/ibc",
            withdrawUrl: "https://app.arable.finance/#/ibc",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "acrechain",
              chainId: "acre_9052-1",
              sourceDenom: "erc20/0xAE6D3334989a22A65228732446731438672418F2",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-490",
              path: "transfer/channel-490/erc20/0xAE6D3334989a22A65228732446731438672418F2",
            },
          },
        ],
        counterparty: [
          {
            chainName: "acrechain",
            sourceDenom: "erc20/0xAE6D3334989a22A65228732446731438672418F2",
            chainType: "cosmos",
            chainId: "acre_9052-1",
            symbol: "CNTO",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/cnto.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/cnto.svg",
            },
          },
        ],
        variantGroupKey: "CNTO",
        name: "Ciento Token",
        description: "Ciento Exchange Token",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "acrechain",
            sourceDenom: "aacre",
          },
          {
            chainName: "acrechain",
            sourceDenom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
          },
        ],
        relative_image_url: "/tokens/generated/cnto.svg",
      },
    ],
  },
  {
    chain_name: "imversed",
    chain_id: "imversed_5555555-1",
    assets: [
      {
        chainName: "imversed",
        sourceDenom: "aimv",
        coinMinimalDenom:
          "ibc/92B223EBFA74DB99BEA92B23DEAA6050734FEEAABB84689CB8E1AE8F9C9F9AF4",
        symbol: "IMV",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/imversed/images/imversed.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/imversed/images/imversed.svg",
        },
        coingeckoId: "imv",
        price: {
          poolId: "866",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "imversed",
              chainId: "imversed_5555555-1",
              sourceDenom: "aimv",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-517",
              path: "transfer/channel-517/aimv",
            },
          },
        ],
        counterparty: [
          {
            chainName: "imversed",
            sourceDenom: "aimv",
            chainType: "cosmos",
            chainId: "imversed_5555555-1",
            symbol: "IMV",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/imversed/images/imversed.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/imversed/images/imversed.svg",
            },
          },
        ],
        variantGroupKey: "IMV",
        name: "Imversed",
        description:
          "The native EVM, governance and staking token of the Imversed",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/imv.svg",
      },
    ],
  },
  {
    chain_name: "medasdigital",
    chain_id: "medasdigital-1",
    assets: [
      {
        chainName: "medasdigital",
        sourceDenom: "umedas",
        coinMinimalDenom:
          "ibc/01E94A5FF29B8DDEFC86F412CC3927F7330E9B523CC63A6194B1108F5276025C",
        symbol: "MEDAS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/medasdigital/images/medas.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/medasdigital/images/medas.svg",
        },
        price: {
          poolId: "1329",
          denom:
            "ibc/41999DF04D9441DAC0DF5D8291DF4333FBCBA810FFD63FDCE34FDF41EF37B6F7",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "medasdigital",
              chainId: "medasdigital-1",
              sourceDenom: "umedas",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-519",
              path: "transfer/channel-519/umedas",
            },
          },
        ],
        counterparty: [
          {
            chainName: "medasdigital",
            sourceDenom: "umedas",
            chainType: "cosmos",
            chainId: "medasdigital-1",
            symbol: "MEDAS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/medasdigital/images/medas.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/medasdigital/images/medas.svg",
            },
          },
        ],
        variantGroupKey: "MEDAS",
        name: "Medas Digital Network",
        description: "The native token of Medas Digital Network",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/medas.svg",
      },
    ],
  },
  {
    chain_name: "onomy",
    chain_id: "onomy-mainnet-1",
    assets: [
      {
        chainName: "onomy",
        sourceDenom: "anom",
        coinMinimalDenom:
          "ibc/B9606D347599F0F2FDF82BA3EE339000673B7D274EA50F59494DC51EFCD42163",
        symbol: "NOM",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/onomy/images/nom.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/onomy/images/nom.svg",
        },
        coingeckoId: "onomy-protocol",
        price: {
          poolId: "882",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "onomy",
              chainId: "onomy-mainnet-1",
              sourceDenom: "anom",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-525",
              path: "transfer/channel-525/anom",
            },
          },
        ],
        counterparty: [
          {
            chainName: "onomy",
            sourceDenom: "anom",
            chainType: "cosmos",
            chainId: "onomy-mainnet-1",
            symbol: "NOM",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/onomy/images/nom.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/onomy/images/nom.svg",
            },
          },
        ],
        variantGroupKey: "NOM",
        name: "Onomy",
        description: "The native token of Onomy Protocol",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/nom.svg",
      },
    ],
  },
  {
    chain_name: "dyson",
    chain_id: "dyson-mainnet-01",
    assets: [
      {
        chainName: "dyson",
        sourceDenom: "dys",
        coinMinimalDenom:
          "ibc/E27CD305D33F150369AB526AEB6646A76EC3FFB1A6CA58A663B5DE657A89D55D",
        symbol: "DYS",
        decimals: 0,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dyson/images/dys.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dyson/images/dys.svg",
        },
        coingeckoId: "",
        price: {
          poolId: "950",
          denom:
            "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "dyson",
              chainId: "dyson-mainnet-01",
              sourceDenom: "dys",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-526",
              path: "transfer/channel-526/dys",
            },
          },
        ],
        counterparty: [
          {
            chainName: "dyson",
            sourceDenom: "dys",
            chainType: "cosmos",
            chainId: "dyson-mainnet-01",
            symbol: "DYS",
            decimals: 0,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dyson/images/dys.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dyson/images/dys.svg",
            },
          },
        ],
        variantGroupKey: "DYS",
        name: "Dyson Protocol",
        description:
          "The native staking and governance token of the Dyson Protocol",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/dys.svg",
      },
    ],
  },
  {
    chain_name: "planq",
    chain_id: "planq_7070-2",
    assets: [
      {
        chainName: "planq",
        sourceDenom: "aplanq",
        coinMinimalDenom:
          "ibc/B1E0166EA0D759FDF4B207D1F5F12210D8BFE36F2345CEFC76948CE2B36DFBAF",
        symbol: "PLQ",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/planq/images/planq.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/planq/images/planq.svg",
        },
        coingeckoId: "planq",
        price: {
          poolId: "1218",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://tfm.com/bridge?chainTo=osmosis-1&chainFrom=planq_7070-2&token0=aplanq&token1=ibc%2FB1E0166EA0D759FDF4B207D1F5F12210D8BFE36F2345CEFC76948CE2B36DFBAF",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "planq",
              chainId: "planq_7070-2",
              sourceDenom: "aplanq",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-492",
              path: "transfer/channel-492/aplanq",
            },
          },
        ],
        counterparty: [
          {
            chainName: "planq",
            sourceDenom: "aplanq",
            chainType: "cosmos",
            chainId: "planq_7070-2",
            symbol: "PLQ",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/planq/images/planq.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/planq/images/planq.svg",
            },
          },
        ],
        variantGroupKey: "PLQ",
        name: "Planq",
        description:
          "The native EVM, governance and staking token of the Planq Network",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/plq.svg",
      },
    ],
  },
  {
    chain_name: "canto",
    chain_id: "canto_7700-1",
    assets: [
      {
        chainName: "canto",
        sourceDenom: "acanto",
        coinMinimalDenom:
          "ibc/47CAF2DB8C016FAC960F33BC492FD8E454593B65CC59D70FA9D9F30424F9C32F",
        symbol: "CANTO",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.svg",
        },
        coingeckoId: "canto",
        price: {
          poolId: "901",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "canto",
              chainId: "canto_7700-1",
              sourceDenom: "acanto",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-550",
              path: "transfer/channel-550/acanto",
            },
          },
        ],
        counterparty: [
          {
            chainName: "canto",
            sourceDenom: "acanto",
            chainType: "cosmos",
            chainId: "canto_7700-1",
            symbol: "CANTO",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.svg",
            },
          },
        ],
        variantGroupKey: "CANTO",
        name: "Canto",
        description:
          "Canto is a Layer-1 blockchain built to deliver on the promise of DeFi",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/canto.svg",
      },
    ],
  },
  {
    chain_name: "quicksilver",
    chain_id: "quicksilver-2",
    assets: [
      {
        chainName: "quicksilver",
        sourceDenom: "uqstars",
        coinMinimalDenom:
          "ibc/46C83BB054E12E189882B5284542DB605D94C99827E367C9192CF0579CD5BC83",
        symbol: "qSTARS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qstars.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qstars.svg",
        },
        price: {
          poolId: "903",
          denom:
            "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "uqstars",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/uqstars",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "qSTARS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qstars.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qstars.svg",
            },
          },
        ],
        variantGroupKey: "qSTARS",
        name: "Quicksilver Liquid Staked STARS",
        description: "Quicksilver Liquid Staked STARS",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "quicksilver",
          sourceDenom: "uqck",
        },
        relatedAssets: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
          },
          {
            chainName: "stargaze",
            sourceDenom: "ustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqatom",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqregen",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqsomm",
          },
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
          },
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
          },
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars1xx5976njvxpl9n4v8huvff6cudhx7yuu8e7rt4/usneaky",
          },
        ],
        relative_image_url: "/tokens/generated/qstars.svg",
      },
      {
        chainName: "quicksilver",
        sourceDenom: "uqatom",
        coinMinimalDenom:
          "ibc/FA602364BEC305A696CBDF987058E99D8B479F0318E47314C49173E8838C5BAC",
        symbol: "qATOM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qatom.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qatom.svg",
        },
        price: {
          poolId: "944",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "uqatom",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/uqatom",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqatom",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "qATOM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qatom.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qatom.svg",
            },
          },
        ],
        variantGroupKey: "qATOM",
        name: "Quicksilver Liquid Staked ATOM",
        description: "Quicksilver Liquid Staked ATOM",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "quicksilver",
          sourceDenom: "uqck",
        },
        relatedAssets: [
          {
            chainName: "cosmoshub",
            sourceDenom: "uatom",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqregen",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqsomm",
          },
          {
            chainName: "stafihub",
            sourceDenom: "uratom",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
        ],
        relative_image_url: "/tokens/generated/qatom.svg",
      },
      {
        chainName: "quicksilver",
        sourceDenom: "uqregen",
        coinMinimalDenom:
          "ibc/79A676508A2ECA1021EDDC7BB9CF70CEEC9514C478DA526A5A8B3E78506C2206",
        symbol: "qREGEN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qregen.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qregen.svg",
        },
        price: {
          poolId: "948",
          denom:
            "ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "uqregen",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/uqregen",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqregen",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "qREGEN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qregen.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qregen.svg",
            },
          },
        ],
        variantGroupKey: "qREGEN",
        name: "Quicksilver Liquid Staked Regen",
        description: "Quicksilver Liquid Staked REGEN",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "quicksilver",
          sourceDenom: "uqck",
        },
        relatedAssets: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
          },
          {
            chainName: "regen",
            sourceDenom: "uregen",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqatom",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "regen",
            sourceDenom: "eco.uC.NCT",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqsomm",
          },
          {
            chainName: "cosmoshub",
            sourceDenom: "uatom",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "stargaze",
            sourceDenom: "ustars",
          },
        ],
        relative_image_url: "/tokens/generated/qregen.svg",
      },
      {
        chainName: "quicksilver",
        sourceDenom: "uqck",
        coinMinimalDenom:
          "ibc/635CB83EF1DFE598B10A3E90485306FD0D47D34217A4BE5FD9977FA010A5367D",
        symbol: "QCK",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qck.png",
        },
        coingeckoId: "quicksilver",
        price: {
          poolId: "952",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "uqck",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/uqck",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "QCK",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qck.png",
            },
          },
        ],
        variantGroupKey: "QCK",
        name: "Quicksilver",
        description:
          "QCK - native token of Quicksilver\n\nLiquid Stake your Cosmos assets with your preferred validator and receive liquid staked assets (qASSETs) that you can use for swapping, pooling, lending, and more, all while your original stake earns staking APY from securing the network.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/quicksilverzone",
        relatedAssets: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqatom",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqregen",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqsomm",
          },
          {
            chainName: "cosmoshub",
            sourceDenom: "uatom",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "stargaze",
            sourceDenom: "ustars",
          },
          {
            chainName: "regen",
            sourceDenom: "uregen",
          },
          {
            chainName: "sommelier",
            sourceDenom: "usomm",
          },
        ],
        relative_image_url: "/tokens/generated/qck.png",
      },
      {
        chainName: "quicksilver",
        sourceDenom: "uqosmo",
        coinMinimalDenom:
          "ibc/42D24879D4569CE6477B7E88206ADBFE47C222C6CAD51A54083E4A72594269FC",
        symbol: "qOSMO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qosmo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qosmo.svg",
        },
        price: {
          poolId: "956",
          denom: "uosmo",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "uqosmo",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/uqosmo",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "qOSMO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qosmo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qosmo.svg",
            },
          },
        ],
        variantGroupKey: "qOSMO",
        name: "Quicksilver Liquid Staked OSMO",
        description: "Quicksilver Liquid Staked OSMO",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "quicksilver",
          sourceDenom: "uqck",
        },
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uion",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqatom",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqregen",
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
        ],
        relative_image_url: "/tokens/generated/qosmo.svg",
      },
      {
        chainName: "quicksilver",
        sourceDenom: "uqsomm",
        coinMinimalDenom:
          "ibc/EAF76AD1EEF7B16D167D87711FB26ABE881AC7D9F7E6D0CF313D5FA530417208",
        symbol: "qSOMM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsomm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsomm.svg",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "uqsomm",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/uqsomm",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqsomm",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "qSOMM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsomm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsomm.svg",
            },
          },
        ],
        variantGroupKey: "qSOMM",
        name: "Quicksilver Liquid Staked SOMM",
        description: "Quicksilver Liquid Staked SOMM",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "quicksilver",
          sourceDenom: "uqck",
        },
        relatedAssets: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
          },
          {
            chainName: "sommelier",
            sourceDenom: "usomm",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqatom",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqregen",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stusomm",
          },
          {
            chainName: "cosmoshub",
            sourceDenom: "uatom",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "osmosis",
            sourceDenom: "uosmo",
          },
        ],
        relative_image_url: "/tokens/generated/qsomm.svg",
      },
    ],
  },
  {
    chain_name: "mars",
    chain_id: "mars-1",
    assets: [
      {
        chainName: "mars",
        sourceDenom: "umars",
        coinMinimalDenom:
          "ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580",
        symbol: "MARS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/mars/images/mars-token.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/mars/images/mars-token.svg",
        },
        coingeckoId: "mars-protocol-a7fcbcfb-fd61-4017-92f0-7ee9f9cc6da3",
        price: {
          poolId: "1099",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "mars",
              chainId: "mars-1",
              sourceDenom: "umars",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-557",
              path: "transfer/channel-557/umars",
            },
          },
        ],
        counterparty: [
          {
            chainName: "mars",
            sourceDenom: "umars",
            chainType: "cosmos",
            chainId: "mars-1",
            symbol: "MARS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/mars/images/mars-token.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/mars/images/mars-token.svg",
            },
          },
        ],
        variantGroupKey: "MARS",
        name: "Mars Hub",
        description:
          "Mars protocol token\n\nLend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/mars_protocol",
        relatedAssets: [],
        relative_image_url: "/tokens/generated/mars.svg",
      },
    ],
  },
  {
    chain_name: "8ball",
    chain_id: "eightball-1",
    assets: [
      {
        chainName: "8ball",
        sourceDenom: "uebl",
        coinMinimalDenom:
          "ibc/8BE73A810E22F80E5E850531A688600D63AE7392E7C2770AE758CAA4FD921B7F",
        symbol: "EBL",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/8ball/images/8ball.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/8ball/images/8ball.svg",
        },
        coingeckoId: "",
        price: {
          poolId: "935",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "8ball",
              chainId: "eightball-1",
              sourceDenom: "uebl",
              port: "transfer",
              channelId: "channel-16",
            },
            chain: {
              port: "transfer",
              channelId: "channel-641",
              path: "transfer/channel-641/uebl",
            },
          },
        ],
        counterparty: [
          {
            chainName: "8ball",
            sourceDenom: "uebl",
            chainType: "cosmos",
            chainId: "eightball-1",
            symbol: "EBL",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/8ball/images/8ball.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/8ball/images/8ball.svg",
            },
          },
        ],
        variantGroupKey: "EBL",
        name: "8ball",
        description: "The native staking token of 8ball.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/ebl.svg",
      },
    ],
  },
  {
    chain_name: "arkh",
    chain_id: "arkh",
    assets: [
      {
        chainName: "arkh",
        sourceDenom: "arkh",
        coinMinimalDenom:
          "ibc/0F91EE8B98AAE3CF393D94CD7F89A10F8D7758C5EC707E721899DFE65C164C28",
        symbol: "ARKH",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/arkh/images/arkh.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/arkh/images/arkh.svg",
        },
        price: {
          poolId: "954",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "arkh",
              chainId: "arkh",
              sourceDenom: "arkh",
              port: "transfer",
              channelId: "channel-12",
            },
            chain: {
              port: "transfer",
              channelId: "channel-648",
              path: "transfer/channel-648/arkh",
            },
          },
        ],
        counterparty: [
          {
            chainName: "arkh",
            sourceDenom: "arkh",
            chainType: "cosmos",
            chainId: "arkh",
            symbol: "ARKH",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/arkh/images/arkh.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/arkh/images/arkh.svg",
            },
          },
        ],
        variantGroupKey: "ARKH",
        name: "Arkhadian",
        description: "The native token of Arkhadian",
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/arkh.svg",
      },
    ],
  },
  {
    chain_name: "noble",
    chain_id: "noble-1",
    assets: [
      {
        chainName: "noble",
        sourceDenom: "ufrienzies",
        coinMinimalDenom:
          "ibc/7FA7EC64490E3BDE5A1A28CBE73CC0AD22522794957BC891C46321E3A6074DB9",
        symbol: "FRNZ",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/frnz.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/frnz.svg",
        },
        price: {
          poolId: "1012",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "noble",
              chainId: "noble-1",
              sourceDenom: "ufrienzies",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-750",
              path: "transfer/channel-750/ufrienzies",
            },
          },
        ],
        counterparty: [
          {
            chainName: "noble",
            sourceDenom: "ufrienzies",
            chainType: "cosmos",
            chainId: "noble-1",
            symbol: "FRNZ",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/frnz.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/frnz.svg",
            },
          },
        ],
        variantGroupKey: "FRNZ",
        name: "Frienzies",
        description:
          "Frienzies are an IBC token redeemable exclusively for a physical asset issued by the Noble entity.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
          },
          {
            chainName: "axelar",
            sourceDenom: "polygon-uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "avalanche-uusdc",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
        ],
        relative_image_url: "/tokens/generated/frnz.svg",
      },
      {
        chainName: "noble",
        sourceDenom: "uusdc",
        coinMinimalDenom:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        symbol: "USDC",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
        },
        coingeckoId: "usd-coin",
        price: {
          poolId: "1223",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "noble",
              chainId: "noble-1",
              sourceDenom: "uusdc",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-750",
              path: "transfer/channel-750/uusdc",
            },
          },
        ],
        counterparty: [
          {
            chainName: "noble",
            sourceDenom: "uusdc",
            chainType: "cosmos",
            chainId: "noble-1",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            chainType: "evm",
            chainId: 1,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
        ],
        variantGroupKey: "USDC",
        name: "USD Coin",
        description:
          "USDC is a fully collateralized US Dollar stablecoin developed by CENTRE, the open source project with Circle being the first of several forthcoming issuers.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
          },
          {
            chainName: "axelar",
            sourceDenom: "polygon-uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "avalanche-uusdc",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
        ],
        relative_image_url: "/tokens/generated/usdc.svg",
      },
    ],
  },
  {
    chain_name: "migaloo",
    chain_id: "migaloo-1",
    assets: [
      {
        chainName: "migaloo",
        sourceDenom: "uwhale",
        coinMinimalDenom:
          "ibc/EDD6F0D66BCD49C1084FB2C35353B4ACD7B9191117CE63671B61320548F7C89D",
        symbol: "WHALE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/white-whale.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/white-whale.svg",
        },
        coingeckoId: "white-whale",
        price: {
          poolId: "1318",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "migaloo",
              chainId: "migaloo-1",
              sourceDenom: "uwhale",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-642",
              path: "transfer/channel-642/uwhale",
            },
          },
        ],
        counterparty: [
          {
            chainName: "migaloo",
            sourceDenom: "uwhale",
            chainType: "cosmos",
            chainId: "migaloo-1",
            symbol: "WHALE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/white-whale.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/white-whale.svg",
            },
          },
        ],
        variantGroupKey: "WHALE",
        name: "Migaloo",
        description: "The native token of Migaloo Chain",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1erul6xyq0gk6ws98ncj7lnq9l4jn4gnnu9we73gdz78yyl2lr7qqrvcgup/ash",
          },
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/urac",
          },
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1etlu2h30tjvv8rfa4fwdc43c92f6ul5w9acxzk/uguppy",
          },
        ],
        relative_image_url: "/tokens/generated/whale.svg",
      },
      {
        chainName: "migaloo",
        sourceDenom:
          "factory/migaloo1erul6xyq0gk6ws98ncj7lnq9l4jn4gnnu9we73gdz78yyl2lr7qqrvcgup/ash",
        coinMinimalDenom:
          "ibc/4976049456D261659D0EC499CC9C2391D3C7D1128A0B9FB0BBF2842D1B2BC7BC",
        symbol: "ASH",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/ash.svg",
        },
        price: {
          poolId: "1360",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "migaloo",
              chainId: "migaloo-1",
              sourceDenom:
                "factory/migaloo1erul6xyq0gk6ws98ncj7lnq9l4jn4gnnu9we73gdz78yyl2lr7qqrvcgup/ash",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-642",
              path: "transfer/channel-642/factory/migaloo1erul6xyq0gk6ws98ncj7lnq9l4jn4gnnu9we73gdz78yyl2lr7qqrvcgup/ash",
            },
          },
        ],
        counterparty: [
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1erul6xyq0gk6ws98ncj7lnq9l4jn4gnnu9we73gdz78yyl2lr7qqrvcgup/ash",
            chainType: "cosmos",
            chainId: "migaloo-1",
            symbol: "ASH",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/ash.svg",
            },
          },
        ],
        variantGroupKey: "ASH",
        name: "ASH",
        description: "ASH",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "migaloo",
            sourceDenom: "uwhale",
          },
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/urac",
          },
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1etlu2h30tjvv8rfa4fwdc43c92f6ul5w9acxzk/uguppy",
          },
        ],
        relative_image_url: "/tokens/generated/ash.svg",
      },
      {
        chainName: "migaloo",
        sourceDenom:
          "factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/urac",
        coinMinimalDenom:
          "ibc/DDF1CD4CDC14AE2D6A3060193624605FF12DEE71CF1F8C19EEF35E9447653493",
        symbol: "RAC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/rac.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/rac.svg",
        },
        price: {
          poolId: "1359",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "migaloo",
              chainId: "migaloo-1",
              sourceDenom:
                "factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/urac",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-642",
              path: "transfer/channel-642/factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/urac",
            },
          },
        ],
        counterparty: [
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/urac",
            chainType: "cosmos",
            chainId: "migaloo-1",
            symbol: "RAC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/rac.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/rac.svg",
            },
          },
        ],
        variantGroupKey: "RAC",
        name: "RAC",
        description: "RAC",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "migaloo",
            sourceDenom: "uwhale",
          },
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1erul6xyq0gk6ws98ncj7lnq9l4jn4gnnu9we73gdz78yyl2lr7qqrvcgup/ash",
          },
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1etlu2h30tjvv8rfa4fwdc43c92f6ul5w9acxzk/uguppy",
          },
        ],
        relative_image_url: "/tokens/generated/rac.svg",
      },
      {
        chainName: "migaloo",
        sourceDenom:
          "factory/migaloo1etlu2h30tjvv8rfa4fwdc43c92f6ul5w9acxzk/uguppy",
        coinMinimalDenom:
          "ibc/42A9553A7770F3D7B62F3A82AF04E7719B4FD6EAF31BE5645092AAC4A6C2201D",
        symbol: "GUPPY",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/guppy.png",
        },
        price: {
          poolId: "1342",
          denom:
            "ibc/46AC07DBFF1352EC94AF5BD4D23740D92D9803A6B41F6E213E77F3A1143FB963",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "migaloo",
              chainId: "migaloo-1",
              sourceDenom:
                "factory/migaloo1etlu2h30tjvv8rfa4fwdc43c92f6ul5w9acxzk/uguppy",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-642",
              path: "transfer/channel-642/factory/migaloo1etlu2h30tjvv8rfa4fwdc43c92f6ul5w9acxzk/uguppy",
            },
          },
        ],
        counterparty: [
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1etlu2h30tjvv8rfa4fwdc43c92f6ul5w9acxzk/uguppy",
            chainType: "cosmos",
            chainId: "migaloo-1",
            symbol: "GUPPY",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/guppy.png",
            },
          },
        ],
        variantGroupKey: "GUPPY",
        name: "GUPPY",
        description: "GUPPY",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "migaloo",
            sourceDenom: "uwhale",
          },
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1erul6xyq0gk6ws98ncj7lnq9l4jn4gnnu9we73gdz78yyl2lr7qqrvcgup/ash",
          },
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/urac",
          },
        ],
        relative_image_url: "/tokens/generated/guppy.png",
      },
    ],
  },
  {
    chain_name: "omniflixhub",
    chain_id: "omniflixhub-1",
    assets: [
      {
        chainName: "omniflixhub",
        sourceDenom: "uflix",
        coinMinimalDenom:
          "ibc/CEE970BB3D26F4B907097B6B660489F13F3B0DA765B83CC7D9A0BC0CE220FA6F",
        symbol: "FLIX",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.svg",
        },
        coingeckoId: "omniflix-network",
        price: {
          poolId: "992",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "omniflixhub",
              chainId: "omniflixhub-1",
              sourceDenom: "uflix",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-199",
              path: "transfer/channel-199/uflix",
            },
          },
        ],
        counterparty: [
          {
            chainName: "omniflixhub",
            sourceDenom: "uflix",
            chainType: "cosmos",
            chainId: "omniflixhub-1",
            symbol: "FLIX",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.svg",
            },
          },
        ],
        variantGroupKey: "FLIX",
        name: "OmniFlix",
        description:
          "The native staking token of OmniFlix Hub.\n\nDecentralized media and network layer for Creators & Sovereign Communities powered by NFTs and related distribution protocols.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/OmniFlixNetwork",
        relatedAssets: [],
        relative_image_url: "/tokens/generated/flix.svg",
      },
    ],
  },
  {
    chain_name: "bluzelle",
    chain_id: "bluzelle-9",
    assets: [
      {
        chainName: "bluzelle",
        sourceDenom: "ubnt",
        coinMinimalDenom:
          "ibc/63CDD51098FD99E04E5F5610A3882CBE7614C441607BA6FCD7F3A3C1CD5325F8",
        symbol: "BLZ",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bluzelle/images/bluzelle.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bluzelle/images/bluzelle.svg",
        },
        coingeckoId: "bluzelle",
        price: {
          poolId: "1007",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bluzelle",
              chainId: "bluzelle-9",
              sourceDenom: "ubnt",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-763",
              path: "transfer/channel-763/ubnt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bluzelle",
            sourceDenom: "ubnt",
            chainType: "cosmos",
            chainId: "bluzelle-9",
            symbol: "BLZ",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bluzelle/images/bluzelle.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bluzelle/images/bluzelle.svg",
            },
          },
        ],
        variantGroupKey: "BLZ",
        name: "Bluzelle",
        description: "The native token of Bluzelle",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/blz.svg",
      },
    ],
  },
  {
    chain_name: "gitopia",
    chain_id: "gitopia",
    assets: [
      {
        chainName: "gitopia",
        sourceDenom: "ulore",
        coinMinimalDenom:
          "ibc/B1C1806A540B3E165A2D42222C59946FB85BA325596FC85662D7047649F419F3",
        symbol: "LORE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gitopia/images/lore.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gitopia/images/lore.svg",
        },
        coingeckoId: "gitopia",
        price: {
          poolId: "1036",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gitopia",
              chainId: "gitopia",
              sourceDenom: "ulore",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-781",
              path: "transfer/channel-781/ulore",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gitopia",
            sourceDenom: "ulore",
            chainType: "cosmos",
            chainId: "gitopia",
            symbol: "LORE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gitopia/images/lore.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gitopia/images/lore.svg",
            },
          },
        ],
        variantGroupKey: "LORE",
        name: "Gitopia",
        description:
          "The native token of Gitopia\n\nGitopia is the next-generation Code Collaboration Platform fuelled by a decentralized network and interactive token economy. It is designed to optimize the open-source software development process through collaboration, transparency, and incentivization.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/gitopiaDAO",
        relatedAssets: [],
        relative_image_url: "/tokens/generated/lore.svg",
      },
    ],
  },
  {
    chain_name: "nolus",
    chain_id: "pirin-1",
    assets: [
      {
        chainName: "nolus",
        sourceDenom: "unls",
        coinMinimalDenom:
          "ibc/D9AFCECDD361D38302AA66EB3BAC23B95234832C51D12489DC451FA2B7C72782",
        symbol: "NLS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nolus/images/nolus.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nolus/images/nolus.svg",
        },
        coingeckoId: "nolus",
        price: {
          poolId: "1041",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "nolus",
              chainId: "pirin-1",
              sourceDenom: "unls",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-783",
              path: "transfer/channel-783/unls",
            },
          },
        ],
        counterparty: [
          {
            chainName: "nolus",
            sourceDenom: "unls",
            chainType: "cosmos",
            chainId: "pirin-1",
            symbol: "NLS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nolus/images/nolus.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nolus/images/nolus.svg",
            },
          },
        ],
        variantGroupKey: "NLS",
        name: "Nolus",
        description:
          "The native token of Nolus chain\n\nElevate your game with up to 3x equity. Dive into a world of minimized risks and unlock the full potential of your assets.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/NolusProtocol",
        relatedAssets: [],
        relative_image_url: "/tokens/generated/nls.svg",
      },
    ],
  },
  {
    chain_name: "neutron",
    chain_id: "neutron-1",
    assets: [
      {
        chainName: "neutron",
        sourceDenom: "untrn",
        coinMinimalDenom:
          "ibc/126DA09104B71B164883842B769C0E9EC1486C0887D27A9999E395C2C8FB5682",
        symbol: "NTRN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.svg",
        },
        coingeckoId: "neutron-3",
        price: {
          poolId: "1324",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom: "untrn",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/untrn",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom: "untrn",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "NTRN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.svg",
            },
          },
        ],
        variantGroupKey: "NTRN",
        name: "Neutron",
        description:
          "The native token of Neutron chain.\n\nThe most secure CosmWasm platform in Cosmos, Neutron lets smart-contracts leverage bleeding-edge Interchain technology with minimal overhead.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/Neutron_org",
        relatedAssets: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron170v88vrtnedesyfytuku257cggxc79rd7lwt7q/ucircus",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron143wp6g8paqasnuuey6zyapucknwy9rhnld8hkr/bad",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
          },
          {
            chainName: "axelar",
            sourceDenom: "wsteth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
          },
        ],
        relative_image_url: "/tokens/generated/ntrn.svg",
      },
      {
        chainName: "neutron",
        sourceDenom:
          "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
        coinMinimalDenom:
          "ibc/2F21E6D4271DE3F561F20A02CD541DAF7405B1E9CB3B9B07E3C2AC7D8A4338A5",
        symbol: "wstETH",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
        },
        coingeckoId: "wrapped-steth",
        price: {
          poolId: "1292",
          denom:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom:
                "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "wstETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
            chainType: "evm",
            chainId: 1,
            address: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
            symbol: "wstETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
            chainType: "evm",
            chainId: 1,
            address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
            symbol: "stETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/steth.svg",
            },
          },
        ],
        variantGroupKey: "stETH",
        name: "Wrapped Lido Staked Ether",
        description:
          "wstETH is a wrapped version of stETH. As some DeFi protocols require a constant balance mechanism for tokens, wstETH keeps your balance of stETH fixed and uses an underlying share system to reflect your earned staking rewards.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "wsteth-wei",
          },
          {
            chainName: "neutron",
            sourceDenom: "untrn",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron170v88vrtnedesyfytuku257cggxc79rd7lwt7q/ucircus",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron143wp6g8paqasnuuey6zyapucknwy9rhnld8hkr/bad",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
          },
        ],
        relative_image_url: "/tokens/generated/wsteth.svg",
      },
      {
        chainName: "neutron",
        sourceDenom:
          "factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
        coinMinimalDenom:
          "ibc/BF685448E564B5A4AC8F6E0493A0B979D0E0BF5EC11F7E15D25A0A2160C944DD",
        symbol: "NEWT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/newt.png",
        },
        coingeckoId: "newt",
        price: {
          poolId: "1334",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom:
                "factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "NEWT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/newt.png",
            },
          },
        ],
        variantGroupKey: "NEWT",
        name: "Newt",
        description: "The cutest NEWT token on Neutron chain.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "neutron",
            sourceDenom: "untrn",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron170v88vrtnedesyfytuku257cggxc79rd7lwt7q/ucircus",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron143wp6g8paqasnuuey6zyapucknwy9rhnld8hkr/bad",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
          },
          {
            chainName: "axelar",
            sourceDenom: "wsteth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
          },
        ],
        relative_image_url: "/tokens/generated/newt.png",
      },
      {
        chainName: "neutron",
        sourceDenom:
          "factory/neutron170v88vrtnedesyfytuku257cggxc79rd7lwt7q/ucircus",
        coinMinimalDenom:
          "ibc/8C8F6349F656C943543C6B040377BE44123D01F712277815C3C13098BB98818C",
        symbol: "CIRCUS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/circus.png",
        },
        price: {
          poolId: "1391",
          denom:
            "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom:
                "factory/neutron170v88vrtnedesyfytuku257cggxc79rd7lwt7q/ucircus",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/factory/neutron170v88vrtnedesyfytuku257cggxc79rd7lwt7q/ucircus",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron170v88vrtnedesyfytuku257cggxc79rd7lwt7q/ucircus",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "CIRCUS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/circus.png",
            },
          },
        ],
        variantGroupKey: "CIRCUS",
        name: "AtomEconomicZone69JaeKwonInu",
        description: "clownmaxxed store of value",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "neutron",
            sourceDenom: "untrn",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron143wp6g8paqasnuuey6zyapucknwy9rhnld8hkr/bad",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
          },
          {
            chainName: "axelar",
            sourceDenom: "wsteth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
          },
        ],
        relative_image_url: "/tokens/generated/circus.png",
      },
      {
        chainName: "neutron",
        sourceDenom:
          "factory/neutron143wp6g8paqasnuuey6zyapucknwy9rhnld8hkr/bad",
        coinMinimalDenom:
          "ibc/442A08C33AE9875DF90792FFA73B5728E1CAECE87AB4F26AE9B422F1E682ED23",
        symbol: "BAD",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/bad.png",
        },
        price: {
          poolId: "1381",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom:
                "factory/neutron143wp6g8paqasnuuey6zyapucknwy9rhnld8hkr/bad",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/factory/neutron143wp6g8paqasnuuey6zyapucknwy9rhnld8hkr/bad",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron143wp6g8paqasnuuey6zyapucknwy9rhnld8hkr/bad",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "BAD",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/bad.png",
            },
          },
        ],
        variantGroupKey: "BAD",
        name: "Badcoin",
        description: "Baddest coin on Cosmos",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-15T14:42:00.000Z",
        relatedAssets: [
          {
            chainName: "neutron",
            sourceDenom: "untrn",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron170v88vrtnedesyfytuku257cggxc79rd7lwt7q/ucircus",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
          },
          {
            chainName: "axelar",
            sourceDenom: "wsteth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
          },
        ],
        relative_image_url: "/tokens/generated/bad.png",
      },
      {
        chainName: "neutron",
        sourceDenom:
          "factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
        coinMinimalDenom:
          "ibc/73BB20AF857D1FE6E061D01CA13870872AD0C979497CAF71BEA25B1CBF6879F1",
        symbol: "APOLLO",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/apollo.svg",
        },
        price: {
          poolId: "1410",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom:
                "factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "APOLLO",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/apollo.svg",
            },
          },
        ],
        variantGroupKey: "APOLLO",
        name: "Apollo DAO",
        description: "The deflationary utility token of the Apollo DAO project",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-22T21:05:00.000Z",
        relatedAssets: [
          {
            chainName: "neutron",
            sourceDenom: "untrn",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron170v88vrtnedesyfytuku257cggxc79rd7lwt7q/ucircus",
          },
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron143wp6g8paqasnuuey6zyapucknwy9rhnld8hkr/bad",
          },
          {
            chainName: "axelar",
            sourceDenom: "wsteth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
          },
        ],
        relative_image_url: "/tokens/generated/apollo.svg",
      },
    ],
  },
  {
    chain_name: "composable",
    chain_id: "centauri-1",
    assets: [
      {
        chainName: "composable",
        sourceDenom: "ppica",
        coinMinimalDenom:
          "ibc/56D7C03B8F6A07AD322EEE1BEF3AE996E09D1C1E34C27CF37E0D4A0AC5972516",
        symbol: "PICA",
        decimals: 12,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg",
        },
        coingeckoId: "picasso",
        price: {
          poolId: "1057",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Composable Trustless Zone",
            type: "external_interface",
            depositUrl: "https://app.trustless.zone/?from=PICASSO&to=OSMOSIS",
            withdrawUrl: "https://app.trustless.zone/?from=OSMOSIS&to=PICASSO",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom: "ppica",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/ppica",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom: "ppica",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "PICA",
            decimals: 12,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg",
            },
          },
          {
            chainName: "picasso",
            sourceDenom: "ppica",
            chainType: "non-cosmos",
            symbol: "PICA",
            decimals: 12,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg",
            },
          },
        ],
        variantGroupKey: "PICA",
        name: "Composable",
        description:
          "The native staking and governance token of Composable.\n\nComposable is the base layer connecting L1s and L2s. We are scaling IBC to other ecosystems, pushing the boundaries of trust-minimized interoperability. We abstract the cross-chain experience for users, delivering seamless chain-agnostic execution of user intentions.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/ComposableFin",
        relatedAssets: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/EE9046745AEC0E8302CB7ED9D5AD67F528FB3B7AE044B247FB0FB293DBDA35E9",
          },
          {
            chainName: "composable",
            sourceDenom:
              "ibc/3CC19CEC7E5A3E90E78A5A9ECC5A0E2F8F826A375CF1E096F4515CF09DA3E366",
          },
          {
            chainName: "axelar",
            sourceDenom: "dot-planck",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
        ],
        relative_image_url: "/tokens/generated/pica.svg",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/EE9046745AEC0E8302CB7ED9D5AD67F528FB3B7AE044B247FB0FB293DBDA35E9",
        coinMinimalDenom:
          "ibc/6727B2F071643B3841BD535ECDD4ED9CAE52ABDD0DCD07C3630811A7A37B215C",
        symbol: "KSM",
        decimals: 12,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/kusama/images/ksm.svg",
        },
        coingeckoId: "kusama",
        price: {
          poolId: "1151",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Composable Trustless Zone",
            type: "external_interface",
            depositUrl: "https://app.trustless.zone/?from=PICASSO&to=OSMOSIS",
            withdrawUrl: "https://app.trustless.zone/?from=OSMOSIS&to=PICASSO",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/EE9046745AEC0E8302CB7ED9D5AD67F528FB3B7AE044B247FB0FB293DBDA35E9",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-2/4",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/EE9046745AEC0E8302CB7ED9D5AD67F528FB3B7AE044B247FB0FB293DBDA35E9",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "KSM",
            decimals: 12,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/kusama/images/ksm.svg",
            },
          },
          {
            chainName: "picasso",
            sourceDenom: "4",
            chainType: "non-cosmos",
            symbol: "KSM",
            decimals: 12,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/kusama/images/ksm.svg",
            },
          },
          {
            chainName: "kusama",
            sourceDenom: "Planck",
            chainType: "non-cosmos",
            symbol: "KSM",
            decimals: 12,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/kusama/images/ksm.svg",
            },
          },
        ],
        variantGroupKey: "KSM",
        name: "Kusama",
        description:
          "The native fee, governance, staking, and bonding token of the Polkadot platform.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "composable",
            sourceDenom: "ppica",
          },
          {
            chainName: "composable",
            sourceDenom:
              "ibc/3CC19CEC7E5A3E90E78A5A9ECC5A0E2F8F826A375CF1E096F4515CF09DA3E366",
          },
          {
            chainName: "axelar",
            sourceDenom: "dot-planck",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
        ],
        relative_image_url: "/tokens/generated/ksm.svg",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/3CC19CEC7E5A3E90E78A5A9ECC5A0E2F8F826A375CF1E096F4515CF09DA3E366",
        coinMinimalDenom:
          "ibc/6B2B19D874851F631FF0AF82C38A20D4B82F438C7A22F41EDA33568345397244",
        symbol: "DOT",
        decimals: 10,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.svg",
        },
        coingeckoId: "polkadot",
        price: {
          poolId: "1145",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Composable Trustless Zone",
            type: "external_interface",
            depositUrl: "https://app.trustless.zone/?from=PICASSO&to=OSMOSIS",
            withdrawUrl: "https://app.trustless.zone/?from=OSMOSIS&to=PICASSO",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/3CC19CEC7E5A3E90E78A5A9ECC5A0E2F8F826A375CF1E096F4515CF09DA3E366",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-2/transfer/channel-15/79228162514264337593543950342",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/3CC19CEC7E5A3E90E78A5A9ECC5A0E2F8F826A375CF1E096F4515CF09DA3E366",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "DOT",
            decimals: 10,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.svg",
            },
          },
          {
            chainName: "picasso",
            sourceDenom: "79228162514264337593543950342",
            chainType: "non-cosmos",
            symbol: "DOT",
            decimals: 10,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.svg",
            },
          },
          {
            chainName: "composablepolkadot",
            sourceDenom: "79228162514264337593543950342",
            chainType: "non-cosmos",
            symbol: "DOT",
            decimals: 10,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.svg",
            },
          },
          {
            chainName: "polkadot",
            sourceDenom: "Planck",
            chainType: "non-cosmos",
            symbol: "DOT",
            decimals: 10,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.svg",
            },
          },
        ],
        variantGroupKey: "DOT",
        name: "Polkadot",
        description:
          "The native fee, governance, staking, and bonding token of the Polkadot platform.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "composable",
            sourceDenom: "ppica",
          },
          {
            chainName: "axelar",
            sourceDenom: "dot-planck",
          },
          {
            chainName: "composable",
            sourceDenom:
              "ibc/EE9046745AEC0E8302CB7ED9D5AD67F528FB3B7AE044B247FB0FB293DBDA35E9",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
          },
        ],
        relative_image_url: "/tokens/generated/dot.svg",
      },
    ],
  },
  {
    chain_name: "quasar",
    chain_id: "quasar-1",
    assets: [
      {
        chainName: "quasar",
        sourceDenom: "uqsr",
        coinMinimalDenom:
          "ibc/1B708808D372E959CD4839C594960309283424C775F4A038AAEBE7F83A988477",
        symbol: "QSR",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quasar/images/quasar.png",
        },
        coingeckoId: "quasar-2",
        price: {
          poolId: "1314",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quasar",
              chainId: "quasar-1",
              sourceDenom: "uqsr",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-688",
              path: "transfer/channel-688/uqsr",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quasar",
            sourceDenom: "uqsr",
            chainType: "cosmos",
            chainId: "quasar-1",
            symbol: "QSR",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quasar/images/quasar.png",
            },
          },
        ],
        variantGroupKey: "QSR",
        name: "Quasar",
        description:
          "The native token of Quasar\n\nQuasar is the first decentralized asset management (D.A.M.) platform enabled by IBC. A secure, permissionless, composable, and diversified interchain DeFi experience is finally here.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/QuasarFi",
        relatedAssets: [],
        relative_image_url: "/tokens/generated/qsr.png",
      },
    ],
  },
  {
    chain_name: "archway",
    chain_id: "archway-1",
    assets: [
      {
        chainName: "archway",
        sourceDenom: "aarch",
        coinMinimalDenom:
          "ibc/23AB778D694C1ECFC59B91D8C399C115CC53B0BD1C61020D8E19519F002BDD85",
        symbol: "ARCH",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/archway/images/archway.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/archway/images/archway.svg",
        },
        coingeckoId: "archway",
        price: {
          poolId: "1375",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "archway",
              chainId: "archway-1",
              sourceDenom: "aarch",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1429",
              path: "transfer/channel-1429/aarch",
            },
          },
        ],
        counterparty: [
          {
            chainName: "archway",
            sourceDenom: "aarch",
            chainType: "cosmos",
            chainId: "archway-1",
            symbol: "ARCH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/archway/images/archway.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/archway/images/archway.svg",
            },
          },
        ],
        variantGroupKey: "ARCH",
        name: "Archway",
        description:
          "The native token of Archway network\n\nAn incentivized L1 blockchain that allows developers to capture the value their dapps create, enabling sustainable economic models.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/archwayHQ",
        relatedAssets: [],
        relative_image_url: "/tokens/generated/arch.svg",
      },
    ],
  },
  {
    chain_name: "empowerchain",
    chain_id: "empowerchain-1",
    assets: [
      {
        chainName: "empowerchain",
        sourceDenom: "umpwr",
        coinMinimalDenom:
          "ibc/DD3938D8131F41994C1F01F4EB5233DEE9A0A5B787545B9A07A321925655BF38",
        symbol: "MPWR",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/empowerchain/images/mpwr.svg",
        },
        price: {
          poolId: "1065",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://tfm.com/bridge?chainTo=osmosis-1&chainFrom=empowerchain-1&token0=umpwr&token1=ibc%2FDD3938D8131F41994C1F01F4EB5233DEE9A0A5B787545B9A07A321925655BF38",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "empowerchain",
              chainId: "empowerchain-1",
              sourceDenom: "umpwr",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1411",
              path: "transfer/channel-1411/umpwr",
            },
          },
        ],
        counterparty: [
          {
            chainName: "empowerchain",
            sourceDenom: "umpwr",
            chainType: "cosmos",
            chainId: "empowerchain-1",
            symbol: "MPWR",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/empowerchain/images/mpwr.svg",
            },
          },
        ],
        variantGroupKey: "MPWR",
        name: "EmpowerChain",
        description: "The native staking and governance token of Empower.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/mpwr.svg",
      },
    ],
  },
  {
    chain_name: "kyve",
    chain_id: "kyve-1",
    assets: [
      {
        chainName: "kyve",
        sourceDenom: "ukyve",
        coinMinimalDenom:
          "ibc/613BF0BF2F2146AE9941E923725745E931676B2C14E9768CD609FA0849B2AE13",
        symbol: "KYVE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kyve/images/kyve-token.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kyve/images/kyve-token.svg",
        },
        coingeckoId: "kyve-network",
        price: {
          poolId: "1075",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kyve",
              chainId: "kyve-1",
              sourceDenom: "ukyve",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-767",
              path: "transfer/channel-767/ukyve",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kyve",
            sourceDenom: "ukyve",
            chainType: "cosmos",
            chainId: "kyve-1",
            symbol: "KYVE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kyve/images/kyve-token.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kyve/images/kyve-token.svg",
            },
          },
        ],
        variantGroupKey: "KYVE",
        name: "KYVE",
        description:
          "The native utility token of the KYVE network.\n\nRevolutionizing data reliability in the Web3 space, KYVE Network provides fast and easy tooling for data validation, immutability, and retrieval, ensuring trustless data for seamless scalability and eliminating data risks and roadblocks.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/KYVENetwork",
        relatedAssets: [],
        relative_image_url: "/tokens/generated/kyve.svg",
      },
    ],
  },
  {
    chain_name: "sei",
    chain_id: "pacific-1",
    assets: [
      {
        chainName: "sei",
        sourceDenom: "usei",
        coinMinimalDenom:
          "ibc/71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D",
        symbol: "SEI",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.svg",
        },
        coingeckoId: "sei-network",
        price: {
          poolId: "1114",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "TFM IBC Transfer",
            type: "external_interface",
            withdrawUrl:
              "https://tfm.com/bridge?chainFrom=osmosis-1&chainTo=pacific-1&token0=ibc%2F71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D&token1=usei",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "sei",
              chainId: "pacific-1",
              sourceDenom: "usei",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-782",
              path: "transfer/channel-782/usei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "sei",
            sourceDenom: "usei",
            chainType: "cosmos",
            chainId: "pacific-1",
            symbol: "SEI",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.svg",
            },
          },
        ],
        variantGroupKey: "SEI",
        name: "Sei",
        description:
          "The native staking token of Sei.\n\nSei is the fastest Layer 1 blockchain, designed to scale with the industry.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/SeiNetwork",
        relatedAssets: [
          {
            chainName: "sei",
            sourceDenom:
              "factory/sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w/OIN",
          },
        ],
        relative_image_url: "/tokens/generated/sei.svg",
      },
      {
        chainName: "sei",
        sourceDenom: "factory/sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w/OIN",
        coinMinimalDenom:
          "ibc/98B3DBF1FA79C4C14CC5F08F62ACD5498560FCB515F677526FD200D54EA048B6",
        symbol: "OIN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/oin.png",
        },
        coingeckoId: "",
        price: {
          poolId: "1210",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "sei",
              chainId: "pacific-1",
              sourceDenom:
                "factory/sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w/OIN",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-782",
              path: "transfer/channel-782/factory/sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w/OIN",
            },
          },
        ],
        counterparty: [
          {
            chainName: "sei",
            sourceDenom:
              "factory/sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w/OIN",
            chainType: "cosmos",
            chainId: "pacific-1",
            symbol: "OIN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/oin.png",
            },
          },
        ],
        variantGroupKey: "OIN",
        name: "OIN STORE OF VALUE",
        description:
          "OIN Token ($OIN) is a groundbreaking digital asset developed on the $SEI Blockchain. It transcends being merely a cryptocurrency; $OIN stands as a robust store of value, symbolizing the future of decentralized finance and its potential to reshape the crypto landscape.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "sei",
            sourceDenom: "usei",
          },
        ],
        relative_image_url: "/tokens/generated/oin.png",
      },
    ],
  },
  {
    chain_name: "passage",
    chain_id: "passage-2",
    assets: [
      {
        chainName: "passage",
        sourceDenom: "upasg",
        coinMinimalDenom:
          "ibc/208B2F137CDE510B44C41947C045CFDC27F996A9D990EA64460BDD5B3DBEB2ED",
        symbol: "PASG",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/passage/images/pasg.png",
        },
        coingeckoId: "passage",
        price: {
          poolId: "1137",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "passage",
              chainId: "passage-2",
              sourceDenom: "upasg",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2494",
              path: "transfer/channel-2494/upasg",
            },
          },
        ],
        counterparty: [
          {
            chainName: "passage",
            sourceDenom: "upasg",
            chainType: "cosmos",
            chainId: "passage-2",
            symbol: "PASG",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/passage/images/pasg.png",
            },
          },
        ],
        variantGroupKey: "PASG",
        name: "Passage",
        description:
          "The native staking and governance token of the Passage chain.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/pasg.png",
      },
    ],
  },
  {
    chain_name: "gateway",
    chain_id: "wormchain",
    assets: [
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
        coinMinimalDenom:
          "ibc/1E43D59E565D41FB4E54CA639B838FFD5BCFC20003D330A56CB1396231AA1CBA",
        symbol: "SOL",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/sol.svg",
        },
        coingeckoId: "solana",
        price: {
          poolId: "1294",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "SOL",
            decimals: 8,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/sol.svg",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "So11111111111111111111111111111111111111112",
            chainType: "non-cosmos",
            symbol: "WSOL",
            decimals: 9,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/sol.svg",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "Lamport",
            chainType: "non-cosmos",
            symbol: "SOL",
            decimals: 9,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/sol.svg",
            },
          },
        ],
        variantGroupKey: "SOL",
        name: "Solana",
        description:
          "Solana (SOL) is the native asset of the Solana blockchain.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/B8ohBnfisop27exk2gtNABJyYjLwQA7ogrp5uNzvZCoy",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
        ],
        relative_image_url: "/tokens/generated/sol.svg",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
        coinMinimalDenom:
          "ibc/CA3733CB0071F480FAE8EF0D9C3D47A49C6589144620A642BBE0D59A293D110E",
        symbol: "BONK",
        decimals: 5,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/bonk.png",
        },
        coingeckoId: "bonk",
        price: {
          poolId: "1129",
          denom:
            "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "Bonk",
            decimals: 5,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/bonk.png",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
            chainType: "non-cosmos",
            symbol: "BONK",
            decimals: 5,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/bonk.png",
            },
          },
        ],
        variantGroupKey: "BONK",
        name: "Bonk",
        description: "The Official Bonk Inu token",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/B8ohBnfisop27exk2gtNABJyYjLwQA7ogrp5uNzvZCoy",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
        ],
        relative_image_url: "/tokens/generated/bonk.png",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
        coinMinimalDenom:
          "ibc/2108F2D81CBE328F371AD0CEF56691B18A86E08C3651504E42487D9EE92DDE9C",
        symbol: "USDT.wh",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdt.hole.svg",
        },
        price: {
          poolId: "1131",
          denom:
            "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            chainType: "evm",
            chainId: 1,
            address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
        ],
        variantGroupKey: "USDT",
        name: "Tether USD (Wormhole)",
        description:
          "Tether USD (Wormhole), USDT, factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          },
          {
            chainName: "kava",
            sourceDenom: "ukava",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
          },
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
          },
        ],
        relative_image_url: "/tokens/generated/usdt.wh.svg",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
        coinMinimalDenom:
          "ibc/B1C287C2701774522570010EEBCD864BCB7AB714711B3AA218699FDD75E832F5",
        symbol: "SUI",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/sui/images/sui.svg",
        },
        coingeckoId: "sui",
        price: {
          poolId: "1127",
          denom:
            "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        },
        categories: [],
        transferMethods: [
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "SUI",
            decimals: 8,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/sui/images/sui.svg",
            },
          },
          {
            chainName: "sui",
            sourceDenom: "0x2::sui::SUI",
            chainType: "non-cosmos",
            symbol: "SUI",
            decimals: 9,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/sui/images/sui.svg",
            },
          },
        ],
        variantGroupKey: "SUI",
        name: "Sui",
        description: "Sui’s native asset is called SUI.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/B8ohBnfisop27exk2gtNABJyYjLwQA7ogrp5uNzvZCoy",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
        ],
        relative_image_url: "/tokens/generated/sui.svg",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
        coinMinimalDenom:
          "ibc/A4D176906C1646949574B48C1928D475F2DF56DE0AC04E1C99B08F90BC21ABDE",
        symbol: "APT",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/aptos/images/apt-dm.svg",
        },
        coingeckoId: "aptos",
        price: {
          poolId: "1125",
          denom:
            "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        },
        categories: [],
        transferMethods: [
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "APT",
            decimals: 8,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/aptos/images/aptos.svg",
            },
          },
          {
            chainName: "aptos",
            sourceDenom: "0x1::aptos_coin::AptosCoin",
            chainType: "non-cosmos",
            symbol: "APT",
            decimals: 8,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/aptos/images/aptos.svg",
            },
          },
        ],
        variantGroupKey: "APT",
        name: "Aptos Coin",
        description:
          "Aptos token (APT) is the Aptos blockchain native token used for paying network and transaction fees.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/B8ohBnfisop27exk2gtNABJyYjLwQA7ogrp5uNzvZCoy",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
        ],
        relative_image_url: "/tokens/generated/apt.svg",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
        coinMinimalDenom:
          "ibc/6B99DB46AA9FF47162148C1726866919E44A6A5E0274B90912FD17E19A337695",
        symbol: "USDC.wh",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdc.hole.svg",
        },
        price: {
          poolId: "1262",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            chainType: "evm",
            chainId: 1,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
        ],
        variantGroupKey: "USDC",
        name: "USD Coin (Wormhole)",
        description:
          "USD Coin (Wormhole), USDC, factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
          {
            chainName: "axelar",
            sourceDenom: "polygon-uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "avalanche-uusdc",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
          },
        ],
        relative_image_url: "/tokens/generated/usdc.wh.svg",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
        coinMinimalDenom:
          "ibc/62F82550D0B96522361C89B0DA1119DE262FBDFB25E5502BC5101B5C0D0DBAAC",
        symbol: "wETH.wh",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/weth.hole.svg",
        },
        price: {
          poolId: "1424",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "WETH",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            chainType: "evm",
            chainId: 1,
            address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            symbol: "WETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/weth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "wei",
            chainType: "evm",
            chainId: 1,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "ETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg",
            },
          },
        ],
        variantGroupKey: "ETH",
        name: "Wrapped Ether (Wormhole)",
        description:
          "Wrapped Ether (Wormhole), WETH, factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
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
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
          },
        ],
        relative_image_url: "/tokens/generated/weth.wh.svg",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/B8ohBnfisop27exk2gtNABJyYjLwQA7ogrp5uNzvZCoy",
        coinMinimalDenom:
          "ibc/E42006ED917C769EDE1B474650EEA6BFE3F97958912B9206DD7010A28D01D9D5",
        symbol: "PYTH",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/pyth.svg",
        },
        coingeckoId: "pyth-network",
        price: {
          poolId: "1315",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/B8ohBnfisop27exk2gtNABJyYjLwQA7ogrp5uNzvZCoy",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/B8ohBnfisop27exk2gtNABJyYjLwQA7ogrp5uNzvZCoy",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/B8ohBnfisop27exk2gtNABJyYjLwQA7ogrp5uNzvZCoy",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "PYTH",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/pyth.svg",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
            chainType: "non-cosmos",
            symbol: "PYTH",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/pyth.svg",
            },
          },
        ],
        variantGroupKey: "PYTH",
        name: "Pyth Network",
        description:
          "Pyth is a protocol that allows market participants to publish pricing information on-chain for others to use. The protocol is an interaction between three parties:\n-Publishers submit pricing information to Pyth's oracle program. Pyth has multiple data publishers for every product to improve the accuracy and robustness of the system.\n-Pyth's oracle program combines publishers' data to produce a single aggregate price and confidence interval.\nConsumers read the price information produced by the oracle program.\n\nPyth's oracle program runs simultaneously on both Solana mainnet and Pythnet. Each instance of the program is responsible for its own set of price feeds. Solana Price Feeds are available for use by Solana protocols. In this case, since the oracle program itself runs on Solana, the resulting prices are immediately available to consumers without requiring any additional work. Pythnet Price Feeds are available on 12+ blockchains. The prices constructed on Pythnet are transferred cross-chain to reach consumers on these blockchains.\n\nIn both cases, the critical component of the system is the oracle program that combines the data from each individual publisher. This program maintains a number of different Solana accounts that list the products on Pyth and their current price data. Publishers publish their price and confidence by interacting with the oracle program on every slot. The program stores this information in its accounts. The first price update in a slot additionally triggers price aggregation, which combines the price data from the previous slot into a single aggregate price and confidence interval. This aggregate price is written to the Solana account where it is readable by other on-chain programs and available for transmission to other blockchains.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
        ],
        relative_image_url: "/tokens/generated/pyth.svg",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
        coinMinimalDenom:
          "ibc/F08DE332018E8070CC4C68FE06E04E254F527556A614F5F8F9A68AF38D367E45",
        symbol: "solana.USDC.wh",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/solana.USDC.wh.svg",
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/solana.USDC.wh.png",
        },
        price: {
          poolId: "1474",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "solana.USDC.wh",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            chainType: "non-cosmos",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            chainType: "evm",
            chainId: 1,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
        ],
        variantGroupKey: "USDC",
        name: "Solana USD Coin (Wormhole)",
        description:
          "Solana USD Coin (Wormhole), Solana USDC, factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
        verified: true,
        unstable: false,
        disabled: false,
        preview: true,
        relatedAssets: [
          {
            chainName: "noble",
            sourceDenom: "uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
          },
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
          },
          {
            chainName: "axelar",
            sourceDenom: "polygon-uusdc",
          },
          {
            chainName: "axelar",
            sourceDenom: "avalanche-uusdc",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
          },
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
          },
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
          },
        ],
        relative_image_url: "/tokens/generated/solana.usdc.wh.svg",
      },
    ],
  },
  {
    chain_name: "xpla",
    chain_id: "dimension_37-1",
    assets: [
      {
        chainName: "xpla",
        sourceDenom: "axpla",
        coinMinimalDenom:
          "ibc/95C9B5870F95E21A242E6AF9ADCB1F212EE4A8855087226C36FBE43FC41A77B8",
        symbol: "XPLA",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/xpla/images/xpla.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/xpla/images/xpla.svg",
        },
        coingeckoId: "xpla",
        price: {
          poolId: "1173",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "XPLA",
            type: "external_interface",
            depositUrl: "https://ibc.xpla.io/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "xpla",
              chainId: "dimension_37-1",
              sourceDenom: "axpla",
              port: "transfer",
              channelId: "channel-9",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1634",
              path: "transfer/channel-1634/axpla",
            },
          },
        ],
        counterparty: [
          {
            chainName: "xpla",
            sourceDenom: "axpla",
            chainType: "cosmos",
            chainId: "dimension_37-1",
            symbol: "XPLA",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/xpla/images/xpla.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/xpla/images/xpla.svg",
            },
          },
        ],
        variantGroupKey: "XPLA",
        name: "XPLA",
        description: "The native staking token of XPLA.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/xpla.svg",
      },
    ],
  },
  {
    chain_name: "realio",
    chain_id: "realionetwork_3301-1",
    assets: [
      {
        chainName: "realio",
        sourceDenom: "ario",
        coinMinimalDenom:
          "ibc/1CDF9C7D073DD59ED06F15DB08CC0901F2A24759BE70463570E8896F9A444ADF",
        symbol: "RIO",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/realio/images/rio.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/realio/images/rio.svg",
        },
        coingeckoId: "realio-network",
        price: {
          poolId: "1180",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Realio Network",
            type: "external_interface",
            depositUrl: "https://app.realio.network/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "realio",
              chainId: "realionetwork_3301-1",
              sourceDenom: "ario",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1424",
              path: "transfer/channel-1424/ario",
            },
          },
        ],
        counterparty: [
          {
            chainName: "realio",
            sourceDenom: "ario",
            chainType: "cosmos",
            chainId: "realionetwork_3301-1",
            symbol: "RIO",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/realio/images/rio.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/realio/images/rio.svg",
            },
          },
        ],
        variantGroupKey: "RIO",
        name: "Realio Network",
        description: "The native currency of the Realio Network.",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/rio.svg",
      },
    ],
  },
  {
    chain_name: "sge",
    chain_id: "sgenet-1",
    assets: [
      {
        chainName: "sge",
        sourceDenom: "usge",
        coinMinimalDenom:
          "ibc/A1830DECC0B742F0B2044FF74BE727B5CF92C9A28A9235C3BACE4D24A23504FA",
        symbol: "SGE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sge/images/sge.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sge/images/sge.svg",
        },
        coingeckoId: "six-sigma",
        price: {
          poolId: "1233",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "sge",
              chainId: "sgenet-1",
              sourceDenom: "usge",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-5485",
              path: "transfer/channel-5485/usge",
            },
          },
        ],
        counterparty: [
          {
            chainName: "sge",
            sourceDenom: "usge",
            chainType: "cosmos",
            chainId: "sgenet-1",
            symbol: "SGE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sge/images/sge.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sge/images/sge.svg",
            },
          },
        ],
        variantGroupKey: "SGE",
        name: "SGE",
        description: "The native token of SGE Network",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/sge.svg",
      },
    ],
  },
  {
    chain_name: "stafihub",
    chain_id: "stafihub-1",
    assets: [
      {
        chainName: "stafihub",
        sourceDenom: "ufis",
        coinMinimalDenom:
          "ibc/01D2F0C4739C871BFBEE7E786709E6904A55559DC1483DD92ED392EF12247862",
        symbol: "FIS",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stafihub/images/fis.svg",
        },
        coingeckoId: "stafi",
        price: {
          poolId: "1230",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stafihub",
              chainId: "stafihub-1",
              sourceDenom: "ufis",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-5413",
              path: "transfer/channel-5413/ufis",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stafihub",
            sourceDenom: "ufis",
            chainType: "cosmos",
            chainId: "stafihub-1",
            symbol: "FIS",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stafihub/images/fis.svg",
            },
          },
        ],
        variantGroupKey: "FIS",
        name: "StaFi Hub",
        description:
          "The native staking and governance token of the StaFi Hub.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "stafihub",
            sourceDenom: "uratom",
          },
          {
            chainName: "cosmoshub",
            sourceDenom: "uatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqatom",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
        ],
        relative_image_url: "/tokens/generated/fis.svg",
      },
      {
        chainName: "stafihub",
        sourceDenom: "uratom",
        coinMinimalDenom:
          "ibc/B66CE615C600ED0A8B5AF425ECFE0D57BE2377587F66C45934A76886F34DC9B7",
        symbol: "rATOM",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stafihub/images/ratom.svg",
        },
        coingeckoId: "",
        price: {
          poolId: "1227",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["liquid_staking", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stafihub",
              chainId: "stafihub-1",
              sourceDenom: "uratom",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-5413",
              path: "transfer/channel-5413/uratom",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stafihub",
            sourceDenom: "uratom",
            chainType: "cosmos",
            chainId: "stafihub-1",
            symbol: "rATOM",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stafihub/images/ratom.svg",
            },
          },
        ],
        variantGroupKey: "rATOM",
        name: "rATOM",
        description: "A liquid staking representation of staked ATOMs",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "stafihub",
            sourceDenom: "ufis",
          },
          {
            chainName: "cosmoshub",
            sourceDenom: "uatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqatom",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
          },
        ],
        relative_image_url: "/tokens/generated/ratom.svg",
      },
    ],
  },
  {
    chain_name: "doravota",
    chain_id: "vota-ash",
    assets: [
      {
        chainName: "doravota",
        sourceDenom: "peaka",
        coinMinimalDenom:
          "ibc/672406ADE4EDFD8C5EA7A0D0DD0C37E431DA7BD8393A15CD2CFDE3364917EB2A",
        symbol: "DORA",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/doravota/images/dora.svg",
        },
        price: {
          poolId: "1239",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "doravota",
              chainId: "vota-ash",
              sourceDenom: "peaka",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2694",
              path: "transfer/channel-2694/peaka",
            },
          },
        ],
        counterparty: [
          {
            chainName: "doravota",
            sourceDenom: "peaka",
            chainType: "cosmos",
            chainId: "vota-ash",
            symbol: "DORA",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/doravota/images/dora.svg",
            },
          },
        ],
        variantGroupKey: "DORA",
        name: "Dora Vota",
        description:
          "The native staking and governance token of the Theta testnet version of the Dora Vota.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/dora.svg",
      },
    ],
  },
  {
    chain_name: "coreum",
    chain_id: "coreum-mainnet-1",
    assets: [
      {
        chainName: "coreum",
        sourceDenom: "ucore",
        coinMinimalDenom:
          "ibc/F3166F4D31D6BA1EC6C9F5536F5DDDD4CC93DBA430F7419E7CDC41C497944A65",
        symbol: "COREUM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/coreum/images/coreum.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/coreum/images/coreum.svg",
        },
        coingeckoId: "coreum",
        price: {
          poolId: "1244",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "coreum",
              chainId: "coreum-mainnet-1",
              sourceDenom: "ucore",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2188",
              path: "transfer/channel-2188/ucore",
            },
          },
        ],
        counterparty: [
          {
            chainName: "coreum",
            sourceDenom: "ucore",
            chainType: "cosmos",
            chainId: "coreum-mainnet-1",
            symbol: "COREUM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/coreum/images/coreum.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/coreum/images/coreum.svg",
            },
          },
        ],
        variantGroupKey: "COREUM",
        name: "Coreum",
        description: "The native token of Coreum",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/coreum.svg",
      },
    ],
  },
  {
    chain_name: "celestia",
    chain_id: "celestia",
    assets: [
      {
        chainName: "celestia",
        sourceDenom: "utia",
        coinMinimalDenom:
          "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
        symbol: "TIA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.svg",
        },
        coingeckoId: "celestia",
        price: {
          poolId: "1248",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "celestia",
              chainId: "celestia",
              sourceDenom: "utia",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-6994",
              path: "transfer/channel-6994/utia",
            },
          },
        ],
        counterparty: [
          {
            chainName: "celestia",
            sourceDenom: "utia",
            chainType: "cosmos",
            chainId: "celestia",
            symbol: "TIA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.svg",
            },
          },
        ],
        variantGroupKey: "TIA",
        name: "Celestia",
        description:
          "Celestia is a modular data availability network that securely scales with the number of users, making it easy for anyone to launch their own blockchain.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/CelestiaOrg",
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
          },
          {
            chainName: "stride",
            sourceDenom: "stutia",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
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
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
        ],
        relative_image_url: "/tokens/generated/tia.svg",
      },
    ],
  },
  {
    chain_name: "dydx",
    chain_id: "dydx-mainnet-1",
    assets: [
      {
        chainName: "dydx",
        sourceDenom: "adydx",
        coinMinimalDenom:
          "ibc/831F0B1BBB1D08A2B75311892876D71565478C532967545476DF4C2D7492E48C",
        symbol: "DYDX",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dydx/images/dydx-circle.svg",
        },
        coingeckoId: "dydx",
        price: {
          poolId: "1246",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "dydx",
              chainId: "dydx-mainnet-1",
              sourceDenom: "adydx",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-6787",
              path: "transfer/channel-6787/adydx",
            },
          },
        ],
        counterparty: [
          {
            chainName: "dydx",
            sourceDenom: "adydx",
            chainType: "cosmos",
            chainId: "dydx-mainnet-1",
            symbol: "DYDX",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dydx/images/dydx.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dydx/images/dydx.svg",
            },
          },
        ],
        variantGroupKey: "DYDX",
        name: "dYdX Protocol",
        description:
          "The native staking token of dYdX Protocol.\n\nOur goal is to build open source code that can power a first class product and trading experience.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/dYdX",
        relatedAssets: [
          {
            chainName: "stride",
            sourceDenom: "stadydx",
          },
          {
            chainName: "stride",
            sourceDenom: "ustrd",
          },
          {
            chainName: "stride",
            sourceDenom: "stuatom",
          },
          {
            chainName: "stride",
            sourceDenom: "stustars",
          },
          {
            chainName: "stride",
            sourceDenom: "stujuno",
          },
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
          },
          {
            chainName: "stride",
            sourceDenom: "stuluna",
          },
          {
            chainName: "stride",
            sourceDenom: "staevmos",
          },
          {
            chainName: "stride",
            sourceDenom: "stuumee",
          },
          {
            chainName: "stride",
            sourceDenom: "stusomm",
          },
        ],
        relative_image_url: "/tokens/generated/dydx.svg",
      },
    ],
  },
  {
    chain_name: "fxcore",
    chain_id: "fxcore",
    assets: [
      {
        chainName: "fxcore",
        sourceDenom: "FX",
        coinMinimalDenom:
          "ibc/2B30802A0B03F91E4E16D6175C9B70F2911377C1CAE9E50FF011C821465463F9",
        symbol: "FX",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.svg",
        },
        coingeckoId: "fx-coin",
        price: {
          poolId: "1241",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Starscan",
            type: "external_interface",
            depositUrl:
              "https://starscan.io/fxbridge?from=fxcore&to=osmosis&token=FX",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "fxcore",
              chainId: "fxcore",
              sourceDenom: "FX",
              port: "transfer",
              channelId: "channel-19",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2716",
              path: "transfer/channel-2716/FX",
            },
          },
        ],
        counterparty: [
          {
            chainName: "fxcore",
            sourceDenom: "FX",
            chainType: "cosmos",
            chainId: "fxcore",
            symbol: "FX",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.svg",
            },
          },
        ],
        variantGroupKey: "FX",
        name: "f(x)Core",
        description: "The native staking token of the Function X",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/fx.svg",
      },
    ],
  },
  {
    chain_name: "nomic",
    chain_id: "nomic-stakenet-3",
    assets: [
      {
        chainName: "nomic",
        sourceDenom: "usat",
        coinMinimalDenom:
          "ibc/75345531D87BD90BF108BE7240BD721CB2CB0A1F16D4EBA71B09EC3C43E15C8F",
        symbol: "nBTC",
        decimals: 14,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nbtc.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nbtc.svg",
        },
        price: {
          poolId: "1284",
          denom:
            "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "nomic",
              chainId: "nomic-stakenet-3",
              sourceDenom: "usat",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-6897",
              path: "transfer/channel-6897/usat",
            },
          },
        ],
        counterparty: [
          {
            chainName: "nomic",
            sourceDenom: "usat",
            chainType: "cosmos",
            chainId: "nomic-stakenet-3",
            symbol: "nBTC",
            decimals: 14,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nbtc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nbtc.svg",
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
        name: "Nomic Bitcoin",
        description: "Bitcoin. On Cosmos.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "osmosis",
            sourceDenom:
              "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
          },
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
        relative_image_url: "/tokens/generated/nbtc.svg",
      },
    ],
  },
  {
    chain_name: "nois",
    chain_id: "nois-1",
    assets: [
      {
        chainName: "nois",
        sourceDenom: "unois",
        coinMinimalDenom:
          "ibc/6928AFA9EA721938FED13B051F9DBF1272B16393D20C49EA5E4901BB76D94A90",
        symbol: "NOIS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nois/images/nois.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nois/images/nois.svg",
        },
        price: {
          poolId: "1305",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "nois",
              chainId: "nois-1",
              sourceDenom: "unois",
              port: "transfer",
              channelId: "channel-37",
            },
            chain: {
              port: "transfer",
              channelId: "channel-8277",
              path: "transfer/channel-8277/unois",
            },
          },
        ],
        counterparty: [
          {
            chainName: "nois",
            sourceDenom: "unois",
            chainType: "cosmos",
            chainId: "nois-1",
            symbol: "NOIS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nois/images/nois.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nois/images/nois.svg",
            },
          },
        ],
        variantGroupKey: "NOIS",
        name: "Nois",
        description: "The native token of Nois",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/nois.svg",
      },
    ],
  },
  {
    chain_name: "qwoyn",
    chain_id: "qwoyn-1",
    assets: [
      {
        chainName: "qwoyn",
        sourceDenom: "uqwoyn",
        coinMinimalDenom:
          "ibc/09FAF1E04435E14C68DE7AB0D03C521C92975C792DB12B2EA390BAA2E06B3F3D",
        symbol: "QWOYN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/qwoyn/images/qwoyn.png",
        },
        price: {
          poolId: "1295",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "qwoyn",
              chainId: "qwoyn-1",
              sourceDenom: "uqwoyn",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-880",
              path: "transfer/channel-880/uqwoyn",
            },
          },
        ],
        counterparty: [
          {
            chainName: "qwoyn",
            sourceDenom: "uqwoyn",
            chainType: "cosmos",
            chainId: "qwoyn-1",
            symbol: "QWOYN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/qwoyn/images/qwoyn.png",
            },
          },
        ],
        variantGroupKey: "QWOYN",
        name: "Qwoyn",
        description: "QWOYN is the native governance token for Qwoyn Network",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/qwoyn.png",
      },
    ],
  },
  {
    chain_name: "source",
    chain_id: "source-1",
    assets: [
      {
        chainName: "source",
        sourceDenom: "usource",
        coinMinimalDenom:
          "ibc/E7905742CE2EA4EA5D592527DC89220C59B617DE803939FE7293805A64B484D7",
        symbol: "SOURCE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/source/images/source.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/source/images/source.svg",
        },
        coingeckoId: "source",
        price: {
          poolId: "1311",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "source",
              chainId: "source-1",
              sourceDenom: "usource",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-8945",
              path: "transfer/channel-8945/usource",
            },
          },
        ],
        counterparty: [
          {
            chainName: "source",
            sourceDenom: "usource",
            chainType: "cosmos",
            chainId: "source-1",
            symbol: "SOURCE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/source/images/source.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/source/images/source.svg",
            },
          },
        ],
        variantGroupKey: "SOURCE",
        name: "Source",
        description: "The native token of SOURCE Chain",
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/source.svg",
      },
    ],
  },
  {
    chain_name: "haqq",
    chain_id: "haqq_11235-1",
    assets: [
      {
        chainName: "haqq",
        sourceDenom: "aISLM",
        coinMinimalDenom:
          "ibc/69110FF673D70B39904FF056CFDFD58A90BEC3194303F45C32CB91B8B0A738EA",
        symbol: "ISLM",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/haqq/images/islm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/haqq/images/islm.svg",
        },
        coingeckoId: "islamic-coin",
        price: {
          poolId: "1343",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "haqq",
              chainId: "haqq_11235-1",
              sourceDenom: "aISLM",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1575",
              path: "transfer/channel-1575/aISLM",
            },
          },
        ],
        counterparty: [
          {
            chainName: "haqq",
            sourceDenom: "aISLM",
            chainType: "cosmos",
            chainId: "haqq_11235-1",
            symbol: "ISLM",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/haqq/images/islm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/haqq/images/islm.svg",
            },
          },
        ],
        variantGroupKey: "ISLM",
        name: "Haqq Network",
        description:
          "The native EVM, governance and staking token of the Haqq Network",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/islm.svg",
      },
    ],
  },
  {
    chain_name: "pundix",
    chain_id: "PUNDIX",
    assets: [
      {
        chainName: "pundix",
        sourceDenom: "bsc0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C",
        coinMinimalDenom:
          "ibc/6FD2938076A4C1BB3A324A676E76B0150A4443DAE0E002FB62AC0E6B604B1519",
        symbol: "PURSE",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/purse-token-logo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/purse-token-logo.svg",
        },
        price: {
          poolId: "1394",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "pundix",
              chainId: "PUNDIX",
              sourceDenom: "bsc0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-12618",
              path: "transfer/channel-12618/bsc0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C",
            },
          },
        ],
        counterparty: [
          {
            chainName: "pundix",
            sourceDenom: "bsc0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C",
            chainType: "cosmos",
            chainId: "PUNDIX",
            symbol: "PURSE",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/purse-token-logo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/purse-token-logo.svg",
            },
          },
          {
            chainName: "binancesmartchain",
            sourceDenom: "0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C",
            chainType: "evm",
            chainId: 56,
            address: "0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C",
            symbol: "PURSE",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/purse-token-logo.svg",
            },
          },
        ],
        variantGroupKey: "PURSE",
        name: "PURSE Token (Function X)",
        description: "PURSE Token",
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relatedAssets: [],
        relative_image_url: "/tokens/generated/purse.svg",
      },
    ],
  },
  {
    chain_name: "nyx",
    chain_id: "nyx",
    assets: [
      {
        chainName: "nyx",
        sourceDenom: "unyx",
        coinMinimalDenom:
          "ibc/1A611E8A3E4248106A1A5A80A64BFA812739435E8B9888EB3F652A21F029F317",
        symbol: "NYX",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nyx/images/nyx.png",
        },
        coingeckoId: "",
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "nyx",
              chainId: "nyx",
              sourceDenom: "unyx",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-15464",
              path: "transfer/channel-15464/unyx",
            },
          },
        ],
        counterparty: [
          {
            chainName: "nyx",
            sourceDenom: "unyx",
            chainType: "cosmos",
            chainId: "nyx",
            symbol: "NYX",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nyx/images/nyx.png",
            },
          },
        ],
        variantGroupKey: "NYX",
        name: "Nym",
        description: "NYX Token (NYX) is the Nym Network's native token.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: true,
        relatedAssets: [
          {
            chainName: "nyx",
            sourceDenom: "unym",
          },
        ],
        relative_image_url: "/tokens/generated/nyx.png",
      },
      {
        chainName: "nyx",
        sourceDenom: "unym",
        coinMinimalDenom:
          "ibc/37CB3078432510EE57B9AFA8DBE028B33AE3280A144826FEAC5F2334CF2C5539",
        symbol: "NYM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nyx/images/nym.png",
        },
        coingeckoId: "nym",
        price: {
          poolId: "1361",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "nyx",
              chainId: "nyx",
              sourceDenom: "unym",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-15464",
              path: "transfer/channel-15464/unym",
            },
          },
        ],
        counterparty: [
          {
            chainName: "nyx",
            sourceDenom: "unym",
            chainType: "cosmos",
            chainId: "nyx",
            symbol: "NYM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nyx/images/nym.png",
            },
          },
        ],
        variantGroupKey: "NYM",
        name: "NYM",
        description:
          "NYM Token (NYM) is the Nym Network's native utility token, used as the primary means to incentivize mixnet node operators.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relatedAssets: [
          {
            chainName: "nyx",
            sourceDenom: "unyx",
          },
        ],
        relative_image_url: "/tokens/generated/nym.png",
      },
    ],
  },
  {
    chain_name: "dymension",
    chain_id: "dymension_1100-1",
    assets: [
      {
        chainName: "dymension",
        sourceDenom: "adym",
        coinMinimalDenom:
          "ibc/9A76CDF0CBCEF37923F32518FA15E5DC92B9F56128292BC4D63C4AEA76CBB110",
        symbol: "DYM",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dymension/images/dymension-logo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dymension/images/dymension-logo.svg",
        },
        coingeckoId: "dymension",
        price: {
          poolId: "1450",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://tfm.com/bridge?chainFrom=dymension_1100-1&chainTo=osmosis-1&token0=adym&token1=ibc%2F9A76CDF0CBCEF37923F32518FA15E5DC92B9F56128292BC4D63C4AEA76CBB110",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "dymension",
              chainId: "dymension_1100-1",
              sourceDenom: "adym",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-19774",
              path: "transfer/channel-19774/adym",
            },
          },
        ],
        counterparty: [
          {
            chainName: "dymension",
            sourceDenom: "adym",
            chainType: "cosmos",
            chainId: "dymension_1100-1",
            symbol: "DYM",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dymension/images/dymension-logo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dymension/images/dymension-logo.svg",
            },
          },
        ],
        variantGroupKey: "DYM",
        name: "Dymension Hub",
        description:
          "The native governance and staking token of the Dymension Hub\n\nDymension is a network of easily deployable and lightning fast modular blockchains called RollApps.",
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        twitterURL: "https://twitter.com/dymension",
        listingDate: "2024-02-06T08:36:00.000Z",
        relatedAssets: [],
        relative_image_url: "/tokens/generated/dym.svg",
      },
    ],
  },
];
