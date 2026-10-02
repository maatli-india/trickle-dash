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
  featureFlags: { userKYCAadhaar: boolean; userPhotoVerification: boolean };
  parcelSafety: {
    maxDeclaredValue: number;
    maxWeightKg: number;
    cashInstrumentThresholdINR: number;
    urgentReportSLAMinutes: number;
  };
  prohibitedCategories: ProhibitedCategory[];
  appVersion: AppVersionConfig;
  parcelPricingTiers: ParcelPricingTier[];
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
