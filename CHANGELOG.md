# Change Log

All notable changes to the "turbo-console-log" extension will be documented in this file.

## [2.9.10]

- Fix issue with logging a parameter of a function assigned to a variable

## [2.9.9]

- Better detection of function assignment to a variable

## [2.9.8]

- Bundle size optimized following the release of recent version `2.9.7`

## [2.9.7]

- This update enhances the handling of destructuring assignments, ensuring that log messages are inserted in the correct line when logging variables within these structures.

## [2.9.6]

- Refined ES6 object literal assignment detection for improved accuracy.

## [2.9.5]

- Fix incorrect log line in the context of single-line and multi-line comments in object literal assignment check

## [2.9.4]

- Fix incorrect log line in the context of a variable within braces scope (#218)

## [2.9.3]

- Fix issue with logging a deep object property 🥳 (#211)

## [2.9.2]

- Fix issue with logging a variable with an anonymous function as the value (#210)

## [2.9.1]

- Fix issue with logging a function assigned to a variable
- Fix issue with logging a parameter of an empty function

## [2.9.0]

- Promise will keep an eye on the CHANGELOG from now on 😊

## [2.8.0]

- Default value for prefix property is set back to '🚀'
- Default value for suffix property is ':'
