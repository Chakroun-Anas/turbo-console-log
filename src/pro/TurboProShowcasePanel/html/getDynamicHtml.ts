import { DynamicFreemiumPanel } from '../types';
import { contentByType } from '../contentByType';
import { getCommonStyles } from '../styles/getCommonStyles';
import { getJavaScript } from '../javascript/javascript';

/**
 * Generate dynamic HTML when dynamic content is available
 * @param dynamicContent The dynamic content to render
 * @returns Complete HTML string for dynamic content
 */
export function getDynamicHtml(dynamicContent: DynamicFreemiumPanel): string {
  // Separate content by type for different placement
  const {
    topContentHtml,
    articlesHtml,
    surveyHtml,
    tableHtml,
    mediaShowcaseCTAHtml,
  } = contentByType(dynamicContent);

  return `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        ${getCommonStyles()}
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Dynamic Content Section -->
        ${topContentHtml}
        
        <!-- Media Showcase CTA Section -->
        ${mediaShowcaseCTAHtml}
        
        <!-- Dynamic Survey Section -->
        ${surveyHtml}
        
        <!-- Dynamic Table Section -->
        ${tableHtml}

        <!-- Dynamic Articles Section -->
        ${
          articlesHtml
            ? `
        <section class="section">
          <h3>📚 Featured Turbo Articles</h3>
          <div class="articles-grid">
            ${articlesHtml}
          </div>
        </section>
        `
            : ''
        }
        
        <!-- Footer -->
        <footer class="footer">
          © 2025 Turbo Console Log • Built with ❤️ by Turbo Unicorn 🦄
        </footer>
      </div>

      <script>
        ${getJavaScript()}
      </script>
    </body>
  </html>
  `;
}
