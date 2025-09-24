/**
 * Determines if the badge should be shown based on content date vs last panel access
 * @param contentDate The date of the content (ISO string)
 * @param lastPanelAccess The date when user last accessed the panel (ISO string or undefined)
 * @returns True if badge should be shown (content is newer than last access)
 */
export function shouldShowBadge(
  contentDate: string | undefined,
  lastPanelAccess: string | undefined,
): boolean {
  // Always show badge if user has never accessed the panel
  if (!lastPanelAccess) {
    return true;
  }

  // Don't show badge if content has no date
  if (!contentDate) {
    return false;
  }

  // Show badge only if content is newer than last panel access
  const contentTime = new Date(contentDate).getTime();
  const lastAccessTime = new Date(lastPanelAccess).getTime();

  return contentTime > lastAccessTime;
}
