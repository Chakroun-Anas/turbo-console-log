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

  // Separate articles from other content
  const articles: DynamicFreemiumPanelContent[] = [];
  const otherContent: DynamicFreemiumPanelContent[] = [];

  dynamicContent.content.forEach((contentItem) => {
    if (contentItem.type === 'article') {
      articles.push(contentItem);
    } else {
      otherContent.push(contentItem);
    }
  });

  // Sort function for order property (ascending), treating undefined as 0
  const sortByOrder = (
    a: DynamicFreemiumPanelContent,
    b: DynamicFreemiumPanelContent,
  ) => (a.order ?? 0) - (b.order ?? 0);

  // Generate unified HTML for all non-article content in order
  const topContentHtml = otherContent
    .sort(sortByOrder)
    .map((contentItem) => renderContentItem(contentItem))
    .join('');

  // Generate articles HTML separately (still ordered)
  const articlesHtml = articles
    .sort(sortByOrder)
    .map((contentItem) => renderContentItem(contentItem))
    .join('');

  return {
    topContentHtml,
    articlesHtml,
    surveyHtml: '', // No longer separated - included in topContentHtml
    tableHtml: '', // No longer separated - included in topContentHtml
    mediaShowcaseCTAHtml: '', // No longer separated - included in topContentHtml
  };
}
