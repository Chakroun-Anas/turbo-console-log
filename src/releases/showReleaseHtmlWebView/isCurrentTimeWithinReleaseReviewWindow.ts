import { ExtensionProperties } from '@/entities';
import {
  afternoonReleaseHoursWindow,
  eveningReleaseHoursWindow,
  morningReleaseHoursWindow,
  nightReleaseHoursWindow,
} from './constants';

export function isCurrentTimeWithinReleaseReviewWindow(
  releaseReviewTargetWindow: ExtensionProperties['releaseReviewTargetWindow'],
  currentDate: Date = new Date(),
): boolean {
  let releaseHoursWindow: { start: number; end: number } =
    nightReleaseHoursWindow; // Default to Night window
  switch (releaseReviewTargetWindow) {
    case 'Morning':
      releaseHoursWindow = morningReleaseHoursWindow;
      break;
    case 'Afternoon':
      releaseHoursWindow = afternoonReleaseHoursWindow;
      break;
    case 'Evening':
      releaseHoursWindow = eveningReleaseHoursWindow;
      break;
    default:
      break; // Night, default to 9 PM to 2 AM
  }
  const currentHour = currentDate.getHours();
  if (releaseHoursWindow.start < releaseHoursWindow.end) {
    return (
      currentHour >= releaseHoursWindow.start &&
      currentHour < releaseHoursWindow.end
    );
  }
  // Handle the case where the window wraps around midnight
  return (
    currentHour >= releaseHoursWindow.start ||
    currentHour < releaseHoursWindow.end
  );
}
