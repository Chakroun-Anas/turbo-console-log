# Turbo Console Log 🚀

**[Official Website](https://www.turboconsolelog.io)** | **[Turbo Pro](https://www.turboconsolelog.io/pro)** | **[GitHub Repository](https://github.com/Chakroun-Anas/turbo-console-log)**

---

## Automated Logging for JavaScript, TypeScript, Python, and PHP

**Turbo Console Log transforms debugging in JavaScript, TypeScript, Python, and PHP.** It's built for developers who refuse to waste time manually typing log statements or hunting them down across dozens of files.

---

### **Two Editions**

**Turbo Console Log Community 🚀**  
Single-file debugging for JavaScript, TypeScript, Python, and PHP. Insert, comment, uncomment, and delete logs with keyboard shortcuts. Uses AST parsing to place logs correctly, even in complex code structures.

**Turbo Console Log Pro 👑**  
Workspace-wide log management across JavaScript, TypeScript, Python, and PHP. View all logs across your entire codebase in a tree view, delete logs by type across multiple files, filter and search logs instantly — beyond what single-file editing allows.

---

### 🐍 Python Support Is Here

**Turbo Console Log now supports Python!** After successfully bringing intelligent logging to JavaScript, TypeScript, and PHP, Python support is now available with the same AST-powered precision you know and trust.

**[Read the full announcement →](https://www.turboconsolelog.io/articles/release-3240)**

## Community Version Features 🚀

The free version provides intelligent log insertion in your active editor:

### ✨ Smart Log Insertion

- **AST-Powered Precision** – Logs are placed correctly based on code structure, handling complex patterns like ternaries, destructuring, and nested expressions
- **7 Console Methods (JS/TS)** – Dedicated commands for `console.log`, `console.info`, `console.debug`, `console.warn`, `console.error`, `console.table`, and custom log functions
- **Python Methods** – Support for `print()`, `logging.debug()`, `logging.info()`, `logging.warning()`, `logging.error()`, and custom Python logging functions
- **PHP Methods** – Support for `var_dump()`, `print_r()`, `error_log()`, and custom PHP logging functions
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

**JavaScript / TypeScript**

- **`⌘K ⌘L`** (Ctrl+K Ctrl+L on Windows/Linux) – Insert console.log
- **`⌘K ⌘E`** – Insert console.error
- **`⌘K ⌘R`** – Insert console.warn
- **`⌘K ⌘N`** – Insert console.info

**Python**

- **`⌘K ⌘L`** (Ctrl+K Ctrl+L on Windows/Linux) – Insert print()
- **`⌘K ⌘B`** – Insert logging.debug()
- **`⌘K ⌘N`** – Insert logging.info()
- **`⌘K ⌘R`** – Insert logging.warning()
- **`⌘K ⌘E`** – Insert logging.error()

**PHP**

- **`⌘K ⌘L`** (Ctrl+K Ctrl+L on Windows/Linux) – Insert var_dump()
- **`⌘K ⌘N`** – Insert print_r()
- **`⌘K ⌘B`** / **`⌘K ⌘E`** – Insert error_log()

**Log Management (all languages)**

- **`Alt+Shift+D`** – Delete all logs in current file
- **`Alt+Shift+C`** – Comment all logs in current file
- **`Alt+Shift+U`** – Uncomment all logs in current file
- **`Alt+Shift+X`** – Correct log messages (update file names & line numbers)

**Full Documentation:** **[Turbo Console Log Docs](https://www.turboconsolelog.io/documentation)**

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

## Turbo Pro Features 💎

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

**Find any log by content in seconds.** Type the keyword, see matching logs instantly, click to jump to the exact line.

- No grep, no scrolling through files, no memory required
- Search across your entire workspace
- Results update as you type

### 🌍 Multi-Language Support

Pro recognizes **JavaScript, TypeScript, Python, and PHP** logs in one unified view:

- **JavaScript/TypeScript:** All console methods and a custom log method from the settings
- **Python:** `print()`, `logging.debug()`, `logging.info()`, `logging.warning()`, `logging.error()`, and a custom log method from the settings
- **PHP:** `var_dump()`, `print_r()`, `error_log()`, and a custom log method from the settings
- **Custom Functions:** Your own logging functions, any language

### ✨ Enhanced Experience

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

**[See Pro in Action](https://www.turboconsolelog.io/pro#see-it-in-action)** | **[Upgrade to Pro](https://www.turboconsolelog.io/pro)**

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
