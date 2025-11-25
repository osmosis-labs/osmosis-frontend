# Fix Market Trade Transaction Timeout Issues

**Status**: ✅ Implemented  
**Related Issues**: Multiple trade tests timeout waiting for transaction confirmation  
**Branch**: `fix/trade-test-asset-loading` (same branch, sequential implementation)

---

## Problem

Three market trade tests all fail with identical pattern:
- **"Market Buy BTC"**: 57.9s failure
- **"Market Sell BTC"**: 56.9s failure
- **"Market Sell OSMO"**: 55.7s failure

### Common Failure Pattern

```
T+0s   - Success promise starts (40s timeout)
T+7s   - ✓ Keplr popup appears
T+7s   - ✓ Approve button clicked
T+8s   - UI interactions complete
T+40s  - ❌ Timeout: "Transaction Successful" never appeared
```

**Critical 32-second gap**: From T+8s (UI complete) to T+40s (timeout), neither success nor failure message appears.

### Root Cause Analysis

Possible causes:
1. **Transactions failing on-chain** - Gas exhaustion, slippage, or validation errors
2. **Timeout too short** - 40s insufficient for blockchain confirmation (especially in EU region)
3. **Missing error detection** - Tests only look for success, not failure messages
4. **UI not showing errors** - Frontend may have bugs in error message display

---

## Solution: Multi-pronged Approach

### 1. Add Transaction Failure Detection

**Problem**: Tests currently only wait for success, never detect failures.

**File**: `packages/e2e/pages/trade-page.ts`

#### Step 1a: Add Failure Locator

**In constructor** (after line 47, near `trxSuccessful`):
```typescript
this.trxSuccessful = page.getByText("Transaction Successful");
this.trxFailed = page.getByText("Transaction Failed"); // NEW
```

#### Step 1b: Create Race Condition Helper

**Add new method** after constructors:
```typescript
/**
 * Waits for either transaction success or failure, whichever comes first.
 * Throws detailed error if transaction fails or times out.
 * @param timeoutMs - Maximum time to wait (default 60s)
 * @returns Promise that resolves on success, rejects on failure
 */
private async waitForTransactionResult(timeoutMs: number = 60000): Promise<void> {
  console.log(`⏰ Waiting for transaction confirmation (${timeoutMs / 1000}s timeout)...`);
  
  const startTime = Date.now();
  
  try {
    // Race between success and failure
    await Promise.race([
      // Success path
      expect(this.trxSuccessful).toBeVisible({ timeout: timeoutMs })
        .then(() => {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(`✓ Transaction successful after ${elapsed}s`);
        }),
      
      // Failure path
      this.trxFailed.waitFor({ state: 'visible', timeout: timeoutMs })
        .then(() => {
          throw new Error('Transaction failed on blockchain');
        }),
    ]);
  } catch (error: any) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Check if it's a failure vs timeout
    const isFailed = await this.trxFailed.isVisible({ timeout: 100 });
    if (isFailed) {
      const errorText = await this.trxFailed.textContent();
      throw new Error(`Transaction failed after ${elapsed}s: ${errorText}`);
    }
    
    // Otherwise it's a timeout
    throw new Error(
      `Transaction status unknown after ${elapsed}s. ` +
      `Neither success nor failure message appeared. ` +
      `Original error: ${error.message}`
    );
  }
}
```

#### Step 1c: Update `buyAndApprove` Method

**Current** (lines 731-733, 748):
```typescript
const successPromise = expect(this.trxSuccessful).toBeVisible({
  timeout: 40000,
});

// ... button clicks ...

await successPromise;
```

**Change to**:
```typescript
// Start listening for transaction result
const resultPromise = this.waitForTransactionResult(60000);

// ... button clicks ...

// Wait for result (success or failure)
await resultPromise;
```

**Lines to modify**: 
- Line 731-733: Replace success promise with result promise
- Line 748: Change `await successPromise` to `await resultPromise`

#### Step 1d: Update `sellAndApprove` Method

**Same changes as buyAndApprove**:
- Line 683-685: Replace success promise with result promise
- Line 700: Change `await successPromise` to `await resultPromise`

---

### 2. Increase Transaction Timeout

**Current**: 40s timeout  
**New**: 60s timeout

**Rationale**: 
- EU region may have slower RPC response times
- Split route swaps confirmed to take longer with 3.0 gas multiplier
- Extra 20s gives breathing room while still failing reasonably fast
- Total test time: ~80s vs current ~60s (acceptable trade-off)

**Implementation**: Already included in `waitForTransactionResult()` default parameter (60000ms).

---

### 3. Add Detailed Logging

**Already included in solution**:
- ✓ Logs when waiting starts with timeout duration
- ✓ Logs elapsed time on success
- ✓ Logs elapsed time on failure/timeout
- ✓ Distinguishes between failure vs timeout in error messages

**Additional logging** in button click flow:

**In `buyAndApprove` and `sellAndApprove`** (after popup approval, before `await resultPromise`):
```typescript
await this.justApproveIfNeeded(context);
console.log('✓ Transaction submitted to blockchain'); // NEW
await this.page.waitForTimeout(1000);
```

---

### 4. Check for Alternative Error Indicators

**Add error toast detection** before waiting for transaction result:

**Add new method**:
```typescript
/**
 * Checks for error messages in toast notifications or alerts.
 * Call this after transaction submission but before waiting for result.
 */
async checkForTransactionErrors(): Promise<void> {
  // Check for error toasts/alerts
  const errorIndicators = [
    this.page.locator('[role="alert"]').filter({ hasText: /error|failed/i }),
    this.page.getByText(/transaction error/i),
    this.page.getByText(/insufficient/i),
  ];
  
  for (const indicator of errorIndicators) {
    const isVisible = await indicator.isVisible({ timeout: 1000 }).catch(() => false);
    if (isVisible) {
      const errorText = await indicator.textContent();
      console.warn(`⚠️ Error indicator detected: ${errorText}`);
      throw new Error(`Transaction error: ${errorText}`);
    }
  }
}
```

**Call in both buyAndApprove and sellAndApprove** (after transaction submission):
```typescript
await this.justApproveIfNeeded(context);
console.log('✓ Transaction submitted to blockchain');
await this.page.waitForTimeout(1000);
await this.checkForTransactionErrors(); // NEW: Check for immediate errors
await resultPromise; // Then wait for final result
```

---

### 5. Add Transaction Hash Capture (Optional - Future Enhancement)

If we can capture the transaction hash from UI, we could:
- Log it for manual blockchain verification
- Query blockchain API directly for status
- Provide better debugging information

**Implementation**: Investigate later if issues persist.

---

## Implementation Order

1. ✅ **Step 1**: Add failure detection (most critical)
2. ✅ **Step 2**: Increase timeout to 60s (already included)
3. ✅ **Step 3**: Add detailed logging (already included)
4. ✅ **Step 4**: Add alternative error checks
5. ⏸️ **Step 5**: Transaction hash capture (optional, future)

---

## Expected Outcomes

### Immediate Benefits
1. **Tests will detect failures** - Won't just timeout, will report actual failures
2. **Better error messages** - Know if tx failed vs. just slow
3. **Longer timeout** - Accommodates slower EU region confirmations
4. **Better debugging** - Detailed logs with timestamps

### Diagnostic Benefits
- If tests still fail, we'll know WHY (timeout vs actual failure)
- Error messages will guide next steps
- Logs will show how long successful transactions take

---

## Testing Strategy

### Phase 1: Run EU Trade Tests
```bash
# Run individual market trade tests in EU region
npm run test:e2e:monitoring -- --grep "Market Buy BTC"
npm run test:e2e:monitoring -- --grep "Market Sell BTC"
npm run test:e2e:monitoring -- --grep "Market Sell OSMO"
npm run test:e2e:monitoring -- --grep "Market Buy OSMO"
```

### Phase 2: Analyze Results

**If tests pass**:
- ✅ Check logs for transaction timing
- ✅ Verify 60s was sufficient
- ✅ Document typical confirmation times

**If tests still fail with timeouts**:
- Check logs for elapsed time
- May need to increase to 90s
- Investigate RPC issues

**If tests fail with "Transaction failed"**:
- ✅ We now know transactions are actually failing!
- Check error messages for cause
- Investigate gas, slippage, or other issues

### Phase 3: CI/CD Testing

Run full test suite in all regions:
- US
- EU  
- SG

Compare results and timing across regions.

---

## Related Investigations

### If Transactions Are Failing

Potential issues to check:
1. **Gas multiplier not applied** - Verify 3.0 multiplier reaches market buy/sell
2. **Slippage too tight** - 3% may be insufficient for some swaps
3. **Insufficient balance** - Despite checks, edge cases may exist
4. **Route calculation errors** - Split routes may have issues

### If Timeouts Persist

Potential issues to check:
1. **EU RPC slow/unstable** - Test with different RPC endpoint
2. **Proxy issues** - Test proxy configuration
3. **Frontend bug** - Success message not appearing despite tx success
4. **Need even longer timeout** - Consider 90s for EU region specifically

---

## Files to Modify

- ✅ `packages/e2e/pages/trade-page.ts`
  - Add `trxFailed` locator
  - Add `waitForTransactionResult()` method
  - Add `checkForTransactionErrors()` method  
  - Update `buyAndApprove()` to use new result handling
  - Update `sellAndApprove()` to use new result handling

---

## Success Criteria

- [x] Market trade tests either pass or fail with clear error messages
- [x] No more "timeout with no information" failures
- [x] Logs show transaction timing and status
- [x] Error messages are actionable (guide next debugging steps)
- [ ] 60s timeout sufficient for EU region (or we know we need more)

---

## Notes

- Implement this AFTER asset loading fix (both on same branch)
- This is diagnostic AND fix - will tell us what's really wrong
- May need follow-up work based on results
- Consider region-specific timeouts if EU consistently slower

