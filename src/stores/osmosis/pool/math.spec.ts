import assert from 'assert';
import * as Math from './math';
import { Dec } from '@keplr-wallet/unit';

const powPrecision = new Dec('0.00000001');

describe('Test osmosis math', () => {
	test('TestAbsDifferenceWithSign', () => {
		const [s, b] = Math.absDifferenceWithSign(new Dec('3.2'), new Dec('4.3432389'));
		assert.strictEqual(b, true);
		assert.strictEqual(s.toString(), '1.143238900000000000');
	});

	test('TestPowApprox', () => {
		const s = Math.powApprox(new Dec('0.8'), new Dec('0.32'), powPrecision);
		const expected = new Dec('0.93108385');
		assert.strictEqual(
			expected
				.sub(s)
				.abs()
				.lte(powPrecision),
			true,
			"expected value & actual value's difference should less than precision"
		);
	});

	test('TestPow', () => {
		const s = Math.pow(new Dec('1.68'), new Dec('0.32'));
		const expected = new Dec('1.18058965');
		assert.strictEqual(
			expected
				.sub(s)
				.abs()
				.lte(powPrecision),
			true,
			"expected value & actual value's difference should less than precision"
		);
	});

	test('TestCalcSpotPrice', () => {
		const actual = Math.calcSpotPrice(new Dec('100'), new Dec('0.1'), new Dec('200'), new Dec('0.3'), new Dec('0'));
		const expected = new Dec('1.5');
		assert.strictEqual(
			expected
				.sub(actual)
				.abs()
				.lte(powPrecision),
			true,
			"expected value & actual value's difference should less than precision"
		);
	});

	test('TestCalcSpotPriceWithSwapFee', () => {
		const actual = Math.calcSpotPrice(new Dec('100'), new Dec('0.1'), new Dec('200'), new Dec('0.3'), new Dec('0.01'));
		const expected = new Dec('1.51515151');
		assert.strictEqual(
			expected
				.sub(actual)
				.abs()
				.lte(powPrecision),
			true,
			"expected value & actual value's difference should less than precision"
		);
	});

	test('TestCalcOutGivenIn', () => {
		const actual = Math.calcOutGivenIn(
			new Dec('100'),
			new Dec('0.1'),
			new Dec('200'),
			new Dec('0.3'),
			new Dec('40'),
			new Dec('0.01')
		);
		const expected = new Dec('21.0487006');
		assert.strictEqual(
			expected
				.sub(actual)
				.abs()
				.lte(powPrecision.mul(new Dec('10000'))),
			true,
			"expected value & actual value's difference should less than precision*10000"
		);
	});

	test('TestCalcInGivenOut', () => {
		const actual = Math.calcInGivenOut(
			new Dec('100'),
			new Dec('0.1'),
			new Dec('200'),
			new Dec('0.3'),
			new Dec('70'),
			new Dec('0.01')
		);
		const expected = new Dec('266.8009177');
		assert.strictEqual(
			expected
				.sub(actual)
				.abs()
				.lte(powPrecision.mul(new Dec('10'))),
			true,
			"expected value & actual value's difference should less than precision*10"
		);
	});

	test('TestCalcPoolOutGivenSingleIn', () => {
		const actual = Math.calcPoolOutGivenSingleIn(
			new Dec('100'),
			new Dec('0.2'),
			new Dec('300'),
			new Dec('1'),
			new Dec('40'),
			new Dec('0.15')
		);
		const expected = new Dec('18.6519592');
		assert.strictEqual(
			expected
				.sub(actual)
				.abs()
				.lte(powPrecision.mul(new Dec('10000'))),
			true,
			"expected value & actual value's difference should less than precision*10000"
		);
	});

	test('TestCalcSingleInGivenPoolOut', () => {
		const actual = Math.calcSingleInGivenPoolOut(
			new Dec('100'),
			new Dec('0.2'),
			new Dec('300'),
			new Dec('1'),
			new Dec('70'),
			new Dec('0.15')
		);
		const expected = new Dec('210.64327066965955');
		assert.strictEqual(
			expected
				.sub(actual)
				.abs()
				.lte(powPrecision.mul(new Dec('10000'))),
			true,
			"expected value & actual value's difference should less than precision*10000"
		);
	});

	test('TestCalcSingleOutGivenPoolIn', () => {
		const actual = Math.calcSingleOutGivenPoolIn(
			new Dec('200'),
			new Dec('0.8'),
			new Dec('300'),
			new Dec('1'),
			new Dec('40'),
			new Dec('0.15')
		);
		const expected = new Dec('31.77534976');
		assert.strictEqual(
			expected
				.sub(actual)
				.abs()
				.lte(powPrecision.mul(new Dec('10000'))),
			true,
			"expected value & actual value's difference should less than precision*10000"
		);
	});

	test('TestCalcPoolInGivenSingleOut', () => {
		const actual = Math.calcPoolInGivenSingleOut(
			new Dec('200'),
			new Dec('0.8'),
			new Dec('300'),
			new Dec('1'),
			new Dec('70'),
			new Dec('0.15')
		);
		const expected = new Dec('90.29092777');
		assert.strictEqual(
			expected
				.sub(actual)
				.abs()
				.lte(powPrecision.mul(new Dec('10000'))),
			true,
			"expected value & actual value's difference should less than precision*10000"
		);
	});
});
