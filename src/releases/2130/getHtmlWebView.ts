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
        <h1 class="primary-color" style="margin-bottom: 0px;">Turbo Console Log v2.13.0 Release: Smarter, More Precise, and Evolving!</h1>
        <div class="image-container">
            <a href="https://www.turboconsolelog.io/sponsorship?showSponsor=true">
           <div style="text-align: center;">
    <a href="https://www.turboconsolelog.io/sponsorship?showSponsor=true" target="_blank">
        <img src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fv2.13.0.893425fb.webp&w=1200&q=75"
             alt="Support Turbo Console Log - Sponsor Now!"
             style="width: 420px; height: 256px" />
    </a>
    <p style="color: #FFC947; font-size: 12px; margin-top: 0px;">
        <strong>Clicking the image will redirect u to the sponsorship dialog in the extension website 💖</strong>
    </p>
</div>

            </a>
        </div>

        <p class="text">
            <span class="strong">Thank you to the amazing Turbo Console Log community! Your support in the last release was incredible. Let's keep the momentum going to ensure this project thrives! 🚀</span>
        </p>

        <div class="section-container">
            <h2 class="secondary-color">Fixed Bugs & Improvements 🛠️</h2>
            <ul class="list">
            <li>Corrected Log Placement in Object Assignments (Issue #252).</li>
            <li>Accurate Log Placement for Array Assignments with TypeScript (Issue #253).</li>
            <li>Precise Log Placement for Single-Line Expressions (Issue #254).</li>
            <li>Smart Quote Selection for Log Messages (Linked to Issue #254).</li>
            </ul>
        </div>

        <div class="section-container">
            <h2 class="secondary-color">🚨 Addressing False Claims</h2>
            <p>Recently, a GitHub issue falsely labeled Turbo Console Log as "spam adware." Let's be clear:</p>
            <ul class="list">
            <li>The web view **only appears once per bi-weekly release** (or upon installation).</li>
            <li>It **can be dismissed** and will not appear again until the next release.</li>
            <li>Turbo Console Log is **completely free & open-source** with no paywall restrictions.</li>
            <li>We introduced a **structured, predictable release plan** to keep things transparent.</li>
            </ul>
            <p>For more details, check the discussion:  <a href="https://github.com/Chakroun-Anas/turbo-console-log/issues/250">Github Issue</a></p>
           
        </div>

        <p class="text">
            <span class="strong">Your contributions ensure Turbo Console Log stays actively maintained. Every bit of support helps us keep pushing forward!</span>
        </p>

        <div class="button-container">
            <a class="button" href="https://www.turboconsolelog.io/sponsorship?showSponsor=true" style="color: white;">SUPPORT THE PROJECT</a>
        </div>

        <div class="section-container">
            <h2 class="secondary-color">📖 Read More:</h2>
            <ul class="list">
            <li><a href="https://www.turboconsolelog.io/articles/release-2130">Full Release Notes</a></li>
            <li><a href="https://www.turboconsolelog.io/articles/sponsorship-campaign">Sponsorship Campaign</a></li>
            </ul>
        </div>
        </div>
    </body>
    </html>
      `;
}
