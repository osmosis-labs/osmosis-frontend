import { createTestStore, waitAccountLoaded } from './test-env';

const stores = createTestStore();

(async () => {
	const chainInfo = stores.chainStore.current;
	const account = stores.accountStore.getAccount(chainInfo.chainId);

	await waitAccountLoaded(account);

	for (let i = 0; i < 10; i++) {
		await new Promise(resolve => {
			account.osmosis.sendCreatePoolMsg(
				Math.random().toString(),
				[
					{
						weight: Math.floor(Math.random() * 200).toString(),
						token: {
							currency: chainInfo.currencies[0],
							amount: Math.floor(Math.random() * 200).toString(),
						},
					},
					{
						weight: Math.floor(Math.random() * 200).toString(),
						token: {
							currency: chainInfo.currencies[1],
							amount: Math.floor(Math.random() * 200).toString(),
						},
					},
					{
						weight: Math.floor(Math.random() * 200).toString(),
						token: {
							currency: chainInfo.currencies[2],
							amount: Math.floor(Math.random() * 200).toString(),
						},
					},
				],
				'',
				resolve
			);
		});
	}
})();
