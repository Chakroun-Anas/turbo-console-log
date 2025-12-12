import { WebviewVariantConfig } from '@/entities/WebviewVariant';

/**
 * Fallback webview variants for v3.12.0
 * Used when Thompson Sampling API fails
 * Matches variants defined in WebviewInteractor on the website
 */
export const WEBVIEW_FALLBACK_VARIANTS: Record<string, WebviewVariantConfig> = {
  A: {
    title: '🚀 Workspace Log Mastery',
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
          .highlight {
            color: #FF8A65;
            font-weight: bold;
          }
          .feature-color {
            color: #9D7CF6;
            font-weight: bold;
          }
          img { 
            max-width: 400px;
            width: 100%;
            height: auto;
            border-radius: 12px;
            margin-top: 8px;
            margin-bottom: 16px;
            box-shadow: 0 8px 32px rgba(79, 195, 247, 0.3);
          }
          .text {
            font-size: 14px;
            line-height: 1.6;
            color: #CCCCCC;
            margin: 0 0 8px 0;
            text-align: justify;
          }
          .features {
            text-align: left;
            margin: 20px 0;
            background: rgba(79, 195, 247, 0.08);
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #4FC3F7;
          }
          .feature-item {
            margin: 12px 0;
            font-size: 14px;
            line-height: 1.5;
            color: #E0E0E0;
          }
          .feature-title {
            color: #4FC3F7;
            font-weight: 600;
            margin-bottom: 4px;
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
            cursor: pointer;
            border: none;
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
              url: 'https://www.turboconsolelog.io/pro?utm_source=extension&utm_medium=webview&utm_campaign=v3120_release&variant=fallback&webviewVersion=3.12.0&webviewVariant=A'
            });
          }
        </script>
      </head>
      <body>
        <div class="container">
            <h1>🚀 Workspace Log Mastery</h1>
            <img 
            src="https://www.turboconsolelog.io/assets/turbo-pro-illustration.png"
            alt="Turbo Pro"
            />

            <p class="text">
            Turbo Pro introduces a <strong class="highlight">workspace-wide log explorer</strong>. 
            One structured tree, every log in your project, instant navigation. 
            Finally a clear view of what's happening across your entire codebase.
            </p>

            <div class="features">
            <div class="feature-item">
                <div class="feature-title">🌳 Unified Log Tree</div>
                <div>All logs from all files in one place. Click any entry and jump directly to its location.</div>
            </div>

            <div class="feature-item">
                <div class="feature-title">🧹 Fast Multi-Delete</div>
                <div>Remove hundreds of logs at once. Choose types, choose scope, confirm, done.</div>
            </div>

            <div class="feature-item">
                <div class="feature-title">🎯 Real-Time Filtering</div>
                <div>Toggle log types and see the tree update immediately. No delay, no friction.</div>
            </div>

            <div class="feature-item">
                <div class="feature-title">🔍 Precise Search</div>
                <div>Find any log by content and navigate to it instantly.</div>
            </div>
            </div>

            <p class="text">
            Designed for <strong class="feature-color">JavaScript, TypeScript, and PHP</strong>. 
            Whether your workspace has 50 logs or 1,000, Turbo Pro gives you full control.
            </p>

            <button class="cta-button" onclick="openProPage()">
            Explore Turbo Pro →
            </button>
        </div>
      </body>
    </html>
    `,
  },
  B: {
    title: '🎄 Full Workspace Control',
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
            color: #66BB6A;
            margin: 0 0 15px 0;
            line-height: 1.3;
          }
          .power-color {
            color: #81C784;
            font-weight: bold;
          }
          .scale-color {
            color: #4CAF50;
            font-weight: bold;
          }
          img { 
            max-width: 400px;
            width: 100%;
            height: auto;
            border-radius: 12px;
            margin-top: 8px;
            margin-bottom: 16px;
            box-shadow: 0 8px 32px rgba(186, 104, 200, 0.3);
          }
          .text {
            font-size: 14px;
            line-height: 1.6;
            color: #CCCCCC;
            margin: 0 0 12px 0;
            text-align: justify;
          }
          .stat-box {
            background: linear-gradient(135deg, rgba(102, 187, 106, 0.15), rgba(129, 199, 132, 0.15));
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid rgba(102, 187, 106, 0.3);
          }
          .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #66BB6A;
            margin-bottom: 8px;
          }
          .stat-text {
            font-size: 14px;
            color: #E0E0E0;
            line-height: 1.5;
          }
          .cta-button { 
            display: inline-block; 
            padding: 14px 32px;
            background: linear-gradient(135deg, #66BB6A, #4CAF50);
            color: #FFFFFF;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 10px;
            cursor: pointer;
            border: none;
          }
          .cta-button:hover { 
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 187, 106, 0.4);
          }
        </style>
        <script>
          const vscode = acquireVsCodeApi();
          function openProPage() {
            vscode.postMessage({
              command: 'openExternal',
              url: 'https://www.turboconsolelog.io/pro?utm_source=extension&utm_medium=webview&utm_campaign=v3120_release&variant=fallback&webviewVersion=3.12.0&webviewVariant=B'
            });
          }
        </script>
      </head>
      <body>
        <div class="container">
            <h1>🎄 Full Workspace Control</h1>
            <img 
            src="https://www.turboconsolelog.io/assets/turbo-pro-illustration.png"
            alt="Turbo Pro"
            />

            <p class="text">
            Turbo Pro now offers a <strong class="power-color">complete overview of all logs in your workspace</strong>. 
            Structured, searchable, and built for scale.
            </p>

            <div class="stat-box">
            <div class="stat-number">600+ LOGS</div>
            <div class="stat-text">
                Tested on large projects: the explorer organizes logs from hundreds of files with stable performance and clean navigation.
            </div>
            </div>

            <p class="text">
            <strong class="scale-color">Batch cleanup is now immediate.</strong> 
            Remove selected log types across your entire project in seconds. 
            Filter views update instantly, and search finds any log by content with millisecond response time.
            </p>

            <p class="text">
            Works smoothly across JavaScript, TypeScript, and PHP. 
            Ideal for teams preparing commits, reviewing code, or refactoring.
            </p>

            <button class="cta-button" onclick="openProPage()">
            Discover Turbo Pro →
            </button>
        </div>
      </body>
    </html>
    `,
  },
  C: {
    title: '⚡ A Clearer Way to Debug',
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
            color: #FFD54F;
            margin: 0 0 15px 0;
            line-height: 1.3;
          }
          .breakthrough-color {
            color: #FFC947;
            font-weight: bold;
          }
          .instant-color {
            color: #FFEB3B;
            font-weight: bold;
          }
          img { 
            max-width: 400px;
            width: 100%;
            height: auto;
            border-radius: 12px;
            margin-top: 8px;
            margin-bottom: 16px;
            box-shadow: 0 8px 32px rgba(102, 187, 106, 0.3);
          }
          .text {
            font-size: 14px;
            line-height: 1.6;
            color: #CCCCCC;
            margin: 0 0 8px 0;
            text-align: justify;
          }
          .benefit-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 20px 0;
          }
          .benefit-card {
            background: rgba(255, 213, 79, 0.08);
            padding: 16px;
            border-radius: 8px;
            text-align: left;
            border: 1px solid rgba(255, 213, 79, 0.2);
          }
          .benefit-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .benefit-title {
            color: #FFD54F;
            font-weight: 600;
            font-size: 13px;
            margin-bottom: 6px;
          }
          .benefit-desc {
            font-size: 12px;
            color: #B0B0B0;
            line-height: 1.4;
          }
          .cta-button { 
            display: inline-block; 
            padding: 14px 32px;
            background: linear-gradient(135deg, #FFD54F, #FFC947);
            color: #1E1E1E;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 10px;
            cursor: pointer;
            border: none;
          }
          .cta-button:hover { 
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(255, 213, 79, 0.4);
          }
        </style>
        <script>
          const vscode = acquireVsCodeApi();
          function openProPage() {
            vscode.postMessage({
              command: 'openExternal',
              url: 'https://www.turboconsolelog.io/pro?utm_source=extension&utm_medium=webview&utm_campaign=v3120_release&variant=fallback&webviewVersion=3.12.0&webviewVariant=C'
            });
          }
        </script>
      </head>
      <body>
        <div class="container">
            <h1>⚡ A Clearer Way to Debug</h1>

            <img 
            src="https://www.turboconsolelog.io/assets/turbo-pro-illustration.png"
            alt="Turbo Pro"
            />

            <p class="text">
            Turbo Pro now includes a <strong class="breakthrough-color">workspace-wide log explorer</strong>. 
            A single tree that reveals every log in your project with direct navigation and immediate actions.
            </p>

            <div class="benefit-grid">
            <div class="benefit-card">
                <div class="benefit-icon">🌲</div>
                <div class="benefit-title">Unified View</div>
                <div class="benefit-desc">All logs in one place. No more switching between files.</div>
            </div>

            <div class="benefit-card">
                <div class="benefit-icon">⚡</div>
                <div class="benefit-title">Bulk Cleanup</div>
                <div class="benefit-desc">Remove large sets of logs instantly with controlled targeting.</div>
            </div>

            <div class="benefit-card">
                <div class="benefit-icon">🎛️</div>
                <div class="benefit-title">Live Filters</div>
                <div class="benefit-desc">Toggle log types and watch results update immediately.</div>
            </div>

            <div class="benefit-card">
                <div class="benefit-icon">🔍</div>
                <div class="benefit-title">Fast Search</div>
                <div class="benefit-desc">Locate logs by content with instant navigation.</div>
            </div>
            </div>

            <p class="text">
            Built for <strong class="instant-color">JavaScript, TypeScript, and PHP</strong>. 
            A practical upgrade that gives you clarity and control across your entire codebase.
            </p>

            <button class="cta-button" onclick="openProPage()">
            See What's New →
            </button>
        </div>
      </body>
    </html>
    `,
  },
};
