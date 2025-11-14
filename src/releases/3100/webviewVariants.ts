import { WebviewVariantConfig } from '@/entities/WebviewVariant';

/**
 * Fallback webview variants for v3.10.0
 * Used when Thompson Sampling API fails
 * Matches variants defined in WebviewInteractor on the website
 */
export const WEBVIEW_FALLBACK_VARIANTS: Record<string, WebviewVariantConfig> = {
  A: {
    title: '🐘 PHP Joins the Turbo Family!',
    htmlContent: `
    <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
            padding: 40px 20px; 
            background: #1E1E1E; 
            color: #FFFFFF;
            margin: 0;
          }
          .container { 
            max-width: 700px; 
            margin: 0 auto; 
            text-align: center;
          }
          h1 { 
            font-size: 28px;
            font-weight: 600;
            color: #FF6B6B;
            margin: 0 0 15px 0;
            line-height: 1.3;
          }
          .php-color {
            color: #FFC947;
            font-weight: bold;
          }
          .info-color {
            color: #48BFE3;
            font-weight: bold;
          }
          img { 
            max-width: 400px;
            width: 100%;
            height: auto;
            border-radius: 12px;
            margin-top: 8px;
            margin-bottom: 16px;
            box-shadow: 0 8px 32px rgba(136, 146, 191, 0.3);
          }
          .text {
            font-size: 14px;
            line-height: 1.6;
            color: #CCCCCC;
            margin: 0 0 8px 0;
            text-align: justify;
          }
          .cta-button { 
            display: inline-block; 
            padding: 14px 32px;
            background: linear-gradient(135deg, #FF6B6B, #FFC947);
            color: #FFFFFF;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 10px;
          }
          .cta-button:hover { 
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
          }
        </style>
        <script>
          const vscode = acquireVsCodeApi();
          function openProPage() {
            vscode.postMessage({
              command: 'openExternal',
              url: 'https://www.turboconsolelog.io/pro?utm_source=extension&utm_medium=webview&utm_campaign=v3100_release&variant=fallback&webviewVersion=3.10.0&webviewVariant=A'
            });
          }
        </script>
      </head>
      <body>
        <div class="container">
          <h1>🐘 PHP Joins the Turbo Family!</h1>
          
          <img 
            src="https://www.turboconsolelog.io/assets/turbo-pro-php-illustration.png" 
            alt="Turbo Pro PHP Support"
          />
          
          <p class="text">
            The moment many of you have been waiting for is finally here! <strong class="php-color">Turbo Console Log now supports PHP</strong>, bringing the same powerful debugging experience you love in JavaScript and TypeScript to your PHP projects.
          </p>
          <p class="text">
            PHP support comes with complete access to all Pro features: the <strong class="info-color">centralized panel</strong> for unified log management, real-time synchronization, contextual actions, and one-click navigation across your entire codebase. Everything that makes Turbo Pro powerful for JavaScript and TypeScript now works seamlessly with PHP.
          </p>
          <p class="text">
            We're just getting started! More languages are coming to the Pro bundle, turning Turbo Console Log into your go-to debugging companion for any project, any stack, any language.
          </p>
          
          <button onclick="openProPage()" class="cta-button" style="border: none; cursor: pointer;">
            Check Turbo Pro →
          </button>
        </div>
      </body>
    </html>
  `,
  },
  B: {
    title: '⏱️ PHP Support: Save Hours Every Week',
    htmlContent: `
    <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
            padding: 40px 20px; 
            background: #1E1E1E; 
            color: #FFFFFF;
            margin: 0;
          }
          .container { 
            max-width: 700px; 
            margin: 0 auto; 
            text-align: center;
          }
          h1 { 
            font-size: 28px;
            font-weight: 600;
            color: #4ECDC4;
            margin: 0 0 15px 0;
            line-height: 1.3;
          }
          .time-color {
            color: #FFC947;
            font-weight: bold;
          }
          .feature-color {
            color: #FF6B6B;
            font-weight: bold;
          }
          img { 
            max-width: 400px;
            width: 100%;
            height: auto;
            border-radius: 12px;
            margin-top: 8px;
            margin-bottom: 16px;
            box-shadow: 0 8px 32px rgba(78, 205, 196, 0.3);
          }
          .text {
            font-size: 14px;
            line-height: 1.6;
            color: #CCCCCC;
            margin: 0 0 8px 0;
            text-align: justify;
          }
          .cta-button { 
            display: inline-block; 
            padding: 14px 32px;
            background: linear-gradient(135deg, #4ECDC4, #48BFE3);
            color: #FFFFFF;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 10px;
          }
          .cta-button:hover { 
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(78, 205, 196, 0.4);
          }
        </style>
        <script>
          const vscode = acquireVsCodeApi();
          function openProPage() {
            vscode.postMessage({
              command: 'openExternal',
              url: 'https://www.turboconsolelog.io/pro?utm_source=extension&utm_medium=webview&utm_campaign=v3100_release&variant=fallback&webviewVersion=3.10.0&webviewVariant=B'
            });
          }
        </script>
      </head>
      <body>
        <div class="container">
          <h1>⏱️ PHP Support: Save Hours Every Week</h1>
          
          <img 
            src="https://www.turboconsolelog.io/assets/turbo-pro-php-illustration.png" 
            alt="Turbo Pro Centralized Panel"
          />
          
          <p class="text">
            You know that feeling when you're hunting for logs across multiple files? When you lose your train of thought switching contexts? Turbo Pro's <strong class="feature-color">centralized panel</strong> eliminates that friction entirely.
          </p>
          <p class="text">
            Imagine managing all your console logs from one place. <strong class="time-color">No more context switching</strong>. No more scrolling endlessly. Just click, navigate, and you're exactly where you need to be. Whether it's JavaScript, TypeScript, or PHP, your workflow stays smooth.
          </p>
          <p class="text">
            Developers using Turbo Pro report saving hours every week. Not because of magic, but because good tools compound. Small time savings, dozens of times per day, add up to getting home earlier.
          </p>
          
          <button onclick="openProPage()" class="cta-button" style="border: none; cursor: pointer;">
            Try Turbo Pro →
          </button>
        </div>
      </body>
    </html>
  `,
  },
  C: {
    title: '🚀 PHP Support: Level Up Your Debugging!',
    htmlContent: `
    <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
            padding: 40px 20px; 
            background: #1E1E1E; 
            color: #FFFFFF;
            margin: 0;
          }
          .container { 
            max-width: 700px; 
            margin: 0 auto; 
            text-align: center;
          }
          h1 { 
            font-size: 28px;
            font-weight: 600;
            color: #B794F6;
            margin: 0 0 15px 0;
            line-height: 1.3;
          }
          .power-color {
            color: #FFC947;
            font-weight: bold;
          }
          .energy-color {
            color: #FF6B6B;
            font-weight: bold;
          }
          img { 
            max-width: 400px;
            width: 100%;
            height: auto;
            border-radius: 12px;
            margin-top: 8px;
            margin-bottom: 16px;
            box-shadow: 0 8px 32px rgba(183, 148, 246, 0.3);
          }
          .text {
            font-size: 14px;
            line-height: 1.6;
            color: #CCCCCC;
            margin: 0 0 8px 0;
            text-align: justify;
          }
          .cta-button { 
            display: inline-block; 
            padding: 14px 32px;
            background: linear-gradient(135deg, #B794F6, #9D7CF6);
            color: #FFFFFF;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 10px;
          }
          .cta-button:hover { 
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(183, 148, 246, 0.4);
          }
        </style>
        <script>
          const vscode = acquireVsCodeApi();
          function openProPage() {
            vscode.postMessage({
              command: 'openExternal',
              url: 'https://www.turboconsolelog.io/pro?utm_source=extension&utm_medium=webview&utm_campaign=v3100_release&variant=fallback&webviewVersion=3.10.0&webviewVariant=C'
            });
          }
        </script>
      </head>
      <body>
        <div class="container">
          <h1>🚀 PHP Support: Level Up Your Debugging!</h1>
          
          <img 
            src="https://www.turboconsolelog.io/assets/turbo-pro-php-illustration.png" 
            alt="Turbo Pro PHP Power"
          />
          
          <p class="text">
            This is HUGE! <strong class="energy-color">PHP support just landed</strong> and it's everything you've been asking for. Lightning-fast log insertion, smart variable detection, and instant navigation. All the power you love in JavaScript and TypeScript, now supercharged for PHP.
          </p>
          <p class="text">
            But here's where it gets even better: Turbo Pro's <strong class="power-color">centralized panel</strong> brings ALL your logs together. No more hunting. No more chaos. Just pure, concentrated debugging power at your fingertips. One click. Any file. Any language. BOOM, you're there.
          </p>
          <p class="text">
            Ready to transform how you debug? This is your moment. PHP support is live, the panel is waiting, and your most productive debugging sessions are about to begin. Let's GO!
          </p>
          
          <button onclick="openProPage()" class="cta-button" style="border: none; cursor: pointer;">
            Power Up Now →
          </button>
        </div>
      </body>
    </html>
  `,
  },
};
