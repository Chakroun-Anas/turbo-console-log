import { getCommonStyles } from '../styles/getCommonStyles';
import { getJavaScript } from '../javascript/javascript';
import { contentByType } from '../contentByType';
import { getStaticContent } from '../staticContent';

/**
 * Generate static HTML using the same structure as dynamic content
 * @returns Complete HTML string for static content
 */
export function getStaticHtml(): string {
  // Get static content that matches the dynamic structure
  const staticContent = getStaticContent();

  // Use the same content separation logic as dynamic version
  const {
    topContentHtml,
    articlesHtml,
    surveyHtml,
    tableHtml,
    mediaShowcaseCTAHtml,
  } = contentByType(staticContent);

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
