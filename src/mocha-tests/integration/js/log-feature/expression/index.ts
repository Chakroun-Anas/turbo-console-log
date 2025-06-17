import { describe } from 'mocha';

import expressionCallTests from './call';

export default (): void => {
  describe('Expression Context', () => {
    expressionCallTests();
  });
};
