/**
 * Mock mode configuration for prototyping environment.
 *
 * When NEXT_PUBLIC_MOCK_MODE=true, the app runs with mocked Stellar data
 * instead of making real network calls. This allows designers and developers
 * to prototype new features without needing backend services or network access.
 */

export const IS_MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

/**
 * Logs mock mode status on app initialization.
 * Call this once during app boot (e.g., in StoreProvider or layout).
 */
export const logMockModeStatus = (): void => {
  if (IS_MOCK_MODE) {
    console.log(
      "%c[MOCK MODE] Running with mocked Stellar data. No real network calls will be made.",
      "color: #f59e0b; font-weight: bold; font-size: 14px;",
    );
  }
};
