export interface ExtensionNotificationResponse {
  message: string;
  ctaText: string;
  ctaUrl: string;
  countryFlag?: string;
  variant: string;
  isDeactivated?: boolean; // Since Turbo v3.12.5
}
