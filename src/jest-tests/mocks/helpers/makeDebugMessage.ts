import { DebugMessage } from '@/debug-message';

export const makeDebugMessage = (): DebugMessage => ({
  msg: jest.fn(),
  logMessage: jest.fn(),
  detectAll: jest.fn(),
  enclosingBlockName: jest.fn(),
});
