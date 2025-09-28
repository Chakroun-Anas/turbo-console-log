import { DynamicFreemiumPanel, DynamicFreemiumPanelContent } from './types';

/**
 * Static content provider that mirrors the DynamicFreemiumPanelInteractor
 * This provides consistent content structure for the static version
 */
export function getStaticContent(): DynamicFreemiumPanel {
  const content: DynamicFreemiumPanelContent[] = [
    {
      type: 'paragraph',
      component: {
        title: '🎉 New Dynamic Panel!',
        content:
          "This panel now updates automatically with the latest Turbo Console Log news, feature previews, and community updates. Stay connected with what's coming next!",
      },
    },
    {
      type: 'countdown',
      component: {
        eventName: 'Turbo Console Log v3.8.0 - Hide Logs from Pro Panel',
        targetDateUTC: new Date('2025-10-06T00:00:00.000Z'),
        illustrationSrc: 'turbo-pro-tree.png',
        CTA: {
          text: 'Read v3.8.0 Teaser Article',
          url: 'https://www.turboconsolelog.io/articles/v380-hide-logs-teaser',
        },
      },
    },
    {
      type: 'survey',
      component: {
        title: "🚀 Shape Turbo's Future",
        description:
          "Help us decide what's next for Turbo Console Log by taking our one-minute community survey.",
        CTA: {
          text: '📝 Take Survey',
          url: 'https://www.turboconsolelog.io/community-survey',
        },
      },
    },
    {
      type: 'table',
      component: {
        title: '⚡ Turbo Console Log Commands',
        columns: ['Command', 'macOS', 'Windows/Linux'],
        rows: [
          {
            Command: 'Console Log',
            macOS: '⌘K ⌘L',
            'Windows/Linux': 'Ctrl+K Ctrl+L',
          },
          {
            Command: 'Console Info',
            macOS: '⌘K ⌘N',
            'Windows/Linux': 'Ctrl+K Ctrl+N',
          },
          {
            Command: 'Console Debug',
            macOS: '⌘K ⌘B',
            'Windows/Linux': 'Ctrl+K Ctrl+B',
          },
          {
            Command: 'Console Warn',
            macOS: '⌘K ⌘R',
            'Windows/Linux': 'Ctrl+K Ctrl+R',
          },
          {
            Command: 'Console Error',
            macOS: '⌘K ⌘E',
            'Windows/Linux': 'Ctrl+K Ctrl+E',
          },
          {
            Command: 'Console Table',
            macOS: '⌘K ⌘T',
            'Windows/Linux': 'Ctrl+K Ctrl+T',
          },
          {
            Command: 'Custom Log',
            macOS: '⌘K ⌘C',
            'Windows/Linux': 'Ctrl+K Ctrl+C',
          },
          {
            Command: 'Comment Logs',
            macOS: '⌥⇧C',
            'Windows/Linux': 'Alt+Shift+C',
          },
          {
            Command: 'Uncomment Logs',
            macOS: '⌥⇧U',
            'Windows/Linux': 'Alt+Shift+U',
          },
          {
            Command: 'Delete Logs',
            macOS: '⌥⇧D',
            'Windows/Linux': 'Alt+Shift+D',
          },
          {
            Command: 'Correct Logs',
            macOS: '⌥⇧X',
            'Windows/Linux': 'Alt+Shift+X',
          },
        ],
      },
    },
    {
      type: 'article',
      component: {
        title: 'Understanding the Full AST Engine',
        description:
          "Deep dive into how Turbo's AST engine revolutionizes code analysis and log placement.",
        illustrationSrc:
          'https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-full-ast-engine.6f0df9f8.png&w=640&q=75',
      },
    },
  ];

  return {
    tooltip: 'v3.8.0 Hide Logs Preview 🎭',
    date: new Date('2025-09-28T12:00:00.000Z'),
    content,
  };
}
