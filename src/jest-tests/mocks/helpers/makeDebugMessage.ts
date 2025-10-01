import { DebugMessage } from '@/debug-message';

export const makeDebugMessage = (): DebugMessage => ({
  msg: jest.fn(),
  detectAll: jest.fn().mockResolvedValue([]),
});
