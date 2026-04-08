# 🚀 Turbo Console Log

**[Official Website](https://www.turboconsolelog.io)** | **[Turbo Pro](https://www.turboconsolelog.io/pro)** | **[GitHub Repository](https://github.com/Chakroun-Anas/turbo-console-log)**

---

## 🚀 Automated Logging for JavaScript/TypeScript and PHP

**Turbo Console Log automates the process of writing meaningful log statements.** Insert logs with a single keyboard shortcut, then manage them across your entire workspace with precision and speed.

### **Two Editions**

**🆓 Turbo Console Log (Free)**  
Focused on the active editor for JavaScript and TypeScript. Insert, comment, uncomment, and delete logs with keyboard shortcuts. Uses AST parsing to place logs correctly, even in complex code structures.

**💎 Turbo Console Log Pro**  
Workspace-wide log management for JavaScript, TypeScript, and PHP. View all logs across your entire codebase in a tree view, delete logs by type across multiple files, filter and search logs instantly.

---

## 🎁 New in v3.20.0 - Free 2-Hour Pro Trial

<p align="center">
  <img src="https://www.turboconsolelog.io/assets/turbo-pro-two-hours-trial.png" alt="Try Turbo Pro Free for 2 Hours" width="300">
</p>

**Experience the full power of Turbo Pro before purchasing.** We've introduced a free 2-hour trial that gives you complete access to all Pro features—no credit card required.

**How it works:**

1. **[Request your trial key](https://www.turboconsolelog.io/pro-trial)** via email (instant delivery)
2. Open VS Code: `Cmd+Shift+P` → "Turbo Console Log: Activate Trial"
3. Explore workspace-wide log management with an interactive guide
4. Full Pro features for 2 hours—workspace explorer, mass cleanup, filtering, search, and more

**[Get Your Free Trial Key →](https://www.turboconsolelog.io/pro-trial)**

---

## 🆓 Free Version Features

The free version provides intelligent log insertion in your active editor:

### ✨ Smart Log Insertion

- **AST-Powered Precision** – Logs are placed correctly based on code structure, handling complex patterns like ternaries, destructuring, and nested expressions
- **7 Console Methods (JS/TS)** – Dedicated commands for `console.log`, `console.info`, `console.debug`, `console.warn`, `console.error`, `console.table`, and custom log functions
- **PHP Methods (Pro only)** – Support for `var_dump()`, `print_r()`, `error_log()`, and custom PHP logging functions
- **Individual Shortcuts** – Each method has its own keyboard shortcut (⌘K combinations)
- **Multi-Cursor Support** – Insert logs for multiple variables simultaneously
- **Customizable Format** – Configure prefixes, quotes, spacing, and context information

### 🛠️ Log Management (Active Editor)

- **Comment All Logs** – Comment out all logs in the current file
- **Uncomment All Logs** – Restore previously commented logs
- **Delete All Logs** – Remove all logs from the current file
- **Correct Log Messages** – Update file names and line numbers after refactoring

**Best for:** Single-file work, small projects, and everyday debugging tasks

### ⌨️ Keyboard Shortcuts

- **`⌘K ⌘L`** (Ctrl+K Ctrl+L on Windows/Linux) – Insert console.log
- **`⌘K ⌘E`** – Insert console.error
- **`⌘K ⌘R`** – Insert console.warn
- **`⌘K ⌘N`** – Insert console.info
- **`Alt+Shift+D`** – Delete all logs in current file
- **`Alt+Shift+C`** – Comment all logs in current file
- **`Alt+Shift+U`** – Uncomment all logs in current file

**Full Documentation:** **[Turbo Console Log Docs](https://www.turboconsolelog.io/documentation)**

---

## 💎 Turbo Pro Features

<p align="center">
  <img src="https://www.turboconsolelog.io/assets/turbo-pro-illustration.png" alt="Turbo Console Log Pro" width="300">
</p>

**For larger codebases with logs spread across many files, Pro provides workspace-wide visibility and management.** See all logs across your entire workspace, delete logs by type across multiple files, and use advanced filtering and search.

**Best for:** Multi-file projects, teams, large codebases, and pre-commit cleanup workflows

### 🌲 Workspace Log Explorer

**Get a complete view of all logs in your project.** The workspace explorer displays every log across all files in a native VS Code tree view.

- Navigate your entire workspace's logs from one panel
- Click any log to jump directly to its location in the code
- Handles large codebases efficiently (hundreds or thousands of files)

### 🧹 Mass Cleanup Operations

**Delete logs across multiple files at once.** Select which log types to remove and the scope (workspace, folder, or file).

- Choose specific types: `console.log`, `console.error`, `console.warn`, or all types
- Set scope: entire workspace, specific folder, or single file
- Process hundreds of logs quickly and reliably

### 🎯 Real-Time Filtering

**Filter logs by type to focus on what matters.** Toggle log types and the tree view updates instantly.

- Filter by: log, error, warn, info, debug, table
- Updates immediately without re-scanning
- Color-coded for quick visual identification (🟦 log, 🟥 error, 🟨 warn, 🟩 info, 🟪 debug, 📊 table)

### 🔍 Instant Search

**Find logs by content across your workspace.** Search results update as you type, and you can jump directly to any match.

- Search across all workspace files
- Real-time results as you type
- Click to navigate directly to the log location

### ✨ Additional Features

- **Context Actions:** Right-click any log for quick actions (comment, delete, correct)
- **Auto-Correction:** Automatically updates file names and line numbers after refactoring
- **Hide Logs:** Temporarily hide logs by pattern, file, or folder
- **Smart Detection:** Recognizes both Turbo-generated logs and manually written console statements

### 🎁 Pro License Details

- ✅ **Lifetime access** – One-time purchase, use forever
- ✅ **Up to 5 machines** – Activate on multiple devices
- ✅ **All future updates** – Includes all future features and improvements
- ✅ **Priority email support** – Direct support at support@turboconsolelog.io

**One-time payment, no subscription required.**

**[Try the 2-Hour Free Trial](https://www.turboconsolelog.io/pro-trial)** | **[See Pro in Action](https://www.turboconsolelog.io/pro#see-it-in-action)** | **[Upgrade to Pro](https://www.turboconsolelog.io/pro)**

---

## ⚙️ Configuration

Both editions are fully customizable through VS Code settings. Access via `Preferences > Settings` and search for "Turbo Console Log".

### Log Message Format

- **`logMessagePrefix`** – Customize the prefix (default: `🚀`)
- **`logMessageSuffix`** – Customize the suffix (default: `:`)
- **`delimiterInsideMessage`** – Separator between log elements (default: `~`)
- **`quote`** – Quote style: `"` (double), `'` (single), or `` ` `` (backticks)
- **`wrapLogMessage`** – Wrap log messages in curly braces

### Context Information

- **`includeFilename`** – Add file name to log output
- **`includeLineNum`** – Add line number to log output
- **`insertEnclosingClass`** – Include class name in logs (default: `true`)
- **`insertEnclosingFunction`** – Include function name in logs (default: `true`)

### Spacing & Formatting

- **`insertEmptyLineBeforeLogMessage`** – Add blank line before logs
- **`insertEmptyLineAfterLogMessage`** – Add blank line after logs
- **`addSemicolonInTheEnd`** – Append semicolon to log statements

### Custom Logging

- **`logFunction`** – Custom log function name for the "Insert Custom Log" command (default: `log`)

### Notifications & Telemetry

- **`logCorrectionNotificationEnabled`** – Show notifications when logs are corrected
- **`isTurboTelemetryEnabled`** – Anonymous usage analytics (respects VS Code global settings)

**Full Settings Documentation:** **[Settings Guide](https://www.turboconsolelog.io/documentation/settings/custom-prefix)**

---

## ✉️ Newsletter

**Get updates on new features, releases, and Pro feature announcements.**

**[Join the Newsletter](https://www.turboconsolelog.io/join)**

---

## Contact

**Support:** **[support@turboconsolelog.io](mailto:support@turboconsolelog.io)**  
**Feedback:** **[feedback@turboconsolelog.io](mailto:feedback@turboconsolelog.io)**  
**Sponsorship:** **[sponsorship@turboconsolelog.io](mailto:sponsorship@turboconsolelog.io)**

---

## Contribute

Contributions are welcome! Report bugs, suggest features, or submit pull requests.

**[Contribute on GitHub](https://github.com/Chakroun-Anas/turbo-console-log)**

---

## License

Turbo Console Log is released under the **Turbo Unicorn Custom License**.  
Free for personal and non-commercial use. Commercial use, redistribution, and Pro features are protected.

See the full **[LICENSE](./LICENSE.txt)** for details.
