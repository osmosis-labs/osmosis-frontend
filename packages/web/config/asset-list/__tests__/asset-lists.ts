import { MockAssetLists, MockChains } from "~/config/asset-list/mock-data";

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(() => {
  // eslint-disable-next-line no-console
  (console.warn as jest.Mock).mockRestore();
});

describe("getKeplrCompatibleChain", () => {
  it("should return undefined if assetList is not found and environment is testnet", async () => {
    const assetLists: any[] = [];
    const environment = "testnet";

    const getKeplrCompatibleChain = await import("../utils").then(
      (module) => module.getKeplrCompatibleChain
    );
    const result = getKeplrCompatibleChain({
      chain: MockChains[0],
      assetLists,
      environment,
    });

    expect(result).toBeUndefined();
  });

  it("should return error if assetList is not found and environment is mainnet", async () => {
    const assetLists: any[] = [];
    const environment = "mainnet";

    const getKeplrCompatibleChain = await import("../utils").then(
      (module) => module.getKeplrCompatibleChain
    );

    expect(() =>
      getKeplrCompatibleChain({
        chain: MockChains[0],
        assetLists,
        environment,
      })
    ).toThrow(`Failed to find currencies for ${MockChains[0].chain_name}`);
  });

  it("should return a valid ChainInfoWithExplorer object when it contains cw20 tokens", async () => {
    const environment = "mainnet";

    const getKeplrCompatibleChain = await import("../utils").then(
      (module) => module.getKeplrCompatibleChain
    );

    const result = getKeplrCompatibleChain({
      chain: MockChains[2],
      assetLists: MockAssetLists,
      environment,
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "bech32Config": {
          "bech32PrefixAccAddr": "juno",
          "bech32PrefixAccPub": "junopub",
          "bech32PrefixConsAddr": "junovalcons",
          "bech32PrefixConsPub": "junovalconspub",
          "bech32PrefixValAddr": "junovaloper",
          "bech32PrefixValPub": "junovaloperpub",
        },
        "bip44": {
          "coinType": 118,
        },
        "chainId": "juno-1",
        "chainName": "juno",
        "currencies": [
          {
            "coinDecimals": 6,
            "coinDenom": "JUNO",
            "coinGeckoId": "juno-network",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.svg",
            "coinMinimalDenom": "ujuno",
            "contractAddress": undefined,
            "priceCoinId": "pool:ujuno",
          },
          {
            "coinDecimals": 3,
            "coinDenom": "MARBLE",
            "coinGeckoId": "marble",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/marble.svg",
            "coinMinimalDenom": "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl:MARBLE",
            "contractAddress": "juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
            "priceCoinId": "pool:marble",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "NETA",
            "coinGeckoId": "neta",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/neta.svg",
            "coinMinimalDenom": "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr:NETA",
            "contractAddress": "juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
            "priceCoinId": "pool:neta",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "HOPE",
            "coinGeckoId": "hope-galaxy",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hope.svg",
            "coinMinimalDenom": "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z:HOPE",
            "contractAddress": "juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
            "priceCoinId": "pool:hope",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "RAC",
            "coinGeckoId": "racoon",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/rac.svg",
            "coinMinimalDenom": "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa:RAC",
            "contractAddress": "juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
            "priceCoinId": "pool:rac",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "BLOCK",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/block.svg",
            "coinMinimalDenom": "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq:BLOCK",
            "contractAddress": "juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
            "priceCoinId": "pool:block",
          },
          {
            "coinDecimals": 0,
            "coinDenom": "DHK",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dhk.svg",
            "coinMinimalDenom": "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49:DHK",
            "contractAddress": "juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
            "priceCoinId": "pool:dhk",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "RAW",
            "coinGeckoId": "junoswap-raw-dao",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/raw.svg",
            "coinMinimalDenom": "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g:RAW",
            "contractAddress": "juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
            "priceCoinId": "pool:raw",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "ASVT",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/asvt.png",
            "coinMinimalDenom": "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w:ASVT",
            "contractAddress": "juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
            "priceCoinId": "pool:asvt",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "JOE",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/joe.png",
            "coinMinimalDenom": "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3:JOE",
            "contractAddress": "juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
            "priceCoinId": "pool:joe",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "GLTO",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.svg",
            "coinMinimalDenom": "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se:GLTO",
            "contractAddress": "juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
            "priceCoinId": "pool:glto",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "GKEY",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/gkey.svg",
            "coinMinimalDenom": "cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh:GKEY",
            "contractAddress": "juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh",
            "priceCoinId": "pool:gkey",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "SEJUNO",
            "coinGeckoId": "stakeeasy-juno-derivative",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sejuno.svg",
            "coinMinimalDenom": "cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv:SEJUNO",
            "contractAddress": "juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv",
            "priceCoinId": "pool:sejuno",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "BJUNO",
            "coinGeckoId": "stakeeasy-bjuno",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/bjuno.svg",
            "coinMinimalDenom": "cw20:juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3:BJUNO",
            "contractAddress": "juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3",
            "priceCoinId": undefined,
          },
          {
            "coinDecimals": 6,
            "coinDenom": "SOLAR",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/solar.svg",
            "coinMinimalDenom": "cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse:SOLAR",
            "contractAddress": "juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse",
            "priceCoinId": "pool:solar",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "SEASY",
            "coinGeckoId": "seasy",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/seasy.svg",
            "coinMinimalDenom": "cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf:SEASY",
            "contractAddress": "juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf",
            "priceCoinId": "pool:seasy",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "MUSE",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/muse.png",
            "coinMinimalDenom": "cw20:juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3:MUSE",
            "contractAddress": "juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3",
            "priceCoinId": undefined,
          },
          {
            "coinDecimals": 6,
            "coinDenom": "FURY",
            "coinGeckoId": "fanfury",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/fanfury.png",
            "coinMinimalDenom": "cw20:juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz:FURY",
            "contractAddress": "juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz",
            "priceCoinId": undefined,
          },
          {
            "coinDecimals": 6,
            "coinDenom": "PHMN",
            "coinGeckoId": "posthuman",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/phmn.svg",
            "coinMinimalDenom": "cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l:PHMN",
            "contractAddress": "juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l",
            "priceCoinId": "pool:phmn",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "HOPERS",
            "coinGeckoId": "hopers-io ",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hopers.svg",
            "coinMinimalDenom": "cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n:HOPERS",
            "contractAddress": "juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n",
            "priceCoinId": "pool:hopers",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "WYND",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/wynd.svg",
            "coinMinimalDenom": "cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9:WYND",
            "contractAddress": "juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
            "priceCoinId": "pool:wynd",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "NRIDE",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/nride.svg",
            "coinMinimalDenom": "cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq:NRIDE",
            "contractAddress": "juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq",
            "priceCoinId": "pool:nride",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "FOX",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/fox.png",
            "coinMinimalDenom": "cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x:FOX",
            "contractAddress": "juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x",
            "priceCoinId": "pool:fox",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "GRDN",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/guardian.png",
            "coinMinimalDenom": "cw20:juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma:GRDN",
            "contractAddress": "juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma",
            "priceCoinId": "pool:grdn",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "MNPU",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mnpu.svg",
            "coinMinimalDenom": "cw20:juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my:MNPU",
            "contractAddress": "juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my",
            "priceCoinId": "pool:mnpu",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "SHIBAC",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/shibacosmos.png",
            "coinMinimalDenom": "cw20:juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z:SHIBAC",
            "contractAddress": "juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z",
            "priceCoinId": "pool:shibac",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "SKOJ",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sikoba.svg",
            "coinMinimalDenom": "cw20:juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp:SKOJ",
            "contractAddress": "juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp",
            "priceCoinId": "pool:skoj",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "CLST",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/celestims.png",
            "coinMinimalDenom": "cw20:juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg:CLST",
            "contractAddress": "juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg",
            "priceCoinId": "pool:clst",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "OSDOGE",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/osdoge.png",
            "coinMinimalDenom": "cw20:juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je:OSDOGE",
            "contractAddress": "juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je",
            "priceCoinId": "pool:osdoge",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "APEMOS",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/apemos.png",
            "coinMinimalDenom": "cw20:juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06:APEMOS",
            "contractAddress": "juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06",
            "priceCoinId": "pool:apemos",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "INVDRS",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/invdrs.png",
            "coinMinimalDenom": "cw20:juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8:INVDRS",
            "contractAddress": "juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8",
            "priceCoinId": "pool:invdrs",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "DOGA",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/doga.png",
            "coinMinimalDenom": "cw20:juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d:DOGA",
            "contractAddress": "juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d",
            "priceCoinId": "pool:doga",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "CATMOS",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/catmos.png",
            "coinMinimalDenom": "cw20:juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488:CATMOS",
            "contractAddress": "juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488",
            "priceCoinId": "pool:catmos",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "SUMMIT",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/summit.png",
            "coinMinimalDenom": "cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm:SUMMIT",
            "contractAddress": "juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
            "priceCoinId": "pool:summit",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "SUMMIT",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/summit.png",
            "coinMinimalDenom": "cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm:SUMMIT",
            "contractAddress": "juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
            "priceCoinId": "pool:summit",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "SPACER",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/spacer.png",
            "coinMinimalDenom": "cw20:juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg:SPACER",
            "contractAddress": "juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg",
            "priceCoinId": "pool:spacer",
          },
          {
            "coinDecimals": 9,
            "coinDenom": "LIGHT",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/light.png",
            "coinMinimalDenom": "cw20:juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l:LIGHT",
            "contractAddress": "juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l",
            "priceCoinId": "pool:light",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "MILE",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mille.png",
            "coinMinimalDenom": "cw20:juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d:MILE",
            "contractAddress": "juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d",
            "priceCoinId": "pool:mile",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "MANNA",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/manna.png",
            "coinMinimalDenom": "cw20:juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq:MANNA",
            "contractAddress": "juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq",
            "priceCoinId": "pool:manna",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "VOID",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/void.png",
            "coinMinimalDenom": "cw20:juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8:VOID",
            "contractAddress": "juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8",
            "priceCoinId": undefined,
          },
          {
            "coinDecimals": 6,
            "coinDenom": "SLCA",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/silica.png",
            "coinMinimalDenom": "cw20:juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux:SLCA",
            "contractAddress": "juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux",
            "priceCoinId": "pool:slca",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "PEPEC",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/pepec.png",
            "coinMinimalDenom": "cw20:juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k:PEPEC",
            "contractAddress": "juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k",
            "priceCoinId": "pool:pepec",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "CASA",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/casa.png",
            "coinMinimalDenom": "cw20:juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss:CASA",
            "contractAddress": "juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss",
            "priceCoinId": "pool:casa",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "WATR",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/watr.png",
            "coinMinimalDenom": "cw20:juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw:WATR",
            "contractAddress": "juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw",
            "priceCoinId": "pool:watr",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "DGL",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dgl.png",
            "coinMinimalDenom": "factory/juno1u805lv20qc6jy7c3ttre7nct6uyl20pfky5r7e/DGL",
            "contractAddress": undefined,
            "priceCoinId": "pool:dgl",
          },
        ],
        "explorerUrlToTx": "https://www.mintscan.io/juno/txs/\${txHash}",
        "features": [
          "ibc-transfer",
          "ibc-go",
          "cosmwasm",
          "wasmd_0.24+",
        ],
        "feeCurrencies": [
          {
            "coinDecimals": 6,
            "coinDenom": "JUNO",
            "coinGeckoId": "juno-network",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.svg",
            "coinMinimalDenom": "ujuno",
            "priceCoinId": "pool:ujuno",
          },
        ],
        "prettyChainName": "Juno",
        "rest": "https://lcd-juno.keplr.app",
        "rpc": "https://rpc-juno.keplr.app",
        "stakeCurrency": {
          "coinDecimals": 6,
          "coinDenom": "JUNO",
          "coinGeckoId": "juno-network",
          "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.svg",
          "coinMinimalDenom": "ujuno",
        },
      }
    `);
  });

  it("should return a valid ChainInfoWithExplorer object when assetList is found", async () => {
    const environment = "mainnet";

    const getKeplrCompatibleChain = await import("../utils").then(
      (module) => module.getKeplrCompatibleChain
    );

    const result = getKeplrCompatibleChain({
      chain: MockChains[0],
      assetLists: MockAssetLists,
      environment,
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "bech32Config": {
          "bech32PrefixAccAddr": "osmo",
          "bech32PrefixAccPub": "osmopub",
          "bech32PrefixConsAddr": "osmovalcons",
          "bech32PrefixConsPub": "osmovalconspub",
          "bech32PrefixValAddr": "osmovaloper",
          "bech32PrefixValPub": "osmovaloperpub",
        },
        "bip44": {
          "coinType": 118,
        },
        "chainId": "osmosis-1",
        "chainName": "osmosis",
        "currencies": [
          {
            "coinDecimals": 6,
            "coinDenom": "OSMO",
            "coinGeckoId": "osmosis",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg",
            "coinMinimalDenom": "uosmo",
            "contractAddress": undefined,
            "priceCoinId": "pool:uosmo",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "ION",
            "coinGeckoId": "ion",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ion.svg",
            "coinMinimalDenom": "uion",
            "contractAddress": undefined,
            "priceCoinId": "pool:uion",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "IBCX",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ibcx.svg",
            "coinMinimalDenom": "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
            "contractAddress": undefined,
            "priceCoinId": "pool:ibcx",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "stIBCX",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/stibcx.svg",
            "coinMinimalDenom": "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
            "contractAddress": undefined,
            "priceCoinId": "pool:stibcx",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "ampOSMO",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/amposmo.png",
            "coinMinimalDenom": "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
            "contractAddress": undefined,
            "priceCoinId": "pool:amposmo",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "CDT",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/CDT.svg",
            "coinMinimalDenom": "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
            "contractAddress": undefined,
            "priceCoinId": "pool:cdt",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "MBRN",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/MBRN.svg",
            "coinMinimalDenom": "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
            "contractAddress": undefined,
            "priceCoinId": "pool:mbrn",
          },
        ],
        "explorerUrlToTx": "https://www.mintscan.io/cosmos/txs/\${txHash}",
        "features": [
          "ibc-go",
          "ibc-transfer",
          "cosmwasm",
          "wasmd_0.24+",
          "osmosis-txfees",
        ],
        "feeCurrencies": [
          {
            "coinDecimals": 6,
            "coinDenom": "OSMO",
            "coinGeckoId": "osmosis",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg",
            "coinMinimalDenom": "uosmo",
            "priceCoinId": "pool:uosmo",
          },
        ],
        "prettyChainName": "Osmosis",
        "rest": "https://lcd-osmosis.keplr.app",
        "rpc": "https://rpc-osmosis.keplr.app",
        "stakeCurrency": {
          "coinDecimals": 6,
          "coinDenom": "OSMO",
          "coinGeckoId": "osmosis",
          "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg",
          "coinMinimalDenom": "uosmo",
        },
      }
    `);
  });
});

describe("getChainList", () => {
  afterEach(() => {
    jest.resetModules();
  });

  it("should return the correct chain information when OSMOSIS_CHAIN_ID_OVERWRITE is not set", async () => {
    // Set OSMOSIS_CHAIN_ID_OVERWRITE to undefined
    delete process.env.NEXT_PUBLIC_OSMOSIS_CHAIN_ID_OVERWRITE;

    const getChainList = await import("../utils").then(
      (module) => module.getChainList
    );

    const result = getChainList({
      assetLists: MockAssetLists,
      chains: MockChains,
      environment: "mainnet",
    });
    const expectedChainId = "osmosis-1";

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.chain_id).toBe(expectedChainId);
    expect(result[0]?.bech32_prefix).toBe("osmo");
  });

  it("should return the correct chain information when OSMOSIS_CHAIN_ID_OVERWRITE is set", async () => {
    // Set OSMOSIS_CHAIN_ID_OVERWRITE to a custom value
    process.env.NEXT_PUBLIC_OSMOSIS_CHAIN_ID_OVERWRITE = "custom-chain-id";

    const getChainList = await import("../utils").then(
      (module) => module.getChainList
    );

    const result = getChainList({
      assetLists: MockAssetLists,
      chains: MockChains,
      environment: "mainnet",
    });
    const expectedChainId = "custom-chain-id";

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.chain_id).toBe(expectedChainId);
    expect(result[0]?.bech32_prefix).toBe("osmo");
  });
});
