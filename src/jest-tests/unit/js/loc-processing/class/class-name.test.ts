import helpers from '../../helpers';

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
      expect(helpers.jsLineCodeProcessing.getClassName(classLOC)).toBe(
        classesNames[index],
      );
    });
  });
});
