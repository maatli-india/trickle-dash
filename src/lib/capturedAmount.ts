import type { ParcelMatch } from "./types";

// Mirrors the backend's capturedParcelAmount fallback chain
// (internal/orchestrators/parcel_match.go) so the admin sees the same cap
// the server will actually enforce.
export function capturedAmount(match: ParcelMatch): number {
  if (match.pricing?.totalPayableAmount && match.pricing.totalPayableAmount > 0) {
    return match.pricing.totalPayableAmount;
  }
  if (match.pricing?.senderPayableAmount && match.pricing.senderPayableAmount > 0) {
    return match.pricing.senderPayableAmount;
  }
  return match.agreedPrice || 0;
}
