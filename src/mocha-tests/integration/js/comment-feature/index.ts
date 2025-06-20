import { describe } from 'mocha';
import commentLogMessagesTest from './commentLogMessages';
import commentCustomLogMessages from './commentCustomLogMessages';
import commentDebugMessagesTests from './commentDebugMessages';
import commentWarnMessages from './commentWarnMessages';
import commentErrorMessages from './commentErrorMessages';
import commentTableMessages from './commentTableMessages';

export default (): void => {
  describe('Comment log messages inserted by the extension feature', () => {
    commentLogMessagesTest();
    commentDebugMessagesTests();
    commentCustomLogMessages();
    commentWarnMessages();
    commentErrorMessages();
    commentTableMessages();
  });
};
