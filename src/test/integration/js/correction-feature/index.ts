import { describe } from 'mocha';
import correctLogMessage from './correctLogMessages';
import correctWarnLogMessage from './correctWarnLogMessages';
import correctErrorLogMessage from './correctErrorLogMessages';
import correctTableLogMessage from './correctTableLogMessages';
import correctDebugLogMessage from './correctDebugLogMessages';
import correctCustomLogMessage from './correctCustomLogMessages';

export default (): void => {
  describe('Correct turbo log messages line number or file name if necessary', () => {
    correctLogMessage();
    correctWarnLogMessage();
    correctErrorLogMessage();
    correctTableLogMessage();
    correctDebugLogMessage();
    correctCustomLogMessage();
  });
};
