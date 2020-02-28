// @flow

/**
 * Check if line code represents a class declaration
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function checkClassDeclaration(lineCode: string): boolean {
  const classNameRegex = /class(\s+)[a-zA-Z]+(.*){/;
  return classNameRegex.test(lineCode);
}

/**
 * Check if line code represents an object declaration
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function checkObjectDeclaration(lineCode: string): boolean {
  const objectRejex = /(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*){/;
  return objectRejex.test(lineCode);
}

/**
 * Check if the line code represents an array declaration
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function checkArrayDeclaration(
  lineCodeSelectionLine: string,
  lineCodeSelectionNextLine: string
): boolean {
  const arrayDeclarationRegex: RegExp = /(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*)\[/;
  return (
    arrayDeclarationRegex.test(lineCodeSelectionLine) ||
    (/(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*).*[a-zA-Z0-9]*/.test(
      lineCodeSelectionLine
    ) &&
      lineCodeSelectionNextLine.startsWith("["))
  );
}

/**
 * Check if line code represents a function call
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function checkFunctionCallDeclaration(lineCode: string): boolean {
  const functionCallDeclarationRegex = /(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*).*\(.*/;
  return functionCallDeclarationRegex.test(lineCode);
}

/**
 * Check if line code represents a function call related to an object (obj.func)
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function checkObjectFunctionCallDeclaration(
  lineCodeSelectionLine: string,
  lineCodeSelectionNextLine: string
): boolean {
  const objectFunctionCallDeclaration: RegExp = /(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*).*[a-zA-Z0-9]*\./;
  return (
    objectFunctionCallDeclaration.test(lineCodeSelectionLine) ||
    (/(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*).*[a-zA-Z0-9]*/.test(
      lineCodeSelectionLine
    ) &&
      lineCodeSelectionNextLine.startsWith("."))
  );
}

/**
 * Return the class name in case if the line code represents a class declaration
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function className(lineCode: string): string {
  if (lineCode.split(/class /).length >= 2) {
    const textInTheRightOfClassKeyword = lineCode.split(/class /)[1].trim();
    if (textInTheRightOfClassKeyword.split(" ").length > 0) {
      return textInTheRightOfClassKeyword.split(" ")[0].replace("{", "");
    } else {
      return textInTheRightOfClassKeyword.replace("{", "");
    }
  }
  return "";
}

/**
 * Return a boolean indicating if the line code represents a named function declaration
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function checkIfFunction(lineCode: string): boolean {
  const namedFunctionDeclarationRegex = /(function)?(\s*)[a-zA-Z]+(\s*)\(.*\):?(\s*)[a-zA-Z]*(\s*){/;
  const nonNamedFunctionDeclaration = /(function)(\s*)\(.*\)(\s*){/;
  const namedFunctionExpressionRegex = /[a-zA-Z]+(\s*)=(\s*)(function)?(\s*)[a-zA-Z]*(\s*)\(.*\)(\s*)(=>)?(\s*){/;
  const isNamedFunctionDeclaration = namedFunctionDeclarationRegex.test(
    lineCode
  );
  const isNonNamedFunctionDeclaration = nonNamedFunctionDeclaration.test(
    lineCode
  );
  const isNamedFunctionExpression = namedFunctionExpressionRegex.test(lineCode);
  return (
    (isNamedFunctionDeclaration && !isNonNamedFunctionDeclaration) ||
    isNamedFunctionExpression
  );
}

/**
 * Return a boolean indicating if the line code represents an if, switch, while, for or catch statement
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function checkIfJSBuiltInStatement(lineCode: string): boolean {
  const jSBuiltInStatement = /(if|switch|while|for|catch)(\s*)\(.*\)(\s*){/;
  return jSBuiltInStatement.test(lineCode);
}

/**
 * Return the function name in case if the line code represents a named function declaration
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 */
function functionName(lineCode: string): string {
  if (/function(\s+)[a-zA-Z]+(\s*)\(.*\)(\s*){/.test(lineCode)) {
    if (lineCode.split("function ").length > 1) {
      return lineCode
        .split("function ")[1]
        .split("(")[0]
        .replace(/(\s*)/g, "");
    }
  } else {
    if (lineCode.split(/\(.*\)/).length > 0) {
      const textInTheLeftOfTheParams = lineCode.split(/\(.*\)/)[0];
      if (/=/.test(textInTheLeftOfTheParams)) {
        if (textInTheLeftOfTheParams.split("=").length > 0) {
          return textInTheLeftOfTheParams
            .split("=")[0]
            .replace(/export |module.exports |const |var |let |=|(\s*)/g, "");
        }
      } else {
        return textInTheLeftOfTheParams.replace(
          /async|public|private|protected|static|export |(\s*)/g,
          ""
        );
      }
    }
  }
  return "";
}

module.exports.checkClassDeclaration = checkClassDeclaration;
module.exports.checkObjectDeclaration = checkObjectDeclaration;
module.exports.checkArrayDeclaration = checkArrayDeclaration;
module.exports.checkFunctionCallDeclaration = checkFunctionCallDeclaration;
module.exports.checkObjectFunctionCallDeclaration = checkObjectFunctionCallDeclaration;
module.exports.className = className;
module.exports.checkIfFunction = checkIfFunction;
module.exports.checkIfJSBuiltInStatement = checkIfJSBuiltInStatement;
module.exports.functionName = functionName;
