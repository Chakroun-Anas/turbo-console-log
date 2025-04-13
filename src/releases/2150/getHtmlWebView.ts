export function getHtmlWebView(): string {
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
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="primary-color" style="margin-bottom: 0px;">
            <img src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-console-log-icon.a3aba0a3.png&w=64&q=75" style="height: 24px; width: 24px;" alt="Turbo Console Log Logo" />
            Turbo Console Log v2.15.0: April’s Only Drop!
          </h1>
          <div style="width: 100%; display: flex; justify-content: center; margin-top: 20px;">
            <a style="text-decoration: none; color: white;" href="https://www.turboconsolelog.io/articles/release-2150">
              <div class="release-illustration-container">
                <h2>Release v2.15.0</h2>
              </div>
              <p style="text-decoration: underline;">👉 Read the full release article 🗞️</p>
            </a>
          </div>

          <div class="section-container">
            <h2 class="secondary-color">🐛 What’s Fixed</h2>
            <ul class="list">
              <li>All core commands (Comment, Uncomment, Delete, Correct Log) now work even when using a custom log function</li>
              <li>Discovered and resolved thanks to tzarger – community-powered fix 💪</li>
              <li>Turbo now proudly runs on 100+ passing unit and integration tests</li>
            </ul>
          </div>

          <div class="section-container">
            <h2 class="secondary-color">⏳ Why Only One Release This Month?</h2>
            <p class="text">
              This sprint was hard. Financial pressure, burnout, and the unpredictability of donations made it impossible to sustain our bi-weekly release pace. 
              We had to focus everything on delivering one stable, meaningful release — while preparing for the upcoming PRO transition in May.
            </p>
          </div>

          <div class="section-container">
            <h2 class="secondary-color">🧠 PRO Version Coming in May</h2>
            <p class="text">
              A dedicated visual panel is coming! Turbo Console Log PRO will unlock powerful new interactive features—while the free version stays alive and updated.
              <br/><br/>
              💡 PRO will be available under a <strong>one-time purchase model</strong> at a <strong>reasonable price</strong>. No subscriptions. No lock-ins. Just support-driven upgrades for those who want more.
            </p>
          </div>

          <div class="section-container">
            <h2 class="secondary-color">📬 Stay in the Loop</h2>
            <p class="text">
              Be the first to hear about the PRO launch and other updates by joining our newsletter.
            </p>
            <p><a href="https://www.turboconsolelog.io/join">👉 Join the newsletter 💌</a></p>
          </div>

          <div class="section-container">
            <h2 class="secondary-color">🤍 We Need You — Now More Than Ever</h2>
            <p class="text">
              Turbo Console Log is 100% free, but it's not free to build. We’re in a fragile transition phase, and right now, 
              even a small donation can make the difference between survival and burnout. If Turbo helps you daily, this is your moment to give back.
            </p>
            <p><a href="https://www.turboconsolelog.io/sponsorship?showSponsor=true">👉 Become a Sponsor Today 🚀</a></p>
          </div>

          <div class="section-container">
            <h2 class="secondary-color">📚 More to Explore</h2>
            <ul class="list">
              <li><a href="https://www.turboconsolelog.io/articles/debugging-science-art">Debugging Between Science & Art 📘</a></li>
              <li><a href="https://www.turboconsolelog.io/articles/release-plan-2025">2025 Release Plan & Vision 📅</a></li>
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
