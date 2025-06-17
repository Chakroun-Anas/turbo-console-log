import helpers from '../../../helpers';

describe('Nullish operator assignment', () => {
  it('Should correctly place log after nullish coalescing assignment', () => {
    const nullishLOC = `
          const data = someValue ?? defaultValue;
        `;
    expect(
      helpers.jsLineCodeProcessing.isNullishCoalescingAssignment(nullishLOC),
    ).toBe(true);
  });
});
