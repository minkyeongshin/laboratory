"use client";
import { GoogleTagManager } from "@next/third-parties/google";

import { IS_MOCK_MODE } from "@/mocks";

const GA_MEASUREMENT_ID = "GTM-KCNDDL3";

export const GoogleAnalytics = () => {
  // Disable GA in mock mode
  if (IS_MOCK_MODE) {
    return null;
  }

  const isGoogleTrackingEnabled =
    process.env.NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS !== "true" &&
    process.env.NODE_ENV === "production";

  if (!isGoogleTrackingEnabled) {
    return null;
  }

  return (
    <>
      <GoogleTagManager gtmId={GA_MEASUREMENT_ID} />
    </>
  );
};
