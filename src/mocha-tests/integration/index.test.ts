import { describe } from 'mocha';
import jsFeaturesTests from './js';
import phpFeaturesTests from './php';

describe('Integration tests', () => {
  jsFeaturesTests();
  phpFeaturesTests();
});
