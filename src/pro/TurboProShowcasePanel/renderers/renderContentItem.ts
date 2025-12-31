import {
  DynamicFreemiumPanelContent,
  ParagraphPanelComponent,
  ArticlePanelComponent,
  CountDownPanelComponent,
  SurveyPanelComponent,
  TablePanelComponent,
  MediaShowcaseCTAPanelComponent,
  VideoPanelComponent,
  YouTubeVideoPanelComponent,
} from '../types';
import { renderParagraphComponent } from './renderParagraphComponent';
import { renderArticleComponent } from './renderArticleComponent';
import { renderCountDownComponent } from './renderCountDownComponent';
import { renderSurveyComponent } from './renderSurveyComponent';
import { renderTableComponent } from './renderTableComponent';
import { renderMediaShowcaseCTAComponent } from './renderMediaShowcaseCTAComponent';
import { renderVideoComponent } from './renderVideoComponent';
import { renderYouTubeVideoComponent } from './renderYouTubeVideoComponent';

/**
 * Render a single content item based on its type
 * @param contentItem The content item to render
 * @returns HTML string for the content item
 */
export function renderContentItem(
  contentItem: DynamicFreemiumPanelContent,
): string {
  switch (contentItem.type) {
    case 'paragraph':
      return renderParagraphComponent(
        contentItem.component as ParagraphPanelComponent,
      );
    case 'article':
      return renderArticleComponent(
        contentItem.component as ArticlePanelComponent,
      );
    case 'countdown':
      return renderCountDownComponent(
        contentItem.component as CountDownPanelComponent,
      );
    case 'survey':
      return renderSurveyComponent(
        contentItem.component as SurveyPanelComponent,
      );
    case 'table':
      return renderTableComponent(contentItem.component as TablePanelComponent);
    case 'media-showcase-cta':
      return renderMediaShowcaseCTAComponent(
        contentItem.component as MediaShowcaseCTAPanelComponent,
      );
    case 'video':
      return renderVideoComponent(contentItem.component as VideoPanelComponent);
    case 'youtube-video':
      return renderYouTubeVideoComponent(
        contentItem.component as YouTubeVideoPanelComponent,
      );
    default:
      // Future content types can be added here
      return '';
  }
}
