// Types for dynamic content (matching the API structure)
export interface ParagraphPanelComponent {
  title: string;
  content: string;
  rawHtml?: boolean; // If true, content will be rendered as raw HTML without escaping
}

export interface ArticlePanelComponent {
  title: string;
  description: string;
  illustrationSrc: string;
  url: string;
  illustrationFocus?: 'top' | 'center' | 'bottom';
}

export interface CountDownPanelComponent {
  eventName: string;
  targetDateUTC: Date | string;
  illustrationSrc: string;
  CTA: {
    text: string;
    url: string;
  };
}

export interface SurveyPanelComponent {
  title: string;
  description: string;
  CTA: {
    text: string;
    url: string;
  };
}

export interface TablePanelComponent {
  title: string;
  columns: Array<string>;
  rows: Array<{ [column: string]: string }>;
}

export interface MediaShowcaseCTAPanelComponent {
  illustrationSrcs: Array<string>;
  tagline?: string; // Optional tagline to show before the CTA
  subtitle?: string; // Optional supporting line (mechanism + reassurance) shown under the tagline
  // Optional inline "before/after" cleanup demo, rendered in place of the
  // illustration so the closing card shows the feature. Lines flagged `removed`
  // render struck-through.
  codeDemo?: {
    lines: Array<{ text: string; removed?: boolean }>;
    caption: string;
  };
  // Optional tiny "cleanup config" panel shown above the code demo, so the
  // viewer sees what controls the cleanup. Rendered as labeled on/off toggles.
  settingsDemo?: {
    title: string;
    items: Array<{ label: string; on: boolean }>;
  };
  cta: {
    text: string;
    url: string;
  };
  // Optional testimonial rendered as a full-width block after the CTA card.
  testimonial?: {
    quote: string;
    author: string;
  };
}

export interface VideoPanelComponent {
  videoSrc: string;
  caption: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export interface YouTubeVideoPanelComponent {
  youtubeVideoId: string;
  caption: string;
  title?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  startTime?: number; // Start time in seconds
}

export interface WorkspaceLogCountComponent {
  logCount: number;
  title: string;
  description: string;
  metadata?: {
    totalLogs: number;
    totalFiles: number;
    repositories: Array<{
      name: string;
      path: string;
      logCount: number;
      fileCount: number;
      topNestedFolder?: {
        relativePath: string;
        logCount: number;
        percentage: number;
      };
    }>;
    logTypeDistribution: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
  } | null; // Allow null to indicate error state
  // Optional locked Pro feature board shown inside the analytics card — the
  // single place Pro features are surfaced in the freemium panel.
  lockedFeatures?: Array<{
    icon: string;
    name: string;
    desc: string;
    isNew?: boolean; // shows a version badge when true
  }>;
  // Optional URL the "Unlock with Turbo Pro" board header links to.
  unlockUrl?: string;
}

export type FreemiumPanelComponent =
  | ParagraphPanelComponent
  | ArticlePanelComponent
  | CountDownPanelComponent
  | SurveyPanelComponent
  | TablePanelComponent
  | MediaShowcaseCTAPanelComponent
  | VideoPanelComponent
  | YouTubeVideoPanelComponent
  | WorkspaceLogCountComponent;

export type DynamicFreemiumPanelContentType =
  | 'paragraph'
  | 'article'
  | 'countdown'
  | 'survey'
  | 'table'
  | 'media-showcase-cta'
  | 'video'
  | 'youtube-video'
  | 'workspace-log-count';

export interface DynamicFreemiumPanelContent {
  type: DynamicFreemiumPanelContentType;
  component: FreemiumPanelComponent;
  order?: number; // Optional order property for controlling render sequence
}

export interface DynamicFreemiumPanel {
  tooltip: string;
  date: Date | string;
  content: Array<DynamicFreemiumPanelContent>;
}

export interface SeparatedContent {
  topContentHtml: string;
  articlesHtml: string;
  surveyHtml: string;
  tableHtml: string;
  mediaShowcaseCTAHtml: string;
  videoHtml: string;
  youtubeVideoHtml: string;
}
