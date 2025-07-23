import { spacesBeforeLine } from '@/utilities';
import { makeTextDocument } from '../../mocks/helpers/';

describe('spacesBeforeLine', () => {
  it('returns correct spaces before content', () => {
    const doc = makeTextDocument([
      '    const x = 42;', // ← 4 spaces before
    ]);

    const result = spacesBeforeLine(doc, 0);
    expect(result).toBe('    ');
  });
});
