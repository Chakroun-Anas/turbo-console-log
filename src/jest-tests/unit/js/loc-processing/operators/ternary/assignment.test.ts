import helpers from '../../../helpers';

describe('Ternary operator assignment', () => {
  it('Should return true for ternary assignment LOCs', () => {
    const ternaryAssignmentLOCs = [`const foo = 1 + 1 === 2 ? 'bar': 'baz';`];
    ternaryAssignmentLOCs.forEach((ternaryAssignmentLOC) => {
      expect(
        helpers.jsLineCodeProcessing.isTernaryExpressionAssignment(
          ternaryAssignmentLOC,
        ),
      ).toBe(true);
    });
  });
});
