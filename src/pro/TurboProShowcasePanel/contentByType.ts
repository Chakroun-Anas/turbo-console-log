import {
  DynamicFreemiumPanel,
  DynamicFreemiumPanelContent,
  SeparatedContent,
} from './types';
import { renderContentItem } from './renderers/renderContentItem';

/**
 * Separate content by type for different placement in the UI
 * @param dynamicContent The dynamic content to separate
 * @returns Object with separated content HTML strings
 */
export function contentByType(
  dynamicContent: DynamicFreemiumPanel | undefined,
): SeparatedContent {
  if (
    !dynamicContent ||
    !dynamicContent.content ||
    dynamicContent.content.length === 0
  ) {
    return {
      topContentHtml: '',
      articlesHtml: '',
      surveyHtml: '',
      tableHtml: '',
      mediaShowcaseCTAHtml: '',
    };
  }

  const topContent: DynamicFreemiumPanelContent[] = [];
  const articles: DynamicFreemiumPanelContent[] = [];
  const surveys: DynamicFreemiumPanelContent[] = [];
  const tables: DynamicFreemiumPanelContent[] = [];
  const mediaShowcaseCTAs: DynamicFreemiumPanelContent[] = [];

  // Separate content by type
  dynamicContent.content.forEach((contentItem) => {
    switch (contentItem.type) {
      case 'article':
        articles.push(contentItem);
        break;
      case 'survey':
        surveys.push(contentItem);
        break;
      case 'table':
        tables.push(contentItem);
        break;
      case 'media-showcase-cta':
        mediaShowcaseCTAs.push(contentItem);
        break;
      default:
        topContent.push(contentItem);
        break;
    }
  });

  // Generate HTML for each section
  const topContentHtml = topContent
    .map((contentItem) => renderContentItem(contentItem))
    .join('');

  const articlesHtml = articles
    .map((contentItem) => renderContentItem(contentItem))
    .join('');

  const surveyHtml = surveys
    .map((contentItem) => renderContentItem(contentItem))
    .join('');

  const tableHtml = tables
    .map((contentItem) => renderContentItem(contentItem))
    .join('');

  const mediaShowcaseCTAHtml = mediaShowcaseCTAs
    .map((contentItem) => renderContentItem(contentItem))
    .join('');

  return {
    topContentHtml,
    articlesHtml,
    surveyHtml,
    tableHtml,
    mediaShowcaseCTAHtml,
  };
}
