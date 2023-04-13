import { describe } from 'mocha';
import classDeclarationTest from './class-declaration.test';
import classNameTest from './class-name.test';

export default (): void => {
  describe('Class LOC processing', () => {
    classDeclarationTest();
    classNameTest();
  });
};
