/**
 * News Aggregator Service
 * Fetches news from NewsAPI and RSS feeds
 */

import Parser from 'rss-parser';
import crypto from 'crypto';

interface Article {
  title: string;
  content: string;
  source_name: string;
  source_url: string;
  published_at: Date;
  content_hash: string;
}

export class NewsAggregator {
  private rssParser: Parser;
  private newsApiKey: string;

  constructor() {
    this.rssParser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'ProofLocker/1.0',
      },
    });
    this.newsApiKey = process.env.NEWS_API_KEY || '';
  }

  /**
   * Generate content hash for deduplication
   */
  private generateHash(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  /**
   * Fetch from NewsAPI
   */
  async fetchNewsAPI(limit: number = 50): Promise<Article[]> {
    if (!this.newsApiKey) {
      console.warn('[NewsAggregator] NEWS_API_KEY not set, skipping NewsAPI');
      return [];
    }

    try {
      // Fetch top headlines from multiple categories
      const categories = ['general', 'technology', 'business', 'science'];
      const allArticles: Article[] = [];

      for (const category of categories) {
        const url = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&pageSize=20&apiKey=${this.newsApiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
          console.error(`[NewsAggregator] NewsAPI error: ${response.status}`);
          continue;
        }

        const data = await response.json();

        if (data.articles) {
          const articles = data.articles
            .filter((a: any) => a.title && a.description)
            .map((a: any) => ({
              title: a.title,
              content: a.description || a.content || a.title,
              source_name: a.source?.name || 'Unknown',
              source_url: a.url,
              published_at: new Date(a.publishedAt),
              content_hash: this.generateHash(a.title + a.description),
            }));

          allArticles.push(...articles);
        }
      }

      console.log(`[NewsAggregator] Fetched ${allArticles.length} articles from NewsAPI`);
      return allArticles.slice(0, limit);
    } catch (error) {
      console.error('[NewsAggregator] NewsAPI fetch error:', error);
      return [];
    }
  }

  /**
   * Fetch from RSS feeds
   */
  async fetchRSS(limit: number = 50): Promise<Article[]> {
    const feeds = [
      { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC World' },
      { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', name: 'Google News' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', name: 'NY Times World' },
      { url: 'https://www.aljazeera.com/xml/rss/all.xml', name: 'Al Jazeera' },
      { url: 'https://feeds.reuters.com/reuters/topNews', name: 'Reuters' },
    ];

    const allArticles: Article[] = [];

    for (const feed of feeds) {
      try {
        const parsed = await this.rssParser.parseURL(feed.url);

        const articles = parsed.items
          .filter((item) => item.title && item.contentSnippet)
          .slice(0, 20)
          .map((item) => ({
            title: item.title || '',
            content: item.contentSnippet || item.content || item.title || '',
            source_name: feed.name,
            source_url: item.link || '',
            published_at: item.pubDate ? new Date(item.pubDate) : new Date(),
            content_hash: this.generateHash(item.title + item.contentSnippet),
          }));

        allArticles.push(...articles);
        console.log(`[NewsAggregator] Fetched ${articles.length} articles from ${feed.name}`);
      } catch (error) {
        console.error(`[NewsAggregator] RSS fetch error for ${feed.name}:`, error);
      }
    }

    return allArticles.slice(0, limit);
  }

  /**
   * Fetch from all sources
   */
  async fetchAll(limit: number = 100): Promise<Article[]> {
    console.log('[NewsAggregator] Starting fetch from all sources...');

    const [newsApiArticles, rssArticles] = await Promise.all([
      this.fetchNewsAPI(50),
      this.fetchRSS(50),
    ]);

    const allArticles = [...newsApiArticles, ...rssArticles];

    // Deduplicate by content hash
    const uniqueArticles = Array.from(
      new Map(allArticles.map((a) => [a.content_hash, a])).values()
    );

    console.log(
      `[NewsAggregator] Total unique articles: ${uniqueArticles.length} (from ${allArticles.length})`
    );

    return uniqueArticles.slice(0, limit);
  }
}

export const newsAggregator = new NewsAggregator();
