import { describe } from 'mocha';
import coreTests from './core';
import jsFeaturesTests from './js';

describe('Integration tests', () => {
  coreTests();
  jsFeaturesTests();
});
