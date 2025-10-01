/**
 * Get common CSS styles used in both static and dynamic versions
 * @returns CSS styles as string
 */
export function getCommonStyles(): string {
  return `
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: #1e1e1e;
          color: #ffffff;
          line-height: 1.6;
        }

        h1, h2, h3 { font-weight: bold; margin: 0; }
        a { color: #48BFE3; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .primary-color { color: #FF6B6B; }
        .secondary-color { color: #FFC947; }
        .info-color { color: #48BFE3; font-weight: bold; }
        .container { max-width: 800px; margin: 0 auto; padding: 16px; }

        /* Dynamic Content Styles */
        .dynamic-content {
          margin-bottom: 24px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          border-left: 4px solid #48BFE3;
        }
        
        .dynamic-content h3 {
          color: #FFC947;
          margin-bottom: 8px;
          font-size: 18px;
        }
        
        .dynamic-content p {
          margin: 0;
          opacity: 0.9;
          line-height: 1.5;
        }

        /* Countdown Widget Styles */
        .countdown-widget {
          margin-bottom: 24px;
          padding: 28px 20px;
          background: rgba(30, 30, 30, 0.8);
          border-radius: 12px;
          border: 2px solid #FFC947;
          position: relative;
          overflow: hidden;
          min-height: 180px;
        }
        
        .countdown-widget::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: var(--bg-image);
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0.3;
          z-index: 0;
        }
        
        .countdown-content {
          position: relative;
          z-index: 1;
        }
        
        .countdown-title {
          color: #FF6B6B;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 16px;
          text-align: center;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
        }
        
        .countdown-timer {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin: 16px 0;
          text-align: center;
        }
        
        .countdown-unit {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 8px 4px;
        }
        
        .countdown-number {
          color: #FFC947;
          font-size: 18px;
          font-weight: bold;
          display: block;
        }
        
        .countdown-label {
          color: #CCCCCC;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .countdown-cta {
          display: inline-block;
          padding: 8px 16px;
          background: linear-gradient(135deg, #FF6B6B, #FFC947);
          color: #1E1E1E;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 12px;
          margin-top: 12px;
          transition: all 0.3s ease;
        }
        
        .countdown-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }

        /* Section Styles */
        .section {
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          border: 1px solid rgba(72, 191, 227, 0.2);
        }
        .section h3 {
          color: #FFC947;
          font-size: 16px;
          margin-bottom: 12px;
          text-align: center;
        }

        /* Commands Table */
        .commands-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        .commands-table th,
        .commands-table td {
          padding: 8px 6px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          font-size: 11px;
        }
        .commands-table th {
          background: rgba(255, 201, 71, 0.1);
          color: #FFC947;
          font-weight: bold;
        }


        /* Articles Grid */
        .articles-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 8px;
        }
        .article-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(72, 191, 227, 0.3);
          border-radius: 8px;
          padding: 12px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .article-card:hover {
          border-color: #48BFE3;
          background: rgba(72, 191, 227, 0.08);
        }
        .article-image {
          width: 100%;
          height: 110px;
          object-fit: cover;
          object-position: center 10%;
          border-radius: 6px;
          margin-bottom: 8px;
        }
        .article-title {
          color: #FFC947;
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 6px;
        }
        .article-desc {
          font-size: 11px;
          color: #CCCCCC;
          line-height: 1.4;
        }

        /* Survey Section */
        .survey-section {
          background: linear-gradient(135deg, rgba(255,107,107,0.12), rgba(255,201,71,0.12));
          border: 2px solid #FF6B6B;
          border-radius: 12px;
          padding: 16px;
          margin: 16px 0;
          text-align: center;
        }
        .survey-section h3 {
          color: #FF6B6B;
          font-size: 16px;
          margin-bottom: 8px;
        }
        .survey-section p {
          font-size: 12px;
          color: #FFFFFF;
          margin-bottom: 12px;
        }
        .survey-cta {
          display: inline-block;
          padding: 10px 16px;
          background: linear-gradient(135deg, #FF6B6B, #FFC947);
          color: #1E1E1E;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 13px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }
        .survey-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
        }

        .media-showcase-cta {
          margin: 16px 0;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        
        .media-showcase-images {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
        }
        
        @media (min-width: 800px) {
          .media-showcase-images {
            flex-direction: row;
            justify-content: center;
            flex-wrap: wrap;
            gap: 6px;
          }
          
          .media-showcase-cta-button {
            margin-top: 8px;
          }
        }
        
        .media-showcase-image {
          width: auto;
          max-width: 360px;
          max-height: 400px;
          margin: 0 auto;
          display: block;
          border-radius: 8px;
        }
        
        .media-showcase-images img {
          border-radius: 8px;
        }

        .media-showcase-cta-button {
          display: inline-block;
          padding: 10px 20px;
          background: linear-gradient(135deg, #667EEA, #764BA2);
          color: #FFFFFF;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 13px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        .media-showcase-cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        .footer {
          text-align: center;
          margin-top: 16px;
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 10px;
          color: #CCCCCC;
        }
    `;
}
