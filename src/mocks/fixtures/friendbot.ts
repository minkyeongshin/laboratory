/**
 * Mock FriendBot fixtures.
 *
 * The useFriendBot hook returns the raw Response object from fetch().
 * For mock mode, we create a Response-like object that indicates success.
 */

/**
 * FriendBot success response body shape.
 * This is what the real FriendBot returns on success.
 */
export interface FriendbotSuccessResponse {
  hash: string;
  ledger: number;
  envelope_xdr: string;
  result_xdr: string;
  result_meta_xdr: string;
}

/**
 * Creates a mock successful FriendBot response body.
 *
 * @returns FriendBot success response data
 */
export const getMockFriendbotResponseBody = (): FriendbotSuccessResponse => ({
  hash: "abc123def456789",
  ledger: 50000000,
  envelope_xdr: "AAAAAgAAAA...", // Truncated for brevity
  result_xdr: "AAAAAAAAAGQ...",
  result_meta_xdr: "AAAAAwAAAA...",
});

/**
 * Creates a mock Response object for successful FriendBot funding.
 * Matches the Response interface that useFriendBot returns.
 *
 * @returns A Response object indicating success
 */
export const getMockFriendbotResponse = (): Response => {
  const body = getMockFriendbotResponseBody();

  return new Response(JSON.stringify(body), {
    status: 200,
    statusText: "OK",
    headers: {
      "Content-Type": "application/json",
    },
  });
};
