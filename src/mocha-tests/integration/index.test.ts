import { describe } from 'mocha';
import jsFeaturesTests from './js';
import phpFeaturesTests from './php';
import pythonFeaturesTests from './python';

describe('Integration tests', () => {
  jsFeaturesTests();
  phpFeaturesTests();
  pythonFeaturesTests();
});
