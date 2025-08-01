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
          .image-container { margin: 20px auto; display: flex; flex-direction: column; align-items: center; cursor: pointer; }
          img { max-width: 100%; border-radius: 8px; cursor: pointer; }
          .command-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 20px 0; }
          .command-card { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; border: 1px solid rgba(72, 191, 227, 0.3); }
          .command-title { color: #FFC947; font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; }
          .command-desc { font-size: 14px; color: #CCCCCC; margin-bottom: 8px; }
          .command-shortcut { background: rgba(72, 191, 227, 0.2); color: #48BFE3; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-family: monospace; }
          .console-log { color: #9CE3F0; }
          .console-info { color: #48BFE3; }
          .console-debug { color: #FFD973; }
          .console-warn { color: #FFC947; }
          .console-error { color: #FF6B6B; }
          .console-table { color: #9CE3F0; }
          .console-custom { color: #FF6B6B; }
          .pro-section { background: linear-gradient(135deg, rgba(255,107,107,0.1), rgba(255,201,71,0.1)); border: 2px solid #FF6B6B; border-radius: 12px; padding: 24px; margin: 24px 0; }
          .pro-button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #FF6B6B, #FFC947); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: transform 0.2s; }
          .pro-button:hover { transform: translateY(-2px); color: white; text-decoration: none; }
          .newsletter-section { background: rgba(72, 191, 227, 0.1); border: 2px solid #48BFE3; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
          .newsletter-input { padding: 10px; border: 1px solid #48BFE3; border-radius: 6px; background: rgba(255,255,255,0.1); color: #FFFFFF; margin: 8px; width: 250px; }
          .newsletter-button { padding: 10px 20px; background: #48BFE3; color: #FFFFFF; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin: 8px; }
          .newsletter-button:hover { background: #9CE3F0; color: #1E1E1E; text-decoration: none; }
          .discount-highlight { background: linear-gradient(135deg, #FF6B6B, #FFC947); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: bold; font-size: 18px; }
          .footer { text-align: center; margin-top: 40px; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); color: #CCCCCC; font-size: 12px; }
          .badge { display: inline-block; padding: 4px 8px; background: #48BFE3; color: #1E1E1E; border-radius: 4px; font-size: 12px; font-weight: bold; margin-left: 8px; }
          .feature-highlight { background: rgba(255,201,71,0.1); border-left: 4px solid #FFC947; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
          .dual-image-container { display: flex; flex-direction: row; gap: 20px; align-items: center; justify-content: center; margin: 20px 0; flex-wrap: wrap; }
          .dual-image-container img { flex: 1; min-width: 300px; max-width: 45%; }
          .centered-image { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; }
          .caption {
            font-size: 13px;
            color: #CCCCCC;
            font-style: italic;
            text-align: center;
            max-width: 80%;
            margin-top: 0px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="primary-color">
            v3.4.0: More Complete
            <span style="display: inline-block; position: relative; top: 4px;">
                <img src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-console-log-icon.a3aba0a3.png&w=64&q=75" style="height: 32px; width: 32px;" alt="Turbo Console Log Logo" />
            </span>
          </h1>
          
          <p class="secondary-color" style="margin-bottom: 8px;">7 New Console Commands  & Fancy Pro Panel View 🌳 </p>
          <span class="badge">MORE CONTROLE</span>
          <span class="badge">MORE PRECISION</span>
          <span class="badge">MORE FEATURES</span>

         <div class="image-container">
          <a href="https://www.turboconsolelog.io/articles/release-340" target="_blank" style="text-decoration: none;">
            <img 
              src="https://www.turboconsolelog.io/assets/shortcuts-rain.png" 
              alt="Keyboard Shortcuts Rain" 
              style="height: 400px; width: auto; margin-bottom: 16px; box-shadow: 0 8px 32px rgba(255, 201, 71, 0.3);" 
            />
          </a>
          <div style="text-align: center; margin-top: 8px;">
            <a href="https://www.turboconsolelog.io/articles/release-340" target="_blank" style="display: inline-flex; align-items: center; color: #48BFE3; text-decoration: none; font-weight: bold; font-size: 14px;">
              👉 Read the full release article
            </a>
          </div>
        </div>

          <div class="section-container">
            <h2 class="info-color">🎯 Complete Console Method Coverage</h2>
            <p class="text">
              Finally! We've expanded beyond just <code>console.log</code> to give you <strong class="success-color">dedicated commands for every console method</strong>. Each with its own keyboard shortcut and specialized behavior. No more switching settings. Choose the exact console method you need, when you need it.
            </p>
            <p class="text">
              Along with the new shortcuts, <strong class="warning-color">Turbo Pro gets enhanced log presentation</strong> with <strong class="info-color">color-coded console methods</strong> for instant visual recognition. Each log type now displays in its unique color throughout the tree view, making debugging faster and more intuitive than ever.
            </p>
          </div>

          <div class="section-container">
            <h2 class="warning-color">⌨️ 7 New Console Commands with Dedicated Shortcuts</h2>

         <div class="command-grid">
            <div class="command-card">
              <div class="command-title"><span class="console-log">🟦 Console Log</span></div>
              <div class="command-desc">Standard logging for general debugging</div>
              <div class="command-shortcut">
                <div><strong>Apple:</strong> ⌘K ⌘L</div>
                <div><strong>Windows/Linux:</strong> Ctrl+K Ctrl+L</div>
              </div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 11px; color: #FFC947; text-align: center;">
                  <strong>Legacy:</strong> <code style="background: rgba(255,255,255,0.1); padding: 1px 4px; border-radius: 3px; font-family: monospace;">Ctrl+Alt+L</code>
                </div>
              </div>
            </div>
            <div class="command-card">
              <div class="command-title"><span class="console-info">🟩 Console Info</span></div>
              <div class="command-desc">Informational messages and status updates</div>
              <div class="command-shortcut">
                <div><strong>Apple:</strong> ⌘K ⌘I</div>
                <div><strong>Windows/Linux:</strong> Ctrl+K Ctrl+I</div>
              </div>
            </div>
            <div class="command-card">
              <div class="command-title"><span class="console-debug">🟪 Console Debug</span></div>
              <div class="command-desc">Debug-level messages for development</div>
              <div class="command-shortcut">
                <div><strong>Apple:</strong> ⌘K ⌘D</div>
                <div><strong>Windows/Linux:</strong> Ctrl+K Ctrl+D</div>
              </div>
            </div>
            <div class="command-card">
              <div class="command-title"><span class="console-warn">🟨 Console Warn</span></div>
              <div class="command-desc">Warning messages for potential issues</div>
              <div class="command-shortcut">
                <div><strong>Apple:</strong> ⌘K ⌘W</div>
                <div><strong>Windows/Linux:</strong> Ctrl+K Ctrl+W</div>
              </div>
            </div>
            <div class="command-card">
              <div class="command-title"><span class="console-error">🟥 Console Error</span></div>
              <div class="command-desc">Error messages and exception logging</div>
              <div class="command-shortcut">
                <div><strong>Apple:</strong> ⌘K ⌘E</div>
                <div><strong>Windows/Linux:</strong> Ctrl+K Ctrl+E</div>
              </div>
            </div>
            <div class="command-card">
              <div class="command-title"><span class="console-table">📊 Console Table</span></div>
              <div class="command-desc">Tabular data display for objects/arrays</div>
              <div class="command-shortcut">
                <div><strong>Apple:</strong> ⌘K ⌘T</div>
                <div><strong>Windows/Linux:</strong> Ctrl+K Ctrl+T</div>
              </div>
            </div>
            <div class="command-card">
              <div class="command-title"><span class="console-custom">🔍 Custom Log</span></div>
              <div class="command-desc">Your custom log function from settings</div>
              <div class="command-shortcut">
                <div><strong>Apple:</strong> ⌘K ⌘C</div>
                <div><strong>Windows/Linux:</strong> Ctrl+K Ctrl+C</div>
              </div>
            </div>
          </div>
          <div class="section-container">
            <h2 class="success-color">🚀 Enhanced Features & Improvements</h2>
            <ul class="list">
              <li><span style="display: inline-block; margin-right: 4px;"><strong>Auto-Save Integration:</strong></span> Turbo commands (comment, uncomment, correct, delete) now auto-save documents after execution</li>
              <li><span style="display: inline-block; margin-right: 4px;"><strong>Enhanced AST Detection:</strong></span> Continuing our AST revolution with even fewer false positives and improved accuracy</li>
              <li><span style="display: inline-block; margin-right: 4px;"><strong>Instant Tree Sync:</strong></span> Pro tree now syncs immediately after file changes thanks to auto-save</li>
              <li><span style="display: inline-block; margin-right: 4px;"><strong>Expand All Enhancement:</strong></span> Pro "Expand All" feature now properly expands final log leaves in the tree</li>
              <li><span style="display: inline-block; margin-right: 4px;"><strong>Unified Command Structure:</strong></span> All new commands follow identical patterns for consistency and reliability</li>
            </ul>
          </div>

          <div class="pro-section">
            <h2 style="color: #FF6B6B; margin-top: 0;">✨ Turbo Pro: Enhanced Tree & Color-Coded Logs</h2>
            
            <div style="display: flex; flex-direction: row; gap: 20px; align-items: center; justify-content: center; margin: 20px 0;">
              <div class="centered-image" style="flex: 1;">
                <img 
                  src="https://www.turboconsolelog.io/assets/v3.4.0-example.png" 
                  alt="Turbo v3.4.0 Console Commands Example" 
                  style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 8px 32px rgba(72, 191, 227, 0.3);" 
                />
                 <p class="caption">
                  Selection-based log insertion using new shortcuts
                </p>
              </div>
              <div style="flex: 1;">
                <img 
                  src="https://www.turboconsolelog.io/assets/v3.4.0-turbo-pro-tree.png" 
                  alt="Turbo Pro Console Tree Panel with Color-Coded Logs"
                  style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);" 
                />
                <div style="display: flex; justify-content: center;">
                  <p class="caption" style="text-align: center;">
                    Pro panel with real-time synced, color-coded logs.
                  </p>
                </div>
              </div>
            </div>

            <p class="text">
              Experience the ultimate debugging workflow with <strong class="success-color">color-coded console methods</strong>, <strong class="warning-color">instant synchronization</strong>, and <strong class="info-color">full keyboard shortcut integration</strong> in our native VSCode tree panel.
            </p>

              <div class="image-container">
                <img 
                  src="https://www.turboconsolelog.io/assets/turbo-pro-illustration.png" 
                  alt="Keyboard Shortcuts Rain" 
                  style="height: 400px; width: auto; margin-bottom: 16px; box-shadow: 0 8px 32px rgba(255, 201, 71, 0.3);" 
                />
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="color: #FFC947; margin-top: 0;">🌳 New Pro Features:</h3>
              <ul class="list">
                <li style="margin-bottom: 6px;"><strong style="display: inline-block; margin-right: 4px;">🎨 Color-Coded Methods:</strong> Each console type displays in unique colors</li>
                <li style="margin-bottom: 6px;"><strong style="display: inline-block; margin-right: 4px;">⚡ Instant Auto-Sync:</strong> Tree updates immediately after any Turbo command</li>
                <li style="margin-bottom: 6px;"><strong style="display: inline-block; margin-right: 4px;">🎯 Smart Shortcuts:</strong> All 7 new shortcuts work seamlessly with the tree</li>
                <li style="margin-bottom: 6px;"><strong style="display: inline-block; margin-right: 4px;">🔄 Enhanced Expand All:</strong> Now properly expands final log leaves</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 20px;">
              <a href="https://www.turboconsolelog.io/pro" class="pro-button">
                🚀 Get Turbo Pro - Lifetime License
              </a>
            </div>
          </div>

            <div class="newsletter-section">
              <h2 style="color: #48BFE3; margin-top: 0;">📬 Celebrate Turbo v3.4.0 with 30% Off!</h2>

              <p class="text" style="text-align: center; margin-bottom: 20px;">
                To mark the release of <strong class="info-color">Turbo v3.4.0</strong>, we're offering a
                <span class="discount-highlight">limited-time 30% lifetime discount</span> on Turbo Pro!
                Subscribe now to get your exclusive discount code — and receive future updates, tips, and developer insights straight to your inbox.
              </p>

              <div class="image-container" style="margin: 20px 0;">
                <img 
                  src="https://www.turboconsolelog.io/assets/subscribe-30-off.png" 
                  alt="Subscribe for 30% Off" 
                  style="height: 400px; width: auto; margin-bottom: 16px;" 
                />
              </div>

              <div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap;">
                <a class="newsletter-button" href="https://www.turboconsolelog.io/join" target="_blank">
                  🎯 Subscribe & Get 30% Off Now
                </a>
              </div>

              <p style="font-size: 12px; color: #CCCCCC; margin-top: 12px;">
                No spam • Unsubscribe anytime • Instant discount code delivery
              </p>
            </div>

          <div class="footer">
            <p>© 2025 Turbo Console Log. All rights reserved.</p>
            <p style="margin-top: 8px; color: #48BFE3;">
              Built with ❤️ by Turbo Unicorn 🦄 for the whole JS/TS community 
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
