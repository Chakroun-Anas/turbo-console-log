import { describe } from 'mocha';
import logFeatureTests from './log-feature';
import commentFeatureTests from './comment-feature';
import uncommentFeatureTests from './uncomment-feature';
export default (): void => {
  describe('JS features', () => {
    logFeatureTests();
    commentFeatureTests();
    uncommentFeatureTests();
  });
};
