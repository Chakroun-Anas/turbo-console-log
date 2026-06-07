import { describe } from 'mocha';
import loggingWarningTests from './loggingWarning';

export default (): void => {
  describe('Logging command', () => {
    loggingWarningTests();
  });
};
