import { describe } from 'mocha';
import logFeatureTests from './log-feature';
import commentFeatureTests from './comment-feature';
import uncommentFeatureTests from './uncomment-feature';
import correctionFeatureTests from './correction-feature';
export default (): void => {
  describe('JS features', () => {
    logFeatureTests();
    commentFeatureTests();
    uncommentFeatureTests();
    correctionFeatureTests();
  });
};
