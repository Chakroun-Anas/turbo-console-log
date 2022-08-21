// @ts-nocheck

const namedFunction = function () {
  return 0;
};

const anonymousFunction = () => {
  return "hello";
};

const anonymousFunctionWithParams = (
  somePraram: { prop1: String; prop1: Boolean },
  otherParam: string
) => {
  return "hello";
};

const asyncAnonymousFunction = async (values: any) => {
  try {
  } catch (error) {}
};
