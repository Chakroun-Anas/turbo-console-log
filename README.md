## Main Functionality

---

This extension make debugging much easier by automating the operation of writing meaningful log message.

## Features

---

I) Insert meaningful log message automatically

Two steps:

- Selecting the variable which is the subject of the debugging

- Pressing ctrl + alt + L

The log message will be inserted in the next line relative to the selected variable like this:

console.log("SelectedVariableEnclosingClassName -> SelectedVariableEnclosingFunctionName -> SelectedVariable", SelectedVariable)

![alt text](https://image.ibb.co/dysw7p/insert_log_message.gif "Inserting meaningful log message after selecting a variable")

Properties:

- turboConsoleLog.wrapLogMessage (boolean): Whether to wrap the log message or not.

- turboConsoleLog.logMessagePrefix (string): The prefix of the log message, default one is TCL.

- turboConsoleLog.addSemicolonInTheEnd (boolean): Whether to put a semicolon in the end of the log message or not.

- turboConsoleLog.quote (enum): Double quotes (""), single quotes ('') or backtick(``).

A wrapped log message :

![alt text](https://image.ibb.co/h9yfYU/wrap_log_message.gif "Wrapping The log message")

II) Comment all log messages, inserted by the extension, from the current document

All it takes to comment all log messages, inserted by the extension, from the current document is to press alt + shift + c

![alt text](https://image.ibb.co/eVwTL9/comment_log_messages.gif "Comment all log messages, inserted by the extension, from the current file")

III) Uncomment all log messages, inserted by the extension, from the current document

All it takes to uncomment all log messages, inserted by the extension, from the current document is to press alt + shift + u

![alt text](https://image.ibb.co/cp9q09/uncomment_log_messages.gif "Uncomment all log messages, inserted by the extension, from the current file")

IV) Delete all log messages, inserted by the extension, from the current document

All it takes to delete all log messages, inserted by the extension, from the current document is to press alt + shift + d

![alt text](https://image.ibb.co/jv9UtU/delete_all_log_messages.gif "Delete all log messages, inserted by the extension, from the current file")

## Release Notes

---

### 1.0.0

Initial release of Turbo Console Log

### 1.1.0

- New feature: The possibility of wrapping the log message is added

## 1.2.0

- New feature: Comment all log messages inserted by the extension
- New feature: Uncomment all log messages inserted by the extension
- When requested, only the log messages inserted by the extension will be commented, uncommented or deleted

## Participate

---

You're more than welcome to participate in the development of the extension by creating pull requests and submitting issues, link of the project in github: https://github.com/Chakroun-Anas/turbo-console-log

## Contact

---

You can contact me on the following mail: chakroun.anas@outlook.com

## License

---

MIT &copy; Chakroun Anas

---

Buying me a coffe will definitely help me to keep working in this project and other open source projects <3

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.me/ChakrounAnas)

**Enjoy!**
