import { describe, it } from 'mocha';
import { expect } from 'chai';
import helpers from '../../helpers';
export default (): void => {
  describe('Extract function name from LOC', () => {
    it('Should extract the function name from the LOC', () => {
      const namedFunctionsLOCs = [
        {
          loc: 'function functionName(){',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'function sayHello (arg1, arg2) {',
          expectedFunctionName: 'sayHello',
        },
        {
          loc: 'module.exports = function functionName (arg1, arg2) {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'export default function functionName (arg1, arg2) {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'function functionName (arg1, arg2, arg3) {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'let functionName = (arg1, arg2) => {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'array.forEach(function functionName() {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'export const functionName = (arg1, arg2) => {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'const functionName = (arg1: Type1, arg2: Type2) => {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'const functionName = (arg1: Type1, arg2: Type2): Type3 => {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'functionName(arg1: any): any {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'async functionName(arg1: any): any {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'public functionName(arg1: any): any {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'public async functionName(arg1: any): any {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'public static functionName(arg1: any): any {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'private functionName(arg1: any): any {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'protected functionName(arg1: any): any {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'static functionName(arg1: any): any {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'export functionName(arg1: any): any {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'export async functionName(arg1: any): any {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'export default async function functionName(arg1) {',
          expectedFunctionName: 'functionName',
        },
        {
          loc: 'constructor(fullName) {',
          expectedFunctionName: 'constructor',
        },
        {
          loc: 'async sayHello(somePram: any): Promise<void> {',
          expectedFunctionName: 'sayHello',
        },
        {
          loc: 'public unitsValidation(scriptId): any[] {',
          expectedFunctionName: 'unitsValidation',
        },
      ];
      namedFunctionsLOCs.forEach(({ loc, expectedFunctionName }) => {
        expect(helpers.jsLineCodeProcessing.getFunctionName(loc)).to.equal(
          expectedFunctionName,
        );
      });
    });
  });
};
