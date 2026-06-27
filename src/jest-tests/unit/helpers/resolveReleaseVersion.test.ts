import { resolveReleaseVersion } from '../../../helpers/resolveReleaseVersion';

describe('resolveReleaseVersion', () => {
  describe('exact match', () => {
    it('returns the version when it is the only entry in the list', () => {
      expect(resolveReleaseVersion('3.25.0', ['3.25.0'])).toBe('3.25.0');
    });

    it('returns the version when it matches a middle entry', () => {
      expect(resolveReleaseVersion('3.25.0', ['3.25.0', '3.30.0'])).toBe(
        '3.25.0',
      );
    });

    it('returns the version when it matches the last entry', () => {
      expect(resolveReleaseVersion('3.30.0', ['3.25.0', '3.30.0'])).toBe(
        '3.30.0',
      );
    });
  });

  describe('fallback to last release version', () => {
    it('returns the only entry when current version is a newer patch', () => {
      expect(resolveReleaseVersion('3.25.1', ['3.25.0'])).toBe('3.25.0');
    });

    it('returns the only entry when current version is a newer minor', () => {
      expect(resolveReleaseVersion('3.26.0', ['3.25.0'])).toBe('3.25.0');
    });

    it('returns the last entry when multiple versions exist and current is newer than all', () => {
      expect(resolveReleaseVersion('3.31.0', ['3.25.0', '3.30.0'])).toBe(
        '3.30.0',
      );
    });

    it('returns the last entry when current version is older than all release versions', () => {
      expect(resolveReleaseVersion('3.0.0', ['3.25.0', '3.30.0'])).toBe(
        '3.30.0',
      );
    });

    it('returns the last entry when current version is between two release versions', () => {
      expect(resolveReleaseVersion('3.27.0', ['3.25.0', '3.30.0'])).toBe(
        '3.30.0',
      );
    });
  });

  describe('empty versions list', () => {
    it('returns undefined', () => {
      expect(resolveReleaseVersion('3.25.0', [])).toBeUndefined();
    });

    it('returns undefined regardless of the current version', () => {
      expect(resolveReleaseVersion('99.0.0', [])).toBeUndefined();
    });
  });

  describe('uses real RELEASE_PANEL_VERSIONS when no override is passed', () => {
    it('resolves 3.25.0 to itself', () => {
      expect(resolveReleaseVersion('3.25.0')).toBe('3.25.0');
    });

    it('resolves a non-release version to the last release version', () => {
      expect(resolveReleaseVersion('3.26.0')).toBe('3.25.0');
    });
  });
});
