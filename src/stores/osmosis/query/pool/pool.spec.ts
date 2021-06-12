import { initLocalnet, RootStore, waitAccountLoaded } from '../../../test-env';
import { Dec } from '@keplr-wallet/unit';

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

		// And prepare the pool
		await new Promise<any>(resolve => {
			account.osmosis.sendCreatePoolMsg(
				'2.5',
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

	test('Query pool', async () => {
		const queryPools = queriesStore.get(chainStore.current.chainId).osmosis.queryGammPools;

		const query = queryPools.getObservableQueryPool('1');
		await query.waitFreshResponse();

		const pool = query.pool!;
		expect(pool.swapFee.toDec().equals(new Dec('2.5'))).toBeTruthy();
		expect(pool.exitFee.toDec().equals(new Dec('0'))).toBeTruthy();
		expect(pool.totalShare.toDec().equals(new Dec('100'))).toBeTruthy();
		// Weight는 만들어질 때 체인 상에서 값이 크게 변환된다. 그래서 여기서 알기 힘들다.
		// expect(pool.totalWeight.toDec().equals(new Dec('600'))).toBeTruthy();

		expect(pool.poolAssets[0].amount.toString()).toBe('100.000000 ATOM');
		expect(pool.poolAssets[1].amount.toString()).toBe('100.000000 FOO');
		expect(pool.poolAssets[2].amount.toString()).toBe('100.000000 OSMO');
	});
});
