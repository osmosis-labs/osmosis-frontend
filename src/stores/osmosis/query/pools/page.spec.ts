import { initLocalnet, RootStore, waitAccountLoaded } from '../../../test-env';

describe('Test Osmosis Pools Pagenation Query', () => {
	let { chainStore, queriesStore } = new RootStore();

	beforeAll(async () => {
		jest.setTimeout(60000);

		// Init new localnet per test
		await initLocalnet();

		const stores = new RootStore();
		chainStore = stores.chainStore;
		queriesStore = stores.queriesStore;
		const accountStore = stores.accountStore;

		const account = accountStore.getAccount(chainStore.current.chainId);
		account.broadcastMode = 'block';
		await waitAccountLoaded(account);

		// And prepare the 10 pools
		for (let i = 0; i < 7; i++) {
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
		}
	});

	test('Query 3 items at page 1', async () => {
		const queryPools = queriesStore.get(chainStore.current.chainId).osmosis.queryGammPools;
		await queryPools.waitFreshResponse();

		const pools = queryPools.getPools(3, 1);

		expect(pools.length).toBe(3);

		for (let i = 0; i < pools.length; i++) {
			const pool = pools[i];

			expect(pool.id).toBe((i + 1).toString());
		}
	});

	test('Query 3 items at page 2', async () => {
		const queryPools = queriesStore.get(chainStore.current.chainId).osmosis.queryGammPools;
		await queryPools.waitFreshResponse();

		const pools = queryPools.getPools(3, 2);

		expect(pools.length).toBe(3);

		for (let i = 0; i < pools.length; i++) {
			const pool = pools[i];

			expect(pool.id).toBe((i + 4).toString());
		}
	});

	test('Query 3 items at page 3, but it should have only 1 item', async () => {
		const queryPools = queriesStore.get(chainStore.current.chainId).osmosis.queryGammPools;
		await queryPools.waitFreshResponse();

		const pools = queryPools.getPools(3, 3);

		expect(pools.length).toBe(1);

		expect(pools[0].id).toBe((7).toString());
	});
});
