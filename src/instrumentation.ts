const IS_MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

export async function register() {
  // Disable Sentry in mock mode
  if (IS_MOCK_MODE) {
    return;
  }

  if (process.env.NODE_ENV === "production") {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("../sentry.server.config");
    }

    if (process.env.NEXT_RUNTIME === "edge") {
      await import("../sentry.edge.config");
    }
  }
}

// Only load Sentry's onRequestError in production (and not in mock mode)
export const onRequestError =
  process.env.NODE_ENV === "production" && !IS_MOCK_MODE
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("@sentry/nextjs").captureRequestError
    : undefined;
