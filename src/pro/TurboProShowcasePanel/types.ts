// Types for dynamic content (matching the API structure)
export interface ParagraphPanelComponent {
  title: string;
  content: string;
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
  cta: {
    text: string;
    url: string;
  };
}

export type FreemiumPanelComponent =
  | ParagraphPanelComponent
  | ArticlePanelComponent
  | CountDownPanelComponent
  | SurveyPanelComponent
  | TablePanelComponent
  | MediaShowcaseCTAPanelComponent;

export type DynamicFreemiumPanelContentType =
  | 'paragraph'
  | 'article'
  | 'countdown'
  | 'survey'
  | 'table'
  | 'media-showcase-cta';

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
}
