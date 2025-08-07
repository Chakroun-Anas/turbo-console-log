import { ExtensionProperties } from '@/entities';

export function additionalTargetWindow(
  currentTargetWindow: ExtensionProperties['releaseReviewTargetWindow'],
): ExtensionProperties['releaseReviewTargetWindow'] {
  const releaseTargetWindows: Array<
    ExtensionProperties['releaseReviewTargetWindow']
  > = ['Morning', 'Afternoon', 'Evening', 'Night'];
  const currentTargetWindowIndex =
    releaseTargetWindows.indexOf(currentTargetWindow);
  if (currentTargetWindow === 'Night') {
    return 'Evening';
  }
  return releaseTargetWindows[currentTargetWindowIndex + 1];
}
