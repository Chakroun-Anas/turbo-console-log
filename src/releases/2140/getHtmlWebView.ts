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
          .text { max-width: 600px; padding-left: 10px;}
          .button-container { text-align: center; margin-top: 30px; margin-bottom: 25px; }
          .button {
            background: #FF6B6B; color: black; padding: 14px 24px; font-weight: bold;
            text-decoration: none; border-radius: 6px; display: inline-block;
            text-align: center; cursor: pointer;
          }
          .release-illustration-container {
            background: #FF6B6B;
            width: 256px;
            height: 128px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 8px;
          }
          .list { margin-left: 20px; text-align: left; padding-left: 10px; }
          .list li { margin-bottom: 8px; display: flex; align-items: center; }
          .list li::before { content: "✅"; margin-right: 10px; }
          .strong { font-weight: bold; }
          .image-container { margin: 20px auto; text-align: center; }
          img { max-width: 100%; border-radius: 8px; cursor: pointer; }
          input[type="email"] {
            padding: 10px; border-radius: 6px; border: none; width: 70%; margin-top: 10px;
          }
          button[type="submit"] {
            padding: 10px 18px; margin-left: 10px; background-color: #FFC947; border: none;
            border-radius: 6px; font-weight: bold; cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="primary-color" style="margin-bottom: 0px;">
          Turbo Console Log v2.14.0: More Stable, Sharper, and Ready for What's Next!
          <img src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-console-log-icon.a3aba0a3.png&w=64&q=75" style="height: 24px; width: 24px;" alt="Turbo Console Log Logo" />
          </h1>
          <div style="width: 100%; display: flex; justify-content: center; margin-top: 20px;">
            <a style="text-decoration: none; color: white;" href="https://www.turboconsolelog.io/articles/release-2140">
              <div class="release-illustration-container">
                <h2>Release V2.14.0</h2>
              </div>
              <p style="text-decoration: underline;">👉 Read the full article release 🗞️</p>
            </a>
          </div>
          <div class="section-container">
            <h2 class="secondary-color">✨ What has been fixed ? </h2>
            <ul class="list">
              <li>
                Logs Appear Outside Function Due to Ignored Return Statement (Issue #256)
              </li>
              <li>
                Incorrect Quote Usage in Log Statements When Logging Objects (Issue #259)
              </li>
              <li>
                Function Call Incorrect Turbo Log Line Computation (Issue #260)
              </li>
               <li>
                Anonymous arrow function transformation when returning an inline object (Issue #262)
              </li>
            </ul>
          </div>

          <div class="section-container">
            <h2 class="secondary-color">📬 Join Newsletter</h2>
            <p class="text">
             Subscribe to our newsletter for the latest updates from Turbo Console Log — and instantly get a free roadmap to modern web development.
            </p>
            <p><a href="https://www.turboconsolelog.io/join">👉 Join the newsletter 💌</a></p>
          </div>

          <div class="section-container">
            <h2 class="secondary-color">💸 Sponsorship</h2>
            <p class="text">
              If Turbo Console Log has helped you debug faster or code happier, consider supporting the project.<br/>
              Every bit helps keep development active and independent.
            </p>
             <a href="https://www.turboconsolelog.io/sponsorship?showSponsor=true">👉 Sponsor the project</a>
          </div>
          <div class="section-container">
            <h2 class="secondary-color">📖 More from Turbo Console Log</h2>
            <ul class="list">
              <li> <a href="https://www.turboconsolelog.io/articles/debugging-science-art">Debugging Between Science & Art 📘</a></li>
              <li><a href="https://www.turboconsolelog.io/articles/release-plan-2025">Turbo Console Log Sponsorship Campaign 📢</a></li>
            </ul>
          </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
        <script>
          setTimeout(() => {
            confetti({
              particleCount: 70,
              spread: 70,
              origin: { y: 0.6 }
            });
          }, 900);
        </script>
      </body>
    </html>
  `;
}
