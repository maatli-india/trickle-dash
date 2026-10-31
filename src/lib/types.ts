export type Paged<T> = {
  total: number;
  page: number;
  limit: number;
  items: T[];
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  status: "active" | "deleted" | "blocked" | "inactive";
  statusReason?: string;
  ratings: number;
  ratingCount: number;
  completedTrips: number;
  underInvestigation?: boolean;
  investigationCaseIds?: string[];
  banReason?: string;
  bannedByAdminId?: string;
  bannedAt?: string;
  unbanReason?: string;
  unbannedByAdminId?: string;
  unbannedAt?: string;
  createdAt: string;
};

export type ParcelSafetyDeclaration = {
  declarationVersion: string;
  noNarcotics: boolean;
  noWeapons: boolean;
  noCashInstruments: boolean;
  noLiveAnimals: boolean;
  noHazmat: boolean;
  noCounterfeitGoods: boolean;
  noOtherProhibited: boolean;
  declaredByUserId: string;
  declaredAt: string;
};

export type CancellationOutcome = {
  cancelledBy: string;
  cancelledByUserId: string;
  cancelledByName?: string;
  policy: string;
  feeAmount: number;
  refundAmount: number;
  refundStatus?: string;
  refundTransactionId?: string;
  refundFailureReason?: string;
  travelerReliabilityHit: boolean;
  reasonCode?: string;
  reason?: string;
  createdAt: string;
};

export type ParcelMatch = {
  id: string;
  bookedByUserId: string;
  senderUserId?: string;
  senderName?: string;
  travelerUserId?: string;
  travelerName?: string;
  travelPlanId: string;
  targetDeliveryTime?: string;
  parcelDescription?: string;
  parcelCategory?: string;
  estimatedWeightKg?: number;
  declaredValue?: number;
  status: string;
  safetyDeclaration?: ParcelSafetyDeclaration;
  inspectionAcknowledged?: boolean;
  safetyHold?: boolean;
  safetyHoldSetAt?: string;
  parcelImageIds?: string[];
  declineEvidenceImageIds?: string[];
  // disputed/disputeReason are set by the pickup-inspection decline, a
  // reported no-show, or a mid-transit exception — see the backend's
  // ResolveDispute. cancellation (when its policy is
  // "admin_dispute_resolution") is how that dispute was resolved; a
  // normal "free"/"late" policy there means a regular self-service
  // cancellation instead, not an admin resolution.
  disputed?: boolean;
  disputeReason?: string;
  cancellation?: CancellationOutcome;
  // agreedPrice/pricing are admin-only fields the backend's
  // NewParcelMatchView only populates for an admin viewer — used here to
  // show the actual captured amount a refund is capped against.
  agreedPrice?: number;
  pricing?: {
    totalPayableAmount?: number;
    senderPayableAmount?: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type TravelPlan = {
  id: string;
  travelerId: string;
  from?: { address?: string };
  to?: { address?: string };
  departureDate: string;
  arrivalDate: string;
  travelMode: string;
  status: "active" | "completed" | "cancelled";
  maxWeightKg?: number;
  pricePerPackage?: number;
  alternatePhone?: string;
  createdAt: string;
};

export type ReportStatusEvent = {
  status: string;
  actorId: string;
  message?: string;
  createdAt: string;
};

export type Report = {
  id: string;
  reportedType: "request" | "user" | "system";
  reportedId?: string;
  category: string;
  urgent: boolean;
  description: string;
  photos?: string[];
  status: "submitted" | "under_review" | "resolved" | "closed_no_action";
  reporterMessage?: string;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
  slaDueAt: string;
  statusHistory: ReportStatusEvent[];
};

export type ProhibitedCategory = { key: string; label: string };

export type AppVersionConfig = {
  minSupportedVersion: string;
  latestVersion: string;
  forceUpdate: boolean;
  updateMessage: string;
  iosStoreUrl: string;
  androidStoreUrl: string;
};

export type ParcelPricingTier = {
  minAmount: number;
  maxAmount?: number | null;
  markupAmount: number;
};

export type EffectiveConfig = {
  featureFlags: { userKYCAadhaar: boolean; userPhotoVerification: boolean; referralProgramEnabled: boolean };
  parcelSafety: {
    maxDeclaredValue: number;
    maxWeightKg: number;
    cashInstrumentThresholdINR: number;
    urgentReportSLAMinutes: number;
    handoffGeofenceRadiusMeters: number;
  };
  prohibitedCategories: ProhibitedCategory[];
  appVersion: AppVersionConfig;
  parcelPricingTiers: ParcelPricingTier[];
  // Storage/API only today — nothing in the pricing calculation reads
  // these values yet (see transitorder's AppConfigPricingPercentages).
  pricingPercentages: { senderPricePercentage: number; travelerPricePercentage: number };
};

export type UserReview = {
  id: string;
  matchId: string;
  reviewerUserId: string;
  reviewerName: string;
  targetUserId: string;
  rating: number;
  tags?: string[];
  review?: string;
  createdAt: string;
};

export type SavedPlace = {
  id: string;
  label: string;
  iconKey: string;
  place?: { address?: string };
};

export type NotificationTemplateCatalogEntry = {
  type: string;
  description: string;
  title: string;
  body: string;
  isCustomized: boolean;
  updatedAt?: string;
};

export type AppContent = {
  key: string;
  title: string;
  body: string;
  format: "markdown" | "plaintext";
  version: number;
  updatedAt: string;
  updatedByAdminId?: string;
};

export type Announcement = {
  id: string;
  message: string;
  severity: "info" | "warning" | "critical";
  active: boolean;
  startAt: string;
  endAt?: string;
  createdByAdminId?: string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionType = "payment" | "refund";

export type TransactionStatus =
  | "checkout_open"
  | "escrowed"
  | "failed"
  | "superseded"
  | "refund_pending"
  | "refund_processing"
  | "refund_completed"
  | "refund_failed";

export type WeekPoint = { weekStart: string; value: number };

export type TrendMetric = {
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  weeklyTrend: WeekPoint[];
};

export type CityCount = { city: string; count: number };

export type OverviewStats = {
  totalUsers: number;
  totalParcelRequests: number;
  totalTripsPosted: number;
  reportsAwaitingReview: number;
  signups: TrendMetric;
  deliveriesCompleted: TrendMetric;
  plansCreated: TrendMetric;
  paymentsCollectedMinor: TrendMetric;
  refundsMinor: TrendMetric;
  topOriginCities: CityCount[];
  topDestinationCities: CityCount[];
};

export type GoogleSearchActorCount = { userId?: string; deviceId?: string; count: number };

export type GoogleSearchLocationCount = { placeId: string; address: string; lat: number; lng: number; count: number };

export type GoogleSearchSourceStats = {
  metric: TrendMetric;
  topSearchers: GoogleSearchActorCount[];
  topLocations: GoogleSearchLocationCount[];
};

export type GoogleSearchStats = {
  selectLocation: GoogleSearchSourceStats;
  createTrip: GoogleSearchSourceStats;
};

// Support chats — the "chat with support" feature in the mobile app.
// Mirrors the transitorder backend's /v1/admin/support-chats contract.
export type SupportThreadStatus = "open" | "resolved" | "closed";

export type SupportThread = {
  id: string;
  userId: string;
  reason: string;
  reasonLabel: string;
  matchId?: string;
  role?: "sender" | "traveller";
  status: SupportThreadStatus;
  assignedAgentId?: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
};

// Same message shape as the existing mobile chat (see src/api/chat.js in
// the trickle app repo) — this admin UI only renders type "text" for v1
// and ignores "file"/"location" messages.
export type ChatMessageType = "text" | "file" | "location";

export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  type: ChatMessageType;
  text?: string;
  createdAt: string;
  isRead: boolean;
  replyToId?: string;
};

// Wire protocol for GET {WS_BASE_URL}/v1/admin/support-chats/:id/ws. Server
// -> client frame names mirror the mobile app's existing chat websocket
// protocol exactly; client -> server uses a "support_" prefix since this
// feature shares one socket server (and its single global per-event-name
// handler table) with the existing parcel-match chat.
export type SupportChatWsServerFrame =
  | { event: "history"; payload: ChatMessage[] }
  | { event: "connected" }
  | { event: "message"; payload: ChatMessage };

export type SupportChatWsClientFrame = {
  event: "support_message";
  payload: { type: "text"; text: string };
};

export type Transaction = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  gateway: string;
  gatewayRole: string;
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  gatewayRefundRequestId?: string;
  refundOfTransactionId?: string;
  entityType: string;
  entityId: string;
  userId: string;
  amountMinor: number;
  currency: string;
  attemptNo: number;
  client?: string;
  failureReason?: string;
  failedAt?: string;
  paidAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PayoutStatus = "due" | "exported" | "paid" | "failed";

export type PayoutBankSnapshot = {
  accountHolderName: string;
  ifsc: string;
  bankName: string;
  accountType: string;
};

export type Payout = {
  id: string;
  matchId: string;
  travelerUserId: string;
  travelerName?: string;
  route?: string;
  amount: number;
  status: PayoutStatus;
  bankReady?: boolean;
  bankAccountSnapshot?: PayoutBankSnapshot;
  beneficiaryEmail?: string;
  exportBatchId?: string;
  exportedAt?: string;
  exportedByAdminId?: string;
  paidAt?: string;
  utr?: string;
  markedPaidByAdminId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
};
