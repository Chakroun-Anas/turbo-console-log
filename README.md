# Turbo Console Log 🚀

[Official Website](https://www.turboconsolelog.io) 🎨  
[GitHub Repository](https://github.com/Chakroun-Anas/turbo-console-log) 📝

## 🌟 Why Turbo Console Log?

Turbo Console Log is a **developer’s best friend** when it comes to debugging.

Trusted by **nearly 2 million developers**, it simplifies inserting meaningful log messages and makes debugging **faster and more efficient**.

### **🚀 Key Benefits:**

✔️ **Save time** by automating console.log statements.  
✔️ **Instantly add context** like function names, variables, and file locations.  
✔️ **Customize logs** to match your workflow.

## 🔥 What’s New in v2.14.0? – Second Mars Release 🚀

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

---

## 🚀 Features at a Glance

✔️ **Insert Meaningful Log Messages** – Quickly generate console logs with helpful context.  
✔️ **Comment, Uncomment, or Delete Logs** – Manage logs with a simple shortcut.  
✔️ **Multi-Cursor Support** – Debug multiple variables simultaneously.  
✔️ **Customizable Log Format** – Personalize how logs appear in your code.

📖 **Full Documentation**: [Turbo Console Log Docs](https://www.turboconsolelog.io/documentation/features)

---

## 🔧 Configuration & Customization

Want to customize your logs? Turbo Console Log allows you to adjust:

✅ Prefixes & Suffixes  
✅ Log Function (`console.log`, `console.warn`, `console.error`, etc.)  
✅ Quote Type (`'`, `"`, or \``)  
✅ Filename & Line Number Inclusion

📖 **Explore Settings**: [Settings Documentation](https://www.turboconsolelog.io/documentation/settings)

---

## ✉️ Stay in the Loop – Join the Newsletter

🚀 **Get early access to new features, exclusive updates, and behind-the-scenes insights!**  
Be the first to know about **Turbo Console Log improvements, new releases, and special announcements**.

📩 **Join the newsletter here** → [https://www.turboconsolelog.io/join](https://www.turboconsolelog.io/join)

---

## 💙 Support Turbo Console Log

Turbo Console Log is **free & open-source**, maintained with passion by developers like you.

If you’ve found value in it, you can help keep it growing:

🔗 **[Visit the Sponsorship Page](https://www.turboconsolelog.io/sponsorship)**

Your support fuels **bug fixes, improvements, and new features**, ensuring Turbo Console Log continues evolving for **millions of developers—including YOU!**

Whether you contribute or not, we’re happy to have you as part of this journey! 🚀

---

## 📢 Stay Updated

🔗 **[Follow Turbo Console Log Updates](https://www.turboconsolelog.io/articles)**  
💬 **Join the Discussion** → [GitHub Discussions](https://github.com/Chakroun-Anas/turbo-console-log/discussions)

## 📧 Contact

📩 **Support:** [support@turboconsolelog.io](mailto:support@turboconsolelog.io)  
📩 **Feedback:** [feedback@turboconsolelog.io](mailto:feedback@turboconsolelog.io)  
📩 **Sponsorship:** [sponsorship@turboconsolelog.io](mailto:sponsorship@turboconsolelog.io)

---

## 🎯 Contribute

Turbo Console Log is **open for contributions!**  
Want to improve it? Report issues, suggest features, or submit pull requests:

👉 **[Contribute on GitHub](https://github.com/Chakroun-Anas/turbo-console-log)**

## 📜 License

MIT License &copy; Turbo Console Log
