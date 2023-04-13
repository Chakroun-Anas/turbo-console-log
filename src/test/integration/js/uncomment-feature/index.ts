import { describe } from 'mocha';
import uncommentLogMessagesTests from './uncommentLogMessages';

export default (): void => {
  describe('Uncomment log messages inserted by the extension feature', () => {
    uncommentLogMessagesTests();
  });
};
