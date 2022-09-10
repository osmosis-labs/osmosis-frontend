import { coin } from '@cosmjs/amino';
import { AminoConverter } from '../src/codegen/osmosis/gamm/v1beta1/tx.amino';
import { osmosis } from '../src/codegen';

it('AminoConverter', async () => {
  const msg = AminoConverter['/osmosis.gamm.v1beta1.MsgJoinPool'].toAmino(
    {
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
    }
  )
  expect(
    msg
  ).toMatchSnapshot();

  const back = AminoConverter['/osmosis.gamm.v1beta1.MsgJoinPool'].fromAmino(
    msg
  );

  expect(
    back
  ).toMatchSnapshot();


  const final = AminoConverter['/osmosis.gamm.v1beta1.MsgJoinPool'].toAmino(
    back
  );

  expect(
    final
  ).toMatchSnapshot();
  
  expect(final).toEqual(msg);

});

it('AminoConverter.MsgSwapExactAmountIn', async () => {
  const msg = AminoConverter['/osmosis.gamm.v1beta1.MsgSwapExactAmountIn'].toAmino(
    {
      sender: 'osmo1f4vxvvvvvvvvvv3luuddddddddddcccccccccc',
      routes: [
        {
          poolId: '606',
          tokenOutDenom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2'
        }
      ],
      tokenIn: 
        coin(
          10248,
          'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2'
        ),
        tokenOutMinAmount: '1000000'
    }
  )
  expect(
    msg
  ).toMatchSnapshot();

  const back = AminoConverter['/osmosis.gamm.v1beta1.MsgSwapExactAmountIn'].fromAmino(
    msg
  );

  expect(
    back
  ).toMatchSnapshot();


  const final = AminoConverter['/osmosis.gamm.v1beta1.MsgSwapExactAmountIn'].toAmino(
    back
  );

  expect(
    final
  ).toMatchSnapshot();
  
  expect(final).toEqual(msg);

});

it('AminoConverter.scoped', async () => {
  const msg = osmosis.gamm.v1beta1.AminoConverter['/osmosis.gamm.v1beta1.MsgJoinPool'].toAmino(
    {
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
    }
  )
  expect(
    msg
  ).toMatchSnapshot();

  const back = osmosis.gamm.v1beta1.AminoConverter['/osmosis.gamm.v1beta1.MsgJoinPool'].fromAmino(
    msg
  );

  expect(
    back
  ).toMatchSnapshot();


  const final = osmosis.gamm.v1beta1.AminoConverter['/osmosis.gamm.v1beta1.MsgJoinPool'].toAmino(
    back
  );

  expect(
    final
  ).toMatchSnapshot();
  
  expect(final).toEqual(msg);

});
