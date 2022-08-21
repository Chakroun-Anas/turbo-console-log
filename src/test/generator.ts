import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import launchJSON from './launch.json';

const testFile = `
import Mocha from "mocha";
import * as assert from "assert";
import * as vscode from "vscode";
import { openDocument } from "../helpers";

test("testLongName", async () => {
  await openDocument("../files/js/testFileName.js");
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    activeTextEditor.selections = [
      new vscode.Selection(
        new vscode.Position(0, 6),
        new vscode.Position(0, 12)
      ),
    ];
    await vscode.commands.executeCommand(
      "turboConsoleLog.displayLogMessage",
      []
    );
    const textDocument = activeTextEditor.document;
    const logMessage = textDocument.lineAt(4).text;
    assert.strictEqual(/console\\.log\\(.*/.test(logMessage), true);
  }
  Mocha.afterEach(async () => {
    await vscode.commands.executeCommand(
      "workbench.action.closeActiveEditor",
      []
    );
  });
});
`;

const testFileRunner = `
import * as path from "path";
import Mocha from "mocha";

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
  });

  const testFile = path.resolve(__dirname, "../js/testFileName.test.js");
  mocha.addFile(testFile);
  return new Promise((resolve, reject) => {
    try {
      // Run the mocha test
      mocha.run((failures) => {
        if (failures > 0) {
          reject(new Error('Test failed'));
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
`;

const testLaunchConfig = {
  name: 'Test: testShortName',
  type: 'extensionHost',
  request: 'launch',
  args: [
    '--extensionDevelopmentPath=${workspaceFolder}',
    '--extensionTestsPath=${workspaceFolder}/out/test/suite/testFileName',
  ],
  outFiles: ['${workspaceFolder}/out/test/**/*.js'],
  preLaunchTask: '${defaultBuildTask}',
};

function generateTest() {
  if (areParametersValid()) {
    const testFileName: string = getFileName(process.argv);
    const testLongName: string = getTestLongName(process.argv);
    const testShortName: string = getTestShortName(process.argv);
    fs.writeFile(
      `${path.join(__dirname, `./js/${testFileName}.test.ts`)}`,
      testFile
        .replace(/testLongName/, testLongName)
        .replace(/testFileName/, testFileName),
      () => {
        console.log(chalk.green('Test file created'));
      },
    );
    fs.writeFile(
      `${path.join(__dirname, `./suite/${testFileName}.ts`)}`,
      testFileRunner.replace(/testFileName/, getFileName(process.argv)),
      () => {
        console.log(chalk.green('Test file runner created'));
      },
    );
    launchJSON.configurations.push({
      ...testLaunchConfig,
      name: testLaunchConfig.name.replace(/testShortName/, testShortName),
      args: [
        testLaunchConfig.args[0],
        testLaunchConfig.args[1].replace(/testFileName/, testFileName),
      ],
    });
    launchJSON.configurations.sort((firstConf, secondConf) => {
      return firstConf.name > secondConf.name ? 1 : -1;
    });
    fs.writeFile(
      path.join(__dirname, './launch.json'),
      JSON.stringify(launchJSON),
      () => {
        console.log(chalk.green('Test launch config is updated locally'));
      },
    );
    fs.writeFile(
      path.join(
        `${process.argv[1].replace('/src/test/generator.ts', '')}`,
        '.vscode/launch.json',
      ),
      JSON.stringify(launchJSON),
      () => {
        console.log(
          chalk.green('Test launch config is updated is .vscode folder'),
        );
      },
    );
  } else {
    process.exit(1);
  }
}

function areParametersValid(): boolean {
  const commandPrams = [...process.argv];
  console.log('🚀 ~ areParametersValid ~ commandPrams', commandPrams);
  let validParams = true;
  if (
    commandPrams.every((param) => !/--fileName=([a-zA-Z0-9(\s)])+/.test(param))
  ) {
    validParams = false;
    console.log(
      chalk.red(
        'You should specify a valid file name for the test using --fileName parameter.',
      ),
    );
  }
  if (
    commandPrams.every(
      (param) => !/--testShortName=([a-zA-Z0-9(\s)])+/.test(param),
    )
  ) {
    validParams = false;
    console.log(
      chalk.red(
        'You should specify a valid short name for the test using --testShortName parameter.',
      ),
    );
  }
  if (
    commandPrams.every(
      (param) => !/--testLongName=([a-zA-Z0-9(\s)])+/.test(param),
    )
  ) {
    validParams = false;
    console.log(
      chalk.red(
        'You should specify a valid long name for the test using --testLongName parameter.',
      ),
    );
  }
  return validParams;
}

function getFileName(params: Array<string>): string {
  const fileName: string | undefined = params.find((value) => {
    return /--fileName=([a-zA-Z0-9(\s)])+/.test(value);
  });
  if (fileName) {
    return fileName.replace('--fileName=', '');
  } else {
    throw new Error('An error occured while extracting test file name');
  }
}

function getTestLongName(params: Array<string>): string {
  const testLongName: string | undefined = params.find((value) =>
    /--testLongName=([a-zA-Z0-9(\s)])+/.test(value),
  );
  if (testLongName) {
    return testLongName.replace('--testLongName=', '');
  } else {
    throw new Error('An error occured while extracting test long name');
  }
}

function getTestShortName(params: Array<string>): string {
  const testShortName: string | undefined = params.find((value) =>
    /--testShortName=([a-zA-Z0-9(\s)])+/.test(value),
  );
  if (testShortName) {
    return testShortName.replace('--testShortName=', '');
  } else {
    throw new Error('An error occured while extracting test short name');
  }
}

generateTest();
