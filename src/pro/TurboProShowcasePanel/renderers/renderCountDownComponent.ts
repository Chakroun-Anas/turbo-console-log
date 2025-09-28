import { CountDownPanelComponent } from '../types';
import { escapeHtml } from './escapeHtml';

/**
 * Render a countdown component as HTML (for top section)
 * @param component The countdown component to render
 * @returns HTML string for the countdown component
 */
export function renderCountDownComponent(
  component: CountDownPanelComponent,
): string {
  const targetDate = new Date(component.targetDateUTC);
  const now = new Date();
  const timeDiff = targetDate.getTime() - now.getTime();

  // Don't display if the event is in the past
  if (timeDiff <= 0) {
    return '';
  }

  // Calculate time units
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return `
      <div class="countdown-widget" data-target-date="${targetDate.toISOString()}" style="--bg-image: url('https://www.turboconsolelog.io/assets/${escapeHtml(component.illustrationSrc)}')">
        <div class="countdown-content">
          <div class="countdown-title">${escapeHtml(component.eventName)}</div>
          <div class="countdown-timer">
            <div class="countdown-unit">
              <span class="countdown-number">${days}</span>
              <span class="countdown-label">Days</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-number">${hours}</span>
              <span class="countdown-label">Hours</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-number">${minutes}</span>
              <span class="countdown-label">Minutes</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-number">${seconds}</span>
              <span class="countdown-label">Seconds</span>
            </div>
          </div>
          <div style="text-align: center;">
            <a class="countdown-cta" onclick="openUrlWithTracking('${escapeHtml(component.CTA.url)}', 'countdown', '${escapeHtml(component.CTA.text)}'); return false;" style="cursor: pointer;">
              ${escapeHtml(component.CTA.text)}
            </a>
          </div>
        </div>
      </div>
    `;
}
