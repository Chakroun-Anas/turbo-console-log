# Turbo Console Log 🚀

[Official Website](https://www.turboconsolelog.io) 🎨  
[GitHub Repository](https://github.com/Chakroun-Anas/turbo-console-log) 📝

---

## 💡 What is Turbo Console Log?

**Turbo Console Log is the standard tool for automated logging in JavaScript and TypeScript.**

It helps you insert, manage, and clean log statements across your code — whether you're using `console.log`, `debug`, `warn`, `table`, or even a fully custom logging function.

Powered by a full **AST engine**, Turbo understands your code structure and adds logs precisely where they belong — making debugging faster, smarter, and less repetitive.

Used by nearly **2 million developers**, Turbo removes friction from your dev flow and keeps your codebase clean.

---

## 🚀 Features at a Glance

✔️ **Insert Meaningful Log Messages** – Quickly generate console logs with helpful context  
✔️ **Comment, Uncomment, or Delete Logs** – Manage logs with a simple shortcut  
✔️ **Multi-Cursor Support** – Debug multiple variables simultaneously  
✔️ **Customizable Log Format** – Personalize how logs appear in your code  
✔️ **7 Console Methods** – Dedicated commands for log, info, debug, warn, error, table, and custom  
✔️ **Individual Keyboard Shortcuts** – Each console method has its own ⌘K combination

### 🔥 Pro Features

✔️ **Native TreeView Panel** – Visual log panel integrated into VS Code  
✔️ **Real-Time Sync** – Workspace logs updated automatically  
✔️ **Color-Coded Console Methods** – Instant visual recognition (🟦 log, 🟩 info, 🟪 debug, 🟨 warn, 🟥 error, 📊 table)  
✔️ **Contextual Actions** – Right-click to comment, delete, or correct logs from the tree  
✔️ **Smart Auto-Correction** – Line numbers and file names stay accurate after refactoring  
✔️ **Vue/Svelte/Astro Support** – Full support for modern frontend frameworks

📖 **Full Documentation**: [Turbo Console Log Docs](https://www.turboconsolelog.io/documentation)

---

## 🔧 Configuration & Customization

Want to customize your logs? Turbo Console Log allows you to adjust:

✅ Prefixes & Suffixes  
✅ Release Notification Timing (Morning, Afternoon, Evening, Night)  
✅ Quote Type (`'`, `"`, or ``)  
✅ Filename & Line Number Inclusion

📖 **Explore Settings**: [Settings Documentation](https://www.turboconsolelog.io/documentation/settings/custom-prefix)

---

## 🚀 What's New in v3.8.0? – Hide Logs + Major Performance Boost

**The most requested feature has arrived!** This release introduces **Hide Logs** for Pro users and a complete engine upgrade that makes Turbo **96% lighter and 89% faster**.

### 🎭 New Pro Feature: Hide Logs

Managing dozens of log statements becomes overwhelming fast. The new **Hide Logs** feature lets you temporarily mute specific entries—by pattern, file, or one-click—without deleting them:

- **Hide file logs**: Hide all logs in specific files
- **Hide folder logs**: Hide all logs in a specific folder
- **Toggle visibility**: Reveal all hidden logs with a single action

Hide everything that's not relevant to your current task, then reveal it all with a single toggle. Your debugging panel stays clean; your workflow stays focused.

### 🧠 Major Engine Upgrade: TypeScript AST → Acorn AST

We've completely rebuilt the parsing engine, swapping the heavy TypeScript compiler layer for the lightweight Acorn parser. You get the same AST-powered precision with a leaner, faster engine:

#### � Performance Improvements

- **96% Smaller Package:** 2.6MB → ~108KB
- **~85% Smaller Bundle:** 3.7MB → ~560KB
- **~89% Faster Activation:** 860ms → ~96ms

Your extension now loads almost instantly with a dramatically smaller footprint.

#### 🛠️ Enhanced Parsing Patterns

The migration to Acorn fixed several edge-case parsing patterns. Log insertion now works correctly in complex real-world code:

✅ **Variables within return statements** – Correct placement for callback parameters and inline expressions  
✅ **JSX and React patterns** – Full support for hooks, fragments, and conditional rendering  
✅ **Computed property destructuring** – Dynamic `[id]` syntax handling  
✅ **Multi-line object literals** – Complex objects with type annotations and deep nesting  
✅ **Binary expressions with optional chaining** – Proper `!==` with `?.` operator parsing  
✅ **Async destructuring assignments** – Multi-line destructuring from async calls  
✅ **Nested default parameters** – Arrow functions with complex parameter lists  
✅ **Class method decorators** – NestJS and Angular pattern support

### 📌 Temporary Limitation

Vue 3 Composition API in separate `.js`/`.ts` files is fully supported. However, Single-File Components (`.vue` with `<script>` blocks) aren't parsed yet. Workaround: isolate your `<script>` logic in a standalone file while we add first-class SFC support. [Track progress here](https://github.com/Chakroun-Anas/turbo-console-log/issues/292).

### 🔮 What's Next: v3.9.0

The next iteration focuses on broader AST engine strengthening—refining edge-case handling, improving parsing resilience, and expanding framework coverage. Vue Single-File Component support is part of this roadmap.

👉 [Read the Full v3.8.0 Release Article](https://www.turboconsolelog.io/articles/release-380)  
👉 [Learn more about Turbo PRO](https://www.turboconsolelog.io/pro)  
👉 [Subscribe to Newsletter](https://www.turboconsolelog.io/join)

---

## 💼 Upgrade to Turbo Pro — One-Time Payment, Lifetime Access

Want more power, more control, and a smoother workflow?

**Turbo Pro** gives you a native side panel, real-time log synchronization, and smart log actions — all built on top of the new AST engine.

### 🔥 Pro Features at a Glance

- 🧭 **Native Log Panel:** Explore all logs in your current folder/workspace via VSCode Tree View
- 🔁 **Real-Time Sync:** Log updates appear instantly in the panel
- 🧠 **Contextual File Actions:** Right-click to comment, delete, or correct logs directly from the tree
- 🧹 **Auto-Correction:** Automatically fix line numbers and file names after log movements
- 🚀 **Fast & Lightweight:** Fully native to VS Code, no external dependencies

👉 [Get Turbo Pro — Lifetime License](https://www.turboconsolelog.io/pro)

---

## ✉️ Stay in the Loop – Join the Newsletter

🚀 **Get early access to new features, exclusive updates, and behind-the-scenes insights!**  
Be the first to know about **Turbo Console Log improvements, releases, and launch news**.

📩 **Join the newsletter** → [https://www.turboconsolelog.io/join](https://www.turboconsolelog.io/join)

---

## 💙 Support Turbo Console Log

Turbo Console Log is **free & open-source**, maintained with passion by developers like you.

If you’ve found value in it, you can help keep it growing:

🔗 **[Visit the Sponsorship Page](https://www.turboconsolelog.io/sponsorship)**

Your support fuels **bug fixes, improvements, and new features**, ensuring Turbo Console Log continues evolving for **millions of developers—including YOU!**

Whether you contribute or not, we’re happy to have you as part of this journey. 🚀

---

## 📧 Contact

📩 **Support:** [support@turboconsolelog.io](mailto:support@turboconsolelog.io)  
📩 **Feedback:** [feedback@turboconsolelog.io](mailto:feedback@turboconsolelog.io)  
📩 **Sponsorship:** [sponsorship@turboconsolelog.io](mailto:sponsorship@turboconsolelog.io)

---

## 🎯 Contribute

Turbo Console Log is **open for contributions!**  
Want to improve it? Report issues, suggest features, or submit pull requests:

👉 **[Contribute on GitHub](https://github.com/Chakroun-Anas/turbo-console-log)**

---

## 📜 License

The Turbo Console Log repository is released under the **Turbo Unicorn Custom License**.  
It allows free personal and non-commercial use of the open-source core.

Commercial use, redistribution, and use of the brand, logo, or Turbo Pro features are strictly protected.

See the full [LICENSE](./LICENSE.txt) for details.
