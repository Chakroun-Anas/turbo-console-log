import { describe } from 'mocha';
import uncommentLogMessagesTests from './uncommentLogMessages';
import uncommentDebugMessagesTests from './uncommentDebugMessages';
import uncommentErrorMessagesTests from './uncommentErrorMessages';
import uncommentWarnMessagesTests from './uncommentWarnMessages';
import uncommentTableMessages from './uncommentTableMessages';
import uncommentCustomMessages from './uncommentCustomMessages';

export default (): void => {
  describe('Uncomment log messages inserted by the extension feature', () => {
    uncommentLogMessagesTests();
    uncommentDebugMessagesTests();
    uncommentErrorMessagesTests();
    uncommentWarnMessagesTests();
    uncommentTableMessages();
    uncommentCustomMessages();
  });
};
