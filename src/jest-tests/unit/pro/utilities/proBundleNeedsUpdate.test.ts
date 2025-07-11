// src/jest-tests/unit/pro/proBundleNeedsUpdate.test.ts

import { proBundleNeedsUpdate } from '../../../../pro/utilities';

describe('proBundleNeedsUpdate', () => {
  it('should return true if current version is greater than pro bundle version', () => {
    expect(proBundleNeedsUpdate('2.0.0', '1.5.0')).toBe(true);
    expect(proBundleNeedsUpdate('1.2.0', '1.1.9')).toBe(true);
    expect(proBundleNeedsUpdate('1.2.0', '1.1')).toBe(true);
  });

  it('should return false if versions are equal', () => {
    expect(proBundleNeedsUpdate('1.0.0', '1.0.0')).toBe(false);
    expect(proBundleNeedsUpdate('1.2.0', '1.2')).toBe(false);
  });

  it('should return false if current version is lower than pro bundle version', () => {
    expect(proBundleNeedsUpdate('1.5.0', '2.0.0')).toBe(false);
    expect(proBundleNeedsUpdate('1.1.9', '1.2.0')).toBe(false);
  });

  it('should return true if pro bundle version is missing', () => {
    expect(proBundleNeedsUpdate('1.0.0')).toBe(true);
  });
});
