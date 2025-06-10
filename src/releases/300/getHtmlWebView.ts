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
          .list li::before { content: "\u2705"; margin-right: 10px; }
          .strong { font-weight: bold; }
          .image-container { margin: 20px auto; display: flex; flex-direction: column; align-items: center; }
          img { max-width: 100%; border-radius: 8px; cursor: pointer; }
          .release-illustration-pro-link:focus {
            outline: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="primary-color">
            <img src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-console-log-icon.a3aba0a3.png&w=64&q=75" style="height: 24px; width: 24px;" alt="Turbo Console Log Logo" />
            Turbo Console Log v3.0.0 — Official Turbo Pro Release 🎉
          </h1>

          <p class="text">
            This release marks a major milestone for Turbo Console Log — we’re officially entering a new era with the launch of <strong>Turbo PRO</strong> for the public.
            The pre-launch was a success, with strong engagement and positive feedback from our early adopters — proof that this is a step in the right direction for the project and the community.<br />
          </p>

          <div class="image-container">
              <a href="https://www.turboconsolelog.io/pro" target="_blank" tabindex="-1" class="release-illustration-pro-link">
                <img 
                  src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-pro-illustration.4cf37990.png&w=828&q=75" 
                  alt="Support Turbo Console Log - Sponsor Now!" 
                  style="height: 460px; width: 308px; margin-bottom: 16px;" 
                />
              </a>
             <a href="https://www.turboconsolelog.io/pro" target="_blank" style="display: inline-block; padding: 0.6rem 1rem; background-color: #ff5c57; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
              🔥 Unlock Turbo PRO Now! 
             </a>
          </div>

          <div class="section-container">
            <h2 style="color: #ffcb6b; margin-bottom: 0px;">Exclusive Additional New Features 💥</h2>
            <div style="margin-left: 20px;margin-top: 0px;">
               <p>
                <strong>Turbo PRO</strong> brings the following new features on top of the free and open source version:
              </p>
              <ul class="list">
                <li>Native dedicated VSCode panel for the extension </li>
                <li>Current folder/workspace logs listing via VSCode Tree View API 🌲</li>
                <li>Real time synchronisation of the current folder/workspace logs in the tree ⚡️</li>
                <li>Contextual menu to execute turbo command actions on the file level 🚦</li>
                <li>Auto correct turbo log messages line numbers and file names when the tree is synchronised 🖊️</li>
                <li>Blazing fast and 100% native to VSCode 💨</li>
              </ul>
            </div>
          </div>

           <div class="section-container">
            <h2 style="color: #ffcb6b; margin-bottom: 0px;">Turbo Console Log Pro Deal 🤝</h2>
            <div style="margin-left: 20px;margin-top: 0px;">
              <ul class="list">
                <li>One life time purchase 💶 </li>
                <li>Private personal license key activation 🔑</li>
                <li>Three activations per new version 🔓</li>
                <li>Lifetime updates and support ♾️</li>
              </ul>
            </div>
          </div>

          <div class="section-container">
            <h2 class="secondary-color">📚 More to Explore</h2>
            <ul class="list">
              <li><a href="https://www.turboconsolelog.io/articles/release-300">V3.0.0 full release notes</a></li>
              <li><a href="https://www.turboconsolelog.io/articles/debugging-memory">Debugging with Memory: Why Turbo PRO Panel Matters! 📘</a></li>
            </ul>
          </div>

          <div class="section-container">
            <h2 class="secondary-color">📬 Stay in the Loop</h2>
            <p class="text">
            Whether it’s about the latest features, updates, or exclusive offers, we want to keep you informed and engaged, feel 
             free to join our newsletter and receives a free JavaScript fullstack roadmap for 2025!
            </p>
            <p><a href="https://www.turboconsolelog.io/join">👉 Join the newsletter 💌</a></p>
          </div>


          <!-- Further sections like features, newsletter, donations, articles, etc. can be structured below following this exact pattern -->


          <hr style="margin-top: 3rem; border-color: #333;" />
          <p style="color: #888;">You can always visit <a href="https://www.turboconsolelog.io" target="_blank" style="color: #88cfff;">https://www.turboconsolelog.io</a> for docs, updates, and the full experience.</p>
          <p style="color: #888;">Copyright &copy; 2025 Turbo Console Log - All Rights Reserved.</p>
        </div>
      </body>
    </html>
  `;
}
