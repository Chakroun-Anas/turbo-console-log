import { describe } from 'mocha';
import correctLogMessage from './correctLogMessages';

export default (): void => {
  describe('Correct turbo log messages line number or file name if necessary', () => {
    correctLogMessage();
  });
};
