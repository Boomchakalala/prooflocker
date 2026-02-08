/**
 * Location Extraction Service
 * Uses Claude API to extract location data from article text
 */

import Anthropic from '@anthropic-ai/sdk';

interface LocationData {
  location_name: string | null;
  geotag_lat: number | null;
  geotag_lng: number | null;
  confidence_score: number;
  category: string;
}

export class LocationExtractor {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Extract location and metadata from article text
   */
  async extractLocation(title: string, content: string): Promise<LocationData> {
    try {
      const prompt = `Analyze this news article and extract the PRIMARY location mentioned. Return ONLY valid JSON, no explanations.

Article Title: ${title}
Article Content: ${content.slice(0, 1500)}

Return JSON with this exact structure:
{
  "location_name": "City, Country" or null if no clear location,
  "geotag_lat": latitude as number or null,
  "geotag_lng": longitude as number or null,
  "confidence_score": 0-100 (how confident you are in the location),
  "category": "Crypto" | "Politics" | "Tech" | "Markets" | "Sports" | "Culture" | "Other"
}

Important:
- Only return the PRIMARY/MAIN location mentioned in the article
- Use exact city names (e.g., "Tehran, Iran" not "Middle East")
- Provide accurate lat/lng coordinates
- confidence_score should be 80+ only if location is explicitly stated
- Choose the most relevant category based on article content`;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';

      // Extract JSON from response (handle cases where Claude adds explanation)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseText;

      const result = JSON.parse(jsonStr);

      return {
        location_name: result.location_name || null,
        geotag_lat: result.geotag_lat ? parseFloat(result.geotag_lat) : null,
        geotag_lng: result.geotag_lng ? parseFloat(result.geotag_lng) : null,
        confidence_score: result.confidence_score || 0,
        category: this.normalizeCategory(result.category),
      };
    } catch (error) {
      console.error('[LocationExtractor] Error:', error);
      // Return default values on error
      return {
        location_name: null,
        geotag_lat: null,
        geotag_lng: null,
        confidence_score: 0,
        category: 'other',
      };
    }
  }

  /**
   * Normalize category to match our allowed values
   */
  private normalizeCategory(category: string): string {
    const allowedCategories: Record<string, string> = {
      'crypto': 'Crypto',
      'bitcoin': 'Crypto',
      'blockchain': 'Crypto',
      'politics': 'Politics',
      'election': 'Politics',
      'government': 'Politics',
      'tech': 'Tech',
      'technology': 'Tech',
      'ai': 'Tech',
      'markets': 'Markets',
      'finance': 'Markets',
      'stocks': 'Markets',
      'sports': 'Sports',
      'football': 'Sports',
      'basketball': 'Sports',
      'culture': 'Culture',
      'entertainment': 'Culture',
      'osint': 'OSINT',
      'intelligence': 'OSINT',
      'other': 'Other',
    };

    const normalized = category?.toLowerCase() || 'other';
    return allowedCategories[normalized] || 'Other';
  }

  /**
   * Batch extract locations for multiple articles
   */
  async extractBatch(
    articles: Array<{ title: string; content: string }>
  ): Promise<LocationData[]> {
    const results = await Promise.all(
      articles.map((article) => this.extractLocation(article.title, article.content))
    );
    return results;
  }
}

export const locationExtractor = new LocationExtractor();
