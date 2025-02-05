# Change Log

All notable changes to the "turbo-console-log" extension will be documented in this file.

## [2.11.4] - 2025-02-05

Fix - Correct v2.11.0 full release notes link URL in the release web view

## [2.11.3] - 2025-02-05

### 🎯 Refining the Sponsorship Flow for Better Engagement

**Web view adjustments** to further refine the sponsorship experience knowing that users who **already installed v2.11.0 or beyond** will not see the web view upon patch updates.

💡 This update is a small but necessary patch to fine-tune our sponsorship model, ensuring that engagement remains meaningful without unnecessary distractions. While it brings a minor adjustment ahead of the next bi-weekly release, it’s a crucial step in optimizing the sustainability of Turbo Console Log 🚀

## [2.11.2] - 2025-02-03

### 🔥 Improved Engagement & Support Visibility

- **Updated web view to prioritize sponsorship visibility** by making the primary call-to-action directly link to the sponsorship page.

💡 _This change is designed to increase engagement, which is crucial for the long-term sustainability of the project. By improving the way sponsorship is presented, we aim to secure more support from developers who rely on Turbo Console Log._ 🚀

## [2.11.1] - 2025-02-03

### 🛠️ Patch Fixes

- **Fixed log insertion in function parameter destructuring**.
- **Resolved an issue with log placement inside template literals and JSX expressions**.
- **Ensured the update notification is only shown once per major release** to avoid unnecessary prompts for users updating from patch versions.

📢 This is a **patch update** to refine stability and user experience after **v2.11.0**.

## [2.11.0] - 2025-02-03

### ✨ New Features

- **Correct Log Messages Command**: Logs now **automatically update their filenames and line numbers** after refactoring.

  - 🏷️ **Command:** `turboConsoleLog.correctAllLogMessages`
  - ⌨️ **Shortcut:** (Alt + Shift + X)
  - 📌 Related issue: [#248 – 🚀 Release v2.11.0: Major Bug Fixes & Improvements](https://github.com/Chakroun-Anas/turbo-console-log/issues/248)

- **Enhanced File Name & Line Number Handling**: The old `includeFileNameAndLineNum` setting has been split into:
  - ✅ `includeFilename` → Includes the file name in log messages.
  - ✅ `includeLineNum` → Includes the line number in log messages.
  - 📌 Related issue: [#247 – Enhance File Name and Line Number Handling in Log Messages](https://github.com/Chakroun-Anas/turbo-console-log/issues/247)

### 🛠️ Improvements & Bug Fixes

- 🔧 Improved **log placement accuracy** in complex expressions.
- 📝 Better handling of **nested objects, ternary expressions, and template literals**.
- 🛠️ Refined detection logic for **function assignments and array elements**.

📢 **First Bi-Weekly Release of 2025** → Expect **regular updates** and continuous improvements! 🚀

## [2.10.8]

### Fixed

- Corrected the extension ID used in the donation notification logic to ensure the notification displays properly in the published version.  
  Users will now see the sponsorship invitation notification when updating to a new version.

## [2.10.7]

### Changed

- Refactored core extension code for better maintainability and performance.
- Introduced a notification inviting users to sponsor the project.  
  Your support is critical to keep Turbo Console Log alive! Consider sponsoring the project to help maintain and develop new features: [https://www.turboconsolelog.io/home?showSponsor=true](https://www.turboconsolelog.io/home?showSponsor=true)

## [2.10.6]

### Fixed

- Improved detection of anonymous functions assigned to variable declarations, especially in cases where type annotations or complex expressions were used.

## [2.10.5]

### Fixed

- Improved Turbo Console Log to accurately insert log messages for variable assignments, specifically when a variable is assigned a value from a function call in TypeScript and JavaScript files.

## [2.10.4]

### Fixed

- Enhanced Turbo Console Log to accurately insert log messages for deconstructed function arguments in TypeScript and JavaScript files. This update ensures more reliable and precise logging capabilities, particularly in complex code structures involving destructuring within function parameters.

## [2.10.3]

- Update README website links

## [2.10.2]

- Fix README

## [2.10.1]

- Update README

## [2.10.0]

- Launch of Turbo Console Log new website (https://www.turboconsolelog.io) 🎉
- Include file name and line number setting is now disabled by default

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

- Fix issue with logging a deep object property
