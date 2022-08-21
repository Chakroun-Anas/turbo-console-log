export interface LineCodeFunctionProcessing {
  doesContainsBuiltInFunction(loc: string): boolean;
  doesContainsNamedFunctionDeclaration(loc: string): boolean;
  isFunctionAssignedToVariable(loc: string): boolean;
  isFunctionDeclaration(loc: string): boolean;
  isObjectFunctionCall(loc: string): boolean;
  getFunctionName(loc: string): string;
  isAnonymousFunction(loc: string): boolean;
  isArgumentOfAnonymousFunction(loc: string, argument: string): boolean;
  /* 
    Wether the body of the anonymous function is already on a block or not
    Return true if the body is already in a block, false otherwise
  */
  shouldTransformAnonymousFunction(loc: string): boolean;
}
