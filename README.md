## Main Functionality

---

This extension make debugging much easier by automating the operation of writing meaningful log message.

## Features

---

I) Insert meaningful log message automatically

Two steps:

- Selecting or hovering the variable which is the subject of the debugging (Manual selection will always take over the hover selection)

- Pressing ctrl + alt + L (Windows) or ctrl + option + L (Mac)

The log message will be inserted in the next line relative to the selected variable like this:

console.log("SelectedVariableEnclosingClassName -> SelectedVariableEnclosingFunctionName -> SelectedVariable", SelectedVariable)

![alt text](https://image.ibb.co/dysw7p/insert_log_message.gif 'Inserting meaningful log message after selecting a variable')

Multiple cursor support:

![alt text](https://i.ibb.co/Jk2pmRG/tcl-multiple-selections.gif 'Multiple cursor support')

Properties:

- turboConsoleLog.logFunction (string): Custom log function to use in the inserted log message, when specified logType property will be ignored

- turboConsoleLog.logType (enum): "log","warn", "error","debug","table"

- turboConsoleLog.wrapLogMessage (boolean): Whether to wrap the log message or not.

- turboConsoleLog.logMessagePrefix (string): The prefix of the log message (default one is 🚀 ).

- turboConsoleLog.logMessageSuffix (string): The suffix of the log message (default one is `:` ).

- turboConsoleLog.addSemicolonInTheEnd (boolean): Whether to put a semicolon in the end of the log message or not.

- turboConsoleLog.insertEnclosingClass (boolean): Whether to insert or not the enclosing class of the selected variable in the log message.

- turboConsoleLog.insertEnclosingFunction (boolean): Whether to insert or not the enclosing function of the selected variable in the log message.

- turboConsoleLog.insertEmptyLineBeforeLogMessage (boolean): Whether to insert an empty line before the log message or not.

- turboConsoleLog.insertEmptyLineAfterLogMessage (boolean): Whether to insert an empty line after the log message or not.

- turboConsoleLog.delimiterInsideMessage (string): The delimiter that will separate the different log message elements (file name, line number, class, function and variable)

- turboConsoleLog.includeFileNameAndLineNum (boolean): Whether to include the file name and the line number of the log message.

- turboConsoleLog.quote (enum): Double quotes (""), single quotes ('') or backtick(``).

A wrapped log message :

![alt text](https://image.ibb.co/h9yfYU/wrap_log_message.gif 'Wrapping The log message')

II) Comment all log messages, inserted by the extension, from the current document

All it takes to comment all log messages, inserted by the extension, from the current document is to press alt + shift + c (Windows) or option + shift + c (Mac)

![alt text](https://image.ibb.co/eVwTL9/comment_log_messages.gif 'Comment all log messages, inserted by the extension, from the current file')

III) Uncomment all log messages, inserted by the extension, from the current document

All it takes to uncomment all log messages, inserted by the extension, from the current document is to press alt + shift + u (Windows) or option + shift + u (Mac)

![alt text](https://image.ibb.co/cp9q09/uncomment_log_messages.gif 'Uncomment all log messages, inserted by the extension, from the current file')

IV) Delete all log messages, inserted by the extension, from the current document

All it takes to delete all log messages, inserted by the extension, from the current document is to press alt + shift + d (Windows) or option + shift + d (Mac)

![alt text](https://image.ibb.co/jv9UtU/delete_all_log_messages.gif 'Delete all log messages, inserted by the extension, from the current file')

## Release Notes

---

### 1.0.0

Initial release of Turbo Console Log

### 1.1.0

- New feature: The possibility of wrapping the log message is added

### 1.2.0

- New feature: Comment all log messages inserted by the extension
- New feature: Uncomment all log messages inserted by the extension
- When requested, only the log messages inserted by the extension will be commented, uncommented or deleted

### 1.3.0

- Multiple cursor support

### 1.4.0

- The extension will comment, uncomment and delete all log messages in the current file whether they have been inserted by it or not

### 2.0.0

- The extension is rewrited with Typescript with a whole new architecture

### 2.1.0

- File name and line number are added to the log message
- The delimiter of elements inside the log message can be customised
- Comment, uncomment and delete only the log messages inserted by the extension

### 2.2.0

- Specify custom log function to use instead of the default console.log
- Specify log function type (log, warn, error, debug, table)

### 2.3.0

- Possibility to insert the log message by hovering the variable
- Manual selection will always take over the hover selection

### 2.4.0

- insertEmptyLineBeforeLogMessage extension property is added
- insertEmptyLineAfterLogMessage extension property is added

### 2.5.0

- Support arrow function transformation

### 2.7.0

- Build the extension with esbuild

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
