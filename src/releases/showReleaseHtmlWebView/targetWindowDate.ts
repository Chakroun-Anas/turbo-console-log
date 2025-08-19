import { ExtensionProperties } from '@/entities';
import {
  afternoonReleaseHoursWindow,
  eveningReleaseHoursWindow,
  morningReleaseHoursWindow,
  nightReleaseHoursWindow,
} from './constants';

export function targetWindowDate(
  releaseReviewTargetWindow: ExtensionProperties['releaseReviewTargetWindow'],
  currentTime: Date = new Date(),
): Date {
  let targetTimeStart = nightReleaseHoursWindow.start; // Default to Night window start time
  switch (releaseReviewTargetWindow) {
    case 'Morning':
      targetTimeStart = morningReleaseHoursWindow.start; // 7 AM
      break;
    case 'Afternoon':
      targetTimeStart = afternoonReleaseHoursWindow.start; // 13 PM
      break;
    case 'Evening':
      targetTimeStart = eveningReleaseHoursWindow.start; // 5 PM
      break;
    default:
      break; // Night, default to 9 PM
  }
  const hours = currentTime.getHours();
  if (releaseReviewTargetWindow !== 'Night') {
    if (hours < targetTimeStart) {
      return new Date(
        currentTime.getFullYear(),
        currentTime.getMonth(),
        currentTime.getDate(),
        targetTimeStart,
        0,
        0,
      );
    }
    return new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate() + 1, // Next day if current time is past start
      targetTimeStart,
      0,
      0,
    );
  }
  // For Night window, we handle the wrap around midnight
  return new Date(
    currentTime.getFullYear(),
    currentTime.getMonth(),
    currentTime.getDate(),
    targetTimeStart,
    0,
    0,
  );
}
