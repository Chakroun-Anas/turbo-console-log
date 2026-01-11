export interface ExtensionNotificationResponse {
  message: string;
  ctaText: string;
  ctaUrl: string;
  countryFlag?: string;
  variant: string;
  isDeactivated?: boolean; // Since Turbo v3.12.5
  isDuplicated?: boolean; // Since Turbo v3.14.0 - Backend deduplication flag
}
