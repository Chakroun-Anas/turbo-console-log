import { getCommonStyles } from '../../TurboProShowcasePanel/styles/getCommonStyles';
import { getJavaScript } from '../../TurboProShowcasePanel/javascript/javascript';
import { renderYouTubeVideoComponent } from '../../TurboProShowcasePanel/renderers/renderYouTubeVideoComponent';
import { renderParagraphComponent } from '../../TurboProShowcasePanel/renderers/renderParagraphComponent';
import { isTestMode } from '@/runTime';

const TURBO_WEBSITE_BASE_URL = isTestMode()
  ? 'http://localhost:3000'
  : 'https://www.turboconsolelog.io';

/**
 * Generate HTML for the Pro Features Guide panel
 * Shows video walkthrough of Pro features for all users
 * @param shouldHideCta Whether to hide the CTA (true for trial users and Pro users)
 * @returns Complete HTML string
 */
export function getStaticHtml(shouldHideCta: boolean): string {
  // Video 1: Workspace Navigation
  const video1Html = renderYouTubeVideoComponent({
    youtubeVideoId: 'JipCA8lqCIU',
    title: '🌲 Workspace Logs Navigation',
    caption:
      'See all your log statements organized by file and folder. Navigate hundreds of logs across thousands of files in seconds.',
  });

  // Video 2: Workspace Cleanup
  const video2Html = renderYouTubeVideoComponent({
    youtubeVideoId: '1302jkatcxc',
    title: '🧹 Workspace Logs Cleanup',
    caption:
      'Delete hundreds of logs across dozens of files instantly. Clean up entire workspace, folders, or specific files with one click.',
  });

  // CTA Banner (between videos) - hide for trial users and Pro users
  const ctaBannerHtml = shouldHideCta
    ? ''
    : renderParagraphComponent({
        title: '🚀 Ready to unlock these Pro features?',
        rawHtml: true,
        content: `
      <div class="pro-showcase-cta-banner">
        <p class="cta-message">
          <strong>Get lifetime access to Turbo Pro</strong> and supercharge your debugging workflow
        </p>
        <a 
          href="${TURBO_WEBSITE_BASE_URL}/pro?utm_source=features-guide&utm_campaign=mid-guide-cta&utm_medium=panel" 
          class="cta-button"
          onclick="openUrlWithTracking('${TURBO_WEBSITE_BASE_URL}/pro?utm_source=features-guide&utm_campaign=mid-guide-cta&utm_medium=panel', 'pro-showcase-cta', 'Get Turbo Pro'); return false;"
        >
          Get Turbo Pro →
        </a>
        <p class="cta-details">One-time purchase • Lifetime access • 30-day money-back guarantee</p>
      </div>
    `,
      });

  // Video 3: Real-Time Filtering
  const video3Html = renderYouTubeVideoComponent({
    youtubeVideoId: 'G5Pa5L_Obq4',
    title: '🔍 Workspace Logs Filtering',
    caption:
      'Filter by log type instantly (log, error, warn, info). Focus on what matters without re-scanning your workspace.',
  });

  // Video 4: Instant Search
  const video4Html = renderYouTubeVideoComponent({
    youtubeVideoId: 'xggQvZimMSk',
    title: '🔎 Workspace Logs Search',
    caption:
      'Find any log by content in seconds across your entire workspace. Jump to the exact line instantly.',
  });

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      ${getCommonStyles()}
            
      /* CTA Banner - using brand colors */
      .pro-showcase-cta-banner {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%);
        border: 2px solid #667EEA;
        color: #FFFFFF;
        padding: 1.5rem;
        border-radius: 12px;
        margin: 1.5rem 0;
        text-align: center;
      }
      
      .pro-showcase-cta-banner .cta-message {
        font-size: 1rem;
        margin: 0 0 1rem 0;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.9);
      }
      
      .pro-showcase-cta-banner .cta-message strong {
        font-weight: 700;
        color: #FFC947;
      }
      
      .pro-showcase-cta-banner .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #667EEA, #764BA2);
        color: #FFFFFF;
        padding: 12px 28px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 700;
        font-size: 1rem;
        transition: all 0.3s ease;
        cursor: pointer;
        border: none;
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
      }
      
      .pro-showcase-cta-banner .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
      }
      
      .pro-showcase-cta-banner .cta-details {
        margin-top: 1rem;
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.6);
        font-style: italic;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Videos and CTA -->
      ${video1Html}
      ${video2Html}
      ${ctaBannerHtml}
      ${video3Html}
      ${video4Html}
    </div>

    <script>
      ${getJavaScript()}
    </script>
  </body>
</html>
  `;
}
