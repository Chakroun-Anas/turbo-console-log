export interface LineCodeFunctionProcessing {
  doesContainsBuiltInFunction(loc: string): boolean;
  doesContainsNamedFunctionDeclaration(loc: string): boolean;
  isFunctionAssignedToVariable(loc: string): boolean;
  isObjectFunctionCallAssignedToVariable(loc: string): boolean;
  getFunctionName(loc: string): string;
}
