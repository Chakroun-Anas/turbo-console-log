import { describe, it } from 'mocha';
import { expect } from 'chai';
import helpers from '../../helpers';

export default (): void => {
  describe('Extract the class name', () => {
    it('Should extract the class name', () => {
      const classLOCs = [
        `export class JSLineCodeProcessing implements LineCodeProcessing {`,
        `class  MyComponent extends React.Component {`,
        `class HelloWorld{`,
        `class Day { `,
      ];
      const classesNames = [
        'JSLineCodeProcessing',
        'MyComponent',
        'HelloWorld',
        'Day',
      ];
      classLOCs.forEach((classLOC, index) => {
        expect(helpers.jsLineCodeProcessing.getClassName(classLOC)).to.equal(
          classesNames[index],
        );
      });
    });
  });
};
