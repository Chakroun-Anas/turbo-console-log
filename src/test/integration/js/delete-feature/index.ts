import { describe } from 'mocha';
import deleteLogMessagesTests from './deleteLogMessages';
import deleteWarnMessagesTests from './deleteWarnMessages';
import deleteErrorMessagesTests from './deleteErrorMessages';
import deleteTableMessagesTests from './deleteTableMessages';
import deleteDebugMessagesTests from './deleteDebugMessages';
import deleteCustomMessagesTests from './deleteCustomMessages';

export default (): void => {
  describe('Delete log messages inserted by the extension feature', () => {
    deleteLogMessagesTests();
    deleteWarnMessagesTests();
    deleteErrorMessagesTests();
    deleteTableMessagesTests();
    deleteDebugMessagesTests();
    deleteCustomMessagesTests();
  });
};
