import { coin } from '@cosmjs/amino';
import { MsgJoinPool } from '../src/codegen/osmosis/gamm/v1beta1/tx';
import { osmosis } from '../src/codegen';

it('fromPartial', async () => {
  expect(
    MsgJoinPool.fromPartial({
      poolId: '606',
      sender: 'osmo1f4vxvvvvvvvvvv3luuddddddddddcccccccccc',
      shareOutAmount: '101010101',
      tokenInMaxs: [
        coin(
          10248,
          'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2'
        ),
        coin(
          64837969,
          'ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228'
        )
      ]
    })
  ).toMatchSnapshot();
});

it('fromPartial.scoped', async () => {
  expect(
    osmosis.gamm.v1beta1.MsgJoinPool.fromPartial({
      poolId: '606',
      sender: 'osmo1f4vxvvvvvvvvvv3luuddddddddddcccccccccc',
      shareOutAmount: '101010101',
      tokenInMaxs: [
        coin(
          10248,
          'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2'
        ),
        coin(
          64837969,
          'ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228'
        )
      ]
    })
  ).toMatchSnapshot();
});

it('encode', async () => {
  const obj = MsgJoinPool.fromPartial({
    poolId: '606',
    sender: 'osmo1f4vxvvvvvvvvvv3luuddddddddddcccccccccc',
    shareOutAmount: '101010101',
    tokenInMaxs: [
      coin(
        10248,
        'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2'
      ),
      coin(
        64837969,
        'ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228'
      )
    ]
  });
  const encoded = MsgJoinPool.encode(obj).finish();
  const decoded = MsgJoinPool.decode(encoded);
  expect(encoded instanceof Uint8Array).toBe(true);
  expect(decoded).toMatchSnapshot();
});
