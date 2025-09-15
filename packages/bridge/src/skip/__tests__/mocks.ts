export const SkipAssets = {
  chain_to_assets_map: {
    "1": {
      assets: [
        {
          denom: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          chain_id: "1",
          origin_denom: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          origin_chain_id: "1",
          trace: "",
          is_cw20: false,
          is_evm: true,
          is_svm: false,
          symbol: "USDC",
          name: "USD Coin",
          logo_uri:
            "https://raw.githubusercontent.com/axelarnetwork/axelar-configs/main/images/tokens/usdc.svg",
          decimals: 6,
          token_contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          coingecko_id: "usd-coin",
          recommended_symbol: "USDC",
        },
        {
          denom: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          chain_id: "1",
          origin_denom: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          origin_chain_id: "1",
          trace: "",
          is_cw20: false,
          is_evm: true,
          is_svm: false,
          symbol: "WETH",
          name: "Wrapped Ether",
          logo_uri:
            "https://raw.githubusercontent.com/axelarnetwork/axelar-configs/main/images/tokens/weth.svg",
          decimals: 18,
          token_contract: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          coingecko_id: "weth",
          recommended_symbol: "WETH",
        },
      ],
    },
    "osmosis-1": {
      assets: [
        {
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
          chain_id: "osmosis-1",
          origin_denom: "uusdc",
          origin_chain_id: "noble-1",
          trace: "transfer/channel-750",
          is_cw20: false,
          is_evm: false,
          is_svm: false,
          symbol: "USDC",
          name: "USDC",
          logo_uri:
            "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.png",
          decimals: 6,
          description:
            "USDC is a fully collateralized US Dollar stablecoin developed by CENTRE, the open source project with Circle being the first of several forthcoming issuers.",
          coingecko_id: "usd-coin",
          recommended_symbol: "USDC",
        },
        {
          denom:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
          chain_id: "osmosis-1",
          origin_denom: "weth-wei",
          origin_chain_id: "axelar-dojo-1",
          trace: "transfer/channel-208",
          is_cw20: false,
          is_evm: false,
          is_svm: false,
          symbol: "ETH",
          name: "ETH",
          logo_uri:
            "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/weth.png",
          decimals: 18,
          description:
            "Ethereum (ETH) is a decentralized, open-source blockchain system featuring smart contract functionality. It's the native cryptocurrency of the Ethereum platform, often regarded as the second most popular digital currency after Bitcoin. Ethereum was proposed in late 2013 and development was crowdfunded in 2014, leading to its network going live on 30 July 2015.\n\nETH, as a digital currency, is used for a variety of purposes within the Ethereum ecosystem, including the execution of decentralized smart contracts and as a mode of payment. Unlike Bitcoin, Ethereum was designed to be a platform for applications that can operate without the need for intermediaries, using blockchain technology. This has made Ethereum a leading platform for various applications, including decentralized finance (DeFi), non-fungible tokens (NFTs), and more. Ethereum is constantly evolving, with a significant upgrade termed Ethereum 2.0, which aims to improve its scalability, security, and sustainability.",
          coingecko_id: "axlweth",
          recommended_symbol: "ETH.axl",
        },
        {
          denom: "uosmo",
          chain_id: "osmosis-1",
          origin_denom: "uosmo",
          origin_chain_id: "osmosis-1",
          trace: "",
          is_cw20: false,
          is_evm: false,
          is_svm: false,
          symbol: "OSMO",
          name: "OSMO",
          logo_uri:
            "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png",
          decimals: 6,
          description: "The native token of Osmosis",
          coingecko_id: "osmosis",
          recommended_symbol: "OSMO",
        },
      ],
    },
    "agoric-3": {
      assets: [
        {
          denom:
            "ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9",
          chain_id: "agoric-3",
          origin_denom: "uusdc",
          origin_chain_id: "noble-1",
          trace: "transfer/channel-62",
          is_cw20: false,
          is_evm: false,
          is_svm: false,
          symbol: "USDC",
          name: "USDC",
          logo_uri:
            "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.png",
          decimals: 6,
          coingecko_id: "usd-coin",
          recommended_symbol: "USDC",
        },
      ],
    },
    "archway-1": {
      assets: [
        {
          denom:
            "ibc/43897B9739BD63E3A08A88191999C632E052724AB96BD4C74AE31375C991F48D",
          chain_id: "archway-1",
          origin_denom: "uusdc",
          origin_chain_id: "noble-1",
          trace: "transfer/channel-29",
          is_cw20: false,
          is_evm: false,
          is_svm: false,
          symbol: "USDC",
          name: "USDC",
          logo_uri:
            "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.png",
          decimals: 6,
          description: "Native Coin",
          coingecko_id: "usd-coin",
          recommended_symbol: "USDC",
        },
      ],
    },
    "noble-1": {
      assets: [
        {
          denom: "uusdc",
          chain_id: "noble-1",
          origin_denom: "uusdc",
          origin_chain_id: "noble-1",
          trace: "",
          is_cw20: false,
          is_evm: false,
          is_svm: false,
          symbol: "USDC",
          name: "USDC",
          logo_uri:
            "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.png",
          decimals: 6,
          description: "USD Coin",
          coingecko_id: "usd-coin",
          recommended_symbol: "USDC",
        },
      ],
    },
  },
};

export const SkipChains = {
  chains: [
    {
      chain_name: "Ethereum",
      chain_id: "1",
      pfm_enabled: false,
      cosmos_module_support: { authz: false, feegrant: false },
      supports_memo: false,
      logo_uri:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
      bech32_prefix: "",
      fee_assets: [],
      chain_type: "evm",
      ibc_capabilities: {
        cosmos_pfm: false,
        cosmos_ibc_hooks: false,
        cosmos_memo: false,
        cosmos_autopilot: false,
      },
      is_testnet: false,
    },
    {
      chain_name: "osmosis",
      chain_id: "osmosis-1",
      pfm_enabled: true,
      cosmos_module_support: { authz: true, feegrant: false },
      supports_memo: true,
      logo_uri:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/osmosis/chain.png",
      bech32_prefix: "osmo",
      fee_assets: [
        {
          denom: "uosmo",
          gas_price: { low: "0.0025", average: "0.025", high: "0.04" },
        },
      ],
      chain_type: "cosmos",
      ibc_capabilities: {
        cosmos_pfm: true,
        cosmos_ibc_hooks: true,
        cosmos_memo: true,
        cosmos_autopilot: false,
      },
      is_testnet: false,
    },
    {
      chain_name: "agoric",
      chain_id: "agoric-3",
      pfm_enabled: false,
      cosmos_module_support: { authz: true, feegrant: true },
      supports_memo: true,
      logo_uri:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/agoric/chain.png",
      bech32_prefix: "agoric",
      fee_assets: [
        {
          denom: "uist",
          gas_price: { low: "0.0034", average: "0.007", high: "0.02" },
        },
        {
          denom: "ubld",
          gas_price: { low: "0.03", average: "0.05", high: "0.07" },
        },
      ],
      chain_type: "cosmos",
      ibc_capabilities: {
        cosmos_pfm: false,
        cosmos_ibc_hooks: false,
        cosmos_memo: true,
        cosmos_autopilot: false,
      },
      is_testnet: false,
    },
    {
      chain_name: "archway",
      chain_id: "archway-1",
      pfm_enabled: false,
      cosmos_module_support: { authz: true, feegrant: true },
      supports_memo: true,
      logo_uri:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/archway/chain.png",
      bech32_prefix: "archway",
      fee_assets: [
        {
          denom: "aarch",
          gas_price: {
            low: "140000000000",
            average: "196000000000",
            high: "225400000000",
          },
        },
      ],
      chain_type: "cosmos",
      ibc_capabilities: {
        cosmos_pfm: false,
        cosmos_ibc_hooks: false,
        cosmos_memo: true,
        cosmos_autopilot: false,
      },
      is_testnet: false,
    },
    {
      chain_name: "noble",
      chain_id: "noble-1",
      pfm_enabled: true,
      cosmos_module_support: { authz: true, feegrant: true },
      supports_memo: true,
      logo_uri:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/noble/chain.png",
      bech32_prefix: "noble",
      fee_assets: [
        {
          denom:
            "ibc/EF48E6B1A1A19F47ECAEA62F5670C37C0580E86A9E88498B7E393EB6F49F33C0",
          gas_price: { low: "0.01", average: "0.01", high: "0.02" },
        },
        {
          denom: "uusdc",
          gas_price: { low: "0.1", average: "0.1", high: "0.2" },
        },
      ],
      chain_type: "cosmos",
      ibc_capabilities: {
        cosmos_pfm: true,
        cosmos_ibc_hooks: false,
        cosmos_memo: true,
        cosmos_autopilot: false,
      },
      is_testnet: false,
    },
    {
      chain_name: "dydx",
      chain_id: "dydx-mainnet-1",
      pfm_enabled: false,
      cosmos_module_support: { authz: true, feegrant: true },
      supports_memo: true,
      logo_uri:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/dydx-mainnet/adydx.png",
      bech32_prefix: "dydx",
      fee_assets: [
        {
          denom: "adydx",
          gas_price: {
            low: "12500000000",
            average: "12500000000",
            high: "20000000000",
          },
        },
        {
          denom:
            "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5",
          gas_price: { low: "0.025", average: "0.025", high: "0.03" },
        },
      ],
      chain_type: "cosmos",
      ibc_capabilities: {
        cosmos_pfm: false,
        cosmos_ibc_hooks: false,
        cosmos_memo: true,
        cosmos_autopilot: false,
      },
      is_testnet: false,
    },
  ],
};

export const ETH_OsmosisToEthereum_Route = {
  source_asset_denom:
    "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
  source_asset_chain_id: "osmosis-1",
  dest_asset_denom: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  dest_asset_chain_id: "1",
  amount_in: "10000000000000000000",
  amount_out: "9992274579512577377",
  operations: [
    {
      axelar_transfer: {
        from_chain: "osmosis",
        from_chain_id: "osmosis-1",
        to_chain: "Ethereum",
        to_chain_id: "1",
        asset: "weth-wei",
        should_unwrap: false,
        denom_in: "weth-wei",
        denom_out: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        fee_amount: "7725420487422623",
        usd_fee_amount: "26.94",
        fee_asset: {
          denom: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          chain_id: "1",
          origin_denom: "",
          origin_chain_id: "",
          trace: "",
          is_cw20: false,
          is_evm: true,
          is_svm: false,
          symbol: "WETH",
          name: "Wrapped Ether",
          logo_uri:
            "https://raw.githubusercontent.com/axelarnetwork/axelar-configs/main/images/tokens/weth.svg",
          decimals: 18,
          token_contract: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        },
        is_testnet: false,
        ibc_transfer_to_axelar: {
          port: "transfer",
          channel: "channel-208",
          from_chain_id: "osmosis-1",
          to_chain_id: "axelar-dojo-1",
          pfm_enabled: true,
          supports_memo: true,
          denom_in:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
          denom_out: "weth-wei",
          bridge_id: "IBC",
          smart_relay: false,
          chain_id: "osmosis-1",
          dest_denom: "weth-wei",
        },
        bridge_id: "AXELAR",
        smart_relay: false,
      },
      tx_index: 0,
      amount_in: "10000000000000000000",
      amount_out: "9992274579512577377",
    },
  ],
  chain_ids: ["osmosis-1", "1"],
  does_swap: false,
  estimated_amount_out: "9992274579512577377",
  swap_venues: [],
  txs_required: 1,
  usd_amount_in: "34871.80",
  usd_amount_out: "34844.86",
  estimated_fees: [],
  required_chain_addresses: ["osmosis-1", "1"],
  estimated_route_duration_seconds: 30,
};

export const ETH_EthereumToOsmosis_Route = {
  source_asset_denom: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  source_asset_chain_id: "1",
  dest_asset_denom:
    "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
  dest_asset_chain_id: "osmosis-1",
  amount_in: "10000000000000000000",
  amount_out: "10000000000000000000",
  operations: [
    {
      axelar_transfer: {
        from_chain: "Ethereum",
        from_chain_id: "1",
        to_chain: "osmosis",
        to_chain_id: "osmosis-1",
        asset: "weth-wei",
        should_unwrap: false,
        denom_in: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        denom_out:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        fee_amount: "73924361079993",
        usd_fee_amount: "0.26",
        fee_asset: {
          denom: "ethereum-native",
          chain_id: "1",
          origin_denom: "",
          origin_chain_id: "",
          trace: "",
          is_cw20: false,
          is_evm: true,
          is_svm: false,
          symbol: "ETH",
          name: "Ethereum",
          logo_uri:
            "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-blue.svg",
          decimals: 18,
          token_contract: "",
        },
        is_testnet: false,
        bridge_id: "AXELAR",
        smart_relay: false,
      },
      tx_index: 0,
      amount_in: "10000000000000000000",
      amount_out: "10000000000000000000",
    },
  ],
  chain_ids: ["1", "osmosis-1"],
  does_swap: false,
  estimated_amount_out: "10000000000000000000",
  swap_venues: [],
  txs_required: 1,
  usd_amount_in: "34843.80",
  usd_amount_out: "34843.80",
  estimated_fees: [],
  required_chain_addresses: ["1", "osmosis-1"],
  estimated_route_duration_seconds: 30,
};

export const ETH_OsmosisToEthereum_Msgs = {
  msgs: [
    {
      multi_chain_msg: {
        chain_id: "osmosis-1",
        path: ["osmosis-1", "1"],
        msg: '{"source_port":"transfer","source_channel":"channel-208","token":{"denom":"ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5","amount":"10000000000000000000"},"sender":"osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx","receiver":"axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7jtdvu72npnt5zhq05ejcsn5qme5","timeout_height":{},"timeout_timestamp":1718978568036848764,"memo":"{\\"destination_chain\\":\\"Ethereum\\",\\"destination_address\\":\\"0xD397883c12b71ea39e0d9f6755030205f31A1c96\\",\\"payload\\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,99,236,5,177,35,136,92,118,9,176,92,53,223,119,127,63,24,2,88],\\"type\\":2,\\"fee\\":{\\"amount\\":\\"7725420487422623\\",\\"recipient\\":\\"axelar1aythygn6z5thymj6tmzfwekzh05ewg3l7d6y89\\"}}"}',
        msg_type_url: "/ibc.applications.transfer.v1.MsgTransfer",
      },
    },
  ],
  txs: [
    {
      cosmos_tx: {
        chain_id: "osmosis-1",
        path: ["osmosis-1", "1"],
        msgs: [
          {
            msg: '{"source_port":"transfer","source_channel":"channel-208","token":{"denom":"ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5","amount":"10000000000000000000"},"sender":"osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx","receiver":"axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7jtdvu72npnt5zhq05ejcsn5qme5","timeout_height":{},"timeout_timestamp":1718978568036848764,"memo":"{\\"destination_chain\\":\\"Ethereum\\",\\"destination_address\\":\\"0xD397883c12b71ea39e0d9f6755030205f31A1c96\\",\\"payload\\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,99,236,5,177,35,136,92,118,9,176,92,53,223,119,127,63,24,2,88],\\"type\\":2,\\"fee\\":{\\"amount\\":\\"7725420487422623\\",\\"recipient\\":\\"axelar1aythygn6z5thymj6tmzfwekzh05ewg3l7d6y89\\"}}"}',
            msg_type_url: "/ibc.applications.transfer.v1.MsgTransfer",
          },
        ],
        signer_address: "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx",
      },
      operations_indices: [0],
    },
  ],
  estimated_fees: [
    {
      fee_type: "SMART_RELAY",
      bridge_id: "IBC",
      amount: "",
      usd_amount: "",
      origin_asset: null,
      chain_id: "",
      tx_index: 0,
    },
  ],
};
export const ETH_EthereumToOsmosis_Msgs = {
  msgs: [
    {
      evm_tx: {
        chain_id: "1",
        to: "0xD397883c12b71ea39e0d9f6755030205f31A1c96",
        value: "73924361079993",
        data: "d421c10500000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000008ac7230489e800000000000000000000000000000000000000000000000000000000433bdb484cb900000000000000000000000000000000000000000000000000000000000000076f736d6f73697300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b6f736d6f313037767975657236777a6665376e727273756a7070613070767833356676706c7034743774780000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000007b7d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045745544800000000000000000000000000000000000000000000000000000000",
        required_erc20_approvals: [
          {
            token_contract: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            spender: "0xD397883c12b71ea39e0d9f6755030205f31A1c96",
            amount: "10000000000000000000",
          },
        ],
        signer_address: "0x7863Ec05b123885c7609B05c35Df777F3F180258",
      },
    },
  ],
  txs: [
    {
      evm_tx: {
        chain_id: "1",
        to: "0xD397883c12b71ea39e0d9f6755030205f31A1c96",
        value: "73924361079993",
        data: "d421c10500000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000008ac7230489e800000000000000000000000000000000000000000000000000000000433bdb484cb900000000000000000000000000000000000000000000000000000000000000076f736d6f73697300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b6f736d6f313037767975657236777a6665376e727273756a7070613070767833356676706c7034743774780000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000007b7d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045745544800000000000000000000000000000000000000000000000000000000",
        required_erc20_approvals: [
          {
            token_contract: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            spender: "0xD397883c12b71ea39e0d9f6755030205f31A1c96",
            amount: "10000000000000000000",
          },
        ],
        signer_address: "0x7863Ec05b123885c7609B05c35Df777F3F180258",
      },
      operations_indices: [0],
    },
  ],
  estimated_fees: [
    {
      fee_type: "SMART_RELAY",
      bridge_id: "IBC",
      amount: "",
      usd_amount: "",
      origin_asset: null,
      chain_id: "",
      tx_index: 0,
    },
  ],
};
