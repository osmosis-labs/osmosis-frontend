import { initLocalnet, RootStore, waitAccountLoaded } from '../../../test-env';

describe('Test Osmosis Total Pools Query', () => {
	let { chainStore, queriesStore, accountStore } = new RootStore();

	beforeAll(async () => {
		jest.setTimeout(60000);

		// Init new localnet per test
		await initLocalnet();

		const stores = new RootStore();
		chainStore = stores.chainStore;
		queriesStore = stores.queriesStore;
		accountStore = stores.accountStore;
	});

	test('Query total pools with 0 pool', async () => {
		const queryNumPools = queriesStore.get(chainStore.current.chainId).osmosis.queryGammNumPools;

		await queryNumPools.waitFreshResponse();

		expect(queryNumPools.numPools).toBe(0);
	});

	test('Query total pools', async () => {
		const account = accountStore.getAccount(chainStore.current.chainId);
		account.broadcastMode = 'block';
		await waitAccountLoaded(account);

		// And prepare the 3 pools
		for (let i = 0; i < 3; i++) {
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

		const queryNumPools = queriesStore.get(chainStore.current.chainId).osmosis.queryGammNumPools;

		await queryNumPools.waitFreshResponse();

		expect(queryNumPools.numPools).toBe(3);
	});
});
