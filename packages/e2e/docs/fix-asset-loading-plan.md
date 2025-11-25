# Fix Market Trade Test Asset Loading Issue

**Status**: ✅ Implemented  
**Related Issue**: "Market Buy OSMO" test fails with "Swap is not available!"  
**Branch**: `fix/trade-test-asset-loading`

---

## Problem

The "Market Buy OSMO" test fails in `beforeEach` with "Swap is not available!" error. Page snapshot shows truncated token names ("ATO ATOM" instead of "ATOM", "OSM OSMO" instead of "OSMO"), indicating asset metadata hasn't fully loaded when test checks for errors.

### Test Failure Details

- **Test**: User should be able to Market Buy OSMO
- **Duration**: 7.8s (fails early, never reaches actual test logic)
- **Location**: `monitoring.market.wallet.spec.ts:37` (beforeEach hook)
- **Error**: `expect(received).toBeFalsy() / Received: true`

### Root Cause

The "Error" button appears when `swapState.error` is set to an unrecognized error type (falls through to generic "Error" translation). This happens because:

1. Assets aren't fully loaded when swap state initializes
2. Route/quote calculation fails with an unexpected error
3. The error doesn't match known types (NoRouteError, etc.)

**Test Flow Analysis**:

```
beforeAll:
  1. setupWallet()
  2. goto()  ← Waits only 2s, assets may not be fully loaded

beforeEach (Market Buy OSMO test):
  1. connectWallet()
  2. isError() check  ← FAILS because swapState has error from incomplete assets

Test body:
  (never reached - failed in beforeEach)
```

The 2-second wait in `goto()` is insufficient for asset metadata to fully load and process.

---

## Solution: Hybrid Approach (Time-based + Condition-based)

### 1. Create Feature Branch

```bash
git checkout -b fix/trade-test-asset-loading
```

### 2. Increase Wait Time in `goto()` Method

**File**: `packages/e2e/pages/trade-page.ts`

**Current** (line 67):

```typescript
// we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
await this.page.waitForTimeout(2000);
```

**Change to**:

```typescript
// we expect that after 4 seconds tokens are loaded and any failure after this point should be considered a bug.
await this.page.waitForTimeout(4000);
```

**Rationale**: Extra 2 seconds allows more time for asset metadata processing. The "Market Buy OSMO" test shows 2s is insufficient.

### 3. Add Asset Verification Method

**File**: `packages/e2e/pages/trade-page.ts`

**Add new method** after `goto()` (around line 70):

```typescript
/**
 * Waits for asset data to be fully loaded and rendered.
 * Verifies token selector UI elements are visible and properly initialized.
 * Call this after goto() or connectWallet() before performing asset-dependent actions.
 */
async waitForAssetsToLoad() {
  console.log('⏳ Waiting for assets to fully load...');

  // Wait for token selector buttons to have proper image elements (assets loaded)
  const tokenButtons = this.page.locator('//div//button[@type]//img[@alt]');

  // Wait for at least 2 token buttons to be visible (From and To tokens)
  await expect(tokenButtons.first()).toBeVisible({ timeout: 10000 });

  // Additional wait for asset metadata to finish processing
  // This ensures token names are not truncated and quotes can be fetched
  await this.page.waitForTimeout(2000);

  console.log('✓ Assets loaded and ready');
}
```

**Rationale**: Explicit verification that token UI elements are present and visible before proceeding with tests.

### 4. Call Verification in `beforeAll` (CRITICAL)

**File**: `packages/e2e/tests/monitoring.market.wallet.spec.ts`

**Current** (lines 27-28):

```typescript
tradePage = new TradePage(context.pages()[0]);
await tradePage.goto();
```

**Change to**:

```typescript
tradePage = new TradePage(context.pages()[0]);
await tradePage.goto();
await tradePage.waitForAssetsToLoad(); // NEW: Critical - ensure assets loaded before any test runs
```

**Rationale**: This is the CRITICAL fix. The "Market Buy OSMO" test fails in `beforeEach` because the `beforeAll` `goto()` didn't wait long enough for assets. Adding verification here ensures assets are ready before any `beforeEach` or test runs.

### 5. Call Verification in Test `beforeEach`

**File**: `packages/e2e/tests/monitoring.market.wallet.spec.ts`

**Current** (lines 35-38):

```typescript
test.beforeEach(async () => {
  await tradePage.connectWallet();
  expect(await tradePage.isError(), "Swap is not available!").toBeFalsy();
});
```

**Change to**:

```typescript
test.beforeEach(async () => {
  await tradePage.connectWallet();
  await tradePage.waitForAssetsToLoad(); // NEW: Ensure assets loaded after wallet connect
  expect(await tradePage.isError(), "Swap is not available!").toBeFalsy();
});
```

**Rationale**: Belt-and-suspenders approach. After wallet connects, verify assets are still ready before checking for errors.

### 6. Call After Each `goto()` in Tests

Since each test calls `goto()` again at the start, add verification there too.

**Lines to modify**:

- Line 56 (Market Buy BTC/OSMO tests - forEach loop)
- Line 69 (Market Sell BTC test)
- Line 80 (Market Sell OSMO test)

**Current**:

```typescript
await tradePage.goto();
await tradePage.openBuyTab(); // or openSellTab()
```

**Change to**:

```typescript
await tradePage.goto();
await tradePage.waitForAssetsToLoad(); // NEW: Wait for assets after navigation
await tradePage.openBuyTab(); // or openSellTab()
```

---

## Expected Outcomes

1. **"Market Buy OSMO" test should pass**: Asset metadata will be fully loaded before error check
2. **No more truncated token names**: UI will show complete asset information
3. **More robust tests**: Condition checks ensure proper initialization
4. **Better debugging**: Console logs show when assets are ready

---

## Testing Checklist

After implementation:

- [x] Run "Market Buy OSMO" test locally
- [x] Verify no truncated token names in page snapshots
- [x] Check console logs show "✓ Assets loaded and ready"
- [ ] Run full EU trade test suite
- [ ] Verify other tests still work (may still have timeout issues - separate fix)

---

## Implementation Notes

- This fix addresses **only the "Market Buy OSMO" test's asset loading issue**
- Other tests ("Market Buy BTC", "Market Sell BTC", "Market Sell OSMO") have different timeout issues (see `fix-transaction-timeout-plan.md`)
- Total wait time after initial `goto()`: 4s (in goto) + 2s (in waitForAssetsToLoad) = 6s
- `waitForAssetsToLoad()` is called in 3 places:
  1. `beforeAll` - after initial page load (CRITICAL)
  2. `beforeEach` - after wallet connect (belt-and-suspenders)
  3. Each test - after their own `goto()` calls
- All changes are in E2E test code, no frontend changes needed

---

## Related Files

- `packages/e2e/pages/trade-page.ts` - Page object with goto() and new waitForAssetsToLoad()
- `packages/e2e/tests/monitoring.market.wallet.spec.ts` - Market buy/sell tests
- `packages/e2e/docs/test-failure-timeline-analysis.md` - Detailed failure analysis
