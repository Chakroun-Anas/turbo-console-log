const namedFunctionDeclarationRegex = /(function)?(\s*)[a-zA-Z]+(\s*)\(.*\):?(\s*)[a-zA-Z]*(\s*){/;
// const lineCodeProcessing = require("./build/lineCodeProcessing");
console.log("function functionName(){".match(namedFunctionDeclarationRegex));
