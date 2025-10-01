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
        title: 'Turbo v3.8.0 is Live ⚡️ 🌳',
        content:
          'Hide Logs (Pro) is here — plus a new Acorn AST engine that makes Turbo 96% smaller, 89% faster, and far smarter at handling complex cases (return variables, JSX, decorators, destructuring, and more).',
      },
    },
    {
      type: 'media-showcase-cta',
      component: {
        illustrationSrcs: [
          'https://www.turboconsolelog.io/assets/turbo-perf-boost.png',
          'https://www.turboconsolelog.io/assets/turbo-pro-hide-logs.png',
        ],
        cta: {
          text: 'Read the full release article',
          url: 'https://www.turboconsolelog.io/articles/release-380?utm_source=panel&utm_campaign=release_380&utm_medium=panel_cta_media',
        },
      },
    },
    {
      type: 'article',
      component: {
        title:
          'Turbo Sundays #1: As a developer, always have your own side project ✨',
        description:
          "In today's world, having a regular job with a stable paycheck is the natural path. But every developer should have at least one side project - something that exists outside company walls.",
        illustrationSrc:
          'https://www.turboconsolelog.io/assets/turbo-sunday-side-project.png',
        illustrationFocus: 'center',
        url: 'https://www.turboconsolelog.io/articles/turbo-sundays-001?utm_source=panel&utm_campaign=release_380&utm_medium=panel_cta_article',
      },
    },
    {
      type: 'article',
      component: {
        title: 'The Story Behind Turbo Console Log',
        description:
          'Why we built Turbo Console Log — from simple idea to a tool trusted by 2M+ developers.',
        illustrationSrc:
          'https://www.turboconsolelog.io/assets/arc-de-triomphe-picture.webp',
        url: 'https://www.turboconsolelog.io/articles/motivation-behind-tcl?utm_source=panel&utm_campaign=release_380&utm_medium=panel_cta_story',
      },
    },
  ];

  return {
    tooltip: 'Turbo v3.8.0 — Pro Hide Logs & Acorn Engine ⚡',
    date: new Date('2025-10-14T14:00:00.000Z'),
    content,
  };
}
