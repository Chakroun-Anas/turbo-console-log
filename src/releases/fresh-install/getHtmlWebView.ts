export function getHtmlWebView(): string {
  return `
  <body style="font-family: sans-serif; padding: 2rem; color: #eaeaea; background-color: #1e1e1e;">
    <div style="max-width: 1020px; margin: 0 auto;">

      <!-- Introduction -->
      <h1 style="color: #ffcb6b;">Debug Faster, Focus On What Matters! 🚀</h1>
      <p>We’re thrilled to have you! Turbo Console Log helps you debug smarter and faster by auto-generating meaningful log messages based on your code context.</p>
      <div style="margin-bottom: 2rem;">
        <a href="https://turboconsolelog.io" target="_blank" style="display: flex; justify-content: center;">
          <figure style="max-width: 50%; display: flex; flex-direction: column; align-items: center;">
            <img 
              src="https://www.turboconsolelog.io/assets/tcl-website-dark-mode.png" 
              alt="Turbo Console Log Website - Dark Mode"
              style="max-width: 100%; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.3);"
            />
            <figcaption>Turbo Console Log Website</figcaption>
          </figure>
        </a>
      </div>

      <!-- Main Features -->

      <div>
        <h2 style="margin-top: 2rem; color: #82aaff;">Features at a Glance ✨</h2>
        <ul>
          <li>Insert Meaningful Log Messages - Quickly generate console logs with helpful context.</li>
          <li>Comment, Uncomment, Correct or Delete Log Messages - Manage logs with simple shortcuts.</li>
          <li>Customizable Log Messages Format - Personalize how logs appear in your code.</li>
          <li>Multi-Cursor Support - Debug multiple variables simultaneously.</li>
        </ul>
        <a href="https://www.turboconsolelog.io/documentation/features/insert-log-message">Read more</a>
      </div>

      <!-- Settings section -->

      <div>
        <h2 style="margin-top: 2rem; color: #82aaff;">Configuration & Customization ⚙️</h2>
        Want to customize your logs? Turbo Console Log allows you to adjust:
        <ul>
          <li>Prefixes & Suffixes</li>
          <li>Log Function (console.log, console.warn, console.error, etc.)</li>
          <li>Quote Type ('," or \`)</li>
          <li>Filename & Line Number Inclusion</li>
        </ul>
        <a href="https://www.turboconsolelog.io/documentation/settings/custom-prefix">Explore full settings</a>
      </div>

      <!-- PRO version section -->

      <h2 style="margin-top: 2rem; color: #ffcb6b;">🔥 Turbo PRO Is Here — The New Era Begins</h2>
      <p><strong>Turbo Console Log PRO</strong> has officially launched! With a dedicated tree panel, grouped logs per file, real-time updates, and log management — this is debugging memory, flow, and clarity all in one.</p>
      <ul>
        <li><strong>🌲 Tree Panel View:</strong> Instantly see all logs grouped by file and line</li>
        <li><strong>⚡ Real-Time Sync:</strong> Logs update live as you debug</li>
        <li><strong>🚦 Contextual Actions:</strong> Right-click to correct, comment, or delete logs</li>
        <li><strong>💾 Memory-Friendly:</strong> Reopen VSCode and find your logs exactly where you left them</li>
      </ul>
      <a href="https://www.turboconsolelog.io/articles/release-300" target="_blank" style="margin-bottom: 5px; display: inline-block;">Read full PRO launch article</a><br/>
      <a href="https://www.turboconsolelog.io/articles/debugging-memory" target="_blank">Read: Debugging with Memory — Why Turbo PRO Panel Matters</a><br/><br/>
      <a href="https://www.turboconsolelog.io/pro" target="_blank" style="display: inline-block; padding: 0.6rem 1rem; background-color: #ff5c57; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">🚀 Unlock Turbo PRO Now</a>

      <!-- Newsletter section -->

      <h2 style="margin-top: 2rem; color: #82aaff;">💡 Stay in the Loop</h2>
      <p>If you want to receive exclusive updates, new features, or future PRO perks — subscribe to the newsletter.</p>
      <figure style="max-width: 50%; display: flex; flex-direction: column; align-items: center;">
          <img 
            src="https://www.turboconsolelog.io/assets/turbo-join-newsletter.png" 
            alt="Turbo Console Log Website - Join Newsletter"
            style="max-width: 100%; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.3);"
          />
          <figcaption style="margin-top: 8px;">Turbo Console Log Website - Join Newsletter Page Preview</figcaption>
      </figure>
      <a href="https://www.turboconsolelog.io/join" target="_blank" style="display: inline-block; padding: 0.6rem 1rem; background-color: #ff5c57; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Join the Newsletter 📬</a>

      <!-- Donations section -->

      <h2 style="margin-top: 2.5rem; color:  #82aaff;">❤️ Support the Mission</h2>
      <p>Turbo Console Log is free and open source. If it makes your day better, consider supporting — it really matters.</p>
      <figure style="max-width: 50%; display: flex; flex-direction: column; align-items: center;">
          <img 
            src="https://www.turboconsolelog.io/assets/turbo-sponsorship-options.png" 
            alt="Turbo Console Log Website - Sponsorship Page Options"
            style="max-width: 100%; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.3);"
          />
          <figcaption style="margin-top: 8px;">Turbo Console Log Website - Sponsorship Page Options</figcaption>
      </figure>
      <a href="https://www.turboconsolelog.io/sponsorship?showSponsor=true" target="_blank" style="display: inline-block; padding: 0.6rem 1rem; background-color: #ff5c57; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 1rem;">Fuel The Turbo 🚀</a>

      <!-- Footer section -->

      <hr style="margin-top: 3rem; border-color: #333;" />
      <p style="color: #888;">
        Welcome aboard! You can always visit <a href="https://turboconsolelog.io" target="_blank" style="color: #88cfff;">https://www.turboconsolelog.io</a> for docs, updates, and all the latest.  
      </p>
      <p style="color: #888;">
       Copyright &copy; 2025 Turbo Console Log - All Rights Reserved.
      </p>
    </div>
  </body>
  `;
}
