import {
	ChainGetter,
	QueriesStore,
	MsgOpt,
	AccountSetBase,
	CosmosMsgOpts,
	HasCosmosQueries,
	AccountWithCosmos,
	QueriesSetBase,
	AccountSetOpts,
	CosmosAccount,
	HasCosmosAccount,
	HasCosmwasmAccount,
	HasCosmwasmQueries,
	CosmwasmAccount,
	AccountWithCosmwasm,
	CosmwasmMsgOpts,
} from '@keplr-wallet/stores';
import { Coin, Dec, DecUtils } from '@keplr-wallet/unit';
import { Currency, KeplrSignOptions } from '@keplr-wallet/types';
import { DeepReadonly } from 'utility-types';
import { HasOsmosisQueries } from '../query';
import deepmerge from 'deepmerge';
import { QueriedPoolBase } from '../query/pool';
import { osmosis } from '../../../proto';
import Long from 'long';
import { StdFee } from '@cosmjs/launchpad';

export interface HasOsmosisAccount {
	osmosis: DeepReadonly<OsmosisAccount>;
}

export interface OsmosisMsgOpts {
	readonly createPool: MsgOpt;
	readonly joinPool: MsgOpt & {
		shareCoinDecimals: number;
	};
	readonly joinSwapExternAmountIn: MsgOpt & {
		shareCoinDecimals: number;
	};
	readonly exitPool: MsgOpt & {
		shareCoinDecimals: number;
	};
	readonly swapExactAmountIn: MsgOpt;
	readonly swapExactAmountOut: MsgOpt;
	readonly lockTokens: MsgOpt;
	readonly superfluidDelegate: MsgOpt;
	readonly lockAndSuperfluidDelegate: MsgOpt;
	readonly beginUnlocking: MsgOpt;
	readonly superfluidUndelegate: MsgOpt;
	readonly superfluidUnbondLock: MsgOpt;
	readonly unlockPeriodLock: MsgOpt;
}

export class AccountWithCosmosAndOsmosis
	extends AccountSetBase<
		CosmosMsgOpts & OsmosisMsgOpts & CosmwasmMsgOpts,
		HasCosmosQueries & HasOsmosisQueries & HasCosmwasmQueries
	>
	implements HasCosmosAccount, HasOsmosisAccount, HasCosmwasmAccount {
	public readonly cosmos: DeepReadonly<CosmosAccount>;
	public readonly osmosis: DeepReadonly<OsmosisAccount>;
	public readonly cosmwasm: DeepReadonly<CosmwasmAccount>;

	static readonly defaultMsgOpts: CosmosMsgOpts & OsmosisMsgOpts & CosmwasmMsgOpts = deepmerge(
		AccountWithCosmos.defaultMsgOpts,
		deepmerge(AccountWithCosmwasm.defaultMsgOpts, {
			createPool: {
				type: 'osmosis/gamm/create-balancer-pool',
				gas: 350000,
			},
			joinPool: {
				type: 'osmosis/gamm/join-pool',
				gas: 240000,
				shareCoinDecimals: 18,
			},
			joinSwapExternAmountIn: {
				type: 'osmosis/gamm/join-swap-extern-amount-in',
				gas: 140000,
				shareCoinDecimals: 18,
			},
			exitPool: {
				type: 'osmosis/gamm/exit-pool',
				gas: 140000,
				shareCoinDecimals: 18,
			},
			swapExactAmountIn: {
				type: 'osmosis/gamm/swap-exact-amount-in',
				gas: 250000,
			},
			swapExactAmountOut: {
				type: 'osmosis/gamm/swap-exact-amount-out',
				gas: 250000,
			},
			lockTokens: {
				type: 'osmosis/lockup/lock-tokens',
				gas: 450000,
			},
			superfluidDelegate: {
				type: 'osmosis/superfluid-delegate',
				gas: 500000,
			},
			lockAndSuperfluidDelegate: {
				type: 'osmosis/lock-and-superfluid-delegate',
				gas: 500000,
			},
			beginUnlocking: {
				type: 'osmosis/lockup/begin-unlock-period-lock',
				// Gas per msg
				gas: 140000,
			},
			unlockPeriodLock: {
				type: 'osmosis/lockup/unlock-period-lock',
				// Gas per msg
				gas: 140000,
			},
			superfluidUndelegate: {
				type: 'osmosis/superfluid-undelegate',
				gas: 300000,
			},
			superfluidUnbondLock: {
				type: 'osmosis/superfluid-unbond-lock',
				// Gas per msg
				gas: 300000,
			},
		})
	);

	constructor(
		protected readonly eventListener: {
			addEventListener: (type: string, fn: () => unknown) => void;
			removeEventListener: (type: string, fn: () => unknown) => void;
		},
		protected readonly chainGetter: ChainGetter,
		protected readonly chainId: string,
		protected readonly queriesStore: QueriesStore<
			QueriesSetBase & HasCosmosQueries & HasOsmosisQueries & HasCosmwasmQueries
		>,
		protected readonly opts: AccountSetOpts<CosmosMsgOpts & OsmosisMsgOpts & CosmwasmMsgOpts>
	) {
		super(eventListener, chainGetter, chainId, queriesStore, opts);

		this.cosmos = new CosmosAccount(
			this as AccountSetBase<CosmosMsgOpts, HasCosmosQueries>,
			chainGetter,
			chainId,
			queriesStore
		);
		this.osmosis = new OsmosisAccount(
			this as AccountSetBase<OsmosisMsgOpts, HasOsmosisQueries>,
			chainGetter,
			chainId,
			queriesStore
		);
		this.cosmwasm = new CosmwasmAccount(
			this as AccountSetBase<CosmwasmMsgOpts, HasCosmwasmQueries>,
			chainGetter,
			chainId,
			queriesStore
		);
	}
}

export class OsmosisAccount {
	constructor(
		protected readonly base: AccountSetBase<OsmosisMsgOpts, HasOsmosisQueries>,
		protected readonly chainGetter: ChainGetter,
		protected readonly chainId: string,
		protected readonly queriesStore: QueriesStore<QueriesSetBase & HasOsmosisQueries>
	) {}

	protected changeDecStringToProtoBz(decStr: string): string {
		let r = decStr;
		while (r.length >= 2 && (r.startsWith('.') || r.startsWith('0'))) {
			r = r.slice(1);
		}

		return r;
	}

	/**
	 *
	 * @param swapFee The swap fee of the pool. Should set as the percentage. (Ex. 10% -> 10)
	 * @param assets Assets that will be provided pool initially. Token can be parsed as to primitive by convenience.
	 */
	async sendCreatePoolMsg(
		swapFee: string,
		assets: {
			// Int
			weight: string;
			// Ex) 10 atom.
			token: {
				currency: Currency;
				amount: string;
			};
		}[],
		memo: string = '',
		onFulfill?: (tx: any) => void
	) {
		const poolParams = {
			swapFee: new Dec(swapFee).quo(DecUtils.getPrecisionDec(2)).toString(),
			exitFee: new Dec(0).toString(),
		};

		const poolAssets: {
			weight: string;
			token: {
				denom: string;
				amount: string;
			};
		}[] = [];

		for (const asset of assets) {
			poolAssets.push({
				weight: asset.weight,
				token: {
					denom: asset.token.currency.coinMinimalDenom,
					amount: new Dec(asset.token.amount)
						.mul(DecUtils.getPrecisionDec(asset.token.currency.coinDecimals))
						.truncate()
						.toString(),
				},
			});
		}

		const msg = {
			type: this.base.msgOpts.createPool.type,
			value: {
				sender: this.base.bech32Address,
				poolParams,
				poolAssets,
				future_pool_governor: '24h',
			},
		};

		await this.base.sendMsgs(
			'createPool',
			{
				aminoMsgs: [msg],
				protoMsgs: [
					{
						type_url: '/osmosis.gamm.v1beta1.MsgCreateBalancerPool',
						value: osmosis.gamm.v1beta1.MsgCreateBalancerPool.encode({
							sender: msg.value.sender,
							poolParams: {
								swapFee: this.changeDecStringToProtoBz(msg.value.poolParams.swapFee),
								exitFee: this.changeDecStringToProtoBz(msg.value.poolParams.exitFee),
							},
							poolAssets: msg.value.poolAssets,
							futurePoolGovernor: msg.value.future_pool_governor,
						}).finish(),
					},
				],
			},
			memo,
			{
				amount: [],
				gas: this.base.msgOpts.createPool.gas.toString(),
			},
			undefined,
			tx => {
				if (tx.code == null || tx.code === 0) {
					// TODO: Refresh the pools list.

					// Refresh the balances
					const queries = this.queriesStore.get(this.chainId);
					queries.queryBalances.getQueryBech32Address(this.base.bech32Address).balances.forEach(bal => {
						if (assets.find(asset => asset.token.currency.coinMinimalDenom === bal.currency.coinMinimalDenom)) {
							bal.fetch();
						}
					});
				}

				if (onFulfill) {
					onFulfill(tx);
				}
			}
		);
	}

	async sendJoinPoolMsg(
		poolId: string,
		shareOutAmount: string,
		maxSlippage: string = '0',
		memo: string = '',
		onFulfill?: (tx: any) => void
	) {
		const queries = this.queries;

		await this.base.sendMsgs(
			'joinPool',
			async () => {
				const queryPool = queries.osmosis.queryGammPools.getObservableQueryPool(poolId);
				await queryPool.waitFreshResponse();

				const pool = queryPool.pool;
				if (!pool) {
					throw new Error('Unknown pool');
				}

				const maxSlippageDec = new Dec(maxSlippage).quo(DecUtils.getPrecisionDec(2));

				const estimated = pool.estimateJoinSwap(shareOutAmount, this.base.msgOpts.joinPool.shareCoinDecimals);

				const tokenInMaxs = maxSlippageDec.equals(new Dec(0))
					? null
					: estimated.tokenIns.map(tokenIn => {
							// TODO: Add the method like toPrimitiveCoin()?
							const dec = tokenIn.toDec();
							const amount = dec
								.mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals))
								.mul(new Dec(1).add(maxSlippageDec))
								.truncate();

							return {
								denom: tokenIn.currency.coinMinimalDenom,
								amount: amount.toString(),
							};
					  });

				const msg = {
					type: this.base.msgOpts.joinPool.type,
					value: {
						sender: this.base.bech32Address,
						poolId,
						shareOutAmount: new Dec(shareOutAmount)
							.mul(DecUtils.getPrecisionDec(this.base.msgOpts.joinPool.shareCoinDecimals))
							.truncate()
							.toString(),
						tokenInMaxs,
					},
				};

				return {
					aminoMsgs: [msg],
					protoMsgs: [
						{
							type_url: '/osmosis.gamm.v1beta1.MsgJoinPool',
							value: osmosis.gamm.v1beta1.MsgJoinPool.encode({
								sender: msg.value.sender,
								poolId: Long.fromString(msg.value.poolId),
								shareOutAmount: msg.value.shareOutAmount,
								tokenInMaxs: msg.value.tokenInMaxs,
							}).finish(),
						},
					],
				};
			},
			memo,
			{
				amount: [],
				gas: this.base.msgOpts.joinPool.gas.toString(),
			},
			undefined,
			tx => {
				if (tx.code == null || tx.code === 0) {
					// TODO: Refresh the pools list.

					// Refresh the balances
					const queries = this.queriesStore.get(this.chainId);
					queries.queryBalances.getQueryBech32Address(this.base.bech32Address).balances.forEach(bal => {
						// TODO: Explicitly refresh the share expected to be minted and provided to the pool.
						bal.fetch();
					});

					queries.osmosis.queryGammPools.getObservableQueryPool(poolId).fetch();
				}

				if (onFulfill) {
					onFulfill(tx);
				}
			}
		);
	}

	async sendJoinSwapExternAmountInMsg(
		poolId: string,
		tokenIn: { currency: Currency; amount: string },
		maxSlippage: string = '0',
		memo: string = '',
		onFulfill?: (tx: any) => void
	) {
		const queries = this.queries;

		await this.base.sendMsgs(
			'joinPool',
			async () => {
				const queryPool = queries.osmosis.queryGammPools.getObservableQueryPool(poolId);
				await queryPool.waitFreshResponse();

				const pool = queryPool.pool;
				if (!pool) {
					throw new Error('Unknown pool');
				}

				const estimated = pool.estimateJoinSwapExternAmountIn(tokenIn, this.base.msgOpts.joinPool.shareCoinDecimals);

				const amount = new Dec(tokenIn.amount).mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals)).truncate();
				const coin = new Coin(tokenIn.currency.coinMinimalDenom, amount);

				const outRatio = new Dec(1).sub(new Dec(maxSlippage).quo(new Dec(100)));
				const shareOutMinAmount = estimated.shareOutAmountRaw
					.toDec()
					.mul(outRatio)
					.truncate();

				const msg = {
					type: this.base.msgOpts.joinSwapExternAmountIn.type,
					value: {
						sender: this.base.bech32Address,
						poolId,
						tokenIn: {
							denom: coin.denom,
							amount: coin.amount.toString(),
						},
						shareOutMinAmount: shareOutMinAmount.toString(),
					},
				};

				return {
					aminoMsgs: [msg],
					protoMsgs: [
						{
							type_url: '/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn',
							value: osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn.encode({
								sender: msg.value.sender,
								poolId: Long.fromString(msg.value.poolId),
								tokenIn: msg.value.tokenIn,
								shareOutMinAmount: msg.value.shareOutMinAmount,
							}).finish(),
						},
					],
				};
			},
			memo,
			{
				amount: [],
				gas: this.base.msgOpts.joinPool.gas.toString(),
			},
			undefined,
			tx => {
				if (tx.code == null || tx.code === 0) {
					// TODO: Refresh the pools list.

					// Refresh the balances
					const queries = this.queriesStore.get(this.chainId);
					queries.queryBalances.getQueryBech32Address(this.base.bech32Address).balances.forEach(bal => {
						// TODO: Explicitly refresh the share expected to be minted and provided to the pool.
						bal.fetch();
					});

					queries.osmosis.queryGammPools.getObservableQueryPool(poolId).fetch();
				}

				if (onFulfill) {
					onFulfill(tx);
				}
			}
		);
	}

	async sendMultihopSwapExactAmountInMsg(
		routes: {
			poolId: string;
			tokenOutCurrency: Currency;
		}[],
		tokenIn: { currency: Currency; amount: string },
		maxSlippage: string = '0',
		memo: string = '',
		stdFee: Partial<StdFee> = {},
		signOptions?: KeplrSignOptions,
		onFulfill?: (tx: any) => void
	) {
		const queries = this.queries;

		await this.base.sendMsgs(
			'swapExactAmountIn',
			async () => {
				const pools: QueriedPoolBase[] = [];
				for (const route of routes) {
					const queryPool = queries.osmosis.queryGammPools.getObservableQueryPool(route.poolId);
					await queryPool.waitFreshResponse();

					const pool = queryPool.pool;
					if (!pool) {
						throw new Error('Unknown pool');
					}

					pools.push(pool);
				}

				const msg = QueriedPoolBase.makeMultihopSwapExactAmountInMsg(
					this.base.msgOpts.swapExactAmountIn,
					this.base.bech32Address,
					tokenIn,
					pools.map((pool, i) => {
						return {
							pool,
							tokenOutCurrency: routes[i].tokenOutCurrency,
						};
					}),
					maxSlippage
				);

				return {
					aminoMsgs: [msg],
					protoMsgs: [
						{
							type_url: '/osmosis.gamm.v1beta1.MsgSwapExactAmountIn',
							value: osmosis.gamm.v1beta1.MsgSwapExactAmountIn.encode({
								sender: msg.value.sender,
								routes: msg.value.routes.map(route => {
									return {
										poolId: Long.fromString(route.poolId),
										tokenOutDenom: route.tokenOutDenom,
									};
								}),
								tokenIn: msg.value.tokenIn,
								tokenOutMinAmount: msg.value.tokenOutMinAmount,
							}).finish(),
						},
					],
				};
			},
			memo,
			{
				amount: stdFee.amount ?? [],
				gas: stdFee.gas ?? (this.base.msgOpts.swapExactAmountIn.gas * Math.max(routes.length, 1)).toString(),
			},
			signOptions,
			tx => {
				if (tx.code == null || tx.code === 0) {
					// TODO: Refresh the pools list.

					// Refresh the balances
					const queries = this.queriesStore.get(this.chainId);
					queries.queryBalances.getQueryBech32Address(this.base.bech32Address).balances.forEach(bal => {
						if (
							bal.currency.coinMinimalDenom === tokenIn.currency.coinMinimalDenom ||
							routes.find(r => r.tokenOutCurrency.coinMinimalDenom === bal.currency.coinMinimalDenom)
						) {
							bal.fetch();
						}
					});

					// Refresh the pools
					for (const route of routes) {
						queries.osmosis.queryGammPools.getObservableQueryPool(route.poolId).fetch();
					}
				}

				if (onFulfill) {
					onFulfill(tx);
				}
			}
		);
	}

	async sendSwapExactAmountInMsg(
		poolId: string,
		tokenIn: { currency: Currency; amount: string },
		tokenOutCurrency: Currency,
		maxSlippage: string = '0',
		memo: string = '',
		stdFee: Partial<StdFee> = {},
		signOptions?: KeplrSignOptions,
		onFulfill?: (tx: any) => void
	) {
		const queries = this.queries;

		await this.base.sendMsgs(
			'swapExactAmountIn',
			async () => {
				const queryPool = queries.osmosis.queryGammPools.getObservableQueryPool(poolId);
				await queryPool.waitFreshResponse();

				const pool = queryPool.pool;
				if (!pool) {
					throw new Error('Unknown pool');
				}

				const msg = pool.makeSwapExactAmountInMsg(
					this.base.msgOpts.swapExactAmountIn,
					this.base.bech32Address,
					tokenIn,
					tokenOutCurrency,
					maxSlippage
				);

				return {
					aminoMsgs: [msg],
					protoMsgs: [
						{
							type_url: '/osmosis.gamm.v1beta1.MsgSwapExactAmountIn',
							value: osmosis.gamm.v1beta1.MsgSwapExactAmountIn.encode({
								sender: msg.value.sender,
								routes: msg.value.routes.map((route: { poolId: string; tokenOutDenom: string }) => {
									return {
										poolId: Long.fromString(route.poolId),
										tokenOutDenom: route.tokenOutDenom,
									};
								}),
								tokenIn: msg.value.tokenIn,
								tokenOutMinAmount: msg.value.tokenOutMinAmount,
							}).finish(),
						},
					],
				};
			},
			memo,
			{
				amount: stdFee.amount ?? [],
				gas: stdFee.gas ?? this.base.msgOpts.swapExactAmountIn.gas.toString(),
			},
			signOptions,
			tx => {
				if (tx.code == null || tx.code === 0) {
					// TODO: Refresh the pools list.

					// Refresh the balances
					const queries = this.queriesStore.get(this.chainId);
					queries.queryBalances.getQueryBech32Address(this.base.bech32Address).balances.forEach(bal => {
						if (
							bal.currency.coinMinimalDenom === tokenIn.currency.coinMinimalDenom ||
							bal.currency.coinMinimalDenom === tokenOutCurrency.coinMinimalDenom
						) {
							bal.fetch();
						}
					});

					// Refresh the pool
					queries.osmosis.queryGammPools.getObservableQueryPool(poolId).fetch();
				}

				if (onFulfill) {
					onFulfill(tx);
				}
			}
		);
	}

	async sendSwapExactAmountOutMsg(
		poolId: string,
		tokenInCurrency: Currency,
		tokenOut: { currency: Currency; amount: string },
		maxSlippage: string = '0',
		memo: string = '',
		onFulfill?: (tx: any) => void
	) {
		const queries = this.queries;

		await this.base.sendMsgs(
			'swapExactAmountOut',
			async () => {
				const queryPool = queries.osmosis.queryGammPools.getObservableQueryPool(poolId);
				await queryPool.waitFreshResponse();

				const pool = queryPool.pool;
				if (!pool) {
					throw new Error('Unknown pool');
				}

				const msg = pool.makeSwapExactAmountOutMsg(
					this.base.msgOpts.swapExactAmountOut,
					this.base.bech32Address,
					tokenInCurrency,
					tokenOut,
					maxSlippage
				);

				return {
					aminoMsgs: [msg],
					protoMsgs: [
						{
							type_url: '/osmosis.gamm.v1beta1.MsgSwapExactAmountOut',
							value: osmosis.gamm.v1beta1.MsgSwapExactAmountOut.encode({
								sender: msg.value.sender,
								routes: msg.value.routes.map((route: { poolId: string; tokenInDenom: string }) => {
									return {
										poolId: Long.fromString(route.poolId),
										tokenInDenom: route.tokenInDenom,
									};
								}),
								tokenOut: msg.value.tokenOut,
								tokenInMaxAmount: msg.value.tokenInMaxAmount,
							}).finish(),
						},
					],
				};
			},
			memo,
			{
				amount: [],
				gas: this.base.msgOpts.swapExactAmountIn.gas.toString(),
			},
			undefined,
			tx => {
				if (tx.code == null || tx.code === 0) {
					// TODO: Refresh the pools list.

					// Refresh the balances
					const queries = this.queriesStore.get(this.chainId);
					queries.queryBalances.getQueryBech32Address(this.base.bech32Address).balances.forEach(bal => {
						if (
							bal.currency.coinMinimalDenom === tokenInCurrency.coinMinimalDenom ||
							bal.currency.coinMinimalDenom === tokenOut.currency.coinMinimalDenom
						) {
							bal.fetch();
						}
					});
				}

				if (onFulfill) {
					onFulfill(tx);
				}
			}
		);
	}

	async sendExitPoolMsg(
		poolId: string,
		shareInAmount: string,
		maxSlippage: string = '0',
		memo: string = '',
		onFulfill?: (tx: any) => void
	) {
		const queries = this.queries;

		await this.base.sendMsgs(
			'exitPool',
			async () => {
				const queryPool = queries.osmosis.queryGammPools.getObservableQueryPool(poolId);
				await queryPool.waitFreshResponse();

				const pool = queryPool.pool;
				if (!pool) {
					throw new Error('Unknown pool');
				}

				const estimated = pool.estimateExitSwap(shareInAmount, this.base.msgOpts.exitPool.shareCoinDecimals);

				const maxSlippageDec = new Dec(maxSlippage).quo(DecUtils.getPrecisionDec(2));

				const tokenOutMins = maxSlippageDec.equals(new Dec(0))
					? null
					: estimated.tokenOuts.map(tokenOut => {
							return {
								denom: tokenOut.currency.coinMinimalDenom,
								amount: tokenOut
									.toDec()
									.mul(new Dec(1).sub(maxSlippageDec))
									.mul(DecUtils.getPrecisionDec(tokenOut.currency.coinDecimals))
									.truncate()
									.toString(),
							};
					  });

				const msg = {
					type: this.base.msgOpts.exitPool.type,
					value: {
						sender: this.base.bech32Address,
						poolId: pool.id,
						shareInAmount: new Dec(shareInAmount)
							.mul(DecUtils.getPrecisionDec(this.base.msgOpts.exitPool.shareCoinDecimals))
							.truncate()
							.toString(),
						tokenOutMins,
					},
				};

				return {
					aminoMsgs: [msg],
					protoMsgs: [
						{
							type_url: '/osmosis.gamm.v1beta1.MsgExitPool',
							value: osmosis.gamm.v1beta1.MsgExitPool.encode({
								sender: msg.value.sender,
								poolId: Long.fromString(msg.value.poolId),
								shareInAmount: msg.value.shareInAmount,
								tokenOutMins: msg.value.tokenOutMins,
							}).finish(),
						},
					],
				};
			},
			memo,
			{
				amount: [],
				gas: this.base.msgOpts.exitPool.gas.toString(),
			},
			undefined,
			tx => {
				if (tx.code == null || tx.code === 0) {
					// Refresh the balances
					const queries = this.queriesStore.get(this.chainId);
					queries.queryBalances.getQueryBech32Address(this.base.bech32Address).fetch();

					// Refresh the pool
					queries.osmosis.queryGammPools.getObservableQueryPool(poolId).fetch();
				}

				if (onFulfill) {
					onFulfill(tx);
				}
			}
		);
	}

	/**
	 *
	 * @param duration Duration's unit is expected to be the second.
	 * @param tokens
	 * @param memo
	 * @param onFulfill
	 */
	async sendLockTokensMsg(
		duration: number,
		tokens: {
			currency: Currency;
			amount: string;
		}[],
		memo: string = '',
		onFulfill?: (tx: any) => void
	) {
		const primitiveTokens = tokens.map(token => {
			const amount = new Dec(token.amount).mul(DecUtils.getPrecisionDec(token.currency.coinDecimals)).truncate();

			return {
				amount: amount.toString(),
				denom: token.currency.coinMinimalDenom,
			};
		});

		const msg = {
			type: this.base.msgOpts.lockTokens.type,
			value: {
				owner: this.base.bech32Address,
				// Duration should be encodec as nana sec.
				duration: (duration * 1_000_000_000).toString(),
				coins: primitiveTokens,
			},
		};

		await this.base.sendMsgs(
			'lockTokens',
			{
				aminoMsgs: [msg],
				protoMsgs: [
					{
						type_url: '/osmosis.lockup.MsgLockTokens',
						value: osmosis.lockup.MsgLockTokens.encode({
							owner: msg.value.owner,
							duration: {
								seconds: Long.fromNumber(Math.floor(parseInt(msg.value.duration) / 1_000_000_000)),
								nanos: parseInt(msg.value.duration) % 1_000_000_000,
							},
							coins: msg.value.coins,
						}).finish(),
					},
				],
			},
			memo,
			{
				amount: [],
				gas: this.base.msgOpts.lockTokens.gas.toString(),
			},
			undefined,
			tx => {
				if (tx.code == null || tx.code === 0) {
					// Refresh the balances
					const queries = this.queriesStore.get(this.chainId);
					queries.queryBalances.getQueryBech32Address(this.base.bech32Address).fetch();

					// Refresh the locked coins
					queries.osmosis.queryLockedCoins.get(this.base.bech32Address).fetch();
					queries.osmosis.queryAccountLocked.get(this.base.bech32Address).fetch();

					queries.osmosis.querySuperfluidDelegations.getQuerySuperfluidDelegations(this.base.bech32Address).fetch();
				}

				if (onFulfill) {
					onFulfill(tx);
				}
			}
		);
	}

	async sendSuperfluidDelegate(
		lockIds: string[],
		validatorAddress: string,
		memo: string = '',
		onFulfill?: (tx: any) => void
	) {
		const msgs = lockIds.map(lockId => {
			return {
				type: this.base.msgOpts.superfluidDelegate.type,
				value: {
					sender: this.base.bech32Address,
					lock_id: lockId,
					val_addr: validatorAddress,
				},
			};
		});

		const protoMsgs = msgs.map(msg => {
			return {
				type_url: '/osmosis.superfluid.MsgSuperfluidDelegate',
				value: osmosis.superfluid.MsgSuperfluidDelegate.encode({
					sender: msg.value.sender,
					lockId: Long.fromString(msg.value.lock_id),
					valAddr: msg.value.val_addr,
				}).finish(),
			};
		});

		await this.base.sendMsgs(
			'superfluidDelegate',
			{
				aminoMsgs: msgs,
				protoMsgs,
			},
			memo,
			{
				amount: [],
				gas: this.base.msgOpts.lockAndSuperfluidDelegate.gas.toString(),
			},
			undefined,
			tx => {
				if (tx.code == null || tx.code === 0) {
					// Refresh the balances
					const queries = this.queriesStore.get(this.chainId);
					queries.queryBalances.getQueryBech32Address(this.base.bech32Address).fetch();

					queries.osmosis.querySuperfluidDelegations.getQuerySuperfluidDelegations(this.base.bech32Address).fetch();
				}

				if (onFulfill) {
					onFulfill(tx);
				}
			}
		);
	}

	async sendLockAndSuperfluidDelegateMsg(
		tokens: {
			currency: Currency;
			amount: string;
		}[],
		validatorAddress: string,
		memo: string = '',
		onFulfill?: (tx: any) => void
	) {
		const primitiveTokens = tokens.map(token => {
			const amount = new Dec(token.amount).mul(DecUtils.getPrecisionDec(token.currency.coinDecimals)).truncate();

			return {
				amount: amount.toString(),
				denom: token.currency.coinMinimalDenom,
			};
		});

		const msg = {
			type: this.base.msgOpts.lockAndSuperfluidDelegate.type,
			value: {
				sender: this.base.bech32Address,
				coins: primitiveTokens,
				val_addr: validatorAddress,
			},
		};

		await this.base.sendMsgs(
			'lockAndSuperfluidDelegate',
			{
				aminoMsgs: [msg],
				protoMsgs: [
					{
						type_url: '/osmosis.superfluid.MsgLockAndSuperfluidDelegate',
						value: osmosis.superfluid.MsgLockAndSuperfluidDelegate.encode({
							sender: msg.value.sender,
							coins: msg.value.coins,
							valAddr: msg.value.val_addr,
						}).finish(),
					},
				],
			},
			memo,
			{
				amount: [],
				gas: this.base.msgOpts.lockAndSuperfluidDelegate.gas.toString(),
			},
			undefined,
			tx => {
				if (tx.code == null || tx.code === 0) {
					// Refresh the balances
					const queries = this.queriesStore.get(this.chainId);
					queries.queryBalances.getQueryBech32Address(this.base.bech32Address).fetch();

					// Refresh the locked coins
					queries.osmosis.queryLockedCoins.get(this.base.bech32Address).fetch();
					queries.osmosis.queryAccountLocked.get(this.base.bech32Address).fetch();

					queries.osmosis.querySuperfluidDelegations.getQuerySuperfluidDelegations(this.base.bech32Address).fetch();
				}

				if (onFulfill) {
					onFulfill(tx);
				}
			}
		);
	}

	async sendBeginUnlockingMsg(lockIds: string[], memo: string = '', onFulfill?: (tx: any) => void) {
		const msgs = lockIds.map(lockId => {
			return {
				type: this.base.msgOpts.beginUnlocking.type,
				value: {
					owner: this.base.bech32Address,
					// XXX: 얘는 어째서인지 소문자가 아님 ㅋ;
					ID: lockId,
					coins: [],
				},
			};
		});

		const protoMsgs = msgs.map(msg => {
			return {
				type_url: '/osmosis.lockup.MsgBeginUnlocking',
				value: osmosis.lockup.MsgBeginUnlocking.encode({
					owner: msg.value.owner,
					ID: Long.fromString(msg.value.ID),
				}).finish(),
			};
		});

		await this.base.sendMsgs(
			'beginUnlocking',
			{
				aminoMsgs: msgs,
				protoMsgs,
			},
			memo,
			{
				amount: [],
				gas: (msgs.length * this.base.msgOpts.beginUnlocking.gas).toString(),
			},
			undefined,
			tx => {
				if (tx.code == null || tx.code === 0) {
					// Refresh the balances
					const queries = this.queriesStore.get(this.chainId);
					queries.queryBalances.getQueryBech32Address(this.base.bech32Address).fetch();

					// Refresh the locked coins
					queries.osmosis.queryLockedCoins.get(this.base.bech32Address).fetch();
					queries.osmosis.queryUnlockingCoins.get(this.base.bech32Address).fetch();
					queries.osmosis.queryAccountLocked.get(this.base.bech32Address).fetch();
				}

				if (onFulfill) {
					onFulfill(tx);
				}
			}
		);
	}

	async sendBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock(
		locks: {
			lockId: string;
			isSyntheticLock: boolean;
		}[],
		memo: string = '',
		onFulfill?: (tx: any) => void
	) {
		const msgs: { type: string; value: any }[] = [];

		for (const lock of locks) {
			if (!lock.isSyntheticLock) {
				msgs.push({
					type: this.base.msgOpts.beginUnlocking.type,
					value: {
						owner: this.base.bech32Address,
						// XXX: 얘는 어째서인지 소문자가 아님 ㅋ;
						ID: lock.lockId,
						coins: [],
					},
				});
			} else {
				msgs.push(
					{
						type: this.base.msgOpts.superfluidUndelegate.type,
						value: {
							sender: this.base.bech32Address,
							lock_id: lock.lockId,
						},
					},
					{
						type: this.base.msgOpts.superfluidUnbondLock.type,
						value: {
							sender: this.base.bech32Address,
							lock_id: lock.lockId,
						},
					}
				);
			}
		}

		let numBeginUnlocking = 0;
		let numSuperfluidUndelegate = 0;
		let numSuperfluidUnbondLock = 0;

		const protoMsgs = msgs.map(msg => {
			if (msg.type === this.base.msgOpts.beginUnlocking.type && msg.value.ID) {
				numBeginUnlocking++;
				return {
					type_url: '/osmosis.lockup.MsgBeginUnlocking',
					value: osmosis.lockup.MsgBeginUnlocking.encode({
						owner: msg.value.owner,
						ID: Long.fromString(msg.value.ID),
					}).finish(),
				};
			} else if (msg.type === this.base.msgOpts.superfluidUndelegate.type && msg.value.lock_id) {
				numSuperfluidUndelegate++;
				return {
					type_url: '/osmosis.superfluid.MsgSuperfluidUndelegate',
					value: osmosis.superfluid.MsgSuperfluidUndelegate.encode({
						sender: msg.value.sender,
						lockId: Long.fromString(msg.value.lock_id),
					}).finish(),
				};
			} else if (msg.type === this.base.msgOpts.superfluidUnbondLock.type && msg.value.lock_id) {
				numSuperfluidUnbondLock++;
				return {
					type_url: '/osmosis.superfluid.MsgSuperfluidUnbondLock',
					value: osmosis.superfluid.MsgSuperfluidUnbondLock.encode({
						sender: msg.value.sender,
						lockId: Long.fromString(msg.value.lock_id),
					}).finish(),
				};
			} else {
				throw new Error('Invalid locks');
			}
		});

		await this.base.sendMsgs(
			'beginUnlocking',
			{
				aminoMsgs: msgs,
				protoMsgs,
			},
			memo,
			{
				amount: [],
				gas: (
					numBeginUnlocking * this.base.msgOpts.beginUnlocking.gas +
					numSuperfluidUndelegate * this.base.msgOpts.superfluidUndelegate.gas +
					numSuperfluidUnbondLock * this.base.msgOpts.superfluidUnbondLock.gas
				).toString(),
			},
			undefined,
			tx => {
				if (tx.code == null || tx.code === 0) {
					// Refresh the balances
					const queries = this.queriesStore.get(this.chainId);
					queries.queryBalances.getQueryBech32Address(this.base.bech32Address).fetch();

					// Refresh the locked coins
					queries.osmosis.queryLockedCoins.get(this.base.bech32Address).fetch();
					queries.osmosis.queryUnlockingCoins.get(this.base.bech32Address).fetch();
					queries.osmosis.queryAccountLocked.get(this.base.bech32Address).fetch();

					queries.osmosis.querySuperfluidDelegations.getQuerySuperfluidDelegations(this.base.bech32Address).fetch();
					queries.osmosis.querySuperfluidUndelegations.getQuerySuperfluidDelegations(this.base.bech32Address).fetch();
				}

				if (onFulfill) {
					onFulfill(tx);
				}
			}
		);
	}

	/**
	 * @deprecated
	 * @param lockIds
	 * @param memo
	 * @param onFulfill
	 */
	async sendUnlockPeriodLockMsg(lockIds: string[], memo: string = '', onFulfill?: (tx: any) => void) {
		const msgs = lockIds.map(lockId => {
			return {
				type: this.base.msgOpts.unlockPeriodLock.type,
				value: {
					owner: this.base.bech32Address,
					// XXX: 얘는 어째서인지 소문자가 아님 ㅋ;
					ID: lockId,
				},
			};
		});

		await this.base.sendMsgs(
			'unlockPeriodLock',
			msgs,
			memo,
			{
				amount: [],
				gas: (msgs.length * this.base.msgOpts.unlockPeriodLock.gas).toString(),
			},
			undefined,
			tx => {
				if (tx.code == null || tx.code === 0) {
					// Refresh the balances
					const queries = this.queriesStore.get(this.chainId);
					queries.queryBalances.getQueryBech32Address(this.base.bech32Address).fetch();

					// Refresh the unlocking coins
					queries.osmosis.queryLockedCoins.get(this.base.bech32Address).fetch();
					queries.osmosis.queryUnlockingCoins.get(this.base.bech32Address).fetch();
					queries.osmosis.queryAccountLocked.get(this.base.bech32Address).fetch();
				}

				if (onFulfill) {
					onFulfill(tx);
				}
			}
		);
	}

	protected get queries(): DeepReadonly<QueriesSetBase & HasOsmosisQueries> {
		return this.queriesStore.get(this.chainId);
	}
}
