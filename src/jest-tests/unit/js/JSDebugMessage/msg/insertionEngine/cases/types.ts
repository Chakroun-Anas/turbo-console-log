import { LogMessageType } from '@/entities';

/**
 * One end-to-end scenario for the JS/TS insertion engine: the selection is run
 * through type detection (`logMessage`), line resolution (`line`) and the
 * transformation check (`needTransformation`), exactly as `msg()` chains them.
 */
export type InsertionEngineCase = {
  name: string;
  fileExtension: string;
  lines: string[];
  selectionLine: number;
  variableName: string;
  /**
   * Zero-based index the log is inserted at: the log goes BEFORE whatever
   * currently sits on that line. Not asserted when a transformation is expected.
   */
  expectedLine: number;
  expectedLogMessageType?: LogMessageType;
  /** Expression the log prints when it differs from the selection. */
  expectedDeepObjectPath?: string;
  expectsTransformation?: boolean;
  /**
   * Pins behaviour the engine does not honour yet: the case runs through
   * `it.failing`, so the suite stays green until the fix lands and then
   * reports "Failing test passed". Drop the flag together with the fix.
   */
  knownBroken?: boolean;
};
