import helpers from '../../helpers';

describe('Built-in function LOC', () => {
  it('Should return true when loc contains a built-in function', () => {
    const builtInFunctionInvocationLOCs = [
      `if (a > 0)  {`,
      `if (a > 0) return 0;`,
      `switch (n) {`,
      `for(let i=0; i < 10; i++) {`,
      `while(true) {`,
      `catch(error) {`,
      `do {
          
                      } while(true)`,
      `while( n < 3) {
                          n++;
                      }`,
    ];
    builtInFunctionInvocationLOCs.forEach((builtInFunctionInvocationLOC) => {
      expect(
        helpers.jsLineCodeProcessing.doesContainsBuiltInFunction(
          builtInFunctionInvocationLOC,
        ),
      ).toBe(true);
    });
  });
  it('Should return false when loc does not contain a built-in function', () => {
    const nonBuiltInFunctionLOCs = [`function sayHello() {`];
    nonBuiltInFunctionLOCs.forEach((nonBuiltInFunctionLOC) => {
      expect(
        helpers.jsLineCodeProcessing.doesContainsBuiltInFunction(
          nonBuiltInFunctionLOC,
        ),
      ).toBe(false);
    });
  });
});
