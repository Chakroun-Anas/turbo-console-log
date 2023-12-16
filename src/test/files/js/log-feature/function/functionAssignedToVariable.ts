// @ts-nocheck

const namedFunction = function () {
  return 0;
};

const anonymousFunction = () => {
  return 'hello';
};

const anonymousFunctionWithParams = (
  somePraram: { prop1: String; prop1: Boolean },
  otherParam: string,
) => {
  return 'hello';
};

const handleClick = (event: React.MouseEvent<HTMLElement>) => {
  setAnchorEl(event.currentTarget);
};
