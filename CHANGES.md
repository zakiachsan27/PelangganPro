# PelangganPro Extension Fixes

## Summary of Changes

### Issue 1: Auto-refresh after login NOT working ✅ FIXED

**Problem:** User logs in via popup, but WhatsApp Web sidebar doesn't auto-refresh. The current code uses `chrome.storage.onChanged` but it's unreliable.

**Solution:** Implemented a robust message passing system:

1. **background.ts** - Added:
   - Port-based connection tracking for content scripts
   - `AUTH_CHANGED` message handler
   - `notifyAuthChanged()` function that sends `AUTH_REFRESH` to all WhatsApp Web tabs
   - Automatic notification on STORE_AUTH and CLEAR_AUTH

2. **popup.tsx** - Added:
   - Sends `AUTH_CHANGED` message to background after successful login/logout
   - This triggers the refresh in all open WhatsApp Web tabs

3. **content-script.tsx** - Added:
   - Port connection to background script for reliable communication
   - `AUTH_REFRESH` message listener
   - `handleAuthRefresh()` function with visual feedback (loading spinner)
   - Reconnection logic if port disconnects

### Issue 2: Adding notes always timeout ✅ FIXED

**Problem:** When user writes note in WhatsApp Web sidebar, it times out. The crm-client.ts fetch has no timeout handling.

**Solution:** Added comprehensive timeout and retry logic:

1. **crm-client.ts** - Added:
   - `DEFAULT_TIMEOUT = 10000` (10 seconds)
   - `MAX_RETRIES = 3`
   - `CRMClientError` class with error codes and retryable flag
   - `fetchWithTimeout()` using AbortController
   - `fetchWithRetry()` with exponential backoff (1s, 2s, 4s)
   - Server errors (5xx) are marked as retryable
   - Better error messages in Indonesian

2. **NotesList.tsx** - Updated:
   - Better error handling for different error types
   - Specific messages for TIMEOUT, NETWORK_ERROR, SESSION_EXPIRED

3. **Sidebar.tsx** - Updated:
   - Better error handling with custom error messages
   - Visual refresh indicator (top progress bar)

4. **ErrorState.tsx** - Updated:
   - Added support for custom error messages via `message` prop

## Files Modified

1. `/tmp/PelangganPro/extension/src/api/crm-client.ts` - Timeout, retry logic, better errors
2. `/tmp/PelangganPro/extension/src/background/background.ts` - Message passing for auth refresh
3. `/tmp/PelangganPro/extension/src/content/content-script.tsx` - AUTH_REFRESH handler
4. `/tmp/PelangganPro/extension/src/popup/popup.tsx` - AUTH_CHANGED notification
5. `/tmp/PelangganPro/extension/src/content/components/Sidebar.tsx` - Better error handling
6. `/tmp/PelangganPro/extension/src/content/components/NotesList.tsx` - Better error handling
7. `/tmp/PelangganPro/extension/src/content/components/ErrorState.tsx` - Custom message support

## Build Status

✅ Build successful: `npm run build` completed without errors

## How It Works

### Auto-refresh Flow:
1. User logs in via popup
2. Popup saves auth to storage
3. Popup sends `AUTH_CHANGED` to background
4. Background queries all WhatsApp Web tabs
5. Background sends `AUTH_REFRESH` to each tab
6. Content script receives message and refreshes sidebar

### Timeout Handling:
1. Each API call uses AbortController with 10s timeout
2. If timeout occurs, error is thrown with retryable flag
3. Retry logic catches retryable errors
4. Exponential backoff: 1s, 2s, 4s between retries
5. Max 3 retries before giving up
6. User sees clear error message

## Test Account
- Email: zakiachsan28@gmail.com
- Password: Zakiachsan123!
- API Base: http://localhost:3000
