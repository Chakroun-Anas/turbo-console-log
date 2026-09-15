import { InsertionEngineCase } from './types';
import { beforeStatementAnchorCases } from './beforeStatementAnchor';
import { callbackInsideReturnCases } from './callbackInsideReturn';
import { callLikeInitializerCases } from './callLikeInitializer';
import { catchClauseCases } from './catchClause';
import { declarationStatementEndCases } from './declarationStatementEnd';
import { destructuringBindingCases } from './destructuringBinding';
import { elseIfConditionCases } from './elseIfCondition';
import { functionBodyOnSignatureLineCases } from './functionBodyOnSignatureLine';
import { innerDeclarationInCallbackCases } from './innerDeclarationInCallback';
import { methodCallObjectCases } from './methodCallObject';
import { multiLineReassignmentCases } from './multiLineReassignment';
import { objectPropertyWithoutDeclarationCases } from './objectPropertyWithoutDeclaration';
import { optionalChainCallCases } from './optionalChainCall';
import { placementConventionCases } from './placementConventions';
import { sfcScriptExtractionCases } from './sfcScriptExtraction';
import { statementBoundaryCases } from './statementBoundary';
import { transformerFalsePositiveCases } from './transformerFalsePositive';
import { tsWrappedObjectLiteralCases } from './tsWrappedObjectLiteral';

export type { InsertionEngineCase } from './types';

export const insertionEngineCases: InsertionEngineCase[] = [
  ...placementConventionCases,
  ...catchClauseCases,
  ...elseIfConditionCases,
  ...objectPropertyWithoutDeclarationCases,
  ...multiLineReassignmentCases,
  ...optionalChainCallCases,
  ...declarationStatementEndCases,
  ...innerDeclarationInCallbackCases,
  ...callLikeInitializerCases,
  ...destructuringBindingCases,
  ...methodCallObjectCases,
  ...functionBodyOnSignatureLineCases,
  ...transformerFalsePositiveCases,
  ...statementBoundaryCases,
  ...callbackInsideReturnCases,
  ...tsWrappedObjectLiteralCases,
  ...beforeStatementAnchorCases,
  ...sfcScriptExtractionCases,
];

export default insertionEngineCases;
