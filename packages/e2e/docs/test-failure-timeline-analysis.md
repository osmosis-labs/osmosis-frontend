# EU Trade Test Failure Timeline Analysis

**Test Run**: https://github.com/osmosis-labs/osmosis-frontend/actions/runs/19635359967/job/56224925458  
**Date**: November 24, 2025  
**Region**: EU  
**Commit**: 9590fa0 - "fix(e2e): resolve Keplr popup race condition in trade tests (#4218)"

---

## "User should be able to Market Buy BTC" Test (Retry 1)

**Start**: 13:14:07.985Z | **Duration**: 57.9s | **End**: 13:15:05.877Z

```
T+0s    ┌─ Test starts
        │
T+Xs    ├─ Navigate to Buy tab
        ├─ Select BTC asset
        ├─ Enter amount: $1.55
        ├─ Check balance sufficient
        ├─ Wait for Buy button to be enabled
        │
        ├─ ═══════════════════════════════════════════════════════════
        ├─ START buyAndApprove()
        ├─ ═══════════════════════════════════════════════════════════
        │
        ├─ THREAD 1 STARTS: Success Promise (40s timeout)
        │  [expect(Transaction Successful).toBeVisible({ timeout: 40000 })]
        │  ⏰ Timeout clock begins: 0s / 40s
        │
        ├─ Click Buy button
        ├─ Set slippage tolerance to 3%
        │  ├─ Wait for slippage input (5s timeout)
        │  ├─ Click input, fill "3"
        │  └─ ✓ Slippage confirmed set to 3%
        │
        ├─ Click Confirm button
        │
        ├─ Wait 7 seconds for popup
        │
T+~7s   ├─ ✓ Popup appeared
        │  URL: chrome-extension://lamickkphgffemlhkgpkpdmnpddenceg/popup.html
        │  Pages count: 2
        │
        ├─ ✓ Clicked Approve button in popup
        │
        ├─ Wait 1s settle time
        │
T+~8s   ├─ UI interactions complete
        │
        │  ⏰ Thread 1 still running: ~8s / 40s
        │  ⏳ Waiting for "Transaction Successful" message...
        │  ⏳ Transaction submitted to blockchain...
        │  ⏳ Waiting for on-chain confirmation...
        │  
T+10s   │  ⏰ Thread 1: 10s / 40s
T+15s   │  ⏰ Thread 1: 15s / 40s
T+20s   │  ⏰ Thread 1: 20s / 40s
T+25s   │  ⏰ Thread 1: 25s / 40s
T+30s   │  ⏰ Thread 1: 30s / 40s
T+35s   │  ⏰ Thread 1: 35s / 40s
        │
T+40s   ├─ ❌ THREAD 1 TIMEOUT
        │  Error: Timed out 40000ms waiting for expect(locator).toBeVisible()
        │  
        │  Locator: getByText('Transaction Successful')
        │  Expected: visible
        │  Received: <element(s) not found>
        │  
        │  Location: trade-page.ts:731 (buyAndApprove)
        │
T+57.9s └─ Test failed (includes teardown time)
```

---

## "User should be able to Market Buy OSMO" Test (Retry 1)

**Start**: 13:15:40.643Z | **Duration**: 7.8s | **End**: 13:15:48.470Z

```
T+0s    ┌─ Test starts
        │
T+Xs    ├─ Navigate to page (goto())
        ├─ Connect wallet
        │
        ├─ ═══════════════════════════════════════════════════════════
        ├─ beforeEach hook
        ├─ ═══════════════════════════════════════════════════════════
        │
T+~7s   ├─ Check: await tradePage.isError()
        │
        ├─ ❌ ERROR DETECTED: "Swap is not available!"
        │  
        │  Page State Analysis:
        │    - Token names truncated in UI:
        │      • Shows "ATO ATOM" instead of "ATOM"
        │      • Shows "OSM OSMO" instead of "OSMO"
        │    - Suggests asset data not fully loaded
        │  
        │  expect(received).toBeFalsy()
        │  Received: true
        │  
        │  Location: monitoring.market.wallet.spec.ts:37
        │
T+7.8s  └─ Test failed in beforeEach
           (Never reached buyAndApprove - no threads started)
```

---

## "User should be able to Market Sell BTC" Test (Retry 1)

**Start**: 13:16:21.425Z | **Duration**: 56.9s | **End**: 13:17:18.302Z

```
T+0s    ┌─ Test starts
        │
T+Xs    ├─ Navigate to Sell tab
        ├─ Select BTC asset
        ├─ Enter amount: $1.54
        ├─ Check balance sufficient
        ├─ Wait for Sell button to be enabled
        │
        ├─ ═══════════════════════════════════════════════════════════
        ├─ START sellAndApprove()
        ├─ ═══════════════════════════════════════════════════════════
        │
        ├─ THREAD 1 STARTS: Success Promise (40s timeout)
        │  [expect(Transaction Successful).toBeVisible({ timeout: 40000 })]
        │  ⏰ Timeout clock begins: 0s / 40s
        │
        ├─ Click Sell button
        ├─ Set slippage tolerance to 3%
        │  ├─ Wait for slippage input (5s timeout)
        │  ├─ Click input, fill "3"
        │  └─ ✓ Slippage confirmed set to 3%
        │
        ├─ Click Confirm button
        │
        ├─ Wait 7 seconds for popup
        │
T+~7s   ├─ ✓ Popup appeared
        │  URL: chrome-extension://lamickkphgffemlhkgpkpdmnpddenceg/popup.html
        │  Pages count: 2
        │
        ├─ ✓ Clicked Approve button in popup
        │
        ├─ Wait 1s settle time
        │
T+~8s   ├─ UI interactions complete
        │
        │  ⏰ Thread 1 still running: ~8s / 40s
        │  ⏳ Waiting for "Transaction Successful" message...
        │  ⏳ Transaction submitted to blockchain...
        │  ⏳ Waiting for on-chain confirmation...
        │  
T+10s   │  ⏰ Thread 1: 10s / 40s
T+15s   │  ⏰ Thread 1: 15s / 40s
T+20s   │  ⏰ Thread 1: 20s / 40s
T+25s   │  ⏰ Thread 1: 25s / 40s
T+30s   │  ⏰ Thread 1: 30s / 40s
T+35s   │  ⏰ Thread 1: 35s / 40s
        │
T+40s   ├─ ❌ THREAD 1 TIMEOUT
        │  Error: Timed out 40000ms waiting for expect(locator).toBeVisible()
        │  
        │  Locator: getByText('Transaction Successful')
        │  Expected: visible
        │  Received: <element(s) not found>
        │  
        │  Location: trade-page.ts:683 (sellAndApprove)
        │
T+56.9s └─ Test failed (includes teardown time)
```

---

## "User should be able to Market Sell OSMO" Test (Retry 1)

**Start**: 13:17:53.161Z | **Duration**: 55.7s | **End**: 13:18:48.889Z

```
T+0s    ┌─ Test starts
        │
T+Xs    ├─ Navigate to Sell tab
        ├─ Select OSMO asset
        ├─ Enter amount: $1.54
        ├─ Check balance sufficient
        ├─ Wait for Sell button to be enabled
        │
        ├─ ═══════════════════════════════════════════════════════════
        ├─ START sellAndApprove()
        ├─ ═══════════════════════════════════════════════════════════
        │
        ├─ THREAD 1 STARTS: Success Promise (40s timeout)
        │  [expect(Transaction Successful).toBeVisible({ timeout: 40000 })]
        │  ⏰ Timeout clock begins: 0s / 40s
        │
        ├─ Click Sell button
        ├─ Set slippage tolerance to 3%
        │  ├─ Wait for slippage input (5s timeout)
        │  ├─ Click input, fill "3"
        │  └─ ✓ Slippage confirmed set to 3%
        │
        ├─ Click Confirm button
        │
        ├─ Wait 7 seconds for popup
        │
T+~7s   ├─ ✓ Popup appeared
        │  URL: chrome-extension://lamickkphgffemlhkgpkpdmnpddenceg/popup.html
        │  Pages count: 2
        │
        ├─ ✓ Clicked Approve button in popup
        │
        ├─ Wait 1s settle time
        │
T+~8s   ├─ UI interactions complete
        │
        │  ⏰ Thread 1 still running: ~8s / 40s
        │  ⏳ Waiting for "Transaction Successful" message...
        │  ⏳ Transaction submitted to blockchain...
        │  ⏳ Waiting for on-chain confirmation...
        │  
T+10s   │  ⏰ Thread 1: 10s / 40s
T+15s   │  ⏰ Thread 1: 15s / 40s
T+20s   │  ⏰ Thread 1: 20s / 40s
T+25s   │  ⏰ Thread 1: 25s / 40s
T+30s   │  ⏰ Thread 1: 30s / 40s
T+35s   │  ⏰ Thread 1: 35s / 40s
        │
T+40s   ├─ ❌ THREAD 1 TIMEOUT
        │  Error: Timed out 40000ms waiting for expect(locator).toBeVisible()
        │  
        │  Locator: getByText('Transaction Successful')
        │  Expected: visible
        │  Received: <element(s) not found>
        │  
        │  Location: trade-page.ts:683 (sellAndApprove)
        │
T+55.7s └─ Test failed (includes teardown time)
```

---

## Summary of Key Insights

### 1. Success Promise Architecture

- **Starts listening BEFORE any button clicks**
- Runs in parallel with all UI interactions
- Designed to catch immediate 1-click trading confirmations
- 40-second timeout actively listening throughout the entire operation

### 2. Market Buy BTC, Market Sell BTC, Market Sell OSMO Tests - Identical Failure Pattern

**Characteristics:**
- All UI interactions complete by ~T+8s
- Success promise listening from T+0s to T+40s
- No "Transaction Successful" OR "Transaction Failed" message appeared
- Suggests transaction stuck or failed on blockchain without UI feedback

**Key Observation:**
- Keplr popup handling works correctly ✓
- Transaction submission appears successful ✓
- Blockchain confirmation never arrives ✗

### 3. Market Buy OSMO Test - Unique Failure Mode

**Characteristics:**
- Fails in `beforeEach` hook, never reaches test logic
- UI rendering issue with truncated token names:
  - "ATO ATOM" instead of "ATOM"
  - "OSM OSMO" instead of "OSMO"
- No transaction threads spawned
- Separate root cause from other 3 tests

**Likely Cause:**
- Asset data not fully loaded when test starts
- Race condition in page initialization
- May need longer wait time after `goto()` before checking errors

### 4. Critical 32-Second Gap

**Timeline:**
- T+8s: UI interactions complete (popup approved)
- T+40s: Success promise times out
- **32 seconds of waiting with no feedback**

**Implications:**
- Transaction is in unknown state during this time
- No visibility into blockchain processing
- Need to detect "Transaction Failed" messages in addition to success
- May need to check transaction status via alternate method (API polling, etc.)

### 5. Possible Root Causes

**For Market Buy BTC, Market Sell BTC, Market Sell OSMO tests:**
1. **Gas exhaustion**: Despite 3.0 multiplier, transactions still running out of gas
2. **Network/RPC issues**: EU region RPC connection slow or timing out
3. **Transaction rejection**: Slippage, price impact, or other on-chain validation failing
4. **Missing error detection**: Frontend shows error but test doesn't look for it
5. **Insufficient timeout**: Transactions need >40s in this environment

**For Market Buy OSMO test:**
1. **Asset loading race condition**: Page loads before asset data fully available
2. **Insufficient wait time**: `goto()` returns before page is truly ready
3. **Frontend bug**: Token name truncation suggests data parsing issue

---

## Recommendations

### Immediate Actions

1. **Check on-chain transaction results**
   - Inspect wallet address used in tests
   - Verify if transactions succeeded/failed on blockchain
   - Check actual gas used vs gas limit

2. **Add failure message detection**
   - Tests currently only wait for success
   - Add detection for "Transaction Failed" or error states
   - Fail fast if error message appears

3. **Increase timeout experimentally**
   - Try 60s or 90s to determine if just slow
   - If still times out, confirms stuck/failed state

4. **Fix Market Buy OSMO test asset loading issue**
   - Increase wait time after `goto()`
   - Add explicit wait for asset data to be fully loaded
   - Verify token names are not truncated before proceeding

### Long-term Improvements

1. **Add transaction polling**
   - Don't rely solely on UI messages
   - Poll blockchain API for transaction status
   - Provide better debugging information

2. **Improve error visibility**
   - Log more details during the 32-second gap
   - Capture network requests
   - Check browser console for errors

3. **Gas monitoring**
   - Verify 3.0 multiplier is actually being applied
   - Log calculated gas limits
   - Compare with successful transactions

4. **Regional testing**
   - Compare EU results with US/SG regions
   - Identify if issue is region-specific
   - Check RPC endpoint health per region

