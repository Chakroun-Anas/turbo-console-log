// @ts-nocheck

export class SomeClass extends AnotherClass<SomeEntity> {
  async someFunc(someParam: ParamType = {}) {
    const variable: FilterObject<UrlRuleEntity> = {
      a: SomeOperator.someFunc(NOW, { orNull: true }),
      ...(undefined !== b && { b }),
      ...(undefined !== c && { c }),
      ...(undefined !== d && { d }),
      ...(Boolean(started) && {
        x: SomeOperator.y(p),
      }),
    };
    return variable;
  }
}
