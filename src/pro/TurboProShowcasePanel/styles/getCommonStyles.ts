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

        /* Workspace Analytics Card - Data-Driven Approach */
        .workspace-analytics-card {
          margin-bottom: 24px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(233, 30, 99, 0.05) 100%);
          border-radius: 12px;
          border: 2px solid #FF6B6B;
        }
        
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 107, 107, 0.3);
        }
        
        .analytics-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #FFC947;
          flex: 1;
          min-width: 0;
        }
        
        .log-count-badge {
          background: linear-gradient(135deg, #FF6B6B 0%, #E91E63 100%);
          color: white;
          font-size: 24px;
          font-weight: 900;
          padding: 8px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
          white-space: nowrap;
          min-width: fit-content;
          flex-shrink: 0;
        }
        
        .analytics-description {
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          font-size: 14px;
        }
        
        .analytics-section {
          margin-top: 24px;
          margin-bottom: 24px;
        }
        
        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: #48BFE3;
          margin: 0 0 12px 0;
        }
        
        /* Repository Chart */
        .repo-chart {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .repo-bar {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .repo-name {
          min-width: 120px;
          flex-shrink: 0;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .repo-bar-container {
          flex: 1;
          height: 28px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          position: relative;
          overflow: hidden;
        }
        
        .repo-bar-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: linear-gradient(90deg, #8B7BD8 0%, #48BFE3 100%);
          border-radius: 6px;
          transition: width 0.5s ease;
        }
        
        .repo-count {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          font-weight: 700;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        /* Log Type Distribution Grid */
        .log-type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }
        
        .log-type-card {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 107, 107, 0.2);
          border-radius: 8px;
          padding: 12px;
        }
        
        .log-type-name {
          font-size: 12px;
          font-weight: 600;
          color: #FFC947;
          margin-bottom: 8px;
          font-family: monospace;
        }
        
        .log-type-stats {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }
        
        .log-type-count {
          font-size: 20px;
          font-weight: 700;
          color: white;
        }
        
        .log-type-percentage {
          font-size: 14px;
          font-weight: 600;
          color: #48BFE3;
        }
        
        .log-type-bar {
          height: 4px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .log-type-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF6B6B 0%, #FFC947 100%);
          border-radius: 2px;
          transition: width 0.5s ease;
        }
        
        /* Impact Section - Data-driven insights */
        .impact-section {
          background: rgba(72, 191, 227, 0.08);
          border-left: 4px solid #48BFE3;
          padding: 16px;
          border-radius: 8px;
        }
        
        .impact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        
        .impact-card {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 14px;
          text-align: center;
          border: 1px solid rgba(72, 191, 227, 0.2);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        
        .impact-card:hover {
          transform: translateY(-2px);
          border-color: rgba(72, 191, 227, 0.5);
        }
        
        .impact-card-highlight {
          background: rgba(72, 191, 227, 0.15);
          border-color: rgba(72, 191, 227, 0.4);
        }
        
        .impact-card-highlight:hover {
          border-color: rgba(72, 191, 227, 0.7);
        }
        
        .impact-metric {
          font-size: 32px;
          font-weight: 700;
          color: #48BFE3;
          margin-bottom: 6px;
          line-height: 1;
        }
        
        .impact-label {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 6px;
          line-height: 1.3;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        
        .impact-hint {
          font-size: 11px;
          color: rgba(255, 201, 71, 0.9);
          font-style: italic;
          line-height: 1.3;
        }
        
        .insights-footer {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid rgba(72, 191, 227, 0.2);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
        }
        
        .insights-footer strong {
          color: #FFC947;
        }
        
        /* Features Reveal */
        .features-reveal {
          background: rgba(139, 123, 216, 0.08);
          border-left: 4px solid #8B7BD8;
          padding: 16px;
          border-radius: 8px;
        }
        
        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 12px;
        }
        
        .feature-item {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          padding: 12px;
          display: flex;
          align-items: start;
          gap: 12px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .feature-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(139, 123, 216, 0.3);
        }
        
        .feature-item.feature-new {
          border: 1px solid rgba(255, 201, 71, 0.3);
        }
        
        .feature-icon {
          font-size: 24px;
          flex-shrink: 0;
        }
        
        .feature-content {
          flex: 1;
        }
        
        .feature-name {
          font-size: 14px;
          font-weight: 700;
          color: #FFC947;
          margin-bottom: 4px;
        }
        
        .feature-desc {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.4;
        }
        
        .new-badge {
          display: inline-block;
          background: linear-gradient(135deg, #FFC947 0%, #FF6B6B 100%);
          color: #1e1e1e;
          font-size: 10px;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 6px;
          text-transform: uppercase;
        }

        /* Locked Pro feature board (upsell teaser inside the analytics card) */
        .feature-item.feature-locked {
          opacity: 0.62;
          background: rgba(0, 0, 0, 0.28);
          border: 1px dashed rgba(255, 255, 255, 0.18);
        }

        .feature-item.feature-locked:hover {
          transform: none;
          box-shadow: none;
        }

        /* Compact (name-only) supporting feature row */
        .feature-item.feature-compact {
          padding: 8px 12px;
          align-items: center;
        }

        .feature-item.feature-compact .feature-name {
          margin-bottom: 0;
          font-size: 13px;
        }

        .feature-item.feature-compact .feature-icon {
          font-size: 18px;
        }

        .pro-unlock-link {
          color: inherit;
          text-decoration: none;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .pro-unlock-link:hover {
          text-decoration: underline;
          opacity: 0.85;
        }
        
        /* Testimonial Section */
        .testimonial-section {
          background: rgba(72, 191, 227, 0.08);
          border-left: 4px solid #48BFE3;
          padding: 16px;
          border-radius: 8px;
          margin-top: 16px;
        }
        
        .testimonial-quote {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          margin-bottom: 8px;
          font-style: italic;
        }
        
        .testimonial-author {
          font-size: 12px;
          color: #48BFE3;
          font-weight: 600;
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
          margin: 16px auto;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          max-width: 250px;
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
          max-width: 100%;
          max-height: 400px;
          margin: 0 auto;
          display: block;
          border-radius: 8px;
        }
        
        .media-showcase-images img {
          border-radius: 8px;
        }

        .media-showcase-tagline {
          font-size: 16px;
          font-weight: 600;
          color: #FFC947;
          margin: 8px 0;
          line-height: 1.4;
        }

        .media-showcase-subtitle {
          font-size: 13px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.5;
          max-width: 320px;
          margin: 0 auto 14px;
          text-align: justify;
        }

        /* Inline "before/after" cleanup demo (replaces the mascot) — full-width
           code banner above the CTA card */
        .cleanup-demo {
          box-sizing: border-box;
          margin-bottom: 16px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px 14px;
          font-family: 'SF Mono', Menlo, Consolas, 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.65;
          text-align: left;
          overflow-x: auto;
        }

        .cleanup-demo-line {
          white-space: pre;
          color: rgba(255, 255, 255, 0.82);
        }

        .cleanup-demo-line.removed {
          color: #FF8787;
          text-decoration: line-through;
          opacity: 0.65;
        }

        .cleanup-demo-caption {
          margin-top: 8px;
          font-size: 11px;
          font-weight: 700;
          color: #6EE7A8;
        }

        /* Tiny "cleanup config" panel above the code demo */
        .settings-demo {
          margin-bottom: 12px;
          background: rgba(0, 0, 0, 0.22);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 11.5px;
          text-align: left;
        }

        .settings-demo-title {
          font-size: 10.5px;
          font-weight: 700;
          color: #FFC947;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }

        .settings-demo-item {
          display: flex;
          align-items: center;
          gap: 7px;
          color: rgba(255, 255, 255, 0.82);
          line-height: 2;
        }

        .settings-demo-toggle {
          display: inline-flex;
          width: 15px;
          height: 15px;
          border-radius: 3px;
          font-size: 10px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .settings-demo-toggle.on {
          background: #2EA043;
          color: #FFFFFF;
        }

        .settings-demo-toggle.off {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.35);
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

        /* Video Component Styles */
        .video-component {
          margin: 16px 0;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(72, 191, 227, 0.2);
          margin-left: auto;
          margin-right: auto;
        }
        
        .video-player {
          width: 100%;
          height: auto;
          border-radius: 6px;
          display: block;
          background: #000000;
        }
        
        .video-caption {
          margin-top: 12px;
          font-size: 13px;
          color: #CCCCCC;
          text-align: center;
          line-height: 1.5;
          padding: 0 8px;
        }

        /* YouTube Video Card Styles */
        .youtube-video-component {
          margin-bottom: 16px;
        }
        
        .youtube-video-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(72, 191, 227, 0.2);
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .youtube-video-card:hover {
          border-color: rgba(72, 191, 227, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(72, 191, 227, 0.2);
        }
        
        .youtube-thumbnail-wrapper {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          background: #000000;
          overflow: hidden;
        }
        
        .youtube-thumbnail {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .youtube-play-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.9;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .youtube-video-card:hover .youtube-play-overlay {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.1);
        }
        
        .youtube-play-icon {
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6));
        }
        
        .youtube-video-info {
          padding: 16px;
        }
        
        .youtube-video-title {
          margin: 0 0 8px 0;
          font-size: 15px;
          font-weight: 600;
          color: #FFFFFF;
          line-height: 1.4;
        }
        
        .youtube-video-caption {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: #CCCCCC;
          line-height: 1.5;
        }
        
        .youtube-video-cta {
          display: inline-block;
          font-size: 12px;
          color: #48BFE3;
          font-weight: 600;
          transition: color 0.3s ease;
        }
        
        .youtube-video-card:hover .youtube-video-cta {
          color: #5DCDFA;
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
