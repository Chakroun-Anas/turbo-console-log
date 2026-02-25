/**
 * Workspace context metadata used for notification scoring
 * Captures behavioral signals about user's current coding state
 */
export interface WorkspaceContext {
  /** Number of open editor tabs across all tab groups */
  openEditorsCount: number;

  /** Number of unsaved files (dirty state) */
  unsavedFilesCount: number;

  /** Number of active terminal instances */
  terminalCount: number;

  /** Current period of the day based on local time */
  periodOfDay: 'morning' | 'afternoon' | 'evening' | 'night';

  /** Current day of the week */
  dayOfWeek:
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';
}
