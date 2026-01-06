# Change Log

All notable changes to the "turbo-console-log" extension will be documented in this file.

## [3.13.1] - 2026-01-06

### 🐛 Bug Fix

**Fixed Double Notification Issue for Fresh Installs:**

- New users now only see the fresh install welcome notification
- Release announcements are now shown exclusively to existing users who are updating
- Prevents the confusing experience of seeing both notifications simultaneously during fresh installation

This ensures a cleaner onboarding experience for new users while maintaining proper release communication for the existing community.

## [3.13.0] - 2026-01-06

### 🎉 Happy New Year 2026 — Celebrating 2025 & Looking Ahead

**2025 Achievements:**

- ✅ Full AST Engine (96% smaller, 89% faster, 86% test coverage)
- ✅ Turbo PRO launched (workspace log explorer, mass cleanup, filtering, search)
- ✅ PHP Support added (first multi-language expansion)

**2026 Vision:**

- 🎯 Git Integration for Turbo Pro
- 🌍 Multi-Language Expansion (Python, Java, C#, Go, Rust, Ruby)
- 🤖 AI-Powered Code Analysis

**🎁 New Year Offer:** 20% OFF Turbo Pro (January 6-12, 2026)

→ [Read Full Celebration Article](https://www.turboconsolelog.io/articles/release-3130)  
→ [Learn About Turbo Pro](https://www.turboconsolelog.io/pro)

## [3.12.7] - 2025-12-31

### 🐛 Bug Fix: Follow-up to v3.12.6

**Fixed Milestone Flag Persistence:**

- Milestone flags (e.g., "shown 100 inserts notification") now persist even if VS Code reloads before you interact with notifications
- Previously, ignoring a notification then reloading VS Code could cause the same notification to appear again after the cooldown period

**Technical Details:**

- Refactored notification flow to fire-and-forget pattern
- Milestone flags written immediately, immune to extension lifecycle abandonment

### 📊 About the Notification System

Turbo uses a respectful cooldown system to avoid overwhelming you:

- **2-day cooldown** between milestone notifications
- **4 notifications/month max** for milestones and tips
- **~2 release notes/month** (don't count toward the limit)
- **Total: ~6-7 notifications/month maximum**

Thank you for your patience and feedback! 🙏

Wishing you all a fantastic new year 2026 🚀 🎉

## [3.12.6] - 2025-12-31

### 🐛 Critical Bug Fix

#### Fixed Race Condition Causing Duplicate Notifications

- **Issue**: Users were receiving multiple identical notifications when reaching some milestones
- **Root Cause**: Notification cooldown timestamp was updated asynchronously after notification completion, allowing rapid-fire command executions to bypass cooldown checks
- **Result**: Duplicate notifications are now completely prevented, even when the conditions of an event are met multiple times

We sincerely apologize for any inconvenience caused by duplicate notifications. This hotfix ensures a much better notification experience going forward.

## [3.12.5] - 2025-12-30

### 🔧 Infrastructure & Quality Improvements

- Internal improvements to extension infrastructure

## [3.12.4] - 2025-12-28

### 🔧 Infrastructure & Quality Improvements

- Internal improvements to extension infrastructure

## [3.12.3] - 2025-12-27

### 🔧 Infrastructure & Quality Improvements

- Internal improvements to extension infrastructure

## [3.12.2] - 2025-12-24

### 🔧 Infrastructure & Quality Improvements

- Internal improvements to extension infrastructure

## [3.12.1] - 2025-12-12

### 🔧 Bug Fixes & Improvements

#### Enhanced JSX Support in .js Files

Fixes [#316](https://github.com/Chakroun-Anas/turbo-console-log/issues/316)

- **Automatic JSX Detection**: The parser now automatically detects and handles JSX syntax in `.js` files without requiring explicit configuration
- **Intelligent Fallback Mechanism**: When parsing fails in `.js` files, the engine automatically retries with JSX support enabled, seamlessly handling React projects that use JSX in `.js` files
- **No Performance Impact**: Regular `.js` files without JSX parse efficiently on the first attempt; the fallback only activates when needed
- **Improved Developer Experience**: React developers can now use Turbo Console Log in `.js` files with JSX syntax without any workarounds or file extension changes

#### Test Coverage Expansion

- **9 New Test Cases**: Added comprehensive test coverage for JSX patterns in `.js` files:
  - React functional components with hooks
  - JSX fragments and spread operators
  - Nested ternary operators in JSX
  - Self-closing tags and spread props
  - Array methods with JSX mapping
  - Arrow functions with implicit JSX returns
  - Complex conditional rendering patterns
  - Mixed files with both JSX and regular JavaScript
- **Error Handling**: Maintains strict error detection for actual syntax errors while supporting valid JSX patterns

This update resolves parsing issues for React projects using `.js` files with JSX syntax, a common pattern in many React codebases, especially those created with older versions of Create React App or custom configurations.

## [3.12.0] - 2025-12-10

### 🎯 Introducing the New Shape of Turbo Pro

This release announces a major evolution in how Turbo Pro works. We're introducing a completely new experience that makes workspace-scale debugging more powerful and intuitive than ever before.

#### What's New

The new Turbo Pro delivers four breakthrough capabilities that fundamentally change how you manage logs:

1. **Workspace Log Explorer** - See every log in your entire codebase in one unified tree view. Click any log to jump to its exact location.

2. **Mass Cleanup Operations** - Delete hundreds of logs across your workspace in seconds. Choose specific log types (console.log, console.error, etc.) or remove them all at once.

3. **Real-Time Filtering** - Toggle log types on and off to focus on what matters. The tree updates instantly without rescanning.

4. **Instant Search** - Find any log by content in milliseconds. No more manual searching through files.

These features work seamlessly across JavaScript, TypeScript, and PHP files, giving you total control over debugging at any scale.

#### Why This Matters

Previous versions helped you insert logs quickly. **This version helps you manage them at scale.** Whether you have 100 logs or 1000, whether you're debugging or cleaning up before a commit, Turbo Pro now makes it effortless.

→ [See all features in action](https://www.turboconsolelog.io/pro#see-it-in-action)  
→ [Learn more about Turbo Pro](https://www.turboconsolelog.io/pro)

## [3.11.0] - 2025-12-01

### 🚀 Turbo Pro: Ultimate Workspace Log Manager

The wait is over. Turbo Pro is now the **ultimate workspace log manager** you've been asking for. This isn't just an update, it's a complete transformation of how you debug at scale.

#### 🌲 What Makes This Release Different

Remember when you had to hunt down logs across dozens of files? Delete them one by one before a commit? Wonder where that authentication log went three days ago? **Those days are over.**

Turbo Pro now gives you **total visibility and control** over every log in your workspace, whether you wrote them yesterday or months ago, whether they're Turbo logs or plain console statements.

#### ✨ Four Game-Changing Features

**1. Workspace Log Explorer** 🌳  
How many logs does your project actually have? Turbo Pro answers in one second flat. See all 600+ logs across 100+ files in a native VS Code tree view. Click any log to jump straight to the source line. No more guessing, no more searching—just instant navigation.

**2. Mass Cleanup Operations** 🧹  
About to push? Need to wipe logs across your entire codebase? Select the log types you want gone (console.log, console.error, all of them, or just Turbo's), choose your scope (workspace, folder, or file), and watch them disappear in seconds. We've tested this with 400+ logs—deleted instantly, reliably, every time.

**3. Real-Time Filtering** 🎯  
Your workspace has hundreds of logs but you only care about errors right now. Toggle log types (log, error, warn, info, debug, table) and the tree updates instantly—no re-scan, no waiting, just pure control over the noise.

**4. Instant Search** 🔍  
Remember that "user authentication" log from last week? Type the keyword, see matching logs instantly, click to jump to the exact line. Find any log by content in seconds—no grep, no scrolling through files, no memory required.

#### 🎨 Enhanced Experience

- **Multi-Language Support**: JavaScript, TypeScript, and PHP logs all in one unified view
- **Smart Detection**: Pro recognizes console.log, console.error, console.warn, console.info, console.debug, console.table, and your custom log functions
- **Color-Coded Tree**: Each log type shows in its unique color (🟦 log, 🟥 error, 🟨 warn, 🟩 info, 🟪 debug, 📊 table)
- **Context Actions**: Right-click any log for instant comment, delete, or correction—no keyboard shortcuts needed

#### 🎁 Your Pro License Still Includes

- ✅ **Lifetime access**: pay once, own it permanently
- ✅ **Use on up to 5 machines**: laptop, desktop, work
- ✅ **All future updates included**: every enhancement, no additional cost
- ✅ **Priority email support** at support@turboconsolelog.io

#### 🔥 Why This Matters

Previous releases gave you a tree panel. **This release gives you total workspace mastery.** This is the debugging experience large codebases deserve—fast, visual, comprehensive, and built to scale with your project.

Whether you're managing 100 logs or 1000, whether you're debugging a feature or cleaning up before release, Turbo Pro makes it effortless.

→ [See all four features in action](https://www.turboconsolelog.io/pro#see-it-in-action)  
→ [Upgrade to Turbo Pro](https://www.turboconsolelog.io/pro)

## [3.10.3] - 2025-11-26

### 🔥 Coming Monday: Workspace-wide Log Cleanup

**Releases December 1st, 2025** - Delete logs 100x faster with the new **Workspace-wide Log Cleanup** feature! Select which log functions to remove (`console.log`, `console.warn`, `console.error`, or all) and obliterate them across your entire workspace in seconds.

#### What's Coming

- **Selective Log Deletion**: Choose specific log types to remove or clean them all at once
- **Workspace-wide Scope**: Process all files in your project with one click
- **Total Control**: Precision targeting of log statements by type
- **Lightning Fast**: Delete hundreds of logs in seconds instead of manually hunting them down

#### How It Will Work

1. Open the Turbo Pro panel
2. Click "Delete Logs by Type"
3. Select which log functions to remove
4. Watch as logs disappear across your entire workspace

This feature will be included in your Turbo Pro license at no extra charge.

👉 [Watch the demo and learn more](https://www.turboconsolelog.io/pro) - Available Monday, December 1st, 2025!

## [3.10.2] - 2025-11-24

### 🔧 Infrastructure & Quality Improvements

- Internal improvements to extension infrastructure

## [3.10.1] - 2025-11-22

### 🔧 Infrastructure & Quality Improvements

- Internal improvements to extension infrastructure

## [3.10.0] - 2025-11-17

### 🚀 PHP Support

Turbo Console Log now supports PHP files, bringing the same powerful debugging capabilities to your full-stack projects. PHP support is available as part of Turbo Pro, extending the logging experience you know from JavaScript and TypeScript to PHP development.

#### New Features

- **PHP Debugging Functions**: Full support for `var_dump()`, `print_r()`, and `error_log()` with dedicated keyboard shortcuts
- **Custom Log Functions**: Configure your own PHP logging function via settings for personalized debugging workflows
- **Unified Log Management**: Comment, uncomment, delete, and correct PHP logs using the same familiar commands
- **Pro Panel Integration**: PHP logs appear alongside JavaScript and TypeScript in the centralized tree view
- **Automatic Correction**: Pro's auto-correction keeps PHP log messages synchronized with your codebase

#### PHP Keyboard Shortcuts

- **var_dump()**: `⌘K ⌘L` (Mac) / `Ctrl+K Ctrl+L` (Windows/Linux)
- **print_r()**: `⌘K ⌘N` (Mac) / `Ctrl+K Ctrl+N` (Windows/Linux)
- **error_log()**: `⌘K ⌘B` or `⌘K ⌘E` (Mac) / `Ctrl+K Ctrl+B` or `Ctrl+K Ctrl+E` (Windows/Linux)
- **Custom Log**: `⌘K ⌘K` (Mac) / `Ctrl+K Ctrl+K` (Windows/Linux)

#### Enhanced Pro Experience

- **Real-Time PHP Log Tracking**: The Pro panel displays all PHP logs with file paths and line numbers
- **Cross-Language Debugging**: Switch seamlessly between JavaScript, TypeScript, and PHP logs in one unified view
- **Selective Management**: Filter, hide, or batch-manage PHP logs directly from the tree panel

👉 [Upgrade to Turbo Pro](https://www.turboconsolelog.io/pro) to unlock PHP support and supercharge your full-stack debugging workflow.

## [3.9.7] - 2025-11-12

### 🔧 Infrastructure & Quality Improvements

- Internal improvements to extension infrastructure

## [3.9.6] - 2025-11-12

### 🔧 Infrastructure & Quality Improvements

- Internal improvements to extension infrastructure

## [3.9.5] - 2025-11-11

### 🔧 Infrastructure & Quality Improvements

- Internal improvements to extension infrastructure

## [3.9.4] - 2025-11-08

### 🔧 Infrastructure & Quality Improvements

- Internal improvements to extension infrastructure

## [3.9.3] - 2025-11-07

### 🔧 Infrastructure & Quality Improvements

- Internal improvements to extension infrastructure

## [3.9.2] - 2025-11-03

### 🔧 Infrastructure & Quality Improvements

- Internal improvements to extension infrastructure

## [3.9.1] - 2025-11-02

### 🔧 Infrastructure & Quality Improvements

- Internal improvements to extension infrastructure

## [3.9.0] - 2025-10-30

### 🎃 Halloween Special Edition: Universal Framework Support

#### 🚀 AST Engine: Universal Framework Support

Our Full AST Engine has reached new heights of sophistication. With v3.9.0, Turbo Console Log now provides first-class support for modern web frameworks that were previously challenging to handle for our new Acorn AST parser:

- **HTML Files with Script Tags**: Intelligent parsing of JavaScript and TypeScript within HTML `<script>` blocks
- **Decorator Handling**: Enhanced support for TypeScript decorators right after type declarations, a common pattern in frameworks like Angular and NestJS
- **Astro Framework Support**: Complete parsing support for Astro's unique component architecture, including component scripts and TypeScript integration
- **Svelte Framework Support**: Native handling of Svelte's reactive syntax, stores, and component lifecycle methods
- **Smarter Generic Detection**: Improved distinction between regular TypeScript files and JSX files when handling generic syntax

These improvements mean that whether you're building with Astro's islands architecture, Svelte's reactive paradigm, or mixing HTML with embedded scripts, Turbo will understand your code context and insert logs with precision.

#### ✨ Pro Bundle: Halloween Promo

There has never been a better time to grab Turbo Pro:

- **Revolutionary Performance**: The TypeScript AST to Acorn migration made Turbo 96% smaller and 89% faster startup — your VS Code experience has never been smoother
- **Strengthened AST Engine**: With v3.9.0's universal framework support, our AST engine now handles virtually any JavaScript/TypeScript codebase
- **Hide Logs Feature**: The #1 most requested Pro feature lets you selectively hide logs from the tree panel for cleaner logs navigation

👉 [Read the Full v3.9.0 Release Article](https://www.turboconsolelog.io/articles/release-390)  
👉 [Upgrade to Turbo Pro](https://www.turboconsolelog.io/pro)

## [3.8.2] - 2025-10-22

### 🎃 Halloween Update: Pro Bug Fix & Spooky New Theme

#### 🐛 Turbo Pro: Critical VDOM Bug Fix

- **Fixed Tree Panel Late Initialization Issue**: Resolved a major bug where opening the Turbo Pro tree panel mid-session would only display logs inserted _after_ the panel was opened, requiring a reload to see all workspace logs.
- **Complete Log Visibility**: The tree panel now correctly displays _all_ turbo logs across the entire workspace/folder, regardless of when the panel is opened during your session.
- **No More Reloads Needed**: Instant, complete visibility of all your debug logs — past, present, and future — without manual reloads.

#### 🧙‍♀️ Halloween Theme & Enhanced Documentation

We've given Turbo Console Log a festive makeover just in time for Halloween! 🎃✨

- **🎥 New Pro Video with Halloween Theme**: Check out the updated [Turbo Pro demo video](https://www.turboconsolelog.io/pro#see-it-in-action) featuring our spooky seasonal theme
- **📚 Enhanced Documentation**: Explore the completely refreshed [documentation](https://www.turboconsolelog.io/documentation) with the Halloween aesthetic — making debugging a little more fun this season!

Whether you're Pro or freemium, take a moment to explore the new look and discover tips to supercharge your debugging workflow.

Happy Halloween, and happy debugging! 🎃👻

## [3.8.1] - 2025-10-16

### 🎯 Vue Single File Component (SFC) Support — Limitation Removed

Turbo Console Log now fully supports **Vue Single File Components (.vue files)** with `<template>`, `<script>`, and `<style>` sections. This addresses the temporary limitation introduced by the lightweight Acorn AST engine migration in v3.8.0.

#### ✨ What's New

- **Native `.vue` File Parsing**: Full support for `<script>` and `<script setup>` blocks within Vue SFC structure
- **Dual-Script Context Awareness**: Intelligently handles Vue files with both `<script>` and `<script setup>` sections
- **No New Dependencies**: Built entirely on the existing Acorn AST engine — no additional parsers needed
- **Composition API & Options API**: Works seamlessly with both Vue coding styles
- **TypeScript in Vue**: Full support for `<script lang="ts">` and `<script setup lang="ts">`

#### 🚀 Performance & Architecture

- **Lightweight Implementation**: No external Vue parser dependencies — keeps the extension fast and minimal
- **AST-Powered Precision**: Leverages the same Acorn engine from v3.8.0 for accurate code understanding
- **Production-Ready**: Comprehensive test coverage across all 31 helper functions (16 checkers + 15 line helpers)

#### 🧪 Quality Assurance

- **40+ New Tests**: Dedicated Vue SFC test cases across all AST layers
- **Edge Case Handling**: Graceful error messages for files without `<script>` tags or selections outside script blocks
- **Zero Regressions**: All 1,193 tests passing with Vue support fully integrated

#### 📝 What This Means

The **"Temporary Limitation"** mentioned in v3.8.0 is now **completely resolved**. Vue developers can now use Turbo Console Log directly in `.vue` files without any workarounds.

👉 [Read the Full v3.8.0 Release Article](https://www.turboconsolelog.io/articles/release-380)

## [3.8.0] - 2025-10-14

### 🎭 New Pro Feature: Hide Logs

The most requested feature is here! **Hide Logs** lets you temporarily mute specific log entries without deleting them:

- **Hide file logs**: Hide all logs in specific files
- **Hide folder logs**: Hide all logs in a specific folder
- **Toggle visibility**: Reveal all hidden logs with a single action

Managing dozens of log statements just got effortless. Hide everything that's not relevant to your current task, then reveal it all when needed.

### 🧠 Major Engine Upgrade: TypeScript AST → Acorn AST

We've completely rebuilt the parsing engine for better performance and reliability:

#### 📊 Performance Improvements

- **96% smaller package**: 2.6MB → ~108KB (package size)
- **~85% smaller bundle**: 3.7MB → ~560KB (bundled size)
- **~89% faster activation**: 860ms → ~96ms (startup time)

Your extension now loads almost instantly with a dramatically smaller footprint.

#### 🛠️ AST Engine: Parsing Pattern Improvements

The migration to Acorn fixed several edge-case parsing patterns. Log insertion now works correctly in complex real-world code:

- **Variables within return statements**: Correctly identifies when a log should stay inside the return block (e.g., callback parameters, inline expressions) vs. before the return
- **JSX and React patterns**: Full support for modern React code including hooks, fragments, conditional rendering, and implicit arrow function returns
- **Computed property destructuring**: Nested object destructuring patterns with dynamic computed property names (`[id]` syntax)
- **Multi-line object literals**: Complex objects spanning dozens of lines with type annotations, arrow functions, and deep property nesting
- **Binary expressions with optional chaining**: Inequality comparisons using `!==` with optional chaining operators now parse correctly
- **Async destructuring assignments**: Multi-line destructuring from async function calls with type assertions and fallback values
- **Nested default parameters**: Arrow functions with multi-line parameter lists where defaults are themselves function expressions
- **Class method decorators**: Parameters within methods that have multiple decorators (NestJS, Angular patterns)

### 📌 Temporary Limitation

Vue 3 Composition API in separate `.js`/`.ts` files is fully supported. However, Single-File Components (`.vue` with `<script>` blocks) aren't parsed yet.

**Workaround**: Isolate your `<script>` logic in a standalone file while we add first-class SFC support. [Track progress here](https://github.com/Chakroun-Anas/turbo-console-log/issues/292).

### 🔮 What's Next: v3.9.0

The next iteration focuses on broader AST engine strengthening — refining edge-case handling, improving parsing resilience, and expanding framework coverage. Vue Single-File Component support is part of this roadmap, bringing native `.vue` parsing alongside deeper pattern recognition for modern JavaScript constructs.

### 🚀 Enhanced Pro Experience

All Pro features now run on the new Acorn engine — lighter, faster, and more responsive. Hide Logs is the first of several power-user upgrades coming in future releases.

👉 [Read the Full v3.8.0 Release Article](https://www.turboconsolelog.io/articles/release-380)  
👉 [Upgrade to Turbo Pro](https://www.turboconsolelog.io/pro)

## [3.7.2] - 2025-09-29

### 🔧 Bug Fixes & Improvements

#### ⚠️ Known Issue (Harmless)

**VS Code Error Notification**: When upgrading from v3.7.0 to v3.7.1 or v3.7.2, some users may briefly see an error:  
`"No view is registered with id: turboConsoleLogFreemiumLauncher"`.

- **Harmless**: This does not affect the extension’s functionality
- **One-time only**: Appears during the upgrade from v3.7.0 and will not return
- **Why it happens**: Due to how VS Code loads new views before the extension activates
- **No action needed**: You can safely dismiss the message

#### 🛠️ Technical Improvements

- Improved reliability of the dynamic panel content system
- Fixed article URL handling for dynamic panel content
- Strengthened type safety for panel component interfaces

## [3.7.1] - 2025-09-28

### 🎉 Dynamic Freemium Panel & v3.8.0 Preview

This release introduces a dynamic content system for the freemium panel and provides an exciting preview of the upcoming v3.8.0 hide logs feature:

#### ✨ New Features

- **Dynamic Freemium Panel**: Panel content now updates automatically with latest news, feature previews, and community updates
- **v3.8.0 Teaser Integration**: Preview of the most requested hide logs feature coming October 6th, 2025
- **Real-time Countdown**: Live countdown to v3.8.0 release with teaser article links
- **Enhanced Community Engagement**: Direct links to surveys, articles, and feature previews

#### 🔧 Improvements

- Updated panel content structure for better user engagement
- Improved freemium user experience with dynamic, relevant content
- Better integration between extension panel and website features

#### 📝 Documentation

- Added comprehensive teaser article for v3.8.0 hide logs feature
- Updated website with countdown and feature preview

## [3.7.0] - 2025-09-18

### 🎯 Community Engagement & Enhanced Freemium Panel Experience

This release focuses on strengthening the connection between Turbo Console Log and its community while providing a richer experience for all users:

#### Release Features:

- **Community Survey Integration**: Release notification now invite users to participate in community surveys to help shape Turbo's future development roadmap.

- **Enhanced Freemium Panel**: The freemium panel has been completely revamped with:
  - **Complete Commands Reference**: Interactive table showing all Turbo Console Log commands with keyboard shortcuts
  - **Featured Turbo Articles**: Direct access to educational content including "Debugging: Between Science & Art" and "Understanding the Full AST Engine"
  - **Community Survey Integration**: Easy access to provide feedback and influence future features

This update reflects our commitment to building Turbo Console Log together with the community, ensuring that user feedback directly influences future development priorities.

## [3.6.0] - 2025-09-05

### 🌍 Regional Pricing for Turbo Pro

This release introduces regional pricing for Turbo Pro, making the premium features more accessible worldwide:

#### ✨ New Features

- **🌎 Regional Pricing**: Turbo Pro is now available with regional pricing tailored to different countries and economies, ensuring fair access to premium features regardless of your location.

- **💰 Automatic Price Adjustment**: The pricing automatically adjusts based on your region when visiting the purchase page, providing the most appropriate pricing for your area.

#### 🔧 System Improvements

- Enhanced purchase flow to support multiple regional pricing tiers
- Improved user experience for international customers

This update reflects our commitment to making Turbo Pro accessible to developers worldwide, regardless of their geographic location.

## [3.5.0] - 2025-08-18

### 🎯 Smarter release notifications and enhanced user control

This release introduces significant improvements to how Turbo Console Log handles release announcements and gives users more control over their experience:

#### ✨ New Features

- **🕒 Release Review Target Window Setting**: New configurable setting `turboConsoleLog.releaseReviewTargetWindow` allows users to control when they receive release notifications. Choose from `Morning`, `Afternoon`, `Evening`, or `Night` (default) time windows to align with your preferred review schedule.

- **🚀 Non-intrusive Release Notifications**: Release announcements now appear as respectful VS Code notifications instead of automatically opening web views. Users can choose to view release notes or dismiss the notification gracefully.

- **🌐 External Article Integration**: New releases now link to comprehensive articles on [turboconsolelog.io](https://www.turboconsolelog.io) instead of embedded web views, providing richer content and better accessibility.

#### 🔧 System Improvements

- **📊 Enhanced Reporting Service**: Reporting integration that fully respects VS Code's global telemetry settings and user privacy preferences.

- **⚡ Smarter Timing Logic**: Intelligent release notification scheduling based on user's target window preference, ensuring announcements appear at convenient times.

- **🔧 Turbo Pro Vue/Svelte/Astro Support**: Fixed an issue where Vue, Svelte, and Astro files were not appearing in the Turbo Pro TreeView panel. These file types now display correctly in the Pro panel alongside JavaScript and TypeScript files.

#### 🎪 Behind the Scenes

- Removed forced web view updates that could interrupt workflows
- Improved global state management for notification tracking
- Enhanced error handling for release content delivery
- Better integration with VS Code's native notification system

This release represents our commitment to user agency and non-disruptive feature discovery. Release notifications are now more respectful of your workflow while still keeping you informed about exciting new capabilities.

## [3.4.2] - 2025-08-06

### 🎯 Scoped shortcuts, reduced conflicts, and reinforced control

This patch addresses an important usability issue:  
Some Turbo commands were triggering inside the terminal and other non-editor views — which was never intended.

To resolve this:

- 🧠 All Turbo Console Log keyboard shortcuts are now scoped with `"when": "editorTextFocus"`, meaning they will only trigger inside active editors.
- ✅ This completely eliminates unintended behaviors in terminal, sidebar, search, and other UI panels.
- 🔒 Terminal actions like `Ctrl+K` to clear output are now fully respected.

We also want to take a moment to highlight that **Turbo now supports 6 brand-new log insertion shortcuts** — one for each log method, with intuitive and conflict-free bindings:

- `Ctrl+K Ctrl+L` → `console.log`
- `Ctrl+K Ctrl+N` → `console.info` (N = Note)
- `Ctrl+K Ctrl+R` → `console.warn` (R = Risk)
- `Ctrl+K Ctrl+E` → `console.error`
- `Ctrl+K Ctrl+B` → `console.debug` (B = Breakpoint)
- `Ctrl+K Ctrl+T` → `console.table`
- `Ctrl+K Ctrl+K` → Custom log

These shortcuts are fast, native, and designed to feel second-nature in your workflow.

We recognize that v3.4.0 introduced a few unintended side effects, and we reacted as quickly as possible to fix them while also addressing the root causes.

We’ll also be increasing integration test coverage around keyboard shortcuts and context detection to avoid this in future releases.

Thanks to everyone who flagged this early and respectfully — you're helping make Turbo even sharper.

## [3.4.1] - 2025-08-06

### 🔧 Fixing shortcut conflicts and refining mental model

After the v3.4.0 release introduced new console log shortcuts, we received helpful community feedback about conflicts with native VSCode keybindings. This patch resolves those issues and improves the logic behind our shortcut assignments to better match intuitive developer mental models:

- 🛠️ Replaced the conflicting `Ctrl+K Ctrl+C` shortcut for **Insert Custom Log** with `Ctrl+K Ctrl+K`, avoiding override of VSCode’s native **Add Line Comment** command  
  ([#284](https://github.com/Chakroun-Anas/turbo-console-log/issues/284))

- 🔁 Changed **Insert Console Info** from `Ctrl+K Ctrl+I` to `Ctrl+K Ctrl+N` → _N = Note_, avoiding conflict with **Show Hover**

- 🔁 Changed **Insert Console Debug** from `Ctrl+K Ctrl+D` to `Ctrl+K Ctrl+B` → _B = Breakpoint_, avoiding conflict with **Move last selection to next match**

- 🔁 Changed **Insert Console Warn** from `Ctrl+K Ctrl+W` to `Ctrl+K Ctrl+R` → _R = Risk_, avoiding conflict with **Close All Editors**

This update ensures all Turbo Console Log shortcuts are now:

- Conflict-free across macOS and Windows
- Easy to remember
- Consistent with VSCode's native behaviors

Thanks again to the community for the quick and constructive feedback!

## [3.4.0] - 2025-08-05

### 🎯 Complete Console Method Coverage

- **7 New Console Commands:** Dedicated commands for `console.log`, `console.info`, `console.debug`, `console.warn`, `console.error`, `console.table`, and custom log functions
- **Individual Keyboard Shortcuts:** Each console method now has its own keyboard shortcut (⌘K combinations)
- **Granular Control:** No more switching settings — choose the exact console method you need instantly

### ⌨️ New Keyboard Shortcuts

- **Console Log:** `⌘K ⌘L` (macOS) / `Ctrl+K Ctrl+L` (Windows/Linux)
- **Console Info:** `⌘K ⌘I` (macOS) / `Ctrl+K Ctrl+I` (Windows/Linux)
- **Console Debug:** `⌘K ⌘D` (macOS) / `Ctrl+K Ctrl+D` (Windows/Linux)
- **Console Warn:** `⌘K ⌘W` (macOS) / `Ctrl+K Ctrl+W` (Windows/Linux)
- **Console Error:** `⌘K ⌘E` (macOS) / `Ctrl+K Ctrl+E` (Windows/Linux)
- **Console Table:** `⌘K ⌘T` (macOS) / `Ctrl+K Ctrl+T` (Windows/Linux)
- **Custom Log:** `⌘K ⌘C` (macOS) / `Ctrl+K Ctrl+C` (Windows/Linux)

### 🚀 Enhanced Core Features

- **Auto-Save Integration:** Turbo commands (comment, uncomment, correct, delete) now auto-save documents after execution
- **Enhanced AST Detection:** Continuing our AST revolution with even fewer false positives and improved accuracy
- **Unified Command Structure:** All new commands follow identical patterns for consistency and reliability
- **Improved Error Recovery:** Enhanced Pro bundle repair system with better recovery mechanisms

### ✨ Turbo Pro Enhancements

- **Color-Coded Console Methods:** Each console type displays in unique colors (🟦 log, 🟩 info, 🟪 debug, 🟨 warn, 🟥 error, 📊 table)
- **Instant Auto-Sync:** Tree updates immediately after any Turbo command thanks to auto-save integration
- **Smart Shortcut Integration:** All 7 new keyboard shortcuts work seamlessly with the Pro tree view
- **Enhanced Expand All:** Now properly expands final log leaves in the tree structure
- **Real-Time Synchronization:** Tree syncs immediately after file changes with improved reliability

### 🧪 Testing & Quality Improvements

- **1,400+ Lines of New Tests:** Comprehensive Jest unit tests for all new console commands
- **Test Suite Consolidation:** Reduced 36+ individual test files into 4 unified, maintainable suites
- **Enhanced Coverage:** Improved edge case handling across all console method scenarios
- **Repair Mode Testing:** 414 lines of comprehensive repair system tests

→ **Legacy Support:** Original `displayLogMessage` command remains available as "Insert console log message (Legacy)"

👉 [Read the Full v3.4.0 Release Article](https://www.turboconsolelog.io/articles/release-340)  
👉 [Learn more about Turbo PRO](https://www.turboconsolelog.io/pro)  
👉 [Subscribe to Newsletter (30% Pro Discount)](https://www.turboconsolelog.io/join)

## [3.3.2] - 2025-07-30

### 📈 Marketplace Visibility & SEO

- Updated extension `categories` to improve discovery across **Debuggers**, **Snippets**, **Visualizations**, and **Programming Languages**
- Refined `keywords` to appear in searches like `debug javascript`, `remove logs`, `log panel`, and `insert log`

### 📜 License & Legal Structure

- Introduced a new **Turbo Unicorn Custom License** to protect the brand, logo, domain, and Turbo Pro bundle
- The core of the extension remains **free and open source** for personal and non-commercial use
- Commercial use of the source code is now **prohibited** unless licensed through Turbo Pro
- All proprietary assets are now explicitly excluded from the open license
- Updated `package.json` license field and added a full [LICENSE](./LICENSE) file

### 📝 README Improvements

- Rewrote intro to define Turbo Console Log as the **standard for automated logging in JavaScript and TypeScript**
- Highlighted support for **custom log functions**, not just console.log
- Updated license section to reflect new legal terms
- Improved configuration section to clarify flexibility with custom log methods

## [3.3.1] - 2025-07-26

### 🔧 Core Improvements

- Optimized AST engine by generating and reusing a single `SourceFile` instance across all checkers and line helpers — improving performance and consistency.

### 💎 UI Enhancements

- Updated Turbo Pro showcase panel with a visual overlay and demo preview.
- Clicking the overlay now opens the [Turbo Pro page](https://www.turboconsolelog.io/pro) with the Pro Bundle 25s demo video.

## [3.3.0] – 2025-07-23

### Full AST Engine Revolution — Complete Rewrite

- **Revolutionary AST Engine:** Complete rebuild from the ground up using TypeScript Compiler API
- **Massive Quality Improvement:** Coverage increased from 45% to 86% average (statements, branches, functions, lines)
- **2.6X More Comprehensive:** 4,423 lines of sophisticated AST code vs 1,688 in the old regex system
- **750+ Tests:** Comprehensive unit and integration testing for bulletproof reliability
- **16 Specialized AST Checkers:** Each code pattern handled with precision and semantic understanding

### What's New:

- **Bulletproof Accuracy:** AST understands code structure semantically, not just pattern matching
- **Modern JavaScript Support:** Native handling of destructuring, async/await, optional chaining
- **Complex Expression Support:** Perfect handling of ternary operators, binary expressions, template literals
- **Edge Case Mastery:** Robust support for multi-line assignments, chained method calls, nested objects
- **TypeScript Integration:** Seamless support for TypeScript-specific syntax and patterns
- **Future-Proof Architecture:** Easy to extend for new JavaScript language features

### Bug Fixes & Improvements:

- **Core Engine:** insertEnclosingClass and insertEnclosingFunction can now be deactivated
- **Pro - Tree Sync:** Fixed sync issues when deleting logs from the tree view
- **Pro - Better UX:** Status bar activation message now has neutral background instead of warning style
- **Pro - Accuracy:** Significantly reduced false positives in the tree view detection

→ [Read the full v3.3.0 release article](https://www.turboconsolelog.io/articles/release-330)  
→ [Understanding the Full AST Engine](https://www.turboconsolelog.io/articles/turbo-full-ast-engine)  
→ [Advanced Debugging: Memory Patterns](https://www.turboconsolelog.io/articles/debugging-memory)

## [3.2.0] – 2025-07-10

- 🧠 **AST Support:** Introduced AST parsing for ternary expressions and function parameters
- 📐 **More reliable Log Placement:** Improved accuracy for ternary expressions and function parameters using AST
- 🐛 **Fix:** Properly handles object literal assignments with complex type annotations
- 🛠️ **Fix:** Default config values are now respected, reducing false positives
- 🧪 **Test Coverage:** New test cases added to validate AST logic and key edge scenarios

→ [Read the full v3.2.0 release article](https://www.turboconsolelog.io/articles/release-320)  
→ [Benchmark Turbo PRO v2](https://www.turboconsolelog.io/articles/benchmark-pro-v2)

## [3.1.0] - 2025-06-25

### ⚡ Turbo Pro v2 — Performance Unleashed & Rock-Solid Reliability

- 🚀 **Massive performance boost**  
  → Faster boot time, instant tree rendering, and snappier log syncing across large workspaces

- 🧠 **False positive log detection drastically reduced**  
  → Improved filtering and smarter engine prevent logs from wrongly appearing or being lost

- 🔁 **Smarter update & self-repair flow**  
  → If a Pro update fails, users now see a dedicated Repair panel with retry mechanism

- ✅ **Increased test coverage with Jest**  
  → Introduced Jest to strengthen unit testing across core logic

- 🔐 **Improved Pro license handling**  
  → Better feedback, error resilience, and auto-repair if something goes wrong in the update phase

- 🎯 **Raised activation limit**  
  → From 3 to 5 activations per version to better support multi-device setups

- ✍️ **New technical articles released**

  📖 [Release 3.1.0 – Full Update Overview](https://www.turboconsolelog.io/articles/release-310)  
  🧬 [How Turbo Pro Works – Technical Deep Dive](https://www.turboconsolelog.io/articles/pro-v2-technical-overview)  
  ⚡️ [Benchmark Pro v2](https://www.turboconsolelog.io/articles/benchmark-pro-v2) Real-world speed across React, Storybook & Vite

🔥 This update turns Turbo Pro into a fully production-grade experience — faster, safer, and smarter than ever.

## [3.0.0] - 2025-06-09

### 🚀 Turbo Console Log PRO Launches — A New Era of Debugging Begins

- 👑 **Turbo PRO officially released**  
  → A new paid tier with powerful new capabilities built directly into the extension

- 🌲 **Tree Panel View**  
  → Instantly see all turbo logs grouped by file and line

- ⚡ **Real-Time Sync**  
  → Logs update live as you debug across files

- 🖱️ **Contextual Actions**  
  → Right-click to comment, delete, or correct logs directly from the panel

- 🧠 **Memory-Friendly Debugging**  
  → Logs persist and reappear on reload — no more lost context

- 🔐 **License System Activated**  
  → Secure, offline-friendly license key flow with lifetime ownership model

- 🛠️ **New Setting: `logCorrectionNotificationEnabled`**

  → Control whether notifications appear when Turbo automatically corrects log metadata  
  → **Default: `false`** — especially tuned for a quieter experience in Turbo PRO’s real-time sync mode

- ✍️ **New release article and companion piece published**

  📖 [Read the full launch article](https://www.turboconsolelog.io/articles/release-300)  
  📘 [Debugging with Memory — Why Turbo PRO Panel Matters!](https://www.turboconsolelog.io/articles/debugging-memory)

🔥 The foundation is set — this is Turbo Console Log’s most powerful release ever.

## [2.18.0] - 2025-05-30

### 🔧 Foundation Strengthening Before Public PRO Launch (June 9)

- 📢 **Panel messaging refined**  
  → Updated wording to clearly distinguish early access from public launch and avoid confusion

- ✍️ **New release article published**  
  → Clarifies the early adopter policy, lifetime key eligibility, and next steps  
  📖 [Read the full article](https://www.turboconsolelog.io/articles/release-2180)

- 🧭 **Roadmap page improved**  
  → Clear structure with updated focus, future enhancements, and community-driven direction

- 💌 **Join & sponsorship pages rewritten**  
  → Better persuasion, stronger CTAs, and reduced friction to subscribe or support

📖 [Read the full release article](https://www.turboconsolelog.io/articles/release-2180)

## [2.17.0] - 2025-05-27

### 🚀 The First PRO Release (Pre-Launch Phase)

- 🆕 **New command**: `activateTurboProBundle`  
  → Allows early adopters to activate their PRO license key and unlock premium features

- 🔐 **License key support**  
  → PRO activation now persists securely via global storage

- 🧠 **Dynamic PRO bundle execution**  
  → Loads the PRO module at runtime with full isolation and validation

- 🌐 **Freemium panel for non-activated users**  
  → Encourages newsletter signup, activation, and educates on PRO availability

- 🎉 **Early adopters (newsletter subscribers)** will receive a personal license key with **lifetime access to Turbo PRO**

🔐 PRO sits on top of the free version — open source stays free forever.  
📩 [Join the newsletter](https://www.turboconsolelog.io/join) to get early access and launch updates.

> This is a **pre-launch milestone** — PRO is live for early testers and will roll out publicly next week. Thank you for being part of the journey.

📖 [Read the full release article](https://www.turboconsolelog.io/articles/release-2170)

## [2.16.0] - 2025-05-12

### ✨ What's New

- Introduced **tailored release webviews**:

  - New users now get a dedicated welcome screen upon fresh install
  - Existing users get update-focused release notes with relevant info

- 🛡️ **Codebase audit completed** — all known vulnerabilities resolved
- 🧪 100% test pass rate (109 tests) across the extension
- 📦 Internal cleanup to support future stability and PRO enhancements

### 🧠 What's Coming

- **Turbo Console Log PRO** — launching next:
  - Visual log panel
  - File, Folder and Workspace graphical actions
  - One-time license, no subscription

➡️ Stay in the loop: [Join the newsletter](https://www.turboconsolelog.io/join)
➡️ Support development: [Sponsor the project](https://www.turboconsolelog.io/sponsorship?showSponsor=true)

Release article 🗞️: https://www.turboconsolelog.io/articles/release-2160

## [2.15.3] - 2025-04-13

V2.15.0 Release note illustration included in the release web view (The web view won't be shown again if already viewed, thank you!)

## [2.15.2] - 2025-04-13

V2.15.0 Release note illustration included in the release web view (The web view won't be shown again if already viewed, thank you!)

## [2.15.1] - 2025-04-13

Enable extension on onStartupFinished event

## [2.15.0] - 2025-04-13

### ✨ Highlights

- This is the **only release of April** due to financial and burnout constraints — focused on stability and preparing for the upcoming PRO version.

### ✅ Fixed

- Fixed: All core commands (Comment, Uncomment, Delete, Correct Log Messages) now fully support custom log functions.
  - Thanks to [tzarger](https://github.com/Chakroun-Anas/turbo-console-log/issues/265) for reporting this issue!

### 🧪 Tests

- Passed the **100+ unit and integration test** milestone — increasing overall confidence and stability.

### 📦 Upcoming

- **Turbo Console Log PRO** coming in May!
  - Includes a graphical panel for enhanced UX.
  - One-time purchase, no subscription.

## [2.14.0] - 2025-03-26

### 🧠 Stability & Sharpness: Turbo Console Log is Getting Smarter

This release focuses on **fine-tuning the engine** behind log insertion. We tackled subtle edge cases around insertion precision, quote consistency, and function call tracking, making your debugging experience even smoother and more reliable.

Huge thanks to everyone reporting issues and helping the extension evolve — your feedback drives this project forward! ❤️

### 🛠️ Fixes & Improvements:

- **Fix: Logs Appearing Outside Functions Due to Ignored Return Statements**

  - Logs now correctly appear _inside_ functions, taking return statements into account when necessary.
  - 📌 [Issue #256](https://github.com/Chakroun-Anas/turbo-console-log/issues/256)

- **Fix: Incorrect Quote Usage in Object Log Statements**

  - When logging objects, the extension now consistently selects the **correct quote style** based on context.
  - 📌 [Issue #259](https://github.com/Chakroun-Anas/turbo-console-log/issues/259)

- **Fix: Incorrect Log Line Computation in Function Calls**

  - Resolved an issue where logs appeared at the **wrong line position** after function calls.
  - 📌 [Issue #260](https://github.com/Chakroun-Anas/turbo-console-log/issues/260)

- **Fix: Anonymous arrow function transformation when returning inline object**

  - Resolved an issue where anonymous arrow functions returning inline objects were incorrectly transformed during log insertion.
  - 📌 [Issue #262](https://github.com/Chakroun-Anas/turbo-console-log/issues/262)

**Full Release Details:** https://github.com/Chakroun-Anas/turbo-console-log/issues/257

## [2.13.0] - 2025-03-13

### 🚀 First Mars Release: Smarter, More Precise, and Evolving!

This release is all about **precision and reliability**! We tackled several long-standing issues to ensure that log messages are placed exactly where they should be.  
Big thanks to the community for the **huge support** in the last release! ❤️ Let's keep the momentum going!

### 🛠️ Fixes & Improvements:

- **Corrected Log Placement in Object Assignments**

  - Logs now appear **immediately after object literal assignments**, fixing previous misplacements.
  - 📌 [Issue #252](https://github.com/Chakroun-Anas/turbo-console-log/issues/252)

- **Accurate Log Placement for Array Assignments with TypeScript**

  - Resolved a bug where logs were placed incorrectly in **TypeScript array assignments**.
  - 📌 [Issue #253](https://github.com/Chakroun-Anas/turbo-console-log/issues/253)

- **Precise Log Placement for Single-Line Expressions**

  - Ensures that logs appear **immediately after complete single-line expressions**, rather than after enclosing brackets.
  - 📌 [Issue #254](https://github.com/Chakroun-Anas/turbo-console-log/issues/254)

- **Smart Quote Selection for Log Messages**
  - The extension now intelligently selects **the correct quote style** (`'`, `"`, or \``) based on the variable content.
  - 📌 Improvement linked to [Issue #254](https://github.com/Chakroun-Anas/turbo-console-log/issues/254)

### 🔥 Addressing False Claims:

A recent **false claim on GitHub** labeled Turbo Console Log as "spam adware." Let's set the record straight:  
✅ The web view **only appears once per bi-weekly release** (or upon first installation).  
✅ It **can be dismissed** and won’t reappear until the next release.  
✅ Turbo Console Log is **completely free & open-source**, with no paywalls.  
✅ We follow a **structured, predictable release schedule** for transparency.  
📌 [Read our full response here](https://github.com/Chakroun-Anas/turbo-console-log/issues/250)

### ❤️ How You Can Help:

If Turbo Console Log **saves you time**, consider supporting its development:  
🔹 **Sponsor the project:** [turboconsolelog.io/sponsorship](https://www.turboconsolelog.io/sponsorship?showSponsor=true)  
🔹 **Spread the word & share the extension** 🚀

Thank you all! **Turbo Console Log keeps evolving, and it's all thanks to you!** ❤️

## [2.12.2] - 2025-02-20

### 🛠️ Patch

- The sponsorship campaign illustration link in the latest release web view has been updated.

Thank u so much for your support (https://www.turboconsolelog.io/sponsorship?showSponsor=true) 💚 🚀

## [2.12.1] - 2025-02-20

### 🛠️ Patch

- The sponsorship campaign illustration link in the latest release web view has been updated.

## [2.12.0] - 2025-02-18

**🛠️ Improved Stability Release**

- Typed Function Call Logging Fix [#236 – Typescript function type parameters multiline brackets support](https://github.com/Chakroun-Anas/turbo-console-log/issues/236)
- Fixed Function Call Assignment Edge Case [#231 – Some issues in Vue3 project](https://github.com/Chakroun-Anas/turbo-console-log/issues/231)
- Whitespace Character Bug Resolved [#212 – Whitespace character bug](https://github.com/Chakroun-Anas/turbo-console-log/issues/227)

## [2.11.5] - 2025-02-10

- Fixed an issue where `wrapLogMessage` did not respect custom log functions. [#227 – custom "log function" does not apply on "Wrap Log Message](https://github.com/Chakroun-Anas/turbo-console-log/issues/227)

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
