# Official website

https://www.turboconsolelog.io

# Main Functionality

Turbo Console Log extension makes debugging much easier by automating the operation of writing meaningful log message.

## Sponsorship

Since the extension is free and open source, we need your support to continue developing and maintaining it. If you are interested in sponsoring the project, u can do it through the following [Link](https://donate.stripe.com/3cs28j2es9mxaGI7st) or contact us at sponsorship@turboconsolelog.io. For more information please visit: https://www.turboconsolelog.io/sponsorship

## Core Features

Full documentation of the core features can be found in the official website: https://www.turboconsolelog.io/documentation?activeSection=features

### I) Insert a meaningful log message

Two steps:

- Selecting or hovering the variable which is the subject of the debugging (Manual selection will always take over the hover selection)

- Pressing ctrl + alt + L (Windows) or ctrl + option + L (Mac)

The log message will be inserted in the next line relative to the selected variable like the following:

`console.log('🚀 ~ classWrappingVariable ~ functionWrappingVariable ~ variable', variable);`

The log function and the content of the log message can be customized in the extension settings (see Settings section for more details).

Multiple cursor selection is also supported.

[<u>See It In Action</u>](https://www.turboconsolelog.io/documentation?activeSection=features&activeSubSection=insert-log-message)

### II) Comment all log messages, inserted by the extension, from the current document

All it takes to comment all log messages, inserted by the extension, from the current document is to press alt + shift + c (Windows) or option + shift + c (Mac)

[<u>See It In Action</u>](https://www.turboconsolelog.io/documentation?activeSection=features&activeSubSection=comment-inserted-log-messages)

### III) Uncomment all log messages, inserted by the extension, from the current document

All it takes to uncomment all log messages, inserted by the extension, from the current document is to press alt + shift + u (Windows) or option + shift + u (Mac)

[<u>See It In Action</u>](https://turboconsolelog.io/documentation?activeSection=features&activeSubSection=uncomment-log-messages)

### IV) Delete all log messages, inserted by the extension, from the current document

All it takes to delete all log messages, inserted by the extension, from the current document is to press alt + shift + d (Windows) or option + shift + d (Mac)

[<u>See It In Action</u>](https://turboconsolelog.io/documentation?activeSection=features&activeSubSection=delete-log-messages)

## Settings

Full documentation of the settings can be found in the official website: https://www.turboconsolelog.io/documentation?activeSection=settings

Properties:

| Feature                              | Description                                                                                                                | Setting                                         | Default     |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------- |
| Custom Prefix                        | The prefix of the log message                                                                                              | turboConsoleLog.logMessagePrefix                | 🚀          |
| Custom suffix                        | The suffix of the log message                                                                                              | turboConsoleLog.logMessageSuffix                | :           |
| Log Type                             | The type of the log message                                                                                                | turboConsoleLog.logType                         | log         |
| Custom Log Function                  | Custom log function to use in the inserted log message, when specified logType property will be ignored                    | turboConsoleLog.logFunction                     | console.log |
| Delimiter Inside Message             | The delimiter that will separate the different log message elements (file name, line number, class, function and variable) | turboConsoleLog.delimiterInsideMessage          | ~           |
| Quote                                | Double quotes ("") or single quotes ('')                                                                                   | turboConsoleLog.quote                           | "           |
| Add Semicolon In The End             | Whether to put a semicolon in the end of the log message or not                                                            | turboConsoleLog.addSemicolonInTheEnd            | true        |
| Insert Enclosing Class               | Whether to insert or not the enclosing class of the selected variable in the log message                                   | turboConsoleLog.insertEnclosingClass            | true        |
| Insert Enclosing Function            | Whether to insert or not the enclosing function of the selected variable in the log message                                | turboConsoleLog.insertEnclosingFunction         | true        |
| Include File Name And Line Number    | Whether to include the file name and the line number of the log message                                                    | turboConsoleLog.includeFileNameAndLineNum       | true        |
| Wrap Log Message                     | Whether to wrap the log message or not                                                                                     | turboConsoleLog.wrapLogMessage                  | true        |
| Insert Empty Line Before Log Message | Whether to insert an empty line before the log message or not                                                              | turboConsoleLog.insertEmptyLineBeforeLogMessage | true        |
| Insert Empty Line After Log Message  | Whether to insert an empty line after the log message or not                                                               | turboConsoleLog.insertEmptyLineAfterLogMessage  | true        |

## Roadmap

https://www.turboconsolelog.io/roadmap

## Articles

- [<u>Introducing Our New Website</u>](https://turboconsolelog.io/articles?articleId=introducing-new-website)
- [<u>Introducing Our New Website</u>](https://turboconsolelog.io/articles?articleId=motivation-behind-tcl)

## Contact

- Support: support@turboconsolelog.io
- Feedback: feedback@turboconsolelog.io
- Sponsorship: sponsorship@turboconsolelog.io

## Release Notes

See the ChangeLog file for details.

## Participate

You're more than welcome to participate in the development of the extension by creating pull requests and submitting issues, link of the project in github: https://github.com/Chakroun-Anas/turbo-console-log

## License

MIT Copyright &copy; Turbo Console Log
