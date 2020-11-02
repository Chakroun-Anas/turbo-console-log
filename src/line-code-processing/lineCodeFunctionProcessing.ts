export interface LineCodeFunctionProcessing {
    doesContainsBuiltInFunction(loc: string): boolean;
    doesContainsNamedFunctionDeclaration(loc: string): boolean;
    doesContainsFunctionCall(loc: string): boolean;
    doesContainsObjectFunctionCall(loc: string): boolean;
    getFunctionName(loc: string): string;
}