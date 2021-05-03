import { deepContained, getEventFromTx, initLocalnet, RootStore, waitAccountLoaded } from '../../test-env';
import { Dec, DecUtils } from '@keplr-wallet/unit';

describe('Test Osmosis Join Pool Tx', () => {
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

	test('Join Pool with no max slippage', async () => {
		const account = accountStore.getAccount(chainStore.current.chainId);

		const poolId = '1';
		const shareOutAmount: string = '1';

		const queryPools = queriesStore.get(chainStore.current.chainId).osmosis.queryGammPools;
		await queryPools.waitFreshResponse();
		const estimated = queryPools.pools
			.find(pool => pool.id === poolId)!
			.estimateJoinSwap(shareOutAmount, account.msgOpts.joinPool.shareCoinDecimals);

		const tx = await new Promise<any>(resolve => {
			account.osmosis.sendJoinPoolMsg(poolId, shareOutAmount, '0', '', tx => {
				resolve(tx);
			});
		});

		deepContained(
			{
				type: 'message',
				attributes: [
					{ key: 'action', value: 'join_pool' },
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
					{
						key: 'amount',
						value: estimated.tokenIns
							.map(tokenIn => {
								const amount = tokenIn
									.toDec()
									.mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals))
									.truncate();

								return amount.toString() + tokenIn.currency.coinMinimalDenom;
							})
							.join(','),
					},
				].concat([
					{
						key: 'amount',
						value: `${new Dec(shareOutAmount)
							.mul(DecUtils.getPrecisionDec(account.msgOpts.joinPool.shareCoinDecimals))
							.truncate()
							.toString()}gamm/pool/${poolId}`,
					},
				]),
			},
			getEventFromTx(tx, 'transfer')
		);
	});

	test('Join Pool with slippage', async () => {
		const account = accountStore.getAccount(chainStore.current.chainId);

		const poolId = '1';
		const shareOutAmount: string = '1';

		const queryPools = queriesStore.get(chainStore.current.chainId).osmosis.queryGammPools;
		await queryPools.waitFreshResponse();
		const estimated = queryPools.pools
			.find(pool => pool.id === poolId)!
			.estimateJoinSwap(shareOutAmount, account.msgOpts.joinPool.shareCoinDecimals);

		const tx = await new Promise<any>(resolve => {
			account.osmosis.sendJoinPoolMsg(poolId, shareOutAmount, '0.1', '', tx => {
				resolve(tx);
			});
		});

		deepContained(
			{
				type: 'message',
				attributes: [
					{ key: 'action', value: 'join_pool' },
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
					{
						key: 'amount',
						value: estimated.tokenIns
							.map(tokenIn => {
								const amount = tokenIn
									.toDec()
									.mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals))
									.truncate();

								return amount.toString() + tokenIn.currency.coinMinimalDenom;
							})
							.join(','),
					},
				].concat([
					{
						key: 'amount',
						value: `${new Dec(shareOutAmount)
							.mul(DecUtils.getPrecisionDec(account.msgOpts.joinPool.shareCoinDecimals))
							.truncate()
							.toString()}gamm/pool/${poolId}`,
					},
				]),
			},
			getEventFromTx(tx, 'transfer')
		);
	});
});
