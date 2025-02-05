export function getHtmlWevView(): string {
  return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; background: #1E1E1E; color: #FFFFFF; }
            h1, h2, h3 { font-weight: bold; }
            a { color: #48BFE3; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .primary-color { color: #FF6B6B; font-size: 22px; }
            .secondary-color { color: #FFC947; font-size: 20px; }
            .info-color { color: #48BFE3; font-weight: bold; }
            .container { max-width: 800px; margin: 0 auto; line-height: 1.6; text-align: center; }
            .section-container { margin-top: 20px; padding: 20px; background: rgba(255,255,255,0.08); border-radius: 8px; text-align: left; }
            .text { max-width: 600px; margin: 0 auto 10px; }
            .button-container { text-align: center; margin-top: 30px; margin-bottom: 25px;}
            .button {
              background: #FF6B6B; color: black; padding: 14px 24px; font-weight: bold;
              text-decoration: none; border-radius: 6px; display: inline-block;
              text-align: center; cursor: pointer;
            }
            .list { margin-left: 20px; text-align: left; padding-left: 10px; }
            .list li { margin-bottom: 8px; display: flex; align-items: center; }
            .list li::before { content: "✅"; margin-right: 10px; }
            .strong { font-weight: bold; }
            .image-container { margin: 20px auto; text-align: center; }
            img { max-width: 100%; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="primary-color" style="margin-bottom: 0px;">🚀 Turbo Console Log Release 2.11.0 💫</h1>
            <p style="margin-top: 0px;"><a href="">full release notes</a></p>
            <div class="image-container">
              <a href="https://www.turboconsolelog.io/sponsorship">
                  <img src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsponsorship-campaign.9fe6b2af.webp&w=640&q=75" 
                      alt="Support Turbo Console Log - Sponsor Now!" />
              </a>
              <p style="text-align: center; font-size: 14px; color: #bbb; margin-top: 5px;">
                  Clicking this image will take you to the <a href="https://www.turboconsolelog.io/sponsorship" style="color: #ffcc00;">Sponsorship Page 💚</a>
              </p>
            </div>

            <p class="text">
                <span class="strong">Turbo Console Log v2.11.0 brings two highly requested features!</span>
                We're excited to introduce **enhanced log control and an all-new command for correcting log messages**.  
                <br/><br/>
                If Turbo Console Log has saved you time, consider supporting its future so we can keep building **faster releases and new features**!
            </p>

            <div class="section-container">
                <h2 class="secondary-color">🚀 Key Features in v2.11.0 🎯</h2>

                <h3 class="info-color">🛠️ More Control Over Log Messages</h3>
                <p class="text">
                    The setting <span class="strong">"includeFileNameAndLineNum"</span> is now split into two independent settings:  
                    <span class="strong">"includeFilename"</span> and <span class="strong">"includeLineNum"</span>.  
                    <br/><br/>
                    This gives you **precise control** over what appears in your log messages.
                </p>

                <h3 class="info-color">🔄 Correct Log Messages Instantly</h3>
                <p class="text">
                    Introducing the new **"Correct Log Messages"** command:  
                    <br/><br/>
                    **Command:** "turboConsoleLog.correctAllLogMessages"  
                    **Shortcut:** (Alt + Shift + X)  
                    <br/><br/>
                    This allows you to **update filenames and line numbers inside logs** after code changes, keeping everything accurate.
                </p>
            </div>

            <div class="section-container">
                <h2 class="secondary-color">🐞 Incremental Bug Fixes & Optimizations</h2>
                <p class="text">
                    As part of our ongoing improvements, we've made **minor fixes** to ensure Turbo Console Log runs smoother than ever.
                </p>
                <ul class="list">
                    <li>Improved <span class="strong">log placement accuracy</span> in complex expressions.</li>
                    <li>Better handling of <span class="strong">nested objects, ternary expressions, and template literals.</span></li>
                    <li>Refined detection logic for <span class="strong">function assignments and array elements.</span></li>
                </ul>
            </div>

            <div class="section-container">
                <h2 class="secondary-color">💙 Support Turbo Console Log 🚀</h2>
               <p class="text">
                  <span class="strong">Turbo Console Log exists because of developers like you! 🚀</span>  
                  <br/><br/>
                  If this extension <span class="strong">saves you time, effort, and frustration</span>, consider supporting its future.  
                  <br/><br/>
                  Your support fuels bug fixes, new features, and ensures that Turbo Console Log keeps evolving for nearly <span class="strong">2 million developers—including YOU!</span>
              </p>
              <div class="button-container">
                  <a class="button" href="https://www.turboconsolelog.io/sponsorship" style="color: white;">TAKE ME TO SPONSORSHIP</a>
              </div>

                <p class="text">
                  <b>Note:</b> This release is part of our **new bi-weekly cycle**! Expect **frequent updates and new features** ahead. 🚀  
                </p>
            </div>

            <div class="section-container">
                <h2 class="secondary-color">📖 Read More:</h2>
                <ul class="list">
                    <li><a href="https://www.turboconsolelog.io/articles/release-2110">Full Release Notes</a></li>
                    <li><a href="https://www.turboconsolelog.io/articles/sponsorship-campaign">Sponsorship Campaign</a></li>
                    <li><a href="https://www.turboconsolelog.io/articles/release-plan-2025">2025 Release Plan</a></li>
                </ul>
            </div>
          </div>
        </body>
      </html>
    `;
}
