import { deepContained, getEventFromTx, initLocalnet, RootStore, waitAccountLoaded } from '../../test-env';

describe('Test Osmosis Exit Pool Tx', () => {
	let { chainStore, accountStore } = new RootStore();

	beforeAll(async () => {
		jest.setTimeout(60000);
	});

	beforeEach(async () => {
		await initLocalnet();

		const stores = new RootStore();
		chainStore = stores.chainStore;
		accountStore = stores.accountStore;

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

	test('ExitPool should fail with 0 share in amount', async () => {
		const account = accountStore.getAccount(chainStore.current.chainId);

		await expect(account.osmosis.sendExitPoolMsg('1', '0')).rejects.not.toBeNull();
	});

	test('ExitPool with 50 share in amount without slippage', async () => {
		const account = accountStore.getAccount(chainStore.current.chainId);

		// Share는 최초로 100개가 발행된다 그러므로 여기서 50개를 exit하는 건 성공한다.
		await new Promise<any>(resolve => {
			account.osmosis.sendExitPoolMsg('1', '50', '0', '', tx => {
				resolve(tx);
			});
		});
	});

	test('ExitPool with 50 share in amount with slippage', async () => {
		const account = accountStore.getAccount(chainStore.current.chainId);

		// Share는 최초로 100개가 발행된다 그러므로 여기서 50개를 exit하는 건 성공한다.
		await new Promise<any>(resolve => {
			account.osmosis.sendExitPoolMsg('1', '50', '1', '', tx => {
				resolve(tx);
			});
		});
	});

	test('ExitPool should fail with more max share in amount', async () => {
		const account = accountStore.getAccount(chainStore.current.chainId);

		// Share는 최초로 100개가 발행된다 그러므로 여기서 100.01개를 exit하는 건 실패한다.
		await expect(account.osmosis.sendExitPoolMsg('1', '100.01', '1')).rejects.not.toBeNull();
	});
});
