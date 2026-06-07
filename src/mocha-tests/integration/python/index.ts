import { describe } from 'mocha';
import logFeatureTests from './log-feature';
import commentFeatureTests from './comment-feature';
import uncommentFeatureTests from './uncomment-feature';
import deleteFeatureTests from './delete-feature';

export default (): void => {
  describe('Python features', () => {
    logFeatureTests();
    commentFeatureTests();
    uncommentFeatureTests();
    deleteFeatureTests();
  });
};
