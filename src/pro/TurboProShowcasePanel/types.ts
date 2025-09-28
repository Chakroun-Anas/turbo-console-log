// Types for dynamic content (matching the API structure)
export interface ParagraphPanelComponent {
  title: string;
  content: string;
}

export interface ArticlePanelComponent {
  title: string;
  description: string;
  illustrationSrc: string;
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

export type FreemiumPanelComponent =
  | ParagraphPanelComponent
  | ArticlePanelComponent
  | CountDownPanelComponent
  | SurveyPanelComponent
  | TablePanelComponent;

export type DynamicFreemiumPanelContentType =
  | 'paragraph'
  | 'article'
  | 'countdown'
  | 'survey'
  | 'table';

export interface DynamicFreemiumPanelContent {
  type: DynamicFreemiumPanelContentType;
  component: FreemiumPanelComponent;
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
}
