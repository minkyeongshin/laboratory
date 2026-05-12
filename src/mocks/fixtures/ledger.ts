/**
 * Mock ledger data fixtures.
 *
 * The useLatestLedger hook returns just the sequence number (a number),
 * extracted from the RPC's getLatestLedger response.
 */

/**
 * Mock latest ledger sequence number.
 * This is the value returned by useLatestLedger's queryFn.
 */
export const MOCK_LATEST_LEDGER_SEQUENCE = 50000000;

/**
 * Returns the mock latest ledger sequence.
 * Matches the exact return type of useLatestLedger (number).
 */
export const getMockLatestLedger = (): number => {
  return MOCK_LATEST_LEDGER_SEQUENCE;
};
