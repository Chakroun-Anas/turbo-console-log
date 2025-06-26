export function getHtmlWebView(): string {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; background: #1E1E1E; color: #FFFFFF; }
          h1, h2, h3 { font-weight: bold; }
          a { color: #48BFE3; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .primary-color { color: #FF6B6B; font-size: 28px; }
          .secondary-color { color: #FFC947; font-size: 20px; }
          .info-color { color: #48BFE3; font-weight: bold; }
          .container { max-width: 800px; margin: 0 auto; line-height: 1.6; text-align: center; }
          .section-container { padding: 15px; background: rgba(255,255,255,0.08); border-radius: 8px; text-align: left; margin-bottom: 24px; }
          .text { maxWidth: '100ch'; text-align: justify; font-size: 14px; }
          .button-container { text-align: center; margin-top: 30px; margin-bottom: 25px; }
          .button {
            background: #FF6B6B; color: black; padding: 14px 24px; font-weight: bold;
            text-decoration: none; border-radius: 6px; display: inline-block;
            text-align: center; cursor: pointer;
          }
          .list { margin-left: 20px; text-align: left; padding-left: 10px; }
          .list li { margin-bottom: 8px; display: flex; align-items: center; }
          .list li::before { content: "\u2705"; margin-right: 10px; }
          .strong { font-weight: bold; }
          .image-container { margin: 20px auto; display: flex; flex-direction: column; align-items: center; }
          img { max-width: 100%; border-radius: 8px; cursor: pointer; }
          .release-illustration-pro-link:focus { outline: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="primary-color">
            <img src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-console-log-icon.a3aba0a3.png&w=64&q=75" style="height: 24px; width: 24px;" alt="Turbo Console Log Logo" />
            Turbo Pro v2 is Here! 🚀
          </h1>

          <p class="text">
            This release is dedicated to the incredible community that has grown around Turbo Console Log — to every developer who shared feedback, every early adopter who believed in the vision, and every supporter who helped push this project forward. 🤍  
          </p>

         <p class="text">
          After weeks of heavy testing, direct input from believers, and a complete performance overhaul — Turbo Pro v2 is live.  
          It delivers smoother log syncing, smarter detection, and a rock-solid experience — with real-world benchmarks proving its speed across massive projects like React, Storybook, and Vite.
        </p>

          <div class="image-container">
              <a href="https://www.turboconsolelog.io/pro" target="_blank" tabindex="-1" class="release-illustration-pro-link">
                <img 
                  src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-pro-illustration.4cf37990.png&w=828&q=75" 
                  alt="Turbo Pro Illustration" 
                  style="height: 460px; width: 308px; margin-bottom: 16px;" 
                />
              </a>
             <a href="https://www.turboconsolelog.io/pro" target="_blank" style="display: inline-block; padding: 0.6rem 1rem; background-color: #ff5c57; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
              🔥 Unlock Turbo PRO v2
             </a>
          </div>

          <div class="section-container">
            <h2 style="color: #ffcb6b;">What’s New in Turbo Pro v2 🛠️</h2>
            <ul class="list">
              <li>Major performance improvements (faster boot, faster syncing) ⚡</li>
              <li>False positive logs detection drastically reduced 🧠</li>
              <li>New update mechanism with retry & repair support 🔁</li>
              <li>Test coverage boosted with Jest-powered unit testing 🧪</li>
              <li>Improved Pro license error handling & self-healing system 🔐</li>
              <li>Raised activations per version to five instead of only three activations 🎯</li>
            </ul>
          </div>

          <div class="section-container">
            <h2 class="secondary-color">🚀 Turbo Console Log Pro Benefits</h2>
            <ul class="list">
              <li>One-time purchase — lifetime license 🔑</li>
              <li>Up to 5 activations per version 🧩</li>
              <li>Lifetime updates and premium support 💬</li>
              <li>Supports project sustainability ❤️</li>
            </ul>
          </div>

          <div class="section-container">
            <h2 class="secondary-color">📚 Dive Deeper</h2>
            <ul class="list">
              <li><a href="https://www.turboconsolelog.io/articles/release-310">Full v3.1.0 release notes</a></li>
              <li><a href="https://www.turboconsolelog.io/articles/pro-v2-technical-overview">How Turbo Pro Works – Technical Deep Dive 🧬</a></li>
              <li><a href="https://www.turboconsolelog.io/articles/benchmark-pro-v2">Benchmark Pro v2 ⚡️</a></li>
            </ul>
          </div>

          <div class="section-container">
            <h2 class="secondary-color">📬 Stay in the Loop</h2>
            <p class="text">
              Get all future updates, new features, and exclusive dev content directly to your inbox. Subscribe and receive our 2025 Fullstack JavaScript Roadmap as a welcome gift!
            </p>
            <p><a href="https://www.turboconsolelog.io/join">👉 Join the newsletter 💌</a></p>
          </div>

          <hr style="margin-top: 3rem; border-color: #333;" />
          <p style="color: #888;">Visit <a href="https://www.turboconsolelog.io" target="_blank" style="color: #88cfff;">https://www.turboconsolelog.io</a> for more insights and documentation.</p>
          <p style="color: #888;">© 2025 Turbo Console Log — All Rights Reserved.</p>
        </div>
      </body>
    </html>
  `;
}
