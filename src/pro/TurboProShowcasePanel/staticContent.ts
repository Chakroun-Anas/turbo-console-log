import { DynamicFreemiumPanel, DynamicFreemiumPanelContent } from './types';

/**
 * Static content provider that mirrors the DynamicFreemiumPanelInteractor
 * This provides consistent content structure for the static version
 */
export function getStaticContent(): DynamicFreemiumPanel {
  const content: DynamicFreemiumPanelContent[] = [
    {
      type: 'paragraph',
      order: 1,
      component: {
        title: '🚀 Turbo v3.9.0 is Live: Universal Framework Support',
        content:
          'Our Acorn-based AST engine now supports Astro and Svelte, parses JS/TS inside HTML <script> blocks, handles TypeScript decorators more reliably, and better distinguishes generics in TS vs JSX. More stacks work, with higher precision.',
      },
    },
    {
      type: 'media-showcase-cta',
      order: 2,
      component: {
        illustrationSrcs: [
          'https://www.turboconsolelog.io/assets/turbo-pro-halloween.png',
        ],
        cta: {
          text: 'Read v3.9.0 Release Article',
          url: 'https://www.turboconsolelog.io/articles/release-390?utm_source=panel&utm_campaign=release_390&utm_medium=panel_cta_article',
        },
      },
    },
    {
      type: 'paragraph',
      order: 3,
      component: {
        title: '🎃 Halloween Special: 20% OFF Turbo Pro',
        content:
          'Ends Sunday night. Lifetime license, one-time payment. Discount is auto-applied at checkout.',
      },
    },
    {
      type: 'countdown',
      order: 4,
      component: {
        eventName: 'Halloween Deal',
        targetDateUTC: new Date('2025-11-02T23:59:59Z'),
        illustrationSrc: 'turbo-pro-halloween-discount-20.png',
        CTA: {
          text: '🎃 Get 20% OFF - Lifetime License',
          url: 'https://www.turboconsolelog.io/pro?discount=HALLOWEEN2025',
        },
      },
    },
  ];

  return {
    tooltip: 'Turbo v3.9.0: 🎃 Halloween Special Edition',
    date: new Date('2025-10-30T00:00:00.000Z'),
    content,
  };
}
