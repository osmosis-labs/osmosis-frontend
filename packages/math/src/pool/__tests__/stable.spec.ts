import * as StableMath from '../stable';
import { Coin, Dec, Int } from '@keplr-wallet/unit';

describe('Test stableswap math', () => {
  describe('calcOutGivenIn', () => {
    test('even pool basic trade', () => {
      const poolAssets: StableMath.StableSwapToken[] = [
        {
          amount: new Dec(1_000_000_000),
          denom: 'foo',
          scalingFactor: 1,
        },
        {
          amount: new Dec(1_000_000_000),
          denom: 'bar',
          scalingFactor: 1,
        },
      ];

      const tokenIn = new Coin('foo', 100);
      const swapFee = new Dec(0);

      const expectedTokenOut = { denom: 'bar', amount: new Int(99) };

      const outAmount = StableMath.calcOutGivenIn(
        poolAssets,
        tokenIn,
        expectedTokenOut.denom,
        swapFee,
      );

      expect(outAmount.equals(expectedTokenOut.amount)).toBeTruthy();
    });
  });

  describe('solver', () => {
    test('even 3-asset small pool, small input', () => {
      const xReserve = new Dec(100);
      const yReserve = new Dec(100);
      const remReserves = [new Dec(100)];
      const yIn = new Dec(1);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('even 3-asset medium pool, small input', () => {
      const xReserve = new Dec(100_000);
      const yReserve = new Dec(100_000);
      const remReserves = [new Dec(100_000)];
      const yIn = new Dec(100);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('even 4-asset small pool, small input', () => {
      const xReserve = new Dec(100);
      const yReserve = new Dec(100);
      const remReserves = [new Dec(100), new Dec(100)];
      const yIn = new Dec(1);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('even 4-asset medium pool, small input', () => {
      const xReserve = new Dec(100_000);
      const yReserve = new Dec(100_000);
      const remReserves = [new Dec(100_000), new Dec(100_000)];
      const yIn = new Dec(1);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('even 4-asset large pool (100M each), small input', () => {
      const xReserve = new Dec(100_000_000);
      const yReserve = new Dec(100_000_000);
      const remReserves = [new Dec(100_000_000), new Dec(100_000_000)];
      const yIn = new Dec(100);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('even 4-asset pool (10B each post-scaled), small input', () => {
      const xReserve = new Dec(10_000_000_000);
      const yReserve = new Dec(10_000_000_000);
      const remReserves = [new Dec(10_000_000_000), new Dec(10_000_000_000)];
      const yIn = new Dec(100_000_000);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('even 10-asset pool (10B each post-scaled), small input', () => {
      const xReserve = new Dec(10_000_000_000);
      const yReserve = new Dec(10_000_000_000);
      const remReserves = [
        new Dec(10_000_000_000), // 3
        new Dec(10_000_000_000), // 4
        new Dec(10_000_000_000), // 5
        new Dec(10_000_000_000), // 6
        new Dec(10_000_000_000), // 7
        new Dec(10_000_000_000), // 8
        new Dec(10_000_000_000), // 9
        new Dec(10_000_000_000), // 10
      ];
      const yIn = new Dec(100);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('even 10-asset pool (100B each post-scaled), large input', () => {
      const xReserve = new Dec(100_000_000_000);
      const yReserve = new Dec(100_000_000_000);
      const remReserves = [
        new Dec(100_000_000_000), // 3
        new Dec(100_000_000_000), // 4
        new Dec(100_000_000_000), // 5
        new Dec(100_000_000_000), // 6
        new Dec(100_000_000_000), // 7
        new Dec(100_000_000_000), // 8
        new Dec(100_000_000_000), // 9
        new Dec(100_000_000_000), // 10
      ];
      const yIn = new Dec(10_000_000_000);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });

    // uneven pools
    test('uneven 3-asset pool, even swap assets as pool minority', () => {
      const xReserve = new Dec(100);
      const yReserve = new Dec(100);
      const remReserves = [new Dec(100_000)];
      const yIn = new Dec(10);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('uneven 3-asset pool, uneven swap assets as pool minority, y > x', () => {
      const xReserve = new Dec(100);
      const yReserve = new Dec(200);
      const remReserves = [new Dec(100_000)];
      const yIn = new Dec(10);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('uneven 3-asset pool, uneven swap assets as pool minority, x > y', () => {
      const xReserve = new Dec(200);
      const yReserve = new Dec(100);
      const remReserves = [new Dec(100_000)];
      const yIn = new Dec(10);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('uneven 3-asset pool, no round numbers', () => {
      const xReserve = new Dec(1178349);
      const yReserve = new Dec(8329743);
      const remReserves = [new Dec(329847)];
      const yIn = new Dec(10);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('uneven 4-asset pool, small input and swap assets in pool minority', () => {
      const xReserve = new Dec(100);
      const yReserve = new Dec(100);
      const remReserves = [new Dec(100_000), new Dec(100_000)];
      const yIn = new Dec(10);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('uneven 4-asset pool, even swap assets in pool majority', () => {
      const xReserve = new Dec(100_000);
      const yReserve = new Dec(100_000);
      const remReserves = [new Dec(100), new Dec(100)];
      const yIn = new Dec(10);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('uneven 4-asset pool, even swap assets in pool majority', () => {
      const xReserve = new Dec(100_000);
      const yReserve = new Dec(100_000);
      const remReserves = [new Dec(100), new Dec(100)];
      const yIn = new Dec(10);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('uneven 4-asset pool, uneven swap assets in pool majority, y > x', () => {
      const xReserve = new Dec(100_000);
      const yReserve = new Dec(200_000);
      const remReserves = [new Dec(100), new Dec(100)];
      const yIn = new Dec(10);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('uneven 4-asset pool, uneven swap assets in pool majority, y < x', () => {
      const xReserve = new Dec(200_000);
      const yReserve = new Dec(100_000);
      const remReserves = [new Dec(100), new Dec(100)];
      const yIn = new Dec(10);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });
    test('uneven 4-asset pool, no round numbers', () => {
      const xReserve = new Dec(1178349);
      const yReserve = new Dec(8329743);
      const remReserves = [new Dec(329847), new Dec(4372897)];
      const yIn = new Dec(10);

      StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn);
    });

    // check for expected exceptions to be thrown
    test('negative xReserve', () => {
      const xReserve = new Dec(-100);
      const yReserve = new Dec(100);
      const remReserves = [new Dec(100), new Dec(100)];
      const yIn = new Dec(1);

      expect(() =>
        StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn),
      ).toThrowError();
    });
    test('negative yReserve', () => {
      const xReserve = new Dec(100);
      const yReserve = new Dec(-100);
      const remReserves = [new Dec(100), new Dec(100)];
      const yIn = new Dec(1);

      expect(() =>
        StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn),
      ).toThrowError();
    });
    test('input greater than pool reserves (even 4-asset pool)', () => {
      const xReserve = new Dec(100);
      const yReserve = new Dec(100);
      const remReserves = [new Dec(100), new Dec(100)];
      const yIn = new Dec(1000);

      expect(() =>
        StableMath.solveCfmm(xReserve, yReserve, remReserves, yIn),
      ).toThrowError();
    });
  });
});
