export function getHtmlWevView(): string {
  return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            .primary-color { color: #FF6B6B; }
            .secondary-color { color: #FFC947; }
            .info-color { color: #48BFE3 }
            .container { max-width: 800px; margin: 0 auto; }
            .section-container {  }
            .text {
                max-width: 450px;
                line-height: 1.6;
            }
            .button {
              background: #FF6B6B; color: black; padding: 10px 15px;
              text-decoration: none; border-radius: 5px; display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="primary-color">🚀 Turbo Console Log Release 2.11.0 💫</h1>
            <p class="text">
                In the context of the major changes Turbo Console Log project is going through, this is the first official bi-weekly release, one the many to
                come, couting on your feedback and support so that we fuel the rocket and keep it flying high.
                <br /> <br />
                U can read more about the new releases cycle and how it reflects on the project's roadmap in the project's GitHub repository <a href="http://localhost:3000/articles/release-plan-2025">here</a>.
            </p>
            <div class="section-container">            
                <h2 class="secondary-color">What does the release brings to the table ? 🍒</h2>
                <ol>
                    <li style="display: flex; flex-direction: column;">
                        <span class="text">
                            The setting "includeFileNameAndLineNum" is splitted to two settings "includeFilename" and "includeLineNum" to 
                            allow more flexibility and control over the inserted log messages.
                        </span>
                        <span style="inline-block; margin-top: 8px; display: flex; flex-direction: column;">
                            <span style="display: inline-block;" class="info-color">Associated issues:</span> 
                            <span style="display: inline-block; margin-top: 8px;">
                                <ul>
                                    <li><a href="https://github.com/Chakroun-Anas/turbo-console-log/issues/225">Suggestions for handling the filename and line number #225</a></li>
                                    <li style="margin-top: 4px;"><a href="https://github.com/Chakroun-Anas/turbo-console-log/issues/111">Can we separate the Include File name and Line Num? #111</a></li>
                                    <li style="margin-top: 4px;"><a href="https://github.com/Chakroun-Anas/turbo-console-log/issues/109">hi I was upadated latest version How to remove "File" and "Line" please!!!!!!! #109</a></li>
                                </ul>
                            </span>
                        </span>
                    </li>
                    <br />
                    <li style="display: flex; flex-direction: column;">
                        <span class="text">
                            You can now correct the line number and the file name inside the log messages inserted by turbo console log, 
                            by executing the newly introduced command "turboConsoleLog.correctAllLogMessages" or using the associated shortcut (alt+shift+x).
                        </span>
                        <span style="inline-block; margin-top: 8px; display: flex; flex-direction: column;">
                            <span style="display: inline-block;" class="info-color">Associated issues:</span> 
                            <span style="display: inline-block; margin-top: 8px;">
                                <ul>
                                    <li style="margin-top: 4px;"><a href="https://github.com/Chakroun-Anas/turbo-console-log/issues/238">Auto change line number in console.log when line no changed #238</a></li>
                                    <li><a href="https://github.com/Chakroun-Anas/turbo-console-log/issues/188">Line Number Correcting #188</a></li>
                                    <li style="margin-top: 4px;"><a href="https://github.com/Chakroun-Anas/turbo-console-log/issues/147">[feature request] Update log messages #147</a></li>
                                </ul>
                            </span>
                        </span>
                    </li>
                </ol>
            </div>
            <div style="margin-top: 16px;">            
                <h2 class="secondary-color">Support Turbo Console Log Family 🚀</h2>
                <p class="text">
                    First we thank u so much for using Turbo Console Log, and we would like to remind you that your support is critical to keep the project alive,
                    last month campaign was a success and we are looking forward to keep the momentum going.
                    <br /> <br />
                    Consider sponsoring the project by donating a small amount, it will help us to keep the project alive and to deliver more features and improvements.
                </p>
                <div>
                  <a class="button" href="https://www.turboconsolelog.com/sponsorship?showSponsor=true">Donate</a>
                </div>
                <p class="text">
                    Note: We will ask u twice a month to support the project upon each release, if you are not interested in supporting the project, you can dismiss the notification.
                </p>
            </div>
          </div>
  
          <script>
            const vscode = acquireVsCodeApi();
            document.querySelector('.button').addEventListener('click', () => {
              vscode.postMessage({ command: 'executeCommand' });
            });
          </script>
        </body>
      </html>
    `;
}
