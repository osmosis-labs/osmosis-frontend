import { coin } from '@cosmjs/amino';
import { AminoConverter } from '../../src/codegen/osmosis/gamm/v1beta1/tx.amino';
import { osmosis } from '../../src/codegen';

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
