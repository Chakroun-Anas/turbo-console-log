export function getHtmlWebView(): string {
  return `
  <body style="font-family: sans-serif; padding: 2rem; color: #eaeaea; background-color: #1e1e1e;">
    <div style="max-width: 1020px; margin: 0 auto;">
      <!-- Introduction -->

      <h1 style="color: #ffcb6b;">Turbo Console Log v2.16.0 — The Stage Is Set For Something Big ⚡️</h1>
      <p>In this release, we’ve introduced a small but important change: <strong>new users and existing users now get their own tailored webview upon a fresh install or an update</strong>. This sets the stage for future improvements — and today, it helps us better serve every developer contextually.</p>
      <p>We’ve also cleaned house under the hood — <strong>all known audit vulnerabilities have been resolved</strong>, and Turbo Console Log now ships with <strong>zero security issues</strong>. Stability and trust are non-negotiable, and we’re proud to deliver both.</p>
      <p>Meanwhile, behind the scenes, we’ve gone all in on something much bigger...</p>

      <!-- Pro Version section -->

      <h2 style="margin-top: 2rem; color: #ffcb6b;">🧠 PRO Is Coming In The Next Release</h2>
      <p><strong>Turbo Console Log PRO</strong> is launching next — a forever-license upgrade designed for power users who want more visual control:</p>
      <ul>
        <li>A smart panel that lists turbo logs in the current opened folder or workspace 📋</li>
        <li>Visual buttons to execute turbo commands on a file or a folder files recursively ⚡️</li>
        <li>More functionalities & Support to come forever ♾️</li>
      </ul>
      <p>This update lays the foundation — and next release, we go live. PRO will sit on top of the free version, which remains powerful and open for everyone.</p>

      <!-- Newsletter section -->

      <h2 style="margin-top: 2rem; color: #82aaff;">📬 Stay In The Loop</h2>
      <p>If you want to be the first to know when PRO drops, or just get occasional updates and previews — sign up below:</p>
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

      <h2 style="margin-top: 2rem; color: #82aaff;">❤️ Support The Mission</h2>
      <p>Turbo Console Log is free and open source, the community donations are what keeping it alive and thriving while staying free for everyone, please consider supporting as it makes a real difference.</p>
       <figure style="max-width: 50%; display: flex; flex-direction: column; align-items: center;">
          <img 
            src="https://www.turboconsolelog.io/assets/turbo-sponsorship-options.png" 
            alt="Turbo Console Log Website - Sponsorship Page Options"
            style="max-width: 100%; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.3);"
          />
          <figcaption style="margin-top: 8px;">Turbo Console Log Website - Sponsorship Page Options</figcaption>
      </figure>
      <a href="https://www.turboconsolelog.io/sponsorship?showSponsor=true" target="_blank" style="display: inline-block; padding: 0.6rem 1rem; background-color: #ff5c57; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Fuel The Turbo 🚀</a>

       <h2 style="margin-top: 2rem; color: #82aaff;">📚 Read more</h2>
        <ul class="list">
          <li><a href="https://www.turboconsolelog.io/articles/release-2160">Full Release Notes</a></li>
          <li><a href="https://www.turboconsolelog.io/articles/debugging-science-art">Debugging Between Science & Art 📘</a></li>
        </ul>

      <!-- Footer section -->
      
      <hr style="margin-top: 3rem; border-color: #333;" />
      <p style="color: #888;">You can always visit <a href="https://turboconsolelog.io" target="_blank" style="color: #88cfff;">turboconsolelog.io</a> for docs, updates, and the full experience.</p>
      <p style="color: #888;">
        Copyright &copy; 2025 Turbo Console Log - All Rights Reserved.
      </p>
    </div>
  </body>
  `;
}
