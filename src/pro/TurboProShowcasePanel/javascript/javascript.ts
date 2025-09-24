/**
 * Get JavaScript code for interactivity in the webview
 * @returns JavaScript code as string
 */
export function getJavaScript(): string {
  return `
        const vscode = acquireVsCodeApi();
        
        function openUrl(url) {
          vscode.postMessage({
            command: 'openUrl',
            url: url
          });
        }

        function trackCtaClick(ctaType, ctaText, ctaUrl) {
          vscode.postMessage({
            command: 'trackCtaClick',
            ctaType: ctaType,
            ctaText: ctaText,
            ctaUrl: ctaUrl
          });
        }

        function openUrlWithTracking(url, ctaType, ctaText) {
          // Track the click first
          trackCtaClick(ctaType, ctaText || 'Unknown', url);
          // Then open the URL
          openUrl(url);
        }

        // Dynamic countdown functionality
        function updateCountdowns() {
          const countdownWidgets = document.querySelectorAll('.countdown-widget');
          
          countdownWidgets.forEach(widget => {
            const targetDate = new Date(widget.dataset.targetDate);
            const now = new Date();
            const timeDiff = targetDate.getTime() - now.getTime();
            
            if (timeDiff <= 0) {
              // Hide widget if event has passed
              widget.style.display = 'none';
              return;
            }
            
            // Calculate time units
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            // Update the display
            const countdownNumbers = widget.querySelectorAll('.countdown-number');
            if (countdownNumbers.length >= 4) {
              countdownNumbers[0].textContent = days;
              countdownNumbers[1].textContent = hours;
              countdownNumbers[2].textContent = minutes;
              countdownNumbers[3].textContent = seconds;
            }
          });
        }
        
        // Update countdown every second
        setInterval(updateCountdowns, 1000);
        
        // Initial update
        updateCountdowns();
    `;
}
