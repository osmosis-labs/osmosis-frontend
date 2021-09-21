import { prettifyTxError } from './prettify-tx-error';

describe('Test prettify tx error', () => {
	test('Test unformated error', () => {
		const message = `blah blahblah
		blah
		`;

		expect(prettifyTxError(message, [])).toBe(message);
	});

	test('Test signature verification error', () => {
		const message =
			'signature verification failed; please verify account number (4287), sequence (193) and chain-id (osmosis-1): unauthorized';

		expect(prettifyTxError(message, [])).toBe(
			"You have too many concurrent txs going on! Try resending after your prior tx lands on chain. (We couldn't send the tx with sequence number 193)"
		);
	});

	test('Test failed to execute message at', () => {
		let message = `failed to execute message; message index: 0: blahblah`;

		expect(prettifyTxError(message, [])).toBe('blahblah (at msg 0)');

		message = `failed to execute message; message index: 15:    blahblah   
		   `;

		expect(prettifyTxError(message, [])).toBe('blahblah (at msg 15)');
	});

	test('Test coins', () => {
		let message = `failed to execute message; message index: 0: 1091377ibc/2739,1000unknown is smaller than 1000uosmo: insufficient funds`;

		expect(
			prettifyTxError(message, [
				{
					coinMinimalDenom: 'ibc/2739',
					coinDecimals: 3,
					coinDenom: 'BLAH',
				},
				{
					coinMinimalDenom: 'uosmo',
					coinDecimals: 6,
					coinDenom: 'OSMO',
				},
			])
		).toBe('1,091.377BLAH,1000unknown is smaller than 0.001OSMO: insufficient funds (at msg 0)');

		message = `failed to execute message; message index: 0: 1091377ibc/2739,1000uosmo is smaller than 1000unknown: insufficient funds`;

		expect(
			prettifyTxError(message, [
				{
					coinMinimalDenom: 'ibc/2739',
					coinDecimals: 3,
					coinDenom: 'BLAH',
				},
				{
					coinMinimalDenom: 'uosmo',
					coinDecimals: 6,
					coinDenom: 'OSMO',
				},
			])
		).toBe('1,091.377BLAH,0.001OSMO is smaller than 1000unknown: insufficient funds (at msg 0)');

		message = `failed to execute message; message index: 0: 1091377ibc/2739,uosmo blahblah unknown uosmo  `;

		expect(
			prettifyTxError(message, [
				{
					coinMinimalDenom: 'ibc/2739',
					coinDecimals: 3,
					coinDenom: 'BLAH',
				},
				{
					coinMinimalDenom: 'uosmo',
					coinDecimals: 6,
					coinDenom: 'OSMO',
				},
			])
		).toBe('1,091.377BLAH,OSMO blahblah unknown OSMO (at msg 0)');

		message = `uosmo osmo OSMO unknown ibc/2739 IBC/2739`;

		expect(
			prettifyTxError(message, [
				{
					coinMinimalDenom: 'ibc/2739',
					coinDecimals: 3,
					coinDenom: 'BLAH',
				},
				{
					coinMinimalDenom: 'uosmo',
					coinDecimals: 6,
					coinDenom: 'OSMO',
				},
			])
		).toBe('OSMO osmo OSMO unknown BLAH IBC/2739');
	});
});
