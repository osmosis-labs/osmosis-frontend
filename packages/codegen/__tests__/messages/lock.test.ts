import { coin } from '@cosmjs/amino';
import { AminoConverter } from '../../src/codegen/osmosis/lockup/tx.amino';
import { osmosis } from '../../src/codegen';
import Long from 'long';

it('toJSON', () => {
  const msg = osmosis.lockup.MsgLockTokens.toJSON({
    owner: 'osmo1RedactedAddress',
    duration: '1209600',
    coins: [
      {
        amount: '10236850525923652977',
        denom: 'gamm/pool/3'
      }
    ]
  });
  // console.log(JSON.stringify(msg, null, 2));
  expect(msg).toMatchSnapshot();
});

xit('fromJSON', () => {
  const msg = osmosis.lockup.MsgLockTokens.fromJSON({
    owner: 'osmo1RedactedAddress',
    duration: '1209600',
    coins: [
      {
        amount: '10236850525923652977',
        denom: 'gamm/pool/3'
      }
    ]
  });
  // console.log(JSON.stringify(msg, null, 2));
  expect(msg).toMatchSnapshot();
});

xit('AminoConverter.MsgLockTokens', async () => {
  const msg = AminoConverter['/osmosis.lockup.MsgLockTokens'].toAmino({
    owner: 'osmo1RedactedAddress',
    duration: '1209600',
    coins: [
      {
        amount: '10236850525923652977',
        denom: 'gamm/pool/3'
      }
    ]
  });
  expect(
    msg
  ).toMatchSnapshot();

  const back = AminoConverter['/osmosis.lockup.MsgLockTokens'].fromAmino(
    msg
  );

  expect(
    back
  ).toMatchSnapshot();


  const final = AminoConverter['/osmosis.lockup.MsgLockTokens'].toAmino(
    back
  );

  expect(
    final
  ).toMatchSnapshot();

  expect(final).toEqual(msg);

});
