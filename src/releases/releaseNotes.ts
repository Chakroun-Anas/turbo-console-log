import { getHtmlWevView as release2110HtmlWebView } from './2110';
import { getHtmlWevView as release2120HtmlWebView } from './2120';
import { getHtmlWevView as release2130HtmlWebView } from './2130';
import { getHtmlWevView as release2140HtmlWebView } from './2140';
import { getHtmlWebView as release2150HtmlWebView } from './2150';
import { getHtmlWebView as release2160HtmlWebView } from './2160';
import { getHtmlWebView as release300HtmlWebView } from './300';
import { getHtmlWebView as release301HtmlWebView } from './310';

export const releaseNotes: Record<
  string,
  { webViewHtml: string; isPro: boolean }
> = {
  '2.11.0': {
    webViewHtml: release2110HtmlWebView(),
    isPro: false,
  },
  '2.12.0': {
    webViewHtml: release2120HtmlWebView(),
    isPro: false,
  },
  '2.13.0': {
    webViewHtml: release2130HtmlWebView(),
    isPro: false,
  },
  '2.14.0': {
    webViewHtml: release2140HtmlWebView(),
    isPro: false,
  },
  '2.15.0': {
    webViewHtml: release2150HtmlWebView(),
    isPro: false,
  },
  '2.16.0': {
    webViewHtml: release2160HtmlWebView(),
    isPro: false,
  },
  '3.0.0': {
    webViewHtml: release300HtmlWebView(),
    isPro: true,
  },
  '3.1.0': {
    webViewHtml: release301HtmlWebView(),
    isPro: true,
  },
};
