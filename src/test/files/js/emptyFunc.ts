// @ts-nocheck

export class SomeClass {
  constructor(
    protected firstDependency: Segments,
    protected secondDependency: SegmentProviders
  ) {}
}

interface Person {
  fullName: string;
}

function sayHello(person: Person) {}

sayHello({
  fullName: "CHAKROUN Anas",
});
