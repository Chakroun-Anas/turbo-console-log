import * as vscode from 'vscode';
import { WorkspaceContext } from '@/entities';

/**
 * Collects current workspace context metadata for notification scoring
 * This matches the same data collected in telemetry for interaction analysis
 *
 * @returns WorkspaceContext object containing behavioral signals
 */
export function collectWorkspaceContext(): WorkspaceContext {
  const now = new Date();

  // Count all open tabs across all tab groups
  const openEditorsCount = vscode.window.tabGroups.all.reduce(
    (count, group) => count + group.tabs.length,
    0,
  );

  // Count unsaved files across all open text documents
  const unsavedFilesCount = vscode.workspace.textDocuments.filter(
    (doc) => doc.isDirty && doc.uri.scheme === 'file',
  ).length;

  // Count terminals
  const terminalCount = vscode.window.terminals.length;

  // Calculate period of day based on local time
  const hour = now.getHours();
  let periodOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  if (hour >= 5 && hour < 12) {
    periodOfDay = 'morning';
  } else if (hour >= 12 && hour < 17) {
    periodOfDay = 'afternoon';
  } else if (hour >= 17 && hour < 21) {
    periodOfDay = 'evening';
  } else {
    periodOfDay = 'night';
  }

  // Get day of week
  const dayNames: (
    | 'SUNDAY'
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
  )[] = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];
  const dayOfWeek = dayNames[now.getDay()];

  return {
    openEditorsCount,
    unsavedFilesCount,
    terminalCount,
    periodOfDay,
    dayOfWeek,
  };
}
