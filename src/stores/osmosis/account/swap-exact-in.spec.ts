import { deepContained, getEventFromTx, initLocalnet, RootStore, waitAccountLoaded } from '../../test-env';
import { Dec, DecUtils, IntPretty } from '@keplr-wallet/unit';

describe('Test Osmosis Swap Exact Amount In Tx', () => {
	let { chainStore, accountStore, queriesStore } = new RootStore();

	beforeAll(async () => {
		jest.setTimeout(60000);
	});

	beforeEach(async () => {
		// Init new localnet per test
		await initLocalnet();

		const stores = new RootStore();
		chainStore = stores.chainStore;
		accountStore = stores.accountStore;
		queriesStore = stores.queriesStore;

		const account = accountStore.getAccount(chainStore.current.chainId);
		account.broadcastMode = 'block';
		await waitAccountLoaded(account);

		// And prepare the pool
		await new Promise<any>(resolve => {
			account.osmosis.sendCreatePoolMsg(
				'0',
				[
					{
						weight: '100',
						token: {
							currency: {
								coinDenom: 'ATOM',
								coinMinimalDenom: 'uatom',
								coinDecimals: 6,
							},
							amount: '100',
						},
					},
					{
						weight: '200',
						token: {
							currency: {
								coinDenom: 'OSMO',
								coinMinimalDenom: 'uosmo',
								coinDecimals: 6,
							},
							amount: '100',
						},
					},
					{
						weight: '300',
						token: {
							currency: {
								coinDenom: 'Foo',
								coinMinimalDenom: 'ufoo',
								coinDecimals: 6,
							},
							amount: '100',
						},
					},
				],
				'',
				tx => {
					resolve(tx);
				}
			);
		});
	});

	test('SwapExactAmountIn should fail with unregistered pool asset', async () => {
		const account = accountStore.getAccount(chainStore.current.chainId);

		await expect(
			account.osmosis.sendSwapExactAmountInMsg(
				'1',
				{
					currency: {
						coinDenom: 'ATOM',
						coinMinimalDenom: 'uatom',
						coinDecimals: 6,
					},
					amount: '1',
				},
				{
					coinDenom: 'BAR',
					coinMinimalDenom: 'ubar',
					coinDecimals: 6,
				}
			)
		).rejects.not.toBeNull();
	});

	test('SwapExactAmountIn should fail with unregistered pool asset (2)', async () => {
		const account = accountStore.getAccount(chainStore.current.chainId);

		await expect(
			account.osmosis.sendSwapExactAmountInMsg(
				'1',
				{
					currency: {
						coinDenom: 'BAR',
						coinMinimalDenom: 'ubar',
						coinDecimals: 6,
					},
					amount: '1',
				},
				{
					coinDenom: 'ATOM',
					coinMinimalDenom: 'uatom',
					coinDecimals: 6,
				}
			)
		).rejects.not.toBeNull();
	});

	test('SwapExactAmountIn with no max slippage', async () => {
		const account = accountStore.getAccount(chainStore.current.chainId);

		const poolId = '1';
		const tokenIn = {
			currency: {
				coinDenom: 'ATOM',
				coinMinimalDenom: 'uatom',
				coinDecimals: 6,
			},
			amount: '1',
		};
		const tokenOutCurrency = {
			coinDenom: 'OSMO',
			coinMinimalDenom: 'uosmo',
			coinDecimals: 6,
		};

		const queryPool = queriesStore
			.get(chainStore.current.chainId)
			.osmosis.queryGammPools.getObservableQueryPool(poolId);
		await queryPool.waitFreshResponse();
		const estimated = queryPool.pool!.estimateSwapExactAmountIn(tokenIn, tokenOutCurrency);

		const tx = await new Promise<any>(resolve => {
			account.osmosis.sendSwapExactAmountInMsg(poolId, tokenIn, tokenOutCurrency, '0', '', tx => {
				resolve(tx);
			});
		});

		deepContained(
			{
				type: 'message',
				attributes: [
					{ key: 'action', value: '/osmosis.gamm.v1beta1.MsgSwapExactAmountIn' },
					{ key: 'module', value: 'gamm' },
					{
						key: 'sender',
						value: account.bech32Address,
					},
				],
			},
			getEventFromTx(tx, 'message')
		);

		deepContained(
			{
				type: 'transfer',
				attributes: [
					{ key: 'amount', value: '1000000uatom' },
					{
						key: 'amount',
						value:
							estimated.tokenOut
								.toDec()
								.mul(DecUtils.getPrecisionDec(tokenOutCurrency.coinDecimals))
								.truncate()
								.toString() + tokenOutCurrency.coinMinimalDenom,
					},
				],
			},
			getEventFromTx(tx, 'transfer')
		);
	});

	test('SwapExactAmountIn with slippage', async () => {
		const account = accountStore.getAccount(chainStore.current.chainId);

		const poolId = '1';
		const tokenIn = {
			currency: {
				coinDenom: 'ATOM',
				coinMinimalDenom: 'uatom',
				coinDecimals: 6,
			},
			amount: '1',
		};
		const tokenOutCurrency = {
			coinDenom: 'OSMO',
			coinMinimalDenom: 'uosmo',
			coinDecimals: 6,
		};

		const queryPool = queriesStore
			.get(chainStore.current.chainId)
			.osmosis.queryGammPools.getObservableQueryPool(poolId);
		await queryPool.waitFreshResponse();
		const estimated = queryPool.pool!.estimateSwapExactAmountIn(tokenIn, tokenOutCurrency);

		const doubleSlippage = new IntPretty(estimated.slippage.toDec().mul(new Dec(2)))
			.locale(false)
			.maxDecimals(4)
			.trim(true);

		expect(doubleSlippage.toDec().gt(new Dec(0))).toBeTruthy();

		const tx = await new Promise<any>(resolve => {
			account.osmosis.sendSwapExactAmountInMsg(poolId, tokenIn, tokenOutCurrency, doubleSlippage.toString(), '', tx => {
				resolve(tx);
			});
		});

		deepContained(
			{
				type: 'message',
				attributes: [
					{ key: 'action', value: '/osmosis.gamm.v1beta1.MsgSwapExactAmountIn' },
					{ key: 'module', value: 'gamm' },
					{
						key: 'sender',
						value: account.bech32Address,
					},
				],
			},
			getEventFromTx(tx, 'message')
		);

		deepContained(
			{
				type: 'transfer',
				attributes: [
					{ key: 'amount', value: '1000000uatom' },
					{
						key: 'amount',
						value:
							estimated.tokenOut
								.toDec()
								.mul(DecUtils.getPrecisionDec(tokenOutCurrency.coinDecimals))
								.truncate()
								.toString() + tokenOutCurrency.coinMinimalDenom,
					},
				],
			},
			getEventFromTx(tx, 'transfer')
		);
	});

	test('SwapExactAmountIn with exactly matched slippage and max slippage', async () => {
		const account = accountStore.getAccount(chainStore.current.chainId);

		const poolId = '1';
		const tokenIn = {
			currency: {
				coinDenom: 'ATOM',
				coinMinimalDenom: 'uatom',
				coinDecimals: 6,
			},
			amount: '1',
		};
		const tokenOutCurrency = {
			coinDenom: 'OSMO',
			coinMinimalDenom: 'uosmo',
			coinDecimals: 6,
		};

		const queryPool = queriesStore
			.get(chainStore.current.chainId)
			.osmosis.queryGammPools.getObservableQueryPool(poolId);
		await queryPool.waitFreshResponse();
		const estimated = queryPool.pool!.estimateSwapExactAmountIn(tokenIn, tokenOutCurrency);

		expect(estimated.slippage.toDec().gt(new Dec(0))).toBeTruthy();

		const tx = await new Promise<any>(resolve => {
			account.osmosis.sendSwapExactAmountInMsg(
				poolId,
				tokenIn,
				tokenOutCurrency,
				estimated.slippage.maxDecimals(18).toString(),
				'',
				tx => {
					resolve(tx);
				}
			);
		});

		deepContained(
			{
				type: 'message',
				attributes: [
					{ key: 'action', value: '/osmosis.gamm.v1beta1.MsgSwapExactAmountIn' },
					{ key: 'module', value: 'gamm' },
					{
						key: 'sender',
						value: account.bech32Address,
					},
				],
			},
			getEventFromTx(tx, 'message')
		);

		deepContained(
			{
				type: 'transfer',
				attributes: [
					{ key: 'amount', value: '1000000uatom' },
					{
						key: 'amount',
						value:
							estimated.tokenOut
								.toDec()
								.mul(DecUtils.getPrecisionDec(tokenOutCurrency.coinDecimals))
								.truncate()
								.toString() + tokenOutCurrency.coinMinimalDenom,
					},
				],
			},
			getEventFromTx(tx, 'transfer')
		);
	});

	test('SwapExactAmountIn should be failed with more max slippage than calculated slippage', async () => {
		const account = accountStore.getAccount(chainStore.current.chainId);

		const poolId = '1';
		const tokenIn = {
			currency: {
				coinDenom: 'ATOM',
				coinMinimalDenom: 'uatom',
				coinDecimals: 6,
			},
			amount: '1',
		};
		const tokenOutCurrency = {
			coinDenom: 'OSMO',
			coinMinimalDenom: 'uosmo',
			coinDecimals: 6,
		};

		const queryPool = queriesStore
			.get(chainStore.current.chainId)
			.osmosis.queryGammPools.getObservableQueryPool(poolId);
		await queryPool.waitFreshResponse();
		const estimated = queryPool.pool!.estimateSwapExactAmountIn(tokenIn, tokenOutCurrency);

		const added = new IntPretty(estimated.slippage.toDec().sub(new Dec('0.01'))).locale(false).maxDecimals(4);

		expect(estimated.slippage.toDec().gt(new Dec(0))).toBeTruthy();
		expect(added.toDec().gt(new Dec(0))).toBeTruthy();

		await expect(
			new Promise<any>((resolve, reject) => {
				account.osmosis
					.sendSwapExactAmountInMsg(poolId, tokenIn, tokenOutCurrency, added.toString(), '', tx => {
						resolve(tx);
					})
					.catch(reject);
			})
		).rejects.not.toBeNull();
	});
});
