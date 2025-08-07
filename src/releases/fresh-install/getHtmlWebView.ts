export function getHtmlWebView(): string {
  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            padding: 0; 
            margin: 0;
            background: #1E1E1E; 
            color: #FFFFFF; 
            line-height: 1.6;
          }
          h1, h2, h3 { font-weight: bold; margin: 0; }
          a { color: #48BFE3; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .primary-color { color: #FF6B6B; }
          .secondary-color { color: #FFC947; }
          .info-color { color: #48BFE3; font-weight: bold; }
          .success-color { color: #9CE3F0; font-weight: bold; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          
          /* Hero Section */
          .hero-section {
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, rgba(255,107,107,0.08), rgba(255,201,71,0.08));
            border-radius: 16px;
            margin-bottom: 40px;
            border: 1px solid rgba(255, 201, 71, 0.3);
          }
          .hero-title {
            font-size: clamp(28px, 5vw, 42px);
            color: #FF6B6B;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          .hero-subtitle {
            font-size: clamp(18px, 3.5vw, 22px);
            color: #FFC947;
            margin-bottom: 12px;
            font-weight: 500;
          }
          .hero-description {
            font-size: 17px;
            color: #CCCCCC;
            max-width: 600px;
            margin: 0 auto;
          }

          /* Newsletter Section */
          .newsletter-hero {
            background: linear-gradient(135deg, rgba(72, 191, 227, 0.12), rgba(255, 107, 107, 0.12));
            border: 2px solid #48BFE3;
            border-radius: 16px;
            padding: 32px 24px;
            margin: 32px 0;
            text-align: center;
          }
          .newsletter-hero h2 {
            color: #48BFE3;
            font-size: 26px;
            margin-bottom: 16px;
          }
          .newsletter-hero p {
            font-size: 15px;
            color: #FFFFFF;
            margin-bottom: 20px;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
          }
          .newsletter-illustration {
            margin: 0 auto 20px auto;
            max-width: 360px;
          }
          .newsletter-illustration img {
            width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(72, 191, 227, 0.25);
          }
          .newsletter-cta {
            display: inline-block;
            padding: 14px 28px;
            background: linear-gradient(135deg, #48BFE3, #9CE3F0);
            color: #1E1E1E;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 17px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(72, 191, 227, 0.3);
          }
          .newsletter-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(72, 191, 227, 0.4);
          }
          .micro-reassure {
            margin-top: 8px;
            font-size: 12px;
            color: #B8E8F6;
          }
          .bonus-highlight {
            background: rgba(255, 201, 71, 0.2);
            border: 1px solid #FFC947;
            border-radius: 8px;
            padding: 10px;
            margin-top: 14px;
            font-size: 13px;
            color: #FFC947;
          }

          /* Features Section */
          .features-simple {
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            border: 1px solid rgba(72, 191, 227, 0.2);
          }
          .features-simple h3 {
            color: #FFC947;
            font-size: 20px;
            margin-bottom: 16px;
            text-align: center;
          }
          .feature-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .feature-list li {
            padding: 6px 0;
            color: #CCCCCC;
            display: flex;
            align-items: baseline;
            font-size: 15px;
          }
          .feature-list li::before {
            content: "⚡";
            margin-right: 10px;
            font-size: 16px;
          }
          /* label spacing for bullets */
          .bullet-label {
            display: inline-block;
            margin-right: 6px;
            color: #FFFFFF;
          }

          .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
            font-size: 12px;
            color: #CCCCCC;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Hero -->
          <section class="hero-section" aria-labelledby="tcl-hero-title">
            <h1 id="tcl-hero-title" class="hero-title">
              Welcome to Turbo Console Log!
              <img src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-console-log-icon.a3aba0a3.png&w=64&q=75" 
                   style="height: 36px; width: 36px;" 
                   alt="Turbo Console Log Logo" />
            </h1>
            <p class="hero-subtitle">You just joined 1.9M+ developers who debug smarter</p>
            <p class="hero-description">
              Let's get you started and make sure you get the most out of Turbo — while helping us build what comes next.
            </p>
          </section>

          <!-- Newsletter -->
          <section class="newsletter-hero" aria-labelledby="tcl-newsletter-title">
            <h2 id="tcl-newsletter-title">📬 Be Part of Turbo’s Future</h2>
            <p>
              Join our inner circle to get early updates, exclusive debugging tips, and a say in what we build next.  
              Your first insider survey is coming this week — plus an instant Turbo Pro discount.
            </p>

            <div class="newsletter-illustration">
              <img src="https://www.turboconsolelog.io/assets/turbo-pro-tree.png" alt="Turbo Pro Tree preview inside VS Code" width="720" height="480" />
            </div>

            <a
              href="https://www.turboconsolelog.io/join?utm_source=webview_freshinstall&utm_medium=app&utm_campaign=onboarding_innercircle_v1&utm_content=hero_btn"
              class="newsletter-cta"
              target="_blank"
              rel="noopener"
              aria-label="Join the Turbo Community and get your Pro discount"
            >
              🎯 Join & Get Your Pro Discount
            </a>
            <div class="micro-reassure">No spam. Unsubscribe anytime.</div>

            <div class="bonus-highlight">
              🎁 Instant bonus: Turbo Pro discount code + exclusive strategies.
            </div>
          </section>

          <!-- Features -->
          <section class="features-simple" aria-labelledby="tcl-features-title">
            <h3 id="tcl-features-title">⚡ What Makes Turbo Special</h3>
            <ul class="feature-list">
              <li>
                <strong class="bullet-label">Smart AST Engine:</strong>
                understands your code semantically for perfect log placement
              </li>
              <li>
                <strong class="bullet-label">7 Console Types:</strong>
                log, info, debug, warn, error, table, custom — all with shortcuts
              </li>
              <li>
                <strong class="bullet-label">Multi-Cursor Magic:</strong>
                debug multiple variables simultaneously
              </li>
              <li>
                <strong class="bullet-label">TreeView Pro Panel:</strong>
                color-coded tree to view, toggle, and delete logs instantly
              </li>
            </ul>
          </section>

          <!-- Footer -->
          <footer class="footer">
            © 2025 Turbo Console Log • Built with ❤️ by Turbo Unicorn 🦄
          </footer>
        </div>
      </body>
    </html>
  `;
}
