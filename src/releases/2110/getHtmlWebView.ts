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
            .button-container { text-align: center; margin-top: 30px; margin-bottom: 25px; }
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
            <h1 class="primary-color">🚀 Turbo Console Log Release 2.11.0 💫</h1>
            
            <div class="image-container">
              <img src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsponsorship-campaign.9fe6b2af.webp&w=640&q=75" 
                   alt="Turbo Console Log Sponsorship Campaign" />
            </div>

            <p class="text">
                <span class="strong">Turbo Console Log v2.11.0 brings two highly requested features!</span>
                We're excited to introduce **enhanced log control and an all-new command for correcting log messages**.  
                <br/><br/>
                <span class="strong">This is the first of many bi-weekly releases</span>, ensuring continuous refinement and expansion of the extension.  
                <br/><br/>
                Read more about the new release cycle and roadmap <a href="https://www.turboconsolelog.io/articles/release-plan-2025">here</a>.
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
                    Thank you for using <span class="strong">Turbo Console Log!</span> Your <span class="strong">support keeps this project alive.</span>  
                    <br/><br/>
                    <span class="strong">Last month's sponsorship campaign was a success!</span>  
                    If this extension <span class="strong">saves you time</span>, consider making a small donation to help us continue improving it.  
                </p>
                <div class="button-container">
                  <a class="button" href="https://www.turboconsolelog.io/sponsorship?showSponsor=true">SPONSOR</a>
                </div>
               <p class="text">
                <b>Note:</b> We’ll gently remind you <span class="strong">twice a month</span> (with each release) to support the project.
                If you're not interested, simply dismiss the notification. We appreciate your support!
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
