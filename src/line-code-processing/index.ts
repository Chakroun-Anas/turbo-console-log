import { LineCodeClassProcessing } from "./lineCodeClassProcessing";
import { LineCodeFunctionProcessing } from "./lineCodeFunctionProcessing";

export interface LineCodeProcessing
  extends LineCodeClassProcessing,
    LineCodeFunctionProcessing {
  doesContainsObjectLiteralDeclaration(loc: string): boolean;
  doesContainsArrayDeclaration(loc: string): boolean;
}
