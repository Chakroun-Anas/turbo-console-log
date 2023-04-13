import { describe, it } from 'mocha';
import { expect } from 'chai';
import helpers from '../../helpers';

export default (): void => {
  describe('Named function LOC', () => {
    const namedFunctionsLOCs = [
      'function functionName(){',
      'function functionName(){',
      'function sayHello (arg1, arg2) {',
      'module.exports = function functionName (arg1, arg2) {',
      'export default function functionName (arg1, arg2) {',
      'functionName (arg1, arg2, arg3) {',
      'const functionName = function (arg1, arg2) {',
      'let functionName = (arg1, arg2) => {',
      'array.forEach(function functionName() {',
      'export const functionName = (arg1, arg2) => {',
      'const functionName = (arg1: Type1, arg2: Type2) => {',
      'const functionName = (arg1: Type1, arg2: Type2): Type3 => {',
      'functionName(arg1: any): any {',
      'async functionName(arg1: any): any {',
      'public functionName(arg1: any): any {',
      'public async functionName(arg1: any): any {',
      'public static functionName(arg1: any): any {',
      'private functionName(arg1: any): any {',
      'protected functionName(arg1: any): any {',
      'static functionName(arg1: any): any {',
      'export functionName(arg1: any): any {',
      'export default async function functionName(arg1) {',
      '  constructor(fullName) {',
      ' async sayHello(somePram: any): Promise<void> {',
      '  unitsValidation( scriptId ): any[] {',
    ];
    it('Should return true when LOC contains named function declaration', () => {
      namedFunctionsLOCs.forEach((namedFunctionLOC) => {
        expect(
          helpers.jsLineCodeProcessing.doesContainsNamedFunctionDeclaration(
            namedFunctionLOC,
          ),
        ).to.equal(true);
      });
    });
    it("Should return false LOC doesn't contains named function declaration", () => {
      const nonNamedFunctionsLOCs = [
        'function() {',
        'function(arg1, arg2) {',
        '() => {',
        '(arg1, arg2) => {',
        'module.exports = function (arg1, arg2) {',
        'function( {',
        'function) {',
      ];
      nonNamedFunctionsLOCs.forEach((nonNamedFunctionLOC) => {
        expect(
          helpers.jsLineCodeProcessing.doesContainsNamedFunctionDeclaration(
            nonNamedFunctionLOC,
          ),
        ).to.equal(false);
      });
    });
  });
};
