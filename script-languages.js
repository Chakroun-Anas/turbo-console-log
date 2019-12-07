function getLanguageConfig(languageId) {
    switch (languageId) {
        case "fsharp":
        case 'csharp':
            return {
                logMessage: 'Console.WriteLine',
                separateText: '.',
                endVariable: ''
            }
        case 'php':
            return {
                logMessage: 'print',
                separateText: '.',
                endVariable: ''
            }
        case 'dart':
            return {
                logMessage: 'print',
                separateText: '+',
                endVariable: '.toString()'
            }
        case 'go':
            return {
                logMessage: 'fmt.Println',
                separateText: '+',
                endVariable: '.toString()'
            }
        case 'java':
            return {
                logMessage: 'System.out.print',
                separateText: '+',
                endVariable: '.toString()'
            }
        case 'python':
            return {
                logMessage: 'print',
                separateText: ',',
                endVariable: '.toString()'
            }
        case 'javascript':
        case 'typescript':
        case 'javascriptreact':
        case 'typescriptreact':
            return {
                logMessage: 'console.log',
                separateText: ',',
                endVariable: ''
            }
    }

}

module.exports.getLanguageConfig = getLanguageConfig