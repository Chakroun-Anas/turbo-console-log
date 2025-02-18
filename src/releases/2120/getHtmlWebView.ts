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
            .section-container { margin-top: 20px; margin-bottom: 20px; padding: 20px; background: rgba(255,255,255,0.08); border-radius: 8px; text-align: left; }
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
            <h1 class="primary-color" style="margin-bottom: 0px;">Turbo Console Log Release v2.12.0: More Stable, But an uncertain future!</h1>
            <div class="image-container">
              <a href="https://www.turboconsolelog.io/sponsorship?showSponsor=true">
                  <img src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsponsorship-v2120.95fd728e.webp&w=1200&q=75" 
                      alt="Support Turbo Console Log - Sponsor Now!" style="width: 420px; height: 256px" />
              </a>
            </div>

            <p class="text">
                <span class="strong">Turbo Console Log has become more stable with this update, thanks to various bug fixes, find the full release note below!</span>
            </p>

              <div class="section-container">
                <h2 class="secondary-color">Fixed Bugs 🐞</h2>
                <ul class="list">
                <li>Typed Function Call Logging Fix: Fixed cases where logs for typed function calls were improperly generated (Issue #236).</li>
                    <li>Fixed Function Call Assignment Edge Case: Resolved issues where function calls assigned to variables were not logged correctly (Issue #231).</li>
                    <li>Whitespace Character Bug Resolved: Corrected unexpected logging behavior caused by leading or trailing whitespace characters (Issue #212).</li>
                </ul>
            </div>

            <p class="text">
                <span class="strong">However, sustaining this level of quality is getting harder. Donations since the last release have been incredibly low, and if this trend continues, we may only be able to release updates monthly if at all :/</span>
            </p>

              <p class="text">
                <span class="strong"> If Turbo Console Log saves you time, please consider supporting it. Your contribution ensures bi-weekly updates continue and that Turbo Console Log remains an actively maintained, evolving tool.</span>
            </p>

             <div class="button-container">
                  <a class="button" href="https://www.turboconsolelog.io/sponsorship?showSponsor=true" style="color: white;">TAKE ME TO SPONSORSHIP</a>
              </div>
            <div class="section-container">
                <h2 class="secondary-color">📖 Read More:</h2>
                <ul class="list">
                    <li><a href="https://www.turboconsolelog.io/articles/release-2120">Full Release Notes</a></li>
                    <li><a href="https://www.turboconsolelog.io/articles/sponsorship-campaign">Sponsorship Campaign</a></li>
                </ul>
            </div>
          </div>
        </body>
      </html>
    `;
}
