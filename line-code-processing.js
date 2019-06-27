/**
 * Return a boolean indicating if the line code represents a class declaration or not
 * @function
 * @param {string} lineCode
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @return {boolean}
 * @since 1.0
 */
function checkClassDeclaration(lineCode) {
  const classNameRegex = /class(\s+)[a-zA-Z]+(.*){/;
  return classNameRegex.test(lineCode);
}

function checkObjectDeclaration(lineCode) {
  const objectRejex = /(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*){/;
  return objectRejex.test(lineCode);
}

function checkArrayDeclaration(lineCodeSelectionLine, lineCodeSelectionNextLine) {
  const arrayDeclarationRejex = /(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*)\[/;
  return arrayDeclarationRejex.test(lineCodeSelectionLine) || (/(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*).*[a-zA-Z0-9]*/.test(lineCodeSelectionLine) && lineCodeSelectionNextLine.startsWith("["));
}

function checkFunctionCallDeclaration(lineCode) {
  const functionCallDeclarationRejex = /(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*).*\(.*/;
  return functionCallDeclarationRejex.test(lineCode);
}

function checkObjectFunctionCallDeclaration(lineCodeSelectionLine, lineCodeSelectionNextLine) {
  const objectFunctionCallDeclaration = /(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*).*[a-zA-Z0-9]*\./;
  return objectFunctionCallDeclaration.test(lineCodeSelectionLine) || (/(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*).*[a-zA-Z0-9]*/.test(lineCodeSelectionLine) && lineCodeSelectionNextLine.startsWith("."));
}

/**
 * Return the class name in case if the line code represents a class declaration
 * @function
 * @param {string} lineCode
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @return {string}
 * @since 1.0
 */
function className(lineCode) {
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
 * @function
 * @param {string} lineCode
 * @return {boolean}
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @since 1.0
 */
function checkIfFunction(lineCode) {
  const namedFunctionDeclarationRegex = /[a-zA-Z]+(\s*)\(.*\)(\s*){/;
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
 * @function
 * @param {string} lineCode
 * @return {boolean}
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @since 1.0
 */
function checkIfJSBuiltInStatement(lineCode) {
  const jSBuiltInStatement = /(if|switch|while|for|catch)(\s*)\(.*\)(\s*){/;
  return jSBuiltInStatement.test(lineCode);
}

/**
 * Return the function name in case if the line code represents a named function declaration
 * @function
 * @param {string} lineCode
 * @return {string} The name of the function that the line code represents
 * @author Chakroun Anas <chakroun.anas@outlook.com>
 * @since 1.0
 */
function functionName(lineCode) {
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
        return textInTheLeftOfTheParams.replace(/async|public|private|protected|static|export |(\s*)/g, "");
      }
    }
  }
  return "";
}

module.exports.checkClassDeclaration = checkClassDeclaration;
module.exports.checkObjectDeclaration = checkObjectDeclaration;
module.exports.checkArrayDeclaration = checkArrayDeclaration;
module.exports.checkFunctionCallDeclaration = checkFunctionCallDeclaration
module.exports.checkObjectFunctionCallDeclaration = checkObjectFunctionCallDeclaration;
module.exports.className = className;
module.exports.checkIfFunction = checkIfFunction;
module.exports.checkIfJSBuiltInStatement = checkIfJSBuiltInStatement;
module.exports.functionName = functionName;
