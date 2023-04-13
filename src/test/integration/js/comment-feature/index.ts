import { describe } from 'mocha';
import commentLogMessagesTest from './commentLogMessages';
import commentCustomLogMessages from './commentCustomLogMessages';

export default (): void => {
  describe('Comment log messages inserted by the extension feature', () => {
    commentLogMessagesTest();
    commentCustomLogMessages();
  });
};
