# Prototyping Guide

This repository is set up as a prototyping environment for the Stellar Laboratory frontend. It can run entirely on mock data, allowing designers and developers to prototype new features without needing AWS tokens, backend services, or real network access.

## Quick Start: Mock Mode

### 1. Enable Mock Mode

Create a `.env.local` file (or copy from `.env.example`):

```bash
cp .env.example .env.local
```

Then set the mock mode flag:

```bash
# .env.local
NEXT_PUBLIC_MOCK_MODE=true
```

### 2. Run the Dev Server

```bash
pnpm dev
```

You should see this message in the browser console:

```
[MOCK MODE] Running with mocked Stellar data. No real network calls will be made.
```

### 3. Start Prototyping

In mock mode:
- **No wallet needed** — A mock wallet is auto-connected with a test public key
- **No network calls** — All Stellar RPC/Horizon API calls return realistic mock data
- **No analytics** — Amplitude, Google Analytics, and Sentry are disabled

## What's Mocked (Phase 1)

| Hook | Purpose | Mock Behavior |
|------|---------|---------------|
| `useAccountInfo` | Fetch account details | Returns funded account for mock wallet, unfunded for others |
| `useLatestLedger` | Get latest ledger sequence | Returns mock ledger sequence (50000000) |
| `useFriendBot` | Fund test accounts | Returns successful funding response |
| `useSimulateTx` | Simulate transactions | Returns successful simulation response |

### Mock Wallet

When mock mode is enabled, a wallet is automatically connected:

- **Public Key**: `GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3HTBFKX5DY4E`
- **Wallet Type**: `FREIGHTER` (simulated)

This allows you to prototype wallet-dependent features without installing browser extensions.

## File Structure

```
src/mocks/
├── index.ts              # IS_MOCK_MODE constant + boot logging
├── mockWallet.ts         # Mock wallet state configuration
└── fixtures/
    ├── accounts.ts       # Mock Horizon account responses
    ├── ledger.ts         # Mock ledger data
    ├── transactions.ts   # Mock RPC simulation responses
    └── friendbot.ts      # Mock FriendBot responses
```

## Adding More Mocks

To mock additional hooks:

1. **Create a fixture file** in `src/mocks/fixtures/` with realistic data matching the SDK types
2. **Import and use SDK types** for type parity (e.g., `Horizon.HorizonApi.AccountResponse`)
3. **Add an early return** in the hook's queryFn/mutationFn:

```typescript
import { IS_MOCK_MODE } from "@/mocks";
import { getMockData } from "@/mocks/fixtures/yourFixture";

export const useYourHook = () => {
  return useQuery({
    queryFn: async () => {
      if (IS_MOCK_MODE) {
        return getMockData();
      }
      // ... original implementation
    },
  });
};
```

## Switching Between Modes

| Mode | Command |
|------|---------|
| **Mock mode** | `NEXT_PUBLIC_MOCK_MODE=true pnpm dev` |
| **Real mode** | `pnpm dev` (default) |

You can also set `NEXT_PUBLIC_MOCK_MODE=true` in `.env.local` to always run in mock mode.

## Troubleshooting

### URL State Persists After Switching Modes

The Zustand store syncs state to the URL querystring. If you switch from mock mode to real mode (or vice versa), some state — like the mock wallet's public key — may persist in the URL and cause unexpected behavior.

**Solution**: When switching modes, either:
- Open a fresh browser tab with a clean URL (e.g., `http://localhost:3000`)
- Clear the URL parameters manually (remove everything after `?`)
- Use incognito/private browsing for testing mode switches

### Mock Data Not Loading

If mocked endpoints are still making real network calls:
1. Verify `NEXT_PUBLIC_MOCK_MODE=true` is set in your `.env.local`
2. Restart the dev server (`pnpm dev`) — env changes require a restart
3. Check the browser console for `[MOCK MODE]` message

### TypeScript Errors in Fixtures

If you see type errors in mock fixtures after an SDK update:
- The fixture types may have drifted from the SDK
- Update the fixture to match the new SDK type structure
- This is intentional — it catches breaking changes early

## Notes

- Mock mode is **client-side only** — the flag is read at runtime via `process.env.NEXT_PUBLIC_MOCK_MODE`
- When mock mode is OFF, the code path is identical to production (zero impact)
- Mock fixtures use real SDK types to catch any type drift during development
