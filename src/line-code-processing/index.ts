import { LineCodeClassProcessing } from './lineCodeClassProcessing';
import { LineCodeFunctionProcessing } from './lineCodeFunctionProcessing';

export interface LineCodeProcessing
  extends LineCodeClassProcessing,
    LineCodeFunctionProcessing {
  isAssignedToVariable(loc: string): boolean;
  isAffectationToVariable(loc: string): boolean;
  isObjectLiteralAssignedToVariable(loc: string): boolean;
  isArrayAssignedToVariable(loc: string): boolean;
}
