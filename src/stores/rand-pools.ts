import { createTestStore, waitAccountLoaded } from './test-env';

const stores = createTestStore();

(async () => {
	const chainInfo = stores.chainStore.current;
	const account = stores.accountStore.getAccount(chainInfo.chainId);

	await waitAccountLoaded(account);

	for (let i = 0; i < 10; i++) {
		const numPoolAssets = 1 + Math.ceil(Math.random() * 3);
		const loop: number[] = [];
		if (i !== 0) {
			for (let i = 0; i < numPoolAssets; i++) {
				loop.push(i);
			}
		} else {
			loop.push(0, 1, 2, 3);
		}

		const assets = loop.map(i => {
			return {
				weight: (Math.floor(Math.random() * 200) + 1).toString(),
				token: {
					currency: chainInfo.currencies[i],
					amount: (Math.floor(Math.random() * 200) + 1).toString(),
				},
			};
		});

		await new Promise(resolve => {
			account.osmosis.sendCreatePoolMsg(Math.random().toString(), assets, '', resolve);
		});
	}
})();
