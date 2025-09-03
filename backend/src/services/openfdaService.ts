import axios from 'axios';
import logger from '../utils/logger';

interface OpenFDADrug {
  openfda: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    substance_name?: string[];
    product_type?: string[];
  };
  products: Array<{
    active_ingredients?: Array<{
      name: string;
      strength: string;
    }>;
    dosage_form?: string;
    route?: string;
    marketing_status?: string;
  }>;
  adverse_reactions?: string[];
  warnings?: string[];
  precautions?: string[];
  drug_interactions?: string[];
  pregnancy?: string[];
  pediatric_use?: string[];
  geriatric_use?: string[];
  clinical_pharmacology?: string[];
  indications_and_usage?: string[];
  dosage_and_administration?: string[];
}

interface OpenFDASearchResult {
  meta: {
    disclaimer: string;
    terms: string;
    license: string;
    last_updated: string;
    results: {
      skip: number;
      limit: number;
      total: number;
    };
  };
  results: OpenFDADrug[];
}

class OpenFDAService {
  private baseUrl = 'https://api.fda.gov';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 30 * 60 * 1000; // 30 minutes
  private rateLimitDelay = 1000; // 1 second between requests
  private lastRequestTime = 0;

  /**
   * Search for drugs using OpenFDA API
   */
  async searchDrugs(query: string, limit: number = 10): Promise<OpenFDASearchResult> {
    const cacheKey = `search_${query}_${limit}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      logger.info('OpenFDA: Returning cached search results', { query, limit });
      return cached.data;
    }

    try {
      logger.info('OpenFDA: Searching for drugs', { query, limit });
      
      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.rateLimitDelay) {
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
      }
      this.lastRequestTime = Date.now();
      
      const response = await axios.get(`${this.baseUrl}/drug/label.json`, {
        params: {
          search: query,
          limit,
          sort: 'openfda.brand_name:asc'
        },
        timeout: 10000 // 10 second timeout
      });

      const result = response.data as OpenFDASearchResult;
      
      // Cache the result
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      logger.info('OpenFDA: Search completed successfully', { 
        query, 
        limit, 
        totalResults: result.meta.results.total 
      });
      
      return result;
    } catch (error: any) {
      logger.error('OpenFDA: Search failed', { 
        query, 
        error: error.message,
        status: error.response?.status,
        response: error.response?.data 
      });
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error(`No drugs found matching query: ${query}`);
      } else if (error.response?.status === 429) {
        throw new Error('OpenFDA API rate limit exceeded. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('OpenFDA API request timed out. Please try again.');
      } else if (error.code === 'ENOTFOUND') {
        throw new Error('Unable to connect to OpenFDA API. Please check your internet connection.');
      }
      
      throw new Error(`Failed to search drugs: ${error.message}`);
    }
  }

  /**
   * Get detailed drug information by ID
   */
  async getDrugDetails(drugId: string): Promise<OpenFDADrug> {
    const cacheKey = `details_${drugId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      logger.info('OpenFDA: Returning cached drug details', { drugId });
      return cached.data;
    }

    try {
      logger.info('OpenFDA: Fetching drug details', { drugId });
      
      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.rateLimitDelay) {
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
      }
      this.lastRequestTime = Date.now();
      
      // Try to get drug details using search first, then by ID
      let response;
      try {
        // First try to get by ID
        response = await axios.get(`${this.baseUrl}/drug/label/${drugId}.json`, {
          timeout: 10000
        });
      } catch (idError: any) {
        if (idError.response?.status === 404) {
          // If ID not found, try searching for the drug
          logger.info('OpenFDA: Drug ID not found, trying search', { drugId });
          response = await axios.get(`${this.baseUrl}/drug/label.json`, {
            params: {
              search: drugId,
              limit: 1
            },
            timeout: 10000
          });
          
          if (response.data.results && response.data.results.length > 0) {
            const result = response.data.results[0] as OpenFDADrug;
            this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
            logger.info('OpenFDA: Drug details fetched via search', { drugId });
            return result;
          } else {
            throw new Error(`No drug found with ID: ${drugId}`);
          }
        } else {
          throw idError;
        }
      }

      const result = response.data as OpenFDADrug;
      
      // Cache the result
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      logger.info('OpenFDA: Drug details fetched successfully', { drugId });
      
      return result;
    } catch (error: any) {
      logger.error('OpenFDA: Failed to fetch drug details', { 
        drugId, 
        error: error.message,
        status: error.response?.status 
      });
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error(`Drug not found: ${drugId}`);
      } else if (error.response?.status === 429) {
        throw new Error('OpenFDA API rate limit exceeded. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('OpenFDA API request timed out. Please try again.');
      }
      
      throw new Error(`Failed to fetch drug details: ${error.message}`);
    }
  }

  /**
   * Get drug interactions
   */
  async getDrugInteractions(drugId: string): Promise<any> {
    try {
      logger.info('OpenFDA: Fetching drug interactions', { drugId });
      
      const response = await axios.get(`${this.baseUrl}/drug/label/${drugId}.json`, {
        timeout: 10000
      });

      const drug = response.data as OpenFDADrug;
      const interactions = drug.drug_interactions || [];
      
      logger.info('OpenFDA: Drug interactions fetched successfully', { 
        drugId, 
        interactionCount: interactions.length 
      });
      
      return interactions;
    } catch (error: any) {
      logger.error('OpenFDA: Failed to fetch drug interactions', { 
        drugId, 
        error: error.message 
      });
      
      throw new Error(`Failed to fetch drug interactions: ${error.message}`);
    }
  }

  /**
   * Get adverse reactions for a drug
   */
  async getAdverseReactions(drugId: string): Promise<string[]> {
    try {
      logger.info('OpenFDA: Fetching adverse reactions', { drugId });
      
      const response = await axios.get(`${this.baseUrl}/drug/label/${drugId}.json`, {
        timeout: 10000
      });

      const drug = response.data as OpenFDADrug;
      const reactions = drug.adverse_reactions || [];
      
      logger.info('OpenFDA: Adverse reactions fetched successfully', { 
        drugId, 
        reactionCount: reactions.length 
      });
      
      return reactions;
    } catch (error: any) {
      logger.error('OpenFDA: Failed to fetch adverse reactions', { 
        drugId, 
        error: error.message 
      });
      
      throw new Error(`Failed to fetch adverse reactions: ${error.message}`);
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('OpenFDA: Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Health check for OpenFDA API
   */
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    try {
      const response = await axios.get(`${this.baseUrl}/drug/label.json`, {
        params: { limit: 1 },
        timeout: 5000
      });

      return {
        status: 'healthy',
        message: 'OpenFDA API is accessible',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        message: `OpenFDA API error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default new OpenFDAService();
