# <span style="color:deepskyblue">**Turbo Console Log tests documentation**</span>

This document inclues information about the tests for Turbo Console Log extension.

## <span style="color:khaki">**Testing Frameworks**</span>

- <span style="color:deepskyblue">Mocha</span>
  : A flexible and widely-used testing framework that provides a simple and customizable test runner. It supports a variety of testing styles, including BDD (Behavior-Driven Development), TDD (Test-Driven Development), and more. Mocha allows developers to write asynchronous tests, and provides features such as hooks, timeouts, and reporters to customize the testing process. (https://mochajs.org/)

- <span style="color:deepskyblue">Chai</span>: An assertion library that can be used in conjunction with Mocha (or other testing frameworks) to provide a more expressive and readable syntax for writing tests. Chai provides several assertion styles, including BDD-style "expect" and "should" syntax, as well as a classic "assert" style. It also supports chaining and negation for complex assertions, and can be extended with plugins to provide additional functionality. (https://www.chaijs.com/)

## <span style="color:khaki">**Tests Structure**</span>

The test folder is structured as follows:

- <span style="color:#808080">**files**</span> folder contains the files used in the integration tests.
- <span style="color:#808080">**integration**</span> folder contains the integration tests.
- <span style="color:#808080">**unit**</span> folder contains the unit tests.
- <span style="color:#808080">**testsRunner.ts**</span> is the file that export a function to runs the tests.
- <span style="color:#808080">**runTests.ts**</span> is the main file that runs the tests.

The tests inside integration and unit folders are structured as follows:

```
scope/
└── features/
    ├── feature1/
    │   ├── scenario1/
    │   │   ├── test_case1.py
    │   │   └── test_case2.py
    │   ├── scenario2/
    │   │   └── test_case3.py
    │   └── feature1.feature
    ├── feature2/
    │   ├── scenario3/
    │   │   └── test_case4.py
    │   └── feature2.feature
    └── feature3/
        ├── scenario4/
        │   ├── test_case5.py
        │   └── test_case6.py
        └── feature3.feature
```

The scope is usually the targeted programming language, for example: python, javascript, typescript, etc.

The features are the features that are tested, for example when it comes to integration tests: insert a log message, comment log messages, uncomment log messages, etc.

A complex scenario can be divided into multiple sub scenarios, in this case a folder should be created for each sub scenario and the test cases should be placed inside it.

A simple scenario can include directly the test cases as files inside the scenario folder.

## <span style="color:khaki">**Writing tests**</span>

The tests need to be written in typescript, and the test files should be placed inside the integration or unit folder while respecting the structure described above.

For integration tests, many helper functions are available in the <span style="color:#808080">**helpers**</span> folder, specially:

- `expectActiveTextEditorWithFile` that ensures at some stage that an active text editor is opened with the file subject of the test.
- `documentLinesChanged` that ensures that the document lines are changed after a command is executed.

## <span style="color:khaki">**Running the tests**</span>

To run the tests, two options are available:

### <span style="color:khaki">**Running the tests from the command line**</span>

```
npm run test
```

<div class="warning">
  
<span style="color:black"> **Warning ⚠️:** <span style="color:black">

<span style="color:black">Running extension tests from the <u>command line</u> is currently <u style="color:darkred">**only**</u> supported if no other instance of Code is running.</span>

</div>

<style>
.warning {
  background-color: #FFE8CC;
  padding: 10px;
  margin: 10px 0;
  border-radius: 3px;
}
</style>

### <span style="color:khaki">**Running the tests with the debugger**</span>

1. Open the <span style="color:deepskyblue">**Debug View**</span> by clicking on the <span style="color:deepskyblue">**Debug**</span> icon in the <span style="color:deepskyblue">**Activity Bar**</span> on the left side of the <span style="color:deepskyblue">**VS Code**</span> window.
2. Select the <span style="color:deepskyblue">**Test: All**</span> configuration.
3. Press <span style="color:deepskyblue">**F5**</span> or click on the <span style="color:deepskyblue">**Start Debugging**</span> button.

if you are interested in running a specific test, you will need to locate use the test file and add `.only` to the test function, be careful please not to commit this change.

## <span style="color:khaki">**Strategy**</span>

As it should be for any software, any changes to the code extension should be tested before committing them.
