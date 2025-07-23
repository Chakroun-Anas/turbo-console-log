export function getHtmlWebView(): string {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; background: #1E1E1E; color: #FFFFFF; }
          h1, h2, h3 { font-weight: bold; }
          a { color: #48BFE3; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .primary-color { color: #FF6B6B; font-size: 32px; }
          .secondary-color { color: #FFC947; font-size: 20px; }
          .info-color { color: #48BFE3; font-weight: bold; }
          .success-color { color: #9CE3F0; font-weight: bold; }
          .warning-color { color: #FFD973; font-weight: bold; }
          .container { max-width: 900px; margin: 0 auto; line-height: 1.6; text-align: center; }
          .section-container { padding: 20px; background: rgba(255,255,255,0.08); border-radius: 12px; text-align: left; margin-bottom: 24px; border: 1px solid rgba(72, 191, 227, 0.2); }
          .text { max-width: 100ch; text-align: justify; font-size: 14px; }
          .list { margin-left: 20px; text-align: left; padding-left: 10px; }
          .list li { margin-bottom: 8px; display: flex; align-items: center; }
          .list li::before { content: "\u2705"; margin-right: 10px; }
          .image-container { margin: 20px auto; display: flex; flex-direction: column; align-items: center; }
          img { max-width: 100%; border-radius: 8px; cursor: pointer; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 20px 0; }
          .stat-card { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid rgba(72, 191, 227, 0.3); }
          .stat-number { font-size: 28px; font-weight: bold; color: #9CE3F0; }
          .stat-label { font-size: 12px; color: #CCCCCC; margin-top: 4px; }
          .improvement { color: #9CE3F0; font-weight: bold; }
          .comparison-table { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin: 16px 0; }
          .comparison-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
          .comparison-row:last-child { border-bottom: none; }
          .old-value { color: #FF6B6B; }
          .new-value { color: #9CE3F0; font-weight: bold; }
          .pro-section { background: linear-gradient(135deg, rgba(255,107,107,0.1), rgba(255,201,71,0.1)); border: 2px solid #FF6B6B; border-radius: 12px; padding: 24px; margin: 24px 0; }
          .pro-button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #FF6B6B, #FFC947); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: transform 0.2s; }
          .pro-button:hover { transform: translateY(-2px); color: white; text-decoration: none; }
          .newsletter-section { background: rgba(72, 191, 227, 0.1); border: 2px solid #48BFE3; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
          .newsletter-input { padding: 10px; border: 1px solid #48BFE3; border-radius: 6px; background: rgba(255,255,255,0.1); color: #FFFFFF; margin: 8px; width: 250px; }
          .newsletter-button { padding: 10px 20px; background: #48BFE3; color: #FFFFFF; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin: 8px; }
          .newsletter-button:hover { background: #9CE3F0; color: #1E1E1E; text-decoration: none; }
          .articles-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 20px 0; }
          .article-card { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; border: 1px solid rgba(72, 191, 227, 0.3); }
          .article-title { color: #FFC947; font-weight: bold; margin-bottom: 8px; }
          .article-desc { font-size: 14px; color: #CCCCCC; margin-bottom: 12px; }
          .article-link { color: #48BFE3; text-decoration: none; font-weight: bold; }
          .article-link:hover { text-decoration: underline; }
          .footer { text-align: center; margin-top: 40px; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); color: #CCCCCC; font-size: 12px; }
          .badge { display: inline-block; padding: 4px 8px; background: #48BFE3; color: #1E1E1E; border-radius: 4px; font-size: 12px; font-weight: bold; margin-left: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="primary-color">
            Turbo Console Log v3.3.0: The Full AST Engine Era
            <span style="display: inline-block; position: relative; top: 4px;">
                <img src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-console-log-icon.a3aba0a3.png&w=64&q=75" style="height: 32px; width: 32px;" alt="Turbo Console Log Logo" />
            </span>
          </h1>
          
          <p class="secondary-color" style="margin-bottom: 8px;">New Detection & Insertion Engine</p>
          <span class="badge">MUCH MORE RELIABLE</span>
          <span class="badge">+85% COVERAGE</span>
          <span class="badge">FULL AST ENGINE</span>

          <div class="image-container">
            <a href="https://www.turboconsolelog.io/articles/release-330" target="_blank" tabindex="-1">
              <img 
                src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-full-ast-engine.6f0df9f8.png&w=640&q=75" 
                alt="Turbo v3.3.0 Full AST Engine" 
                style="height: 400px; width: auto; margin-bottom: 16px; box-shadow: 0 8px 32px rgba(72, 191, 227, 0.3);" 
              />
            </a>
            <a href="https://www.turboconsolelog.io/articles/release-330" target="_blank" style="display: inline-block; padding: 0.8rem 1.5rem; background: linear-gradient(135deg, #FF6B6B, #FFC947); color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              📖 Read Full Release Article
            </a>
          </div>

          <div class="section-container">
            <h2 class="info-color">🎯 Revolutionary Transformation Complete</h2>
            <p class="text">
              After meticulous development in this latest sprint, we've completely rebuilt Turbo Console Log from the ground up with a <strong class="success-color">Full AST Engine</strong>. This isn’t just an improvement — it’s a complete rebuild that redefines how Turbo Console Log works.
            </p>
            <p class="text">
              We've replaced fragile regex patterns with <strong class="info-color">robust TypeScript Compiler API integration</strong>, bringing enterprise-grade code analysis to your debugging workflow. The result? Unprecedented accuracy, reliability, and support for modern JavaScript/TypeScript patterns.
            </p>
          </div>

          <div class="section-container">
            <h2 class="warning-color">📊 By The Numbers: The Transformation</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">+86%</div>
                <div class="stat-label">Average Coverage</div>
                <div style="font-size: 12px; color: #9CE3F0;">vs 45.33% (old) • +47.4%</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">+4,400</div>
                <div class="stat-label">Lines of Code</div>
                <div style="font-size: 12px; color: #9CE3F0;">vs 1,688 (old system) • 2.6X</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">+750</div>
                <div class="stat-label">Test Cases</div>
                <div style="font-size: 12px; color: #9CE3F0;">Unit & integration testing</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">16</div>
                <div class="stat-label">Code Patterns</div>
                <div style="font-size: 12px; color: #9CE3F0;">Specialized AST checkers</div>
              </div>
            </div>

            <div class="comparison-table">
              <h3 style="margin-top: 0; color: #FFC947;">Coverage Comparison: Old vs New</h3>
              <div class="comparison-row">
                <span>Statement Coverage:</span>
                <span><span class="old-value">53.92%</span> → <span class="new-value">89.21%</span></span>
              </div>
              <div class="comparison-row">
                <span>Branch Coverage:</span>
                <span><span class="old-value">31.4%</span> → <span class="new-value">80.63%</span></span>
              </div>
              <div class="comparison-row">
                <span>Function Coverage:</span>
                <span><span class="old-value">42.06%</span> → <span class="new-value">85.24%</span></span>
              </div>
              <div class="comparison-row">
                <span>Line Coverage:</span>
                <span><span class="old-value">53.95%</span> → <span class="new-value">90.49%</span></span>
              </div>
            </div>
          </div>

          <div class="section-container">
            <h2 class="success-color">🔥 What This Means for You</h2>
            <ul class="list">
              <li><span style="display: inline-block; margin-right: 4px;"><strong>Bulletproof Accuracy:</strong></span> AST understands code structure semantically, not just pattern matching</li>
              <li><span style="display: inline-block; margin-right: 4px;"><strong>Modern JavaScript Support:</strong></span> Native handling of destructuring, async/await, optional chaining</li>
              <li><span style="display: inline-block; margin-right: 4px;"><strong>Complex Expression Support:</strong></span> Perfect handling of ternary operators, binary expressions, template literals</li>
              <li><span style="display: inline-block; margin-right: 4px;"><strong>Edge Case Mastery:</strong></span> Robust support for multi-line assignments, chained method calls, nested objects</li>
              <li><span style="display: inline-block; margin-right: 4px;"><strong>TypeScript Integration:</strong></span> Seamless support for TypeScript-specific syntax and patterns</li>
              <li><span style="display: inline-block; margin-right: 4px;"><strong>Future-Proof Architecture:</strong></span> Easy to extend for new JavaScript language features</li>
            </ul>
          </div>

          <div class="section-container">
            <h2 class="warning-color">🐛 Bug Fixes & Improvements</h2>
            <p class="text">
              Along with the revolutionary AST engine, we've also addressed key issues to make your debugging experience even smoother:
            </p>
            
            <div style="margin: 16px 0;">
              <h3 style="color: #9CE3F0; margin-bottom: 8px;">Core Engine Fixes:</h3>
              <ul class="list">
                <li><span style="display: inline-block; margin-right: 4px;"><strong>Configuration Control:</strong></span> insertEnclosingClass and insertEnclosingFunction can now be deactivated when not needed</li>
              </ul>
            </div>

            <div style="margin: 16px 0;">
              <h3 style="color: #FFC947; margin-bottom: 8px;">Turbo Pro Enhancements:</h3>
              <ul class="list">
                <li><span style="display: inline-block; margin-right: 4px;"><strong>Tree Synchronization:</strong></span> Fixed sync issues when deleting logs from the tree view</li>
                <li><span style="display: inline-block; margin-right: 4px;"><strong>Better UX:</strong></span> Status bar activation message now has a neutral background instead of warning style</li>
                <li><span style="display: inline-block; margin-right: 4px;"><strong>Improved Accuracy:</strong></span> Significantly reduced false positives in the tree view detection</li>
              </ul>
            </div>
          </div>

          <div class="pro-section">
            <h2 style="color: #FF6B6B; margin-top: 0;">🚀 Supercharge Your New AST Engine with Turbo Pro!</h2>
            <p class="text">
              <strong class="warning-color">🎉 LAUNCH SPECIAL:</strong> This is the perfect time to grab your <strong class="success-color">lifetime Turbo Pro license</strong>! You're already using the most advanced logging debugging extension — why not get the complete professional experience once for a lifetime?
            </p>
            
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="color: #FFC947; margin-top: 0;">Pro Features Include:</h3>
              <ul class="list">
                <li style="margin-bottom: 6px;"><strong>Native dedicated VSCode panel for the extension</strong></li>
                <li style="margin-bottom: 6px;"><strong>Current folder/workspace logs listing via VSCode Tree View API</strong></li>
                <li style="margin-bottom: 6px;"><strong>Real time synchronisation of the current folder/workspace logs in the tree</strong></li>
                <li style="margin-bottom: 6px;"><strong>Contextual menu to execute turbo command actions on the file level</strong></li>
                <li style="margin-bottom: 6px;"><strong>Auto correct turbo log messages line numbers and file names when the tree is synchronised</strong></li>
                <li style="margin-bottom: 6px;"><strong>Blazing fast and 100% native to VSCode</strong></li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 20px;">
              <a href="https://www.turboconsolelog.io/pro" class="pro-button">
                🔥 Get Turbo Pro - Lifetime License
              </a>
              <p style="font-size: 12px; color: #CCCCCC; margin-top: 8px;">
                Powered by the most advanced AST engine • One-time payment • Lifetime updates
              </p>
            </div>
          </div>

          <div class="section-container">
            <h2 class="info-color">📚 Read More: Deep Dive Articles</h2>
            <div class="articles-grid">
              <div class="article-card">
                <div class="article-title">🚀 Turbo Console Log v3.3.0 Release</div>
                <div class="article-desc">Complete overview of the revolutionary AST engine transformation and all the new features that make debugging more powerful than ever.</div>
                <a href="https://www.turboconsolelog.io/articles/release-330" target="_blank" class="article-link">Read Release Notes →</a>
              </div>
              <div class="article-card">
                <div class="article-title">🔍 Understanding the Full AST Engine</div>
                <div class="article-desc">Technical deep dive into how the new Abstract Syntax Tree engine works and why it's a game-changer for code analysis.</div>
                <a href="https://www.turboconsolelog.io/articles/turbo-full-ast-engine" target="_blank" class="article-link">Learn More →</a>
              </div>
              <div class="article-card">
                <div class="article-title">🧠 Advanced Debugging: Memory Patterns</div>
                <div class="article-desc">Master advanced debugging techniques and learn how to identify memory leaks and performance bottlenecks effectively.</div>
                <a href="https://www.turboconsolelog.io/articles/debugging-memory" target="_blank" class="article-link">Explore Techniques →</a>
              </div>
              <div class="article-card">
                <div class="article-title">💡 Pro Tip: Side Panel Mastery</div>
                <div class="article-desc">Get the most out of Turbo Pro's native VSCode side panel and transform your debugging workflow with these expert tips.</div>
                <a href="https://www.turboconsolelog.io/articles/turbo-pro-side-panel-tip" target="_blank" class="article-link">Master the Panel →</a>
              </div>
            </div>
          </div>

          <div class="newsletter-section">
            <h2 style="color: #48BFE3; margin-top: 0;">📬 Stay Updated with Turbo Console Log</h2>
            <p class="text" style="text-align: center; margin-bottom: 20px;">
              Get notified about new releases, debugging tips, and exclusive content. Join thousands of developers who stay ahead of the curve!
            </p>
            <div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap;">
              <a class="newsletter-button" href="https://www.turboconsolelog.io/join" target="_blank">
                Subscribe to Newsletter
              </a>
            </div>
            <p style="font-size: 12px; color: #CCCCCC; margin-top: 12px;">
                We respect your time and privacy — unsubscribe anytime, no spam guaranteed.
            </p>
          </div>

          <div class="footer">
            <p>© 2025 Turbo Console Log. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
