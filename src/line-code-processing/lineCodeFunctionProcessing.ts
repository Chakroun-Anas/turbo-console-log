export interface LineCodeFunctionProcessing {
  doesContainsBuiltInFunction(loc: string): boolean;
  doesContainsNamedFunctionDeclaration(loc: string): boolean;
  isFunctionAssignedToVariable(loc: string): boolean;
  isFunctionDeclaration(loc: string): boolean;
  isObjectFunctionCall(loc: string): boolean;
  getFunctionName(loc: string): string;
}
