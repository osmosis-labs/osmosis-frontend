# MobX Migration Progress

## Overview

- Started: 2026-01-12
- Target completion: TBD
- Current tier: 3 (External Queries)

## Migration Approach

1. **Write tests first** for existing MobX store behavior
2. **Migrate one store at a time**, starting with simplest
3. **Both implementations coexist** during migration (no big bang)
4. **Update consumers gradually** to use new implementation

## Status

### Tier 1: Simple UI State

| Store        | Tests | Migrated | Consumers Updated | PR  |
| ------------ | ----- | -------- | ----------------- | --- |
| ProfileStore | [x]   | [x]      | 2/2               | -   |
| NavBarStore  | [x]   | [x]      | 2/2               | -   |

### Tier 2: User Settings

| Store            | Tests | Migrated | Consumers Updated | PR  |
| ---------------- | ----- | -------- | ----------------- | --- |
| HideDust         | [x]   | [x]      | 3/3               | -   |
| HideBalances     | [x]   | [x]      | 2/2               | -   |
| Language         | [x]   | [x]      | 3/3               | -   |
| UnverifiedAssets | [x]   | [x]      | 7/7               | -   |

### Tier 3: External Queries

| Store                                      | Tests | Migrated | tRPC Equivalent | PR  |
| ------------------------------------------ | ----- | -------- | --------------- | --- |
| ObservableQueryPoolAprs                    | [ ]   | [ ]      | Exists          | -   |
| ObservableQueryMarketCaps                  | [ ]   | [ ]      | Exists          | -   |
| ObservableQueryTokensHistoricalChart       | [ ]   | [ ]      | Exists          | -   |
| ObservableQueryPriceRangeAprs              | [ ]   | [ ]      | TODO            | -   |
| ObservableQueryActiveGauges                | [ ]   | [ ]      | TODO            | -   |
| ObservableQueryICNSNames                   | [ ]   | [ ]      | TODO            | -   |
| ObservableQueryPositionsPerformanceMetrics | [ ]   | [ ]      | Partial         | -   |

### Tier 4: On-chain Queries

| Store                                      | Tests | Migrated | PR  |
| ------------------------------------------ | ----- | -------- | --- |
| ObservableQueryAccountsPositions           | [ ]   | [ ]      | -   |
| ObservableQueryLiquidityPositionsById      | [ ]   | [ ]      | -   |
| ObservableQueryConcentratedLiquidityParams | [ ]   | [ ]      | -   |
| ObservableQueryAccountLockedCoins          | [ ]   | [ ]      | -   |
| ObservableQueryAccountUnlockingCoins       | [ ]   | [ ]      | -   |
| ObservableQueryAccountLocked               | [ ]   | [ ]      | -   |
| ObservableQueryIncentivizedPools           | [ ]   | [ ]      | -   |
| ObservableQueryGauges                      | [ ]   | [ ]      | -   |
| ObservableQueryLockableDurations           | [ ]   | [ ]      | -   |
| ObservableQuerySuperfluidPools             | [ ]   | [ ]      | -   |
| ObservableQuerySuperfluidDelegations       | [ ]   | [ ]      | -   |
| ObservableQuerySuperfluidParams            | [ ]   | [ ]      | -   |

### Tier 5: Derived Data Stores

| Store                             | Tests | Migrated | PR  |
| --------------------------------- | ----- | -------- | --- |
| ObservableSharePoolDetails        | [ ]   | [ ]      | -   |
| ObservableConcentratedPoolDetails | [ ]   | [ ]      | -   |
| ObservableSuperfluidPoolDetails   | [ ]   | [ ]      | -   |
| ObservablePoolsBonding            | [ ]   | [ ]      | -   |

### Tier 6: Complex Stores

| Store                | Tests | Migrated | PR  |
| -------------------- | ----- | -------- | --- |
| AccountStore         | [ ]   | [ ]      | -   |
| TransferHistoryStore | [ ]   | [ ]      | -   |

## Consumer Files to Update

Files using `useStore()` that need to be updated after each store migration:

### ProfileStore Consumers (2 files)

- [x] `packages/web/modals/profile.tsx`
- [x] `packages/web/components/navbar/index.tsx`

### NavBarStore Consumers (2 files)

- [x] `packages/web/hooks/use-nav-bar.ts`
- [x] `packages/web/components/navbar/index.tsx`

## New Zustand Stores Created

- `packages/web/stores/profile-store.ts` - User avatar selection
- `packages/web/stores/nav-bar-store.ts` - Navbar title and CTAs
- `packages/web/stores/user-settings-store.ts` - All user settings (hideDust, hideBalances, language, showUnverifiedAssets)

## Test Files Created

- `packages/web/stores/__tests__/profile-store.spec.ts`
- `packages/web/stores/__tests__/nav-bar-store.spec.ts`
- `packages/web/stores/__tests__/user-settings-store.spec.ts`

## Cleanup Completed

- ✅ Deleted old MobX user-settings folder (`packages/web/stores/user-settings/`)
- ✅ Deleted old `ProfileStore` class (`packages/web/stores/profile.ts`)
- ✅ Deleted old `NavBarStore` class (`packages/web/stores/nav-bar.ts`)
- ✅ Removed old store instantiation from `RootStore`

## Notes

- Zustand is already a dependency in package.json
- Test infrastructure (MSW, Jest) is already set up
- tRPC is already in use for many queries
- Old MobX stores can be removed once all consumers are migrated and verified
