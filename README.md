## Main Functionality
---

This extension make debugging much easier by automating the operation of writing meaningful log message.

## Features
---

I) Insert meaningful log message automatically 

Two steps:

* Selecting the variable which is the subject of the debugging

* Pressing Ctrl + Alt + l

The log message will be inserted in the next line relative to the selected variable like this: 

console.log('SelectedVariableEnclosingClassName -> SelectVariableEnclosingFunctionName -> SelectedVariable', SelectedVariable)

![alt text](https://image.ibb.co/mG1SXn/insert_log_message.gif "Inserting meaningful log message after selecting a variable")

The log message can be wrapped by changing the value of wrapLogMessage to true in settings.json

![alt text](https://image.ibb.co/kLed57/wrap_log_message.gif "Wrapping The log message")

II) Comment all log messages, inserted by the extension, from the current document

All it takes to comment all log messages, inserted by the extension, from the current document is to press Ctrl + Alt + q

III) Uncomment all log messages, inserted by the extension, from the current document

All it takes to uncomment all log messages, inserted by the extension, from the current document is to press Ctrl + Alt + u

IV) Delete all log messages, inserted by the extension, from the current document

All it takes to delete all log messages, inserted by the extension, from the current document is to press Ctrl + Alt + d

![alt text](https://image.ibb.co/jkoKdS/delete_all_log_messages.gif "Deleting all log messages from the current file")

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