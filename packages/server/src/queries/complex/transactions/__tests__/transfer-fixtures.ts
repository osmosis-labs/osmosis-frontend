import { Transaction } from "../../../data-services";

/**
 * Real records from the historical data service (`/v2/txs/{address}`),
 * trimmed (light client proofs, GMP payload bytes and prices removed).
 */
export const IndexedTransferTxs = {
  send: {
    _id: "C87D0DF06BB8BE74657EF45C13157D235BE5E9A04CA06DDB1864D4B68957950E#72572501",
    hash: "C87D0DF06BB8BE74657EF45C13157D235BE5E9A04CA06DDB1864D4B68957950E",
    chainId: "osmosis-1",
    schemaVersion: 10,
    blockTimestamp: "2026-10-15T11:48:13.919Z",
    index: 3,
    height: 72572501,
    fee: [
      {
        denom: "uosmo",
        amount: "45000",
      },
    ],
    code: 0,
    info: "",
    gasWanted: 500000,
    gasUsed: 260069,
    codespace: null,
    addressIndex: [
      "osmo1ze3f954mtj30st8dw2qhylfvvtdv5q6x8zxxrj",
      "noble1ze3f954mtj30st8dw2qhylfvvtdv5q6x86q7dw",
      "osmo1yl6hdjhmkf37639730gffanpzndzdpmhxy9ep3",
      "osmo17r7qdw2zk6jyw62cvwm6flmhtj9q7zd26r8zc6sqyf0pnaq46cfss8hgxg",
    ],
    messageTypes: ["/ibc.applications.transfer.v1.MsgTransfer"],
    memo: "",
    messages: [
      {
        source_port: "transfer",
        source_channel: "channel-750",
        token: {
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
          amount: "224893756165",
        },
        sender: "osmo1ze3f954mtj30st8dw2qhylfvvtdv5q6x8zxxrj",
        receiver: "noble1ze3f954mtj30st8dw2qhylfvvtdv5q6x86q7dw",
        timeout_height: {
          revision_number: "0",
          revision_height: "0",
        },
        timeout_timestamp: "1792065195226000000",
        memo: "",
        "@type": "/ibc.applications.transfer.v1.MsgTransfer",
      },
    ],
    metadata: [
      {
        type: "osmosis-ui",
        value: [
          {
            txType: "ibc_send",
            txMessageIndex: 0,
            txFee: [
              {
                denom: "uosmo",
                amount: "45000",
                usd: 0.0019759198672821927,
              },
            ],
            txInfo: {
              token: {
                denom:
                  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
                amount: "224893756165",
                usd: 224893.756165,
              },
              chain_to: "noble",
            },
          },
        ],
      },
    ],
  },
  recv: {
    _id: "B7DB18904125AF1FD6A79EFB02C41B5E3AF1F45F0EB4D3EAEC65C98A038D49D4#72572500",
    hash: "B7DB18904125AF1FD6A79EFB02C41B5E3AF1F45F0EB4D3EAEC65C98A038D49D4",
    chainId: "osmosis-1",
    schemaVersion: 10,
    blockTimestamp: "2026-10-15T11:48:09.241Z",
    index: 7,
    height: 72572500,
    fee: [
      {
        denom: "uosmo",
        amount: "24078",
      },
    ],
    code: 0,
    info: "",
    gasWanted: 617367,
    gasUsed: 419006,
    codespace: null,
    addressIndex: [
      "osmo159rufrfkf5g8qld5zqlsejesr4mlnfx06dyzum",
      "osmo1ze3f954mtj30st8dw2qhylfvvtdv5q6x8zxxrj",
      "noble1ze3f954mtj30st8dw2qhylfvvtdv5q6x86q7dw",
      "osmo1yl6hdjhmkf37639730gffanpzndzdpmhxy9ep3",
      "osmo17r7qdw2zk6jyw62cvwm6flmhtj9q7zd26r8zc6sqyf0pnaq46cfss8hgxg",
    ],
    messageTypes: [
      "/ibc.core.client.v1.MsgUpdateClient",
      "/ibc.core.channel.v1.MsgRecvPacket",
    ],
    memo: "Relayed with 💜 by Lavender.Five Nodes 🐝 (8) | hermes 1.10.5 (https://hermes.informal.systems)",
    messages: [
      {
        packet: {
          sequence: "1024796",
          source_port: "transfer",
          source_channel: "channel-1",
          destination_port: "transfer",
          destination_channel: "channel-750",
          data: {
            amount: "224867279694",
            denom: "uusdc",
            receiver: "osmo1ze3f954mtj30st8dw2qhylfvvtdv5q6x8zxxrj",
            sender: "noble1ze3f954mtj30st8dw2qhylfvvtdv5q6x86q7dw",
          },
          timeout_height: {
            revision_number: "0",
            revision_height: "0",
          },
          timeout_timestamp: "1792066087920119401",
        },
        signer: "osmo159rufrfkf5g8qld5zqlsejesr4mlnfx06dyzum",
        "@type": "/ibc.core.channel.v1.MsgRecvPacket",
      },
    ],
    metadata: [
      {
        type: "osmosis-ui",
        value: [
          {
            txType: "ibc_received",
            txMessageIndex: 1,
            txFee: [
              {
                denom: "uosmo",
                amount: "24078",
                usd: 0.001057165036054878,
              },
            ],
            txInfo: {
              token: {
                denom:
                  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
                amount: "224867279694",
                usd: 224867.279694,
              },
              chain_from: "noble",
            },
          },
        ],
      },
    ],
  },
  skip: {
    _id: "BAC92A559399C41A13EDEDBBB704A37162D9AAA9687E27E9309664C7DF66E69C#72566941",
    hash: "BAC92A559399C41A13EDEDBBB704A37162D9AAA9687E27E9309664C7DF66E69C",
    chainId: "osmosis-1",
    schemaVersion: 10,
    blockTimestamp: "2026-10-15T09:25:34.391Z",
    index: 0,
    height: 72566941,
    fee: [
      {
        denom: "uosmo",
        amount: "65635",
      },
    ],
    code: 0,
    info: "",
    gasWanted: 1823184,
    gasUsed: 1219381,
    codespace: null,
    addressIndex: [
      "osmo1j26g4rrz3tlrfnmlzpgr42qlsd78r942zll2zq",
      "osmo10a3k4hvk37cc4hnxctw4p95fhscd2z6h2rmx0aukc6rm8u9qqx9smfsh7u",
      "inj1fjm4drzxeu4ulkdv0ajx4sp0mz0n8ksps64prk",
      "terra1gygragtv7rhv86scnq4lkw0kw499939qer9ur5",
      "osmo1xzphwrc9aahmq7smwaggukwx5w2w8mmtqf5mk0ky0v6hh75paxsszfnlu5",
      "osmo1r9jc2234fljy93z80cevqjt3nmjycec8aj4cc6",
      "osmo1yggqusvjqscjy03ysdmjh5hxmt6tv20u5ufrsuy67ksnw2xqsvzql2j70s",
      "osmo1lur7an0wg2wf5wvyz9h6framsw2ltndn92kv3x0p68kage0kh74qzcfj6c",
      "osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0",
      "osmo1m8wg4vxkefhs374qxmmqpyusgz289wmulex5qdwpfx7jnrxzer5s9cv83q",
      "osmo1yl6hdjhmkf37639730gffanpzndzdpmhxy9ep3",
      "osmo17r7qdw2zk6jyw62cvwm6flmhtj9q7zd26r8zc6sqyf0pnaq46cfss8hgxg",
    ],
    messageTypes: ["/cosmwasm.wasm.v1.MsgExecuteContract"],
    memo: "",
    messages: [
      {
        sender: "osmo1j26g4rrz3tlrfnmlzpgr42qlsd78r942zll2zq",
        contract:
          "osmo10a3k4hvk37cc4hnxctw4p95fhscd2z6h2rmx0aukc6rm8u9qqx9smfsh7u",
        msg: {
          swap_and_action: {
            user_swap: {
              swap_exact_asset_in: {
                swap_venue_name: "osmosis-poolmanager",
                operations: [
                  {
                    pool: "562",
                    denom_in:
                      "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
                    denom_out:
                      "ibc/BE1BB42D4BE3C30D50B68D7C41DB4DFCE9678E8EF8C539F6E6A9345048894FCC",
                  },
                  {
                    pool: "679",
                    denom_in:
                      "ibc/BE1BB42D4BE3C30D50B68D7C41DB4DFCE9678E8EF8C539F6E6A9345048894FCC",
                    denom_out:
                      "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
                  },
                  {
                    pool: "3497",
                    denom_in:
                      "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
                    denom_out:
                      "ibc/794C7D7F3B857713878A3A1927251FA6AC1EEE520424C1F6FAFE9BA26D476138",
                  },
                ],
              },
            },
            min_asset: {
              native: {
                denom:
                  "ibc/794C7D7F3B857713878A3A1927251FA6AC1EEE520424C1F6FAFE9BA26D476138",
                amount: "4716954",
              },
            },
            timeout_timestamp: 1792056626701035800,
            post_swap_action: {
              ibc_transfer: {
                ibc_info: {
                  source_channel: "channel-122",
                  receiver: "inj1fjm4drzxeu4ulkdv0ajx4sp0mz0n8ksps64prk",
                  memo: '{"forward":{"channel":"channel-497","port":"transfer","receiver":"terra1gygragtv7rhv86scnq4lkw0kw499939qer9ur5","retries":2,"timeout":1792056626701033493}}',
                  recover_address:
                    "osmo1j26g4rrz3tlrfnmlzpgr42qlsd78r942zll2zq",
                },
              },
            },
            affiliates: [],
          },
        },
        funds: [
          {
            denom:
              "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
            amount: "100000000000",
          },
        ],
        "@type": "/cosmwasm.wasm.v1.MsgExecuteContract",
      },
    ],
    metadata: [],
  },
  gmp: {
    _id: "56F7183750316899EEB3C0AE818FE1FE2B0B3C176E109384EF9CE9357689AA4E#72566937",
    hash: "56F7183750316899EEB3C0AE818FE1FE2B0B3C176E109384EF9CE9357689AA4E",
    chainId: "osmosis-1",
    schemaVersion: 10,
    blockTimestamp: "2026-10-15T09:25:21.540Z",
    index: 0,
    height: 72566937,
    fee: [
      {
        denom: "uosmo",
        amount: "19117",
      },
    ],
    code: 0,
    info: "",
    gasWanted: 531010,
    gasUsed: 357881,
    codespace: null,
    addressIndex: [
      "osmo1lulklm2d20j6r9raxvq5fm5m8km7cdhttny6yj",
      "axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7jtdvu72npnt5zhq05ejcsn5qme5",
      "axelar1aythygn6z5thymj6tmzfwekzh05ewg3l7d6y89",
      "osmo1yl6hdjhmkf37639730gffanpzndzdpmhxy9ep3",
      "osmo17r7qdw2zk6jyw62cvwm6flmhtj9q7zd26r8zc6sqyf0pnaq46cfss8hgxg",
    ],
    messageTypes: ["/ibc.applications.transfer.v1.MsgTransfer"],
    memo: '{"squidRequestId":"018ae0eaa23612cf631b76d145881f09"}',
    messages: [
      {
        source_port: "transfer",
        source_channel: "channel-208",
        token: {
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
          amount: "43729278",
        },
        sender: "osmo1lulklm2d20j6r9raxvq5fm5m8km7cdhttny6yj",
        receiver:
          "axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7jtdvu72npnt5zhq05ejcsn5qme5",
        timeout_height: {
          revision_number: "0",
          revision_height: "0",
        },
        timeout_timestamp: "1792059912187000000",
        memo: '{"destination_chain":"base","destination_address":"0xce16F69375520ab01377ce7B88f5BA8C48F8D666","type":2,"fee":{"amount":"25869","recipient":"axelar1aythygn6z5thymj6tmzfwekzh05ewg3l7d6y89"},"payload":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,32,161,95,37,111,117,55,218,79,112,122,25,111,109,220,62,46,139,233,218,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,224,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,235,70,99,66,196,212,73,188,159,83,168,101,213,203,144,88,111,64,82,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,70,99,66,196,212,73,188,159,83,168,101,213,203,144,88,111,64,82,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,9,94,167,179,0,0,0,0,0,0,0,0,0,0,0,0,103,138,164,191,78,33,12,242,22,103,83,224,84,213,183,195,28,199,250,134,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,235,70,99,66,196,212,73,188,159,83,168,101,213,203,144,88,111,64,82,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,103,138,164,191,78,33,12,242,22,103,83,224,84,213,183,195,28,199,250,134,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,228,4,228,90,175,0,0,0,0,0,0,0,0,0,0,0,0,235,70,99,66,196,212,73,188,159,83,168,101,213,203,144,88,111,64,82,21,0,0,0,0,0,0,0,0,0,0,0,0,131,53,137,252,214,237,182,224,143,76,124,50,212,247,27,84,189,160,41,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,32,161,95,37,111,117,55,218,79,112,122,25,111,109,220,62,46,139,233,218,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,154,220,113,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,153,77,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,235,70,99,66,196,212,73,188,159,83,168,101,213,203,144,88,111,64,82,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,1,138,224,234,162,54,18,207,99,27,118,209,69,136,31,9]}',
        "@type": "/ibc.applications.transfer.v1.MsgTransfer",
      },
    ],
    metadata: [
      {
        type: "osmosis-ui",
        value: [
          {
            txType: "ibc_send",
            txMessageIndex: 0,
            txFee: [
              {
                denom: "uosmo",
                amount: "19117",
                usd: 0.0008311916680913097,
              },
            ],
            txInfo: {
              token: {
                denom:
                  "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
                amount: "43729278",
                usd: 43.729304506167985,
              },
              chain_to: "axelar",
            },
          },
        ],
      },
    ],
  },
  squid: {
    _id: "3487F3398A9B36B3B12E0085B0419C7059C64A3173A52DF269DA560B63AD8D1A#72566771",
    hash: "3487F3398A9B36B3B12E0085B0419C7059C64A3173A52DF269DA560B63AD8D1A",
    chainId: "osmosis-1",
    schemaVersion: 10,
    blockTimestamp: "2026-10-15T09:21:21.644Z",
    index: 0,
    height: 72566771,
    fee: [
      {
        denom: "uosmo",
        amount: "56587",
      },
    ],
    code: 0,
    info: "",
    gasWanted: 1571847,
    gasUsed: 1218528,
    codespace: null,
    addressIndex: [
      "osmo1yjkmhaq0xhpvhwzk7mncaurasdl0wyesf5cjcl",
      "osmo1n6ney9tsf55etz9nrmzyd8wa7e64qd3s06a74fqs30ka8pps6cvqtsycr6",
      "axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7jtdvu72npnt5zhq05ejcsn5qme5",
      "axelar1aythygn6z5thymj6tmzfwekzh05ewg3l7d6y89",
      "osmo1r9jc2234fljy93z80cevqjt3nmjycec8aj4cc6",
      "osmo1qqtms0c5dfg4mlw4jgyj54tnr3cxznzrz2zutthxxgx4zz9559wsq0nlmw",
      "osmo1yl6hdjhmkf37639730gffanpzndzdpmhxy9ep3",
      "osmo17r7qdw2zk6jyw62cvwm6flmhtj9q7zd26r8zc6sqyf0pnaq46cfss8hgxg",
    ],
    messageTypes: ["/cosmwasm.wasm.v1.MsgExecuteContract"],
    memo: "",
    messages: [
      {
        sender: "osmo1yjkmhaq0xhpvhwzk7mncaurasdl0wyesf5cjcl",
        contract:
          "osmo1n6ney9tsf55etz9nrmzyd8wa7e64qd3s06a74fqs30ka8pps6cvqtsycr6",
        msg: {
          multicall: {
            calls: [
              {
                msg: {
                  stargate: {
                    type_url: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
                    value: {
                      sender:
                        "osmo1n6ney9tsf55etz9nrmzyd8wa7e64qd3s06a74fqs30ka8pps6cvqtsycr6",
                      routes: [
                        {
                          pool_id: "840",
                          token_out_denom:
                            "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
                        },
                      ],
                      token_in: {
                        denom: "uosmo",
                        amount: "0",
                      },
                      token_out_min_amount: "420259899949773",
                    },
                  },
                },
                actions: [
                  {
                    native_balance_fetch: {
                      denom: "uosmo",
                      replacer: "/stargate/value/token_in/amount",
                    },
                  },
                  {
                    field_to_proto_binary: {
                      replacer: "/stargate/value",
                      proto_msg_type: "osmosis_swap_exact_amt_in",
                    },
                  },
                ],
              },
              {
                msg: {
                  stargate: {
                    type_url: "/ibc.applications.transfer.v1.MsgTransfer",
                    value: {
                      source_port: "transfer",
                      source_channel: "channel-208",
                      token: {
                        denom:
                          "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
                        amount: "422371758743491",
                      },
                      sender:
                        "osmo1n6ney9tsf55etz9nrmzyd8wa7e64qd3s06a74fqs30ka8pps6cvqtsycr6",
                      receiver:
                        "axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7jtdvu72npnt5zhq05ejcsn5qme5",
                      timeout_timestamp: 1792059680241000000,
                      memo: '{"ibc_callback":"osmo1n6ney9tsf55etz9nrmzyd8wa7e64qd3s06a74fqs30ka8pps6cvqtsycr6","destination_chain":"binance","destination_address":"0xce16F69375520ab01377ce7B88f5BA8C48F8D666","type":2,"fee":{"amount":"57639655176405","recipient":"axelar1aythygn6z5thymj6tmzfwekzh05ewg3l7d6y89"},"payload":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,100,142,181,194,165,166,61,168,49,2,70,179,236,193,89,107,130,162,63,158,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,187,76,219,156,189,54,176,27,209,203,174,191,45,224,141,145,115,188,9,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,187,76,219,156,189,54,176,27,209,203,174,191,45,224,141,145,115,188,9,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,46,26,125,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,187,76,219,156,189,54,176,27,209,203,174,191,45,224,141,145,115,188,9,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,100,142,181,194,165,166,61,168,49,2,70,179,236,193,89,107,130,162,63,158,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,238,238,238,238,238,238,238,238,238,238,238,238,238,238,238,238,238,238,238,238,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,166,4,75,144,2,165,124,144,51,127,127,206,128,1,157]}',
                    },
                  },
                },
                actions: [
                  {
                    native_balance_fetch: {
                      denom:
                        "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
                      replacer: "/stargate/value/token/amount",
                    },
                  },
                  {
                    ibc_tracking: {
                      channel: "channel-208",
                      denom:
                        "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
                      amount_pointer: "/stargate/value/token/amount",
                    },
                  },
                  {
                    field_to_proto_binary: {
                      replacer: "/stargate/value",
                      proto_msg_type: "ibc_transfer",
                    },
                  },
                ],
              },
            ],
            fallback_address: "osmo1yjkmhaq0xhpvhwzk7mncaurasdl0wyesf5cjcl",
          },
        },
        funds: [
          {
            denom: "uosmo",
            amount: "7000000",
          },
        ],
        "@type": "/cosmwasm.wasm.v1.MsgExecuteContract",
      },
    ],
    metadata: [],
  },
} as unknown as Record<"send" | "recv" | "skip" | "gmp" | "squid", Transaction>;
