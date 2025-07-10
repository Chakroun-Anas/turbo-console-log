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
          .text { max-width: 100ch; text-align: justify; font-size: 14px; }
          .list { margin-left: 20px; text-align: left; padding-left: 10px; }
          .list li { margin-bottom: 8px; display: flex; align-items: center; }
          .list li::before { content: "\u2705"; margin-right: 10px; }
          .image-container { margin: 20px auto; display: flex; flex-direction: column; align-items: center; }
          img { max-width: 100%; border-radius: 8px; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="primary-color">
            We Went The Extra Mile For You             
            <img src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-console-log-icon.a3aba0a3.png&w=64&q=75" style="height: 24px; width: 24px;" alt="Turbo Console Log Logo" />
          </h1>

       <div class="image-container">
        <a href="https://www.turboconsolelog.io/articles/release-320" target="_blank" tabindex="-1" class="release-illustration-article-link">
          <img 
            src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-rocket-bugfixes-ast.63e71f3f.png&w=640&q=75" 
            alt="Turbo v3.2.0 Illustration" 
            style="height: 460px; width: 308px; margin-bottom: 16px;" 
          />
        </a>
        <a href="https://www.turboconsolelog.io/articles/release-320" target="_blank" style="display: inline-block; padding: 0.6rem 1rem; background-color: #ff5c57; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
          View Full Article Release 🚀
        </a>
      </div>

          <p class="text">
Turbo Console Log analyzes your code using dedicated checkers and line deduction helpers. It detects patterns like <span class="info-color">Ternary Expressions</span>, <span class="info-color">Function Parameters</span>, and more — then routes them to the right logic for accurate log placement.</p>
<p class="text">
            That's why we're introducing an <strong>AST-based approach</strong> in v3.2.0. AST parsing is heavier than regex, but it’s far more accurate, reading the full scope of variables rather than isolated code snippets. We're gently introducing AST to handle ternary expressions and function parameters, marking the start of a comprehensive transition.
          </p>

          <p class="text">
AST won’t magically solve every scenario overnight, but it removes a lot of the guesswork — making fixes clearer, more reliable, and easier to maintain. Regex still plays an important role, but AST brings a new level of precision to the table.          </p>

        <div class="section-container">
          <h2 class="secondary-color">🚀 What’s New in v3.2.0</h2>
          <ul class="list">
            <li><strong style="display: inline-block; margin-right: 4px;">AST Support: </strong> AST parsing added for ternary expressions and function parameters.</li>
            <li><strong style="display: inline-block; margin-right: 4px;">Smarter Log Placement (Ternary & Params):</strong> Improved accuracy by analyzing full variable scope in these cases.</li>
            <li><strong style="display: inline-block; margin-right: 4px;">Bug Fix: </strong> Object literal assignments with complex type annotations are now handled correctly.</li>
            <li><strong style="display: inline-block; margin-right: 4px;">Bug Fix: </strong> Default setting values are respected, reducing false positives in log message detection.</li>
            <li><strong style="display: inline-block; margin-right: 4px;">Improved Coverage :</strong> Additional test cases for AST-driven logic and tricky edge cases.</li>
          </ul>
        </div>

        <div class="section-container">
          <h2 class="secondary-color">🔥 Upgrade to Turbo PRO v2</h2>
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
          <p class="text">
            Turbo PRO v2 has been getting love from developers working on large, complex codebases.
            Activations are smooth, performance is stable, and updates are ongoing.
          </p>
          <p class="text">
            Want more control, better visuals, and features that go beyond the basics? 
            Unlock the full Turbo debugging experience!
          </p>
        </div>

          <div class="section-container">
          <h2 class="secondary-color">📚 Dive Deeper</h2>
          <ul class="list">
            <li><a href="https://www.turboconsolelog.io/articles/release-320">Full v3.2.0 release notes</a></li>
            <li><a href="https://www.turboconsolelog.io/articles/benchmark-pro-v2">Benchmark Pro v2 ⚡️</a></li>
            <li><a href="https://www.turboconsolelog.io/articles/pro-v2-technical-overview">How Turbo Pro Works – Technical Deep Dive 🧬</a></li>
            <li><a href="https://www.turboconsolelog.io/articles/turbo-pro-side-panel-tip">Recommended PRO UX: Keep Logs Visible with Dual Sidebars 🪟</a></li>
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
