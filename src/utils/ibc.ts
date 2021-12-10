import { Hash } from '@keplr-wallet/crypto';
import { AccountStore, QueriesStore, WalletStatus } from '@keplr-wallet/stores';
import { Currency, IBCCurrency } from '@keplr-wallet/types';
import { Buffer } from 'buffer';
import _ from 'lodash';
import { IBCAssetInfos } from 'src/config';
import { ChainStore } from 'src/stores/chain';
import { AccountWithCosmosAndOsmosis } from 'src/stores/osmosis/account';
import { QueriesWithCosmosAndOsmosis } from 'src/stores/osmosis/query';

// TODO: IBC minimal denom을 만들어주는 api를 케플러 패키지에 넣는 것도 좋을듯...
export function makeIBCMinimalDenom(sourceChannelId: string, coinMinimalDenom: string): string {
	return (
		'ibc/' +
		Buffer.from(Hash.sha256(Buffer.from(`transfer/${sourceChannelId}/${coinMinimalDenom}`)))
			.toString('hex')
			.toUpperCase()
	);
}

export function getIbcBalances(
	currencies: Currency[],
	chainStore: ChainStore,
	accountStore: AccountStore<AccountWithCosmosAndOsmosis>,
	queriesStore: QueriesStore<QueriesWithCosmosAndOsmosis>
) {
	// https://stackoverflow.com/a/46700791/1633985
	function filter<T>(list: (T | null)[]): T[] {
		return _.filter(list) as T[];
	}
	return filter(
		currencies.map(currency => {
			const channelInfo = _.find(
				IBCAssetInfos,
				channelInfo =>
					currency.coinDenom ==
					chainStore
						.getChain(channelInfo.counterpartyChainId)
						.currencies.find(cur => cur.coinMinimalDenom === channelInfo.coinMinimalDenom)?.coinDenom
			);
			if (!channelInfo) {
				return null; // console.debug('Not an IBC asset:', currency);
			}
			const chainInfo = chainStore.getChain(channelInfo.counterpartyChainId);
			const counterpartyAccount = accountStore.getAccount(channelInfo.counterpartyChainId);

			const originCurrency = chainInfo.currencies.find(
				cur => cur.coinMinimalDenom === channelInfo.coinMinimalDenom
			) as Currency;
			if (!originCurrency) {
				console.error('no originCurrency:', currency);
				return null;
			}
			const balance = queriesStore
				.get(channelInfo.counterpartyChainId)
				.queryBalances.getQueryBech32Address(counterpartyAccount.bech32Address)
				.getBalanceFromCurrency(originCurrency);
			// console.log(
			// 	currency.coinDenom,
			// 	balance.toDec().toString(),
			// 	channelInfo,
			// 	originCurrency,
			// 	(currency as IBCCurrency).originCurrency
			// );

			return {
				accInitialized: counterpartyAccount.walletStatus !== WalletStatus.NotInit,
				initAcc: () => counterpartyAccount.init(),
				channelInfo,
				chainInfo,
				balance,
				sourceChannelId: channelInfo.sourceChannelId,
				destChannelId: channelInfo.destChannelId,
				isUnstable: channelInfo.isUnstable,
			};
		})
	);
}
